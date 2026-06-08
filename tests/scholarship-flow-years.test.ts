import { describe, expect, it } from 'vitest';

import {
  buildScholarshipFlowStartYears,
  getScholarshipFlowEndYear,
} from '@/lib/scholarship-flow-years';

describe('scholarship flow year helpers', () => {
  it('converts a selected start year into a five-year ending year', () => {
    expect(getScholarshipFlowEndYear(2022)).toBe(2026);
  });

  it('builds start-year options from academic years plus current and future starts', () => {
    const options = buildScholarshipFlowStartYears(
      [{ year: '2025-2026' }, { year: '2022-2023' }, { year: 'Invalid' }],
      2026
    );

    expect(options).toEqual([2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031]);
  });
});
