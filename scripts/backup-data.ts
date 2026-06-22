#!/usr/bin/env node
import 'dotenv/config';

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import prisma from '../src/lib/prisma';

export interface BackupSummary {
  id: number;
  tableName: string;
  recordId: number;
  operation: string;
  context: string;
  createdAt: Date;
  performedBy: number | null;
}

type BackupRecordRaw = {
  id: number;
  tableName: string;
  recordId: number;
  operation: string;
  operationContext: string;
  createdAt: Date;
  performedBy: number | null;
};

type BackupFindMany = (args: {
  orderBy: { createdAt: 'asc' | 'desc' };
  take: number;
}) => Promise<BackupRecordRaw[]>;

type BackupCreate = (args: {
  data: {
    tableName: string;
    recordId: number;
    operation: string;
    oldValue: Record<string, unknown>;
    performedBy: number | null;
    operationContext: string;
  };
}) => Promise<{ id: number }>;

type BackupClient = {
  backup: {
    findMany: BackupFindMany;
    create: BackupCreate;
  };
};

const VALID_BACKUP_TABLES = [
  'students',
  'scholarships',
  'disbursements',
  'student_scholarships',
  'student_fees',
  'academic_years',
] as const;

type TableModel = {
  findMany: () => Promise<Array<Record<string, unknown>>>;
};

type TableModels = {
  [key: string]: TableModel;
};

// Maps table name strings to the Prisma model accessor name
const TABLE_MODEL_MAP: Record<string, string> = {
  students: 'student',
  scholarships: 'scholarship',
  disbursements: 'disbursement',
  student_scholarships: 'studentScholarship',
  student_fees: 'studentFees',
  academic_years: 'academicYear',
};

function getModelForTable(
  client: TableModels,
  tableName: string
): TableModel {
  const modelKey = TABLE_MODEL_MAP[tableName];
  if (!modelKey) {
    throw new Error(`Unknown table: ${tableName}`);
  }
  const model = client[modelKey];
  if (!model || typeof model.findMany !== 'function') {
    throw new Error(
      `Prisma model not found for table: ${tableName} (model key: ${modelKey})`
    );
  }
  return model;
}

export async function listRecentBackups(
  client: { backup: { findMany: BackupFindMany } },
  limit: number = 20
): Promise<BackupSummary[]> {
  const records = await client.backup.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return records.map((record) => ({
    id: record.id,
    tableName: record.tableName,
    recordId: record.recordId,
    operation: record.operation,
    context: record.operationContext,
    createdAt: record.createdAt,
    performedBy: record.performedBy,
  }));
}

export async function createTableBackup(
  client: BackupClient & TableModels,
  tableName: string,
  performedBy: number | null = null
): Promise<number> {
  const model = getModelForTable(client, tableName);
  const records = await model.findMany();

  if (records.length === 0) {
    return 0;
  }

  for (const record of records) {
    await client.backup.create({
      data: {
        tableName,
        recordId: record.id as number,
        operation: 'BACKUP',
        oldValue: record,
        performedBy,
        operationContext: 'MANUAL_BACKUP',
      },
    });
  }

  return records.length;
}

export interface ExportResult {
  tableName: string;
  recordCount: number;
  fileName: string;
}

export interface ExportManifest {
  exportedAt: string;
  totalTables: number;
  totalRecords: number;
  tables: ExportResult[];
}

