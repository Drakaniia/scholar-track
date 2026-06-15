import 'dotenv/config';

import { NextRequest } from 'next/server';

import prisma from '../src/lib/prisma';

async function main() {
  const [feeYears, academicYears, scholarships] = await Promise.all([
    prisma.studentFees.findMany({
      select: {
        studentId: true,
        academicYear: true,
        student: { select: { gradeLevel: true } },
      },
      orderBy: { academicYear: 'asc' },
    }),
    prisma.academicYear.findMany({
      select: { year: true },
      orderBy: { year: 'asc' },
    }),
    prisma.scholarship.findMany({
      include: {
        students: {
          select: {
            studentId: true,
            student: {
              select: {
                gradeLevel: true,
                fees: {
                  select: {
                    tuitionFee: true,
                    otherFee: true,
                    miscellaneousFee: true,
                    laboratoryFee: true,
                    amountSubsidy: true,
                    academicYear: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { scholarshipName: 'asc' },
    }),
  ]);

  console.log('counts', {
    feeYears: feeYears.length,
    academicYears: academicYears.length,
    scholarships: scholarships.length,
  });

  const { GET } = await import('../src/app/api/export/summary/route');
  const response = await GET(new NextRequest('http://localhost/api/export/summary?format=xlsx'));

  console.log('status', response.status);
  if (!response.ok) {
    console.log(await response.text());
  } else {
    const buffer = await response.arrayBuffer();
    console.log('ok bytes', buffer.byteLength);
  }
}

main()
  .catch((error) => {
    console.error('ERROR', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
