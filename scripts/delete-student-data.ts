#!/usr/bin/env node
import 'dotenv/config';

import { pathToFileURL } from 'node:url';

import prisma from '../src/lib/prisma';

export const STUDENT_BACKUP_TABLE_NAMES = [
  'students',
  'student_academic_records',
  'student_scholarships',
  'student_fees',
  'disbursements',
] as const;

export interface StudentDataCounts {
  students: number;
  archivedStudents: number;
  studentAcademicRecords: number;
  disbursements: number;
  studentFees: number;
  studentScholarships: number;
  studentBackups: number;
}

export type DeletedStudentDataCounts = Omit<StudentDataCounts, 'archivedStudents'>;

export interface DeleteStudentDataResult {
  before: StudentDataCounts;
  deleted: DeletedStudentDataCounts;
  after: StudentDataCounts;
  scholarshipsBefore: number;
  scholarshipsAfter: number;
}

type CountArgs = {
  where?: unknown;
};

type DeleteArgs = {
  where?: unknown;
};

type CountModel = {
  count: (args?: CountArgs) => Promise<number>;
};

type DeleteModel = {
  deleteMany: (args?: DeleteArgs) => Promise<{ count: number }>;
};

type StudentDataCounter = {
  student: CountModel;
  studentAcademicRecord: CountModel;
  disbursement: CountModel;
  studentFees: CountModel;
  studentScholarship: CountModel;
  backup: CountModel;
};

type StudentDataTransaction = {
  student: DeleteModel;
  studentAcademicRecord: DeleteModel;
  disbursement: DeleteModel;
  studentFees: DeleteModel;
  studentScholarship: DeleteModel;
  backup: DeleteModel;
};

type StudentDataPrisma = StudentDataCounter & {
  scholarship: CountModel;
  $transaction: <T>(callback: (tx: StudentDataTransaction) => Promise<T>) => Promise<T>;
};

function studentBackupWhere() {
  return {
    tableName: {
      in: STUDENT_BACKUP_TABLE_NAMES,
    },
  };
}

export async function countStudentData(client: StudentDataCounter): Promise<StudentDataCounts> {
  const [
    students,
    archivedStudents,
    studentAcademicRecords,
    disbursements,
    studentFees,
    studentScholarships,
    studentBackups,
  ] = await Promise.all([
    client.student.count(),
    client.student.count({ where: { isArchived: true } }),
    client.studentAcademicRecord.count(),
    client.disbursement.count(),
    client.studentFees.count(),
    client.studentScholarship.count(),
    client.backup.count({ where: studentBackupWhere() }),
  ]);

  return {
    students,
    archivedStudents,
    studentAcademicRecords,
    disbursements,
    studentFees,
    studentScholarships,
    studentBackups,
  };
}

export async function deleteStudentData(client: StudentDataPrisma): Promise<DeleteStudentDataResult> {
  const [before, scholarshipsBefore] = await Promise.all([
    countStudentData(client),
    client.scholarship.count(),
  ]);

  const deleted = await client.$transaction(async (tx) => {
    const studentAcademicRecords = await tx.studentAcademicRecord.deleteMany();
    const disbursements = await tx.disbursement.deleteMany();
    const studentFees = await tx.studentFees.deleteMany();
    const studentScholarships = await tx.studentScholarship.deleteMany();
    const studentBackups = await tx.backup.deleteMany({ where: studentBackupWhere() });
    const students = await tx.student.deleteMany();

    return {
      students: students.count,
      studentAcademicRecords: studentAcademicRecords.count,
      disbursements: disbursements.count,
      studentFees: studentFees.count,
      studentScholarships: studentScholarships.count,
      studentBackups: studentBackups.count,
    };
  });

  const [after, scholarshipsAfter] = await Promise.all([
    countStudentData(client),
    client.scholarship.count(),
  ]);

  return {
    before,
    deleted,
    after,
    scholarshipsBefore,
    scholarshipsAfter,
  };
}

type CliOptions = {
  confirm: boolean;
  help: boolean;
};

export function parseCliArgs(args: string[]): CliOptions {
  const allowedArgs = new Set(['--confirm', '--dry-run', '--help', '-h']);
  const unknownArg = args.find((arg) => !allowedArgs.has(arg));

  if (unknownArg) {
    throw new Error(`Unknown option: ${unknownArg}`);
  }

  return {
    confirm: args.includes('--confirm'),
    help: args.includes('--help') || args.includes('-h'),
  };
}

function totalStudentDataCount(counts: StudentDataCounts) {
  return (
    counts.students +
    counts.studentAcademicRecords +
    counts.disbursements +
    counts.studentFees +
    counts.studentScholarships +
    counts.studentBackups
  );
}

function formatCounts(counts: StudentDataCounts | DeletedStudentDataCounts) {
  const archivedText =
    'archivedStudents' in counts ? `  Archived students: ${counts.archivedStudents}` : '';

  return [
    `  Students: ${counts.students}`,
    archivedText.trimEnd(),
    `  Student academic records: ${counts.studentAcademicRecords}`,
    `  Disbursements: ${counts.disbursements}`,
    `  Student fees: ${counts.studentFees}`,
    `  Student scholarship assignments: ${counts.studentScholarships}`,
    `  Student backup snapshots: ${counts.studentBackups}`,
  ]
    .filter(Boolean)
    .join('\n');
}

function printUsage() {
  console.log(`Delete all student data while preserving scholarships.

Usage:
  npm run db:reset-students
  npm run db:reset-students -- --confirm

Options:
  --dry-run    Show counts only. This is the default.
  --confirm    Permanently delete student data.
  --help       Show this message.
`);
}

async function main(args = process.argv.slice(2)) {
  const options = parseCliArgs(args);
  const client = prisma as unknown as StudentDataPrisma;

  if (options.help) {
    printUsage();
    return;
  }

  const counts = await countStudentData(client);
  const scholarshipCount = await client.scholarship.count();

  console.log('Student data reset preview');
  console.log(formatCounts(counts));
  console.log(`  Scholarships preserved: ${scholarshipCount}`);

  if (!options.confirm) {
    console.log('\nDry run only. Re-run with --confirm to permanently delete these student records.');
    return;
  }

  if (totalStudentDataCount(counts) === 0) {
    console.log('\nNo student data found. Nothing to delete.');
    return;
  }

  console.log('\nDeleting student data...');
  const result = await deleteStudentData(client);
  const remaining = totalStudentDataCount(result.after);

  console.log('\nDeleted:');
  console.log(formatCounts(result.deleted));
  console.log(`\nScholarships before: ${result.scholarshipsBefore}`);
  console.log(`Scholarships after: ${result.scholarshipsAfter}`);

  if (remaining > 0) {
    throw new Error(`Student data reset incomplete. Remaining student data rows: ${remaining}`);
  }

  if (result.scholarshipsBefore !== result.scholarshipsAfter) {
    throw new Error('Scholarship count changed during student data reset.');
  }

  console.log('\nStudent data reset complete. Scholarships were preserved.');
}

const isDirectRun = process.argv[1]
  ? import.meta.url === pathToFileURL(process.argv[1]).href
  : false;

if (isDirectRun) {
  main()
    .catch((error) => {
      console.error('Failed to reset student data:', error);
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