export async function exportAllTables(
  client: TableModels,
  outputDir?: string,
  tableFilter?: string[]
): Promise<ExportManifest> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const backupDir = outputDir || join('backups', `backup-${timestamp}`);

  const tablesToExport = tableFilter
    ? tableFilter.filter((t) => VALID_BACKUP_TABLES.includes(t as typeof VALID_BACKUP_TABLES[number]))
    : [...VALID_BACKUP_TABLES];

  if (tablesToExport.length === 0) {
    throw new Error(
      `No valid tables specified. Valid tables: ${VALID_BACKUP_TABLES.join(', ')}`
    );
  }

  mkdirSync(backupDir, { recursive: true });

  const tables: ExportResult[] = [];
  let totalRecords = 0;

  for (const tableName of tablesToExport) {
    const model = getModelForTable(client, tableName);
    const records = await model.findMany();

    // Serialize Decimal fields to strings for JSON compatibility
    const serialized = records.map((record) =>
      JSON.parse(JSON.stringify(record, (_key, value) => {
        if (typeof value === 'bigint') return value.toString();
        return value;
      }))
    );

    const fileName = `${tableName}.json`;
    const filePath = join(backupDir, fileName);
    writeFileSync(filePath, JSON.stringify(serialized, null, 2), 'utf-8');

    tables.push({
      tableName,
      recordCount: serialized.length,
      fileName,
    });
    totalRecords += serialized.length;
  }

  // Write manifest
  const manifest: ExportManifest = {
    exportedAt: new Date().toISOString(),
    totalTables: tables.length,
    totalRecords,
    tables,
  };
  writeFileSync(
    join(backupDir, 'manifest.json'),
    JSON.stringify(manifest, null, 2),
    'utf-8'
  );

  return manifest;
}

// Restore order respecting foreign key dependencies
const RESTORE_ORDER: readonly string[] = [
  'academic_years',
  'students',
  'scholarships',
  'student_scholarships',
  'student_fees',
  'disbursements',
];

export interface RestoreTableResult {
  tableName: string;
  recordCount: number;
}

export interface RestoreResult {
  totalRestored: number;
  totalTables: number;
  tables: RestoreTableResult[];
}

type UpsertModel = {
  upsert: (args: {
    where: { id: number };
    create: Record<string, unknown>;
    update: Record<string, unknown>;
  }) => Promise<unknown>;
};

type RestoreClient = {
  [modelKey: string]: UpsertModel;
};

// Known date field patterns in Prisma field names (camelCase after JSON serialization)
const DATE_FIELDS = new Set([
  'createdAt',
  'updatedAt',
  'birthDate',
  'graduatedAt',
  'awardDate',
  'disbursementDate',
  'startDate',
  'endDate',
  'promotionDate',
  'promotionProcessedAt',
  'startedAt',
  'endedAt',
  'transitionDecisionAt',
  'separatedAt',
]);

function deserializeRecord(record: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(record)) {
    if (DATE_FIELDS.has(key) && typeof value === 'string') {
      // Convert ISO date strings back to Date objects for Prisma
      result[key] = new Date(value);
    } else {
      // Decimal values and other primitives pass through as-is.
      // JSON.parse returns Prisma Decimal values as strings (e.g. "5000.00")
      // which Prisma accepts natively for Decimal fields.
      result[key] = value;
    }
  }
  return result;
}

export async function restoreFromBackup(
  client: RestoreClient,
  backupDir: string,
  dryRun: boolean = false,
  tableFilter?: string[]
): Promise<RestoreResult> {
  const manifestPath = join(backupDir, 'manifest.json');
  const manifestRaw = readFileSync(manifestPath, 'utf-8');
  const manifest: ExportManifest = JSON.parse(manifestRaw);

  const tablesToRestore = tableFilter
    ? RESTORE_ORDER.filter((t) => tableFilter.includes(t))
    : [...RESTORE_ORDER];

  const tables: RestoreTableResult[] = [];
  let totalRestored = 0;

  for (const tableName of tablesToRestore) {
    const tableInfo = manifest.tables.find((t) => t.tableName === tableName);
    if (!tableInfo || tableInfo.recordCount === 0) {
      tables.push({ tableName, recordCount: 0 });
      continue;
    }

    const filePath = join(backupDir, tableInfo.fileName);
    const dataRaw = readFileSync(filePath, 'utf-8');
    const records: Record<string, unknown>[] = JSON.parse(dataRaw);

    if (!dryRun) {
      const modelKey = TABLE_MODEL_MAP[tableName];
      const model = client[modelKey];
      if (!model || typeof model.upsert !== 'function') {
        throw new Error(
          `Prisma model not found for restore: ${tableName} (model key: ${modelKey})`
        );
      }

      for (const record of records) {
        const preparedData = deserializeRecord(record);
        const { id, ...updateData } = preparedData;
        await model.upsert({
          where: { id: id as number },
          create: preparedData,
          update: updateData,
        });
      }
    }

    tables.push({ tableName, recordCount: records.length });
    totalRestored += records.length;
  }

  return { totalRestored, totalTables: tables.filter((t) => t.recordCount > 0).length, tables };
}

