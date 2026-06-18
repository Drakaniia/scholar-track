import { describe, expect, it } from 'vitest';

import { resolveAcademicYearForFee } from '@/lib/academic-year-utils';

describe('resolveAcademicYearForFee', () => {
  it('returns empty year when no academic year is resolved - no date-based fallback', () => {
    const result = resolveAcademicYearForFee(null);

    expect(result.year).toBe('');
    expect(result.termCode).toBe('');
    expect(result.term).toBe('');
  });

  it('returns the year string and term when a resolved academic year is provided', () => {
    const result = resolveAcademicYearForFee({
      year: '2024-2025',
      semester: '1ST',
    });

    expect(result.year).toBe('2024-2025');
    expect(result.termCode).toBe('1ST');
    expect(result.term).toBe('1st Semester');
  });

  it('handles 2nd semester correctly', () => {
    const result = resolveAcademicYearForFee({
      year: '2024-2025',
      semester: '2ND',
    });

    expect(result.year).toBe('2024-2025');
    expect(result.termCode).toBe('2ND');
    expect(result.term).toBe('2nd Semester');
  });

  it('handles summer term (defaults to 1ST since summer is not a scholarship term)', () => {
    const result = resolveAcademicYearForFee({
      year: '2024-2025',
      semester: 'SUMMER',
    });

    expect(result.year).toBe('2024-2025');
    expect(result.termCode).toBe('1ST');
    expect(result.term).toBe('1st Semester');
  });
});
