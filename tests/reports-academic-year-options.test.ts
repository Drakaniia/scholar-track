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
});