export interface CliOptions {
  list: boolean;
  create: string | null;
  exportAll: boolean;
  restore: string | null;
  dryRun: boolean;
  tables: string | null;
  limit: number;
  help: boolean;
}

export function displayBackups(backups: BackupSummary[]): string {
  if (backups.length === 0) {
    return 'No backups found.';
  }

  const lines: string[] = [];
  lines.push('Recent backup snapshots:');
  lines.push('');
  lines.push('  ID  | Table             | Record | Operation | Context        | Performed By | Created At');
  lines.push('  ----+-------------------+--------+-----------+----------------+--------------+------------------------');

  for (const backup of backups) {
    const id = String(backup.id).padEnd(4);
    const table = backup.tableName.padEnd(17);
    const record = String(backup.recordId).padEnd(6);
    const op = backup.operation.padEnd(9);
    const ctx = backup.context.padEnd(14);
    const by = backup.performedBy !== null ? String(backup.performedBy) : '-'.padEnd(12);
    const at = backup.createdAt.toISOString().replace('T', ' ').replace(/\..+/, '');

    lines.push(`  ${id} | ${table} | ${record} | ${op} | ${ctx} | ${String(by).padEnd(12)} | ${at}`);
  }

  lines.push('');
  lines.push(`Total: ${backups.length} backup(s)`);

  return lines.join('\n');
}

export function parseCliArgs(args: string[]): CliOptions {
  const allowedFlags = new Set(['--list', '--create', '--limit', '--export-all', '--restore', '--dry-run', '--tables', '--help', '-h']);

  const options: CliOptions = {
    list: false,
    create: null,
    exportAll: false,
    restore: null,
    dryRun: false,
    tables: null,
    limit: 20,
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (!allowedFlags.has(arg)) {
      throw new Error(`Unknown option: ${arg}`);
    }

    switch (arg) {
      case '--list':
        options.list = true;
        break;
      case '--create':
        i++;
        if (i >= args.length) {
          throw new Error('--create requires a table name argument');
        }
        options.create = args[i];
        break;
      case '--export-all':
        options.exportAll = true;
        break;
      case '--restore':
        i++;
        if (i >= args.length) {
          throw new Error('--restore requires a backup directory path');
        }
        options.restore = args[i];
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--tables':
        i++;
        if (i >= args.length) {
          throw new Error('--tables requires a comma-separated list of table names');
        }
        options.tables = args[i];
        break;
      case '--limit':
        i++;
        if (i >= args.length) {
          throw new Error('--limit requires a number argument');
        }
        options.limit = Number(args[i]);
        if (isNaN(options.limit) || options.limit < 1) {
          throw new Error('--limit must be a positive number');
        }
        break;
      case '--help':
      case '-h':
        options.help = true;
        break;
    }
  }

  return options;
}

