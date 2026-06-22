import { describe, expect, it } from 'vitest';

import { deriveAcademicYearOptions } from '@/lib/academic-year-utils';

interface FeeLike {
  academicYear: string;
  [key: string]: unknown;
}

describe('deriveAcademicYearOptions', () => {
  it('only includes years from the AcademicYear table, ignoring fee-derived phantom years', () => {
    const academicYears = [
      { id: 1, year: '2024-2025' },
    ];
    const fees: FeeLike[] = [
      { academicYear: '2024-2025' },
      { academicYear: '2025-2026' }, // phantom year from fallback
    ];

    const options = deriveAcademicYearOptions(academicYears, fees);

    expect(options).toHaveLength(1);
    expect(options[0]).toMatchObject({ year: '2024-2025', count: 1 });
  });

  it('includes all academic years even if no students have fees for them', () => {
    const academicYears = [
      { id: 1, year: '2023-2024' },
      { id: 2, year: '2024-2025' },
    ];
    const fees: FeeLike[] = [
      { academicYear: '2024-2025' },
    ];

    const options = deriveAcademicYearOptions(academicYears, fees);

    expect(options).toHaveLength(2);
    expect(options.find((o) => o.year === '2023-2024')).toBeDefined();
    expect(options.find((o) => o.year === '2024-2025')).toBeDefined();
    // 2023-2024 has 0 fees but still appears
    const option2023 = options.find((o) => o.year === '2023-2024')!;
    expect(option2023.count).toBe(0);
  });

  it('sorts years in descending order (most recent first)', () => {
    const academicYears = [
      { id: 1, year: '2023-2024' },
      { id: 2, year: '2024-2025' },
    ];
    const fees: FeeLike[] = [];

    const options = deriveAcademicYearOptions(academicYears, fees);

    expect(options[0].year).toBe('2024-2025');
    expect(options[1].year).toBe('2023-2024');
  });

  // --- NEW TESTS for scholarship-based counting ---

  it('counts scholarship academic year assignments when fees are empty', () => {
    const academicYears = [
      { id: 1, year: '2024-2025' },
    ];
    const yearById = new Map<number, string>([[1, '2024-2025']]);

    const options = deriveAcademicYearOptions(academicYears, [], [], yearById);

    expect(options[0]).toMatchObject({ year: '2024-2025', count: 0 });
  });

  it('counts scholarship academic year IDs toward the academic year count', () => {
    const academicYears = [
      { id: 1, year: '2024-2025' },
      { id: 2, year: '2023-2024' },
    ];
    const yearById = new Map<number, string>([
      [1, '2024-2025'],
      [2, '2023-2024'],
    ]);

    // 3 scholarship assignments for 2024-2025, 1 for 2023-2024
    const scholarshipAcademicYearIds = [1, 1, 1, 2];

    const options = deriveAcademicYearOptions(academicYears, [], scholarshipAcademicYearIds, yearById);

    expect(options.find((o) => o.year === '2024-2025')!.count).toBe(3);
    expect(options.find((o) => o.year === '2023-2024')!.count).toBe(1);
  });

  it('combines fee and scholarship counts for the same academic year', () => {
    const academicYears = [
      { id: 1, year: '2024-2025' },
    ];
    const yearById = new Map<number, string>([[1, '2024-2025']]);
    const fees: FeeLike[] = [
      { academicYear: '2024-2025' },
      { academicYear: '2024-2025' },
    ];
    const scholarshipAcademicYearIds = [1, 1, 1]; // 3 scholarship assignments

    const options = deriveAcademicYearOptions(academicYears, fees, scholarshipAcademicYearIds, yearById);

    // 2 fee records + 3 scholarship assignments = 5
    expect(options[0]).toMatchObject({ year: '2024-2025', count: 5 });
  });

  it('ignores null/undefined scholarship academic year IDs', () => {
    const academicYears = [
      { id: 1, year: '2024-2025' },
    ];
    const yearById = new Map<number, string>([[1, '2024-2025']]);
    const scholarshipAcademicYearIds = [1, null, undefined, 1] as (number | null | undefined)[];

    const options = deriveAcademicYearOptions(academicYears, [], scholarshipAcademicYearIds, yearById);

    // Only 2 valid IDs (1 and 1)
    expect(options[0]).toMatchObject({ year: '2024-2025', count: 2 });
  });
});
