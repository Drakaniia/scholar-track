import { join } from 'node:path';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createTableBackup,
  displayBackups,
  exportAllTables,
  listRecentBackups,
  parseCliArgs,
  restoreFromBackup,
} from '../scripts/backup-data';

const { mockMkdirSync, mockWriteFileSync, mockReadFileSync } = vi.hoisted(() => ({
  mockMkdirSync: vi.fn(),
  mockWriteFileSync: vi.fn(),
  mockReadFileSync: vi.fn(),
}));

vi.mock('node:fs', () => ({
  default: {
    mkdirSync: mockMkdirSync,
    writeFileSync: mockWriteFileSync,
    readFileSync: mockReadFileSync,
  },
  mkdirSync: mockMkdirSync,
  writeFileSync: mockWriteFileSync,
  readFileSync: mockReadFileSync,
}));

describe('backup data script', () => {
  describe('listRecentBackups', () => {
    it('returns recent backup records ordered by createdAt descending', async () => {
      const now = new Date();
      const backupRecords = [
        {
          id: 2,
          tableName: 'students',
          recordId: 42,
          operation: 'UPDATE',
          operationContext: 'GRADUATION',
          createdAt: new Date(now.getTime() + 1000),
          performedBy: 1,
        },
        {
          id: 1,
          tableName: 'student_scholarships',
          recordId: 7,
          operation: 'DELETE',
          operationContext: 'GRADUATION',
          createdAt: now,
          performedBy: null,
        },
      ];

      const prisma = {
        backup: {
          findMany: vi.fn().mockResolvedValue(backupRecords),
        },
      };

      const results = await listRecentBackups(prisma, 20);

      expect(results).toHaveLength(2);
      expect(results[0]).toEqual({
        id: 2,
        tableName: 'students',
        recordId: 42,
        operation: 'UPDATE',
        context: 'GRADUATION',
        createdAt: backupRecords[0].createdAt,
        performedBy: 1,
      });
      expect(results[1]).toEqual({
        id: 1,
        tableName: 'student_scholarships',
        recordId: 7,
        operation: 'DELETE',
        context: 'GRADUATION',
        createdAt: backupRecords[1].createdAt,
        performedBy: null,
      });
      expect(prisma.backup.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
        take: 20,
      });
    });

    it('returns an empty array when there are no backups', async () => {
      const prisma = {
        backup: {
          findMany: vi.fn().mockResolvedValue([]),
        },
      };

      const results = await listRecentBackups(prisma);

      expect(results).toEqual([]);
    });

    it('defaults to a limit of 20 when no limit is provided', async () => {
      const prisma = {
        backup: {
          findMany: vi.fn().mockResolvedValue([]),
        },
      };

      await listRecentBackups(prisma);

      expect(prisma.backup.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
        take: 20,
      });
    });

    it('respects a custom limit', async () => {
      const prisma = {
        backup: {
          findMany: vi.fn().mockResolvedValue([]),
        },
      };

      await listRecentBackups(prisma, 5);

      expect(prisma.backup.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
        take: 5,
      });
    });
  });

  describe('createTableBackup', () => {
    it('creates backup entries for all records in a valid table', async () => {
      const students = [
        {
          id: 1,
          firstName: 'Alice',
          lastName: 'Smith',
          program: 'BSCS',
          yearLevel: '3rd',
          gradeLevel: 'College',
          status: 'Active',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          firstName: 'Bob',
          lastName: 'Jones',
          program: 'BSIT',
          yearLevel: '2nd',
          gradeLevel: 'College',
          status: 'Active',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const backupCreateArgs: Array<{ data: Record<string, unknown> }> = [];

      const prisma = {
        student: {
          findMany: vi.fn().mockResolvedValue(students),
        },
        backup: {
          findMany: vi.fn(),
          create: vi.fn().mockImplementation((args: { data: Record<string, unknown> }) => {
            backupCreateArgs.push(args);
            return Promise.resolve({ id: backupCreateArgs.length });
          }),
        },
      };

      const count = await createTableBackup(prisma, 'students', 1);

      expect(count).toBe(2);
      expect(prisma.student.findMany).toHaveBeenCalledOnce();
      expect(prisma.backup.create).toHaveBeenCalledTimes(2);

      // First backup entry
      expect(backupCreateArgs[0]).toMatchObject({
        data: {
          tableName: 'students',
          recordId: 1,
          operation: 'BACKUP',
          performedBy: 1,
          operationContext: 'MANUAL_BACKUP',
        },
      });
      // Should contain the student data in oldValue
      expect(backupCreateArgs[0].data.oldValue).toMatchObject({
        id: 1,
        firstName: 'Alice',
        lastName: 'Smith',
      });

      // Second backup entry
      expect(backupCreateArgs[1]).toMatchObject({
        data: {
          tableName: 'students',
          recordId: 2,
          operation: 'BACKUP',
          performedBy: 1,
          operationContext: 'MANUAL_BACKUP',
        },
      });
    });

    it('throws an error for an invalid table name', async () => {
      const prisma = {
        backup: { findMany: vi.fn(), create: vi.fn() },
      };

      await expect(createTableBackup(prisma, 'nonexistent_table', null)).rejects.toThrow(
        "Unknown table: nonexistent_table"
      );
    });

    it('returns 0 when the table is empty', async () => {
      const prisma = {
        student: {
          findMany: vi.fn().mockResolvedValue([]),
        },
        backup: {
          findMany: vi.fn(),
          create: vi.fn(),
        },
      };

      const count = await createTableBackup(prisma, 'students');

      expect(count).toBe(0);
      expect(prisma.backup.create).not.toHaveBeenCalled();
    });
  });

  describe('parseCliArgs', () => {
    it('parses --list flag', () => {
      const result = parseCliArgs(['--list']);
      expect(result).toMatchObject({ list: true });
    });

    it('parses --create with a table name', () => {
      const result = parseCliArgs(['--create', 'students']);
      expect(result).toMatchObject({ create: 'students' });
    });

    it('parses --limit option', () => {
      const result = parseCliArgs(['--list', '--limit', '10']);
      expect(result).toMatchObject({ list: true, limit: 10 });
    });

    it('parses --export-all flag', () => {
      const result = parseCliArgs(['--export-all']);
      expect(result).toMatchObject({ exportAll: true });
    });

    it('parses --restore with a backup directory path', () => {
      const result = parseCliArgs(['--restore', 'backups/test-export']);
      expect(result).toMatchObject({ restore: 'backups/test-export' });
    });

    it('parses --dry-run flag', () => {
      const result = parseCliArgs(['--restore', 'backups/test', '--dry-run']);
      expect(result).toMatchObject({ restore: 'backups/test', dryRun: true });
    });

    it('parses --tables with comma-separated names', () => {
      const result = parseCliArgs(['--export-all', '--tables', 'students,scholarships']);
      expect(result).toMatchObject({ exportAll: true, tables: 'students,scholarships' });
    });

    it('parses --help flag', () => {
      const result = parseCliArgs(['--help']);
      expect(result).toMatchObject({ help: true });
    });

    it('parses -h as help', () => {
      const result = parseCliArgs(['-h']);
      expect(result).toMatchObject({ help: true });
    });

    it('throws on unknown options', () => {
      expect(() => parseCliArgs(['--unknown'])).toThrow('Unknown option: --unknown');
    });

    it('returns default values when no args given', () => {
      const result = parseCliArgs([]);
      expect(result).toEqual({ list: false, create: null, exportAll: false, restore: null, dryRun: false, tables: null, limit: 20, help: false });
    });
  });

  describe('exportAllTables', () => {
    beforeEach(() => {
      mockMkdirSync.mockClear();
      mockWriteFileSync.mockClear();
    });

    it('exports all valid tables to JSON files and returns a manifest', async () => {
      const client = {
        student: { findMany: vi.fn().mockResolvedValue([{ id: 1, firstName: 'Alice' }]) },
        scholarship: { findMany: vi.fn().mockResolvedValue([{ id: 1, name: 'Test' }]) },
        disbursement: { findMany: vi.fn().mockResolvedValue([]) },
        studentScholarship: { findMany: vi.fn().mockResolvedValue([]) },
        studentFees: { findMany: vi.fn().mockResolvedValue([]) },
        academicYear: { findMany: vi.fn().mockResolvedValue([]) },
      };

      const manifest = await exportAllTables(client, join('backups', 'test-export'));

      expect(mockMkdirSync).toHaveBeenCalledWith(join('backups', 'test-export'), { recursive: true });
      expect(manifest.totalTables).toBe(6);
      expect(manifest.totalRecords).toBe(2);
      expect(manifest.tables).toEqual(
        expect.arrayContaining([
          { tableName: 'students', recordCount: 1, fileName: 'students.json' },
          { tableName: 'scholarships', recordCount: 1, fileName: 'scholarships.json' },
        ])
      );
      // Should have written 7 files (6 tables + 1 manifest)
      expect(mockWriteFileSync).toHaveBeenCalledTimes(7);
    });

    it('exports only specified tables when tableFilter is provided', async () => {
      const client = {
        student: { findMany: vi.fn().mockResolvedValue([{ id: 1 }]) },
        scholarship: { findMany: vi.fn().mockResolvedValue([{ id: 1 }]) },
        disbursement: { findMany: vi.fn().mockResolvedValue([{ id: 1 }]) },
        studentScholarship: { findMany: vi.fn().mockResolvedValue([]) },
        studentFees: { findMany: vi.fn().mockResolvedValue([]) },
        academicYear: { findMany: vi.fn().mockResolvedValue([]) },
      };

      const manifest = await exportAllTables(
        client,
        join('backups', 'test-filtered'),
        ['students', 'scholarships']
      );

      expect(manifest.totalTables).toBe(2);
      expect(manifest.totalRecords).toBe(2);
      expect(manifest.tables).toHaveLength(2);
      expect(manifest.tables[0].tableName).toBe('students');
      expect(manifest.tables[1].tableName).toBe('scholarships');
      // Should have written 3 files (2 tables + 1 manifest)
      expect(mockWriteFileSync).toHaveBeenCalledTimes(3);
      // Only students and scholarships were queried
      expect(client.student.findMany).toHaveBeenCalledOnce();
      expect(client.scholarship.findMany).toHaveBeenCalledOnce();
      expect(client.disbursement.findMany).not.toHaveBeenCalled();
    });

    it('writes a manifest.json with export metadata', async () => {
      const client = {
        student: { findMany: vi.fn().mockResolvedValue([]) },
        scholarship: { findMany: vi.fn().mockResolvedValue([]) },
        disbursement: { findMany: vi.fn().mockResolvedValue([]) },
        studentScholarship: { findMany: vi.fn().mockResolvedValue([]) },
        studentFees: { findMany: vi.fn().mockResolvedValue([]) },
        academicYear: { findMany: vi.fn().mockResolvedValue([]) },
      };

      const manifest = await exportAllTables(client, join('backups', 'test-manifest'));

      expect(manifest.exportedAt).toBeDefined();
      expect(new Date(manifest.exportedAt).toISOString()).toBe(manifest.exportedAt);

      // Verify manifest was written
      const manifestCall = mockWriteFileSync.mock.calls.find(
        (call: unknown[]) => (call[0] as string).endsWith('manifest.json')
      );
      expect(manifestCall).toBeDefined();
      expect(manifestCall![1]).toBeDefined();
      const manifestContent = JSON.parse(manifestCall![1] as string);
      expect(manifestContent.totalTables).toBe(6);
      expect(manifestContent.totalRecords).toBe(0);
      expect(manifestContent.tables).toHaveLength(6);
    });
  });

  describe('restoreFromBackup', () => {
    beforeEach(() => {
      mockReadFileSync.mockClear();
    });

    it('restores tables from a backup directory using upsert', async () => {
      const manifestJson = JSON.stringify({
        exportedAt: '2025-06-21T12:00:00.000Z',
        totalTables: 6,
        totalRecords: 3,
        tables: [
          { tableName: 'academic_years', recordCount: 1, fileName: 'academic_years.json' },
          { tableName: 'students', recordCount: 1, fileName: 'students.json' },
          { tableName: 'scholarships', recordCount: 1, fileName: 'scholarships.json' },
          { tableName: 'student_scholarships', recordCount: 0, fileName: 'student_scholarships.json' },
          { tableName: 'student_fees', recordCount: 0, fileName: 'student_fees.json' },
          { tableName: 'disbursements', recordCount: 0, fileName: 'disbursements.json' },
        ],
      });

      const academicYearsJson = JSON.stringify([
        { id: 1, year: '2024-2025', startDate: '2024-06-01T00:00:00.000Z', endDate: '2025-03-31T00:00:00.000Z', semester: '1ST', isActive: true },
      ]);

      const studentsJson = JSON.stringify([
        { id: 1, firstName: 'Alice', lastName: 'Smith', program: 'BSCS', yearLevel: '3rd', gradeLevel: 'College', status: 'Active' },
      ]);

      const scholarshipsJson = JSON.stringify([
        { id: 1, scholarshipName: 'Test Grant', sponsor: 'Test', type: 'CHED', amount: '5000.00', status: 'Active', source: 'INTERNAL', eligibleGradeLevels: 'College' },
      ]);

      const emptyJson = JSON.stringify([]);

      mockReadFileSync.mockImplementation((path: string) => {
        if (path.endsWith('manifest.json')) return manifestJson;
        if (path.endsWith('academic_years.json')) return academicYearsJson;
        if (path.endsWith('students.json')) return studentsJson;
        if (path.endsWith('scholarships.json')) return scholarshipsJson;
        return emptyJson;
      });

      const upsertCalls: Array<{ model: string; args: unknown }> = [];

      const client = {
        academicYear: {
          upsert: vi.fn().mockImplementation((args: unknown) => {
            upsertCalls.push({ model: 'academicYear', args });
            return Promise.resolve({});
          }),
        },
        student: {
          upsert: vi.fn().mockImplementation((args: unknown) => {
            upsertCalls.push({ model: 'student', args });
            return Promise.resolve({});
          }),
        },
        scholarship: {
          upsert: vi.fn().mockImplementation((args: unknown) => {
            upsertCalls.push({ model: 'scholarship', args });
            return Promise.resolve({});
          }),
        },
        studentScholarship: { upsert: vi.fn() },
        studentFees: { upsert: vi.fn() },
        disbursement: { upsert: vi.fn() },
      };

      const result = await restoreFromBackup(client, 'backups/test-backup');

      expect(result.totalRestored).toBe(3);
      expect(result.totalTables).toBe(3);
      expect(result.tables).toContainEqual({ tableName: 'academic_years', recordCount: 1 });
      expect(result.tables).toContainEqual({ tableName: 'students', recordCount: 1 });
      expect(result.tables).toContainEqual({ tableName: 'scholarships', recordCount: 1 });

      // Verify upsert was called in correct order
      expect(upsertCalls[0].model).toBe('academicYear');
      expect(upsertCalls[1].model).toBe('student');
      expect(upsertCalls[2].model).toBe('scholarship');

      // Verify date fields are deserialized back to Date objects
      const acadYearCall = upsertCalls[0].args as {
        where: { id: number };
        create: Record<string, unknown>;
        update: Record<string, unknown>;
      };
      expect(acadYearCall.create.startDate).toBeInstanceOf(Date);
      expect(acadYearCall.create.year).toBe('2024-2025');
      // update should NOT include id
      expect(acadYearCall.update).not.toHaveProperty('id');
      // create SHOULD include id
      expect(acadYearCall.create).toHaveProperty('id', 1);
    });

    it('returns zero counts when all tables are empty', async () => {
      const manifestJson = JSON.stringify({
        exportedAt: '2025-06-21T12:00:00.000Z',
        totalTables: 6,
        totalRecords: 0,
        tables: [
          { tableName: 'academic_years', recordCount: 0, fileName: 'academic_years.json' },
          { tableName: 'students', recordCount: 0, fileName: 'students.json' },
          { tableName: 'scholarships', recordCount: 0, fileName: 'scholarships.json' },
          { tableName: 'student_scholarships', recordCount: 0, fileName: 'student_scholarships.json' },
          { tableName: 'student_fees', recordCount: 0, fileName: 'student_fees.json' },
          { tableName: 'disbursements', recordCount: 0, fileName: 'disbursements.json' },
        ],
      });

      mockReadFileSync.mockImplementation((path: string) => {
        if (path.endsWith('manifest.json')) return manifestJson;
        return JSON.stringify([]);
      });

      const client = {
        academicYear: { upsert: vi.fn() },
        student: { upsert: vi.fn() },
        scholarship: { upsert: vi.fn() },
        studentScholarship: { upsert: vi.fn() },
        studentFees: { upsert: vi.fn() },
        disbursement: { upsert: vi.fn() },
      };

      const result = await restoreFromBackup(client, 'backups/empty-backup');

      expect(result.totalRestored).toBe(0);
      expect(result.totalTables).toBe(0);
    });

    it('performs a dry run without calling upsert', async () => {
      const manifestJson = JSON.stringify({
        exportedAt: '2025-06-21T12:00:00.000Z',
        totalTables: 1,
        totalRecords: 1,
        tables: [
          { tableName: 'students', recordCount: 1, fileName: 'students.json' },
        ],
      });

      const studentsJson = JSON.stringify([
        { id: 1, firstName: 'Alice', lastName: 'Smith', program: 'BSCS', yearLevel: '3rd', gradeLevel: 'College', status: 'Active' },
      ]);

      mockReadFileSync.mockImplementation((path: string) => {
        if (path.endsWith('manifest.json')) return manifestJson;
        if (path.endsWith('students.json')) return studentsJson;
        return JSON.stringify([]);
      });

      const upsertMock = vi.fn();
      const client = {
        academicYear: { upsert: upsertMock },
        student: { upsert: upsertMock },
        scholarship: { upsert: upsertMock },
        studentScholarship: { upsert: upsertMock },
        studentFees: { upsert: upsertMock },
        disbursement: { upsert: upsertMock },
      };

      const result = await restoreFromBackup(client, 'backups/test', true);

      expect(result.totalRestored).toBe(1);
      expect(result.totalTables).toBe(1);
      expect(upsertMock).not.toHaveBeenCalled();
    });

    it('restores only specified tables when tableFilter is provided', async () => {
      const manifestJson = JSON.stringify({
        exportedAt: '2025-06-21T12:00:00.000Z',
        totalTables: 2,
        totalRecords: 2,
        tables: [
          { tableName: 'students', recordCount: 1, fileName: 'students.json' },
          { tableName: 'scholarships', recordCount: 1, fileName: 'scholarships.json' },
        ],
      });

      const studentsJson = JSON.stringify([{ id: 1, firstName: 'Alice' }]);
      const scholarshipsJson = JSON.stringify([{ id: 1, name: 'Test' }]);

      mockReadFileSync.mockImplementation((path: string) => {
        if (path.endsWith('manifest.json')) return manifestJson;
        if (path.endsWith('students.json')) return studentsJson;
        if (path.endsWith('scholarships.json')) return scholarshipsJson;
        return JSON.stringify([]);
      });

      const studentUpsert = vi.fn().mockResolvedValue({});
      const scholarshipUpsert = vi.fn().mockResolvedValue({});

      const client = {
        academicYear: { upsert: vi.fn() },
        student: { upsert: studentUpsert },
        scholarship: { upsert: scholarshipUpsert },
        studentScholarship: { upsert: vi.fn() },
        studentFees: { upsert: vi.fn() },
        disbursement: { upsert: vi.fn() },
      };

      const result = await restoreFromBackup(
        client,
        'backups/test',
        false,
        ['students', 'scholarships']
      );

      expect(result.totalRestored).toBe(2);
      expect(result.totalTables).toBe(2);
      expect(studentUpsert).toHaveBeenCalled();
      expect(scholarshipUpsert).toHaveBeenCalled();
    });

    it('throws an error when manifest.json is missing', async () => {
      mockReadFileSync.mockImplementation(() => {
        throw new Error('ENOENT: no such file or directory');
      });

      const client = {
        academicYear: { upsert: vi.fn() },
        student: { upsert: vi.fn() },
        scholarship: { upsert: vi.fn() },
        studentScholarship: { upsert: vi.fn() },
        studentFees: { upsert: vi.fn() },
        disbursement: { upsert: vi.fn() },
      };

      await expect(
        restoreFromBackup(client, 'backups/nonexistent')
      ).rejects.toThrow();
    });
  });

  describe('displayBackups', () => {
    it('returns a formatted string of backup records', () => {
      const backups = [
        {
          id: 1,
          tableName: 'students',
          recordId: 42,
          operation: 'UPDATE',
          context: 'GRADUATION',
          createdAt: new Date('2025-06-15T10:30:00Z'),
          performedBy: 1,
        },
        {
          id: 2,
          tableName: 'disbursements',
          recordId: 7,
          operation: 'DELETE',
          context: 'GRADUATION',
          createdAt: new Date('2025-06-14T09:00:00Z'),
          performedBy: null,
        },
      ];

      const output = displayBackups(backups);

      expect(output).toContain('1');
      expect(output).toContain('students');
      expect(output).toContain('42');
      expect(output).toContain('UPDATE');
      expect(output).toContain('GRADUATION');
      expect(output).toContain('2');
      expect(output).toContain('disbursements');
      expect(output).toContain('DELETE');
    });

    it('shows a message when there are no backups', () => {
      const output = displayBackups([]);
      expect(output).toContain('No backups found');
    });
  });
});