function printUsage() {
  console.log(`Create and manage data backups.

Usage:
  npm run db:backup -- --list
  npm run db:backup -- --list --limit 10
  npm run db:backup -- --create <table>
  npm run db:backup -- --export-all
  npm run db:backup -- --export-all --tables students,scholarships
  npm run db:backup -- --restore <backup-dir>
  npm run db:backup -- --restore <backup-dir> --dry-run
  npm run db:backup -- --restore <backup-dir> --tables students,scholarships
  npm run db:backup -- --help

Options:
  --list                  Show recent backup snapshots.
  --limit <n>             Number of backups to show (default: 20).
  --create <table>        Create a backup of all records in a table.
  --export-all            Export all tables to local JSON files.
  --restore <backup-dir>  Restore tables from a local JSON backup directory.
  --dry-run               Preview restore without writing to the database.
  --tables <names>        Comma-separated list of tables to export/restore.
  --help, -h              Show this message.

Valid tables: ${VALID_BACKUP_TABLES.join(', ')}
`);
}

async function main(args = process.argv.slice(2)) {
  const options = parseCliArgs(args);

  if (options.help) {
    printUsage();
    return;
  }

  const tableFilter = options.tables
    ? options.tables.split(',').map((t) => t.trim()).filter(Boolean)
    : undefined;

  // Warn about unknown table names in filter
  if (tableFilter) {
    const unknown = tableFilter.filter(
      (t) => !VALID_BACKUP_TABLES.includes(t as typeof VALID_BACKUP_TABLES[number])
    );
    if (unknown.length > 0) {
      console.warn(`Warning: Unknown table(s): ${unknown.join(', ')}. Valid tables: ${VALID_BACKUP_TABLES.join(', ')}`);
    }
  }

  if (options.restore) {
    const backupDir = resolve(options.restore);
    const label = options.dryRun ? 'Previewing restore from' : 'Restoring from';
    console.log(`${label}: ${backupDir}`);
    if (tableFilter) console.log(`  Tables: ${tableFilter.join(', ')}`);
    if (options.dryRun) console.log('  (dry run — no changes will be made)');

    const result = await restoreFromBackup(
      prisma as unknown as RestoreClient,
      backupDir,
      options.dryRun,
      tableFilter
    );
    const verb = options.dryRun ? 'would be restored' : 'restored';
    console.log(`Done. ${result.totalRestored} records ${verb} across ${result.totalTables} tables.`);
    for (const table of result.tables) {
      console.log(`  ${table.tableName}: ${table.recordCount} records`);
    }
    return;
  }

  if (options.exportAll) {
    console.log('Exporting tables to local JSON files...');
    if (tableFilter) console.log(`  Tables: ${tableFilter.join(', ')}`);
    const manifest = await exportAllTables(
      prisma as unknown as TableModels,
      undefined,
      tableFilter
    );
    console.log(`Export complete. ${manifest.totalRecords} records across ${manifest.totalTables} tables.`);
    for (const table of manifest.tables) {
      console.log(`  ${table.tableName}: ${table.recordCount} records -> ${table.fileName}`);
    }
    return;
  }

  if (options.create) {
    const tableName = options.create;
    if (!VALID_BACKUP_TABLES.includes(tableName as typeof VALID_BACKUP_TABLES[number])) {
      console.error(`Error: Invalid table name "${tableName}". Valid tables: ${VALID_BACKUP_TABLES.join(', ')}`);
      process.exitCode = 1;
      return;
    }

    console.log(`Creating backup of table: ${tableName}...`);
    const count = await createTableBackup(
      prisma as unknown as BackupClient & TableModels,
      tableName
    );
    console.log(`Backup complete. ${count} record(s) backed up from "${tableName}".`);
    return;
  }

  if (options.list) {
    const backups = await listRecentBackups(
      prisma as unknown as { backup: { findMany: BackupFindMany } },
      options.limit
    );
    console.log(displayBackups(backups));
    return;
  }

  // Default: show help
  printUsage();
}

const isDirectRun = process.argv[1]
  ? import.meta.url === pathToFileURL(process.argv[1]).href
  : false;

if (isDirectRun) {
  main()
    .catch((error) => {
      console.error('Backup operation failed:', error);
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
