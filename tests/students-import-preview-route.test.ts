import ExcelJS from 'exceljs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const authMock = vi.hoisted(() => ({
  getSession: vi.fn(),
}));

const prismaMock = vi.hoisted(() => ({
  student: {
    findFirst: vi.fn(),
  },
}));

vi.mock('@/lib/auth', () => authMock);

vi.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}));

async function createWorkbookFile(rows: Record<string, string>[]) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Students');
  const headers = Object.keys(rows[0] ?? {});

  worksheet.addRow(headers);
  rows.forEach((row) => {
    worksheet.addRow(headers.map((header) => row[header] ?? ''));
  });

  const buffer = await workbook.xlsx.writeBuffer();

  return new File([Buffer.from(buffer as ArrayBuffer)], 'students.xlsx', {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

async function createImportPreviewRequest(rows: Record<string, string>[]) {
  const formData = new FormData();
  formData.append('file', await createWorkbookFile(rows));

  return new Request('http://localhost/api/students/import/preview', {
    method: 'POST',
    body: formData,
  });
}

describe('students import preview route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMock.getSession.mockResolvedValue({ id: 1, role: 'ADMIN' });
    prismaMock.student.findFirst.mockResolvedValue(null);
  });

  it('does not treat a strand column as the student program', async () => {
    const { POST } = await import('@/app/api/students/import/preview/route');

    const response = await POST(
      (await createImportPreviewRequest([
        {
          firstName: 'Ana',
          lastName: 'Reyes',
          strand: 'STEM',
          gradeLevel: 'SENIOR_HIGH',
          yearLevel: 'Grade 11',
          status: 'Active',
        },
      ])) as never
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.valid).toBe(0);
    expect(body.data.invalid).toBe(1);
    expect(body.data.errors[0].errors).toContain('program is required');
  });
});
