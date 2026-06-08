import { describe, expect, it, vi } from 'vitest';

import {
  STUDENT_BACKUP_TABLE_NAMES,
  countStudentData,
  deleteStudentData,
} from '../scripts/delete-student-data';

function createCountingModel(count: number) {
  return {
    count: vi.fn().mockResolvedValue(count),
  };
}

describe('delete student data script', () => {
  it('counts students, archived students, student-owned records, and student backup snapshots', async () => {
    const prisma = {
      student: {
        count: vi.fn().mockResolvedValueOnce(12).mockResolvedValueOnce(4),
      },
      studentAcademicRecord: createCountingModel(8),
      disbursement: createCountingModel(7),
      studentFees: createCountingModel(6),
      studentScholarship: createCountingModel(5),
      backup: createCountingModel(3),
    };

    const counts = await countStudentData(prisma);

    expect(counts).toEqual({
      students: 12,
      archivedStudents: 4,
      studentAcademicRecords: 8,
      disbursements: 7,
      studentFees: 6,
      studentScholarships: 5,
      studentBackups: 3,
    });
    expect(prisma.student.count).toHaveBeenCalledWith();
    expect(prisma.student.count).toHaveBeenCalledWith({ where: { isArchived: true } });
    expect(prisma.backup.count).toHaveBeenCalledWith({
      where: {
        tableName: {
          in: STUDENT_BACKUP_TABLE_NAMES,
        },
      },
    });
  });

  it('deletes only student data in dependency order and preserves scholarships', async () => {
    const callOrder: string[] = [];
    const createDeleteModel = (name: string, count: number) => ({
      deleteMany: vi.fn().mockImplementation(async () => {
        callOrder.push(name);
        return { count };
      }),
    });
    const tx = {
      studentAcademicRecord: createDeleteModel('studentAcademicRecord', 8),
      disbursement: createDeleteModel('disbursement', 7),
      studentFees: createDeleteModel('studentFees', 6),
      studentScholarship: createDeleteModel('studentScholarship', 5),
      backup: createDeleteModel('backup', 3),
      student: createDeleteModel('student', 12),
    };
    const prisma = {
      student: {
        count: vi
          .fn()
          .mockResolvedValueOnce(12)
          .mockResolvedValueOnce(4)
          .mockResolvedValueOnce(0)
          .mockResolvedValueOnce(0),
      },
      studentAcademicRecord: createCountingModel(8),
      disbursement: createCountingModel(7),
      studentFees: createCountingModel(6),
      studentScholarship: createCountingModel(5),
      backup: createCountingModel(3),
      scholarship: createCountingModel(21),
      $transaction: vi.fn().mockImplementation((callback) => callback(tx)),
    };

    const result = await deleteStudentData(prisma);

    expect(callOrder).toEqual([
      'studentAcademicRecord',
      'disbursement',
      'studentFees',
      'studentScholarship',
      'backup',
      'student',
    ]);
    expect(tx.backup.deleteMany).toHaveBeenCalledWith({
      where: {
        tableName: {
          in: STUDENT_BACKUP_TABLE_NAMES,
        },
      },
    });
    expect(result.deleted).toEqual({
      students: 12,
      studentAcademicRecords: 8,
      disbursements: 7,
      studentFees: 6,
      studentScholarships: 5,
      studentBackups: 3,
    });
    expect(result.scholarshipsBefore).toBe(21);
    expect(result.scholarshipsAfter).toBe(21);
    expect('scholarship' in tx).toBe(false);
  });
});
