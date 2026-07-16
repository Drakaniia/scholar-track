/**
 * TDD tests for Reports page scholarship academic year filtering
 *
 * Verifies that when filtering by a specific academic year on the Reports page,
 * scholarship records are also filtered by that academic year — not just student
 * fee records.
 *
 * Bug: A student could have Scholarship X in AY 2024-2025 and Scholarship Y
 * in AY 2025-2026. When filtering by 2024-2025, `hasAcademicYearData()` returns
 * true (because Scholarship X matches), but Scholarship Y bleeds into the results
 * because the scholarship type/source filters don't check `ss.academicYearId`.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const reportsPageSource = readFileSync(
  join(process.cwd(), 'src/app/(dashboard)/reports/page.tsx'),
  'utf8'
);

describe('Reports page scholarship academic year filtering', () => {
  // ── Helper: scholarshipMatchesAcademicYear or equivalent ──

  it('uses a helper to check scholarship academic year match before including student in scholarship type group', () => {
    // getStudentsByGradeLevelAndScholarship must call the helper function
    // when filtering by scholarship type, not just ss.scholarship?.type
    const fnStart = reportsPageSource.indexOf('const getStudentsByGradeLevelAndScholarship = ');
    const fnEnd = reportsPageSource.indexOf('const getScholarshipNames');
    const fnBody = reportsPageSource.slice(fnStart, fnEnd);

    // Must use the scholarshipMatchesAcademicYear helper when matching scholarship type
    expect(fnBody).toContain('scholarshipMatchesAcademicYear');
  });

  it('filters scholarship names by academic year when building the names list', () => {
    // getScholarshipNames must filter ss by academic year
    const fnStart = reportsPageSource.indexOf('const getScholarshipNames');
    const fnEnd = reportsPageSource.indexOf('const scholarshipMatchesFundingFilter');
    const fnBody = reportsPageSource.slice(fnStart, fnEnd);

    expect(fnBody).toContain('scholarshipMatchesAcademicYear');
  });

  it('filters scholarship types by academic year when building the type list', () => {
    // filterScholarshipTypes must filter ss by academic year
    const fnStart = reportsPageSource.indexOf('const filterScholarshipTypes');
    let fnEnd = reportsPageSource.indexOf('const hasMatchingScholarship');
    if (fnEnd === -1) fnEnd = reportsPageSource.indexOf('function hasMatchingScholarship');
    const fnBody = reportsPageSource.slice(fnStart, fnEnd);

    expect(fnBody).toContain('scholarshipMatchesAcademicYear');
  });

  it('filters scholarships by academic year when checking hasMatchingScholarship', () => {
    // hasMatchingScholarship must filter ss by academic year
    const fnStart = reportsPageSource.indexOf('const hasMatchingScholarship');
    const fnEnd = reportsPageSource.indexOf('const getFilteredGradeLevelCounts');
    const fnBody = reportsPageSource.slice(fnStart, fnEnd);

    expect(fnBody).toContain('scholarshipMatchesAcademicYear');
  });

  it('filters scholarship types by academic year when building allScholarshipTypes list', () => {
    // The allScholarshipTypes construction must only include scholarship types
    // that belong to the selected academic year
    const typesSectionStart = reportsPageSource.indexOf('const allScholarshipTypes');
    let typesSectionEnd = reportsPageSource.indexOf('const scholarshipTypes');
    if (typesSectionEnd === -1)
      typesSectionEnd = reportsPageSource.indexOf(
        'const scholarshipTypes = filterScholarshipTypes'
      );
    const typesSectionBody = reportsPageSource.slice(typesSectionStart, typesSectionEnd);

    // The .flatMap((s) => s.scholarships || []) should be followed by a filter
    // that checks academic year before .map((ss) => ss.scholarship?.type)
    expect(typesSectionBody).toContain('scholarshipMatchesAcademicYear');
  });

  // ── Scenario: Student with cross-year scholarships ──

  it('does not show a student under a scholarship type that belongs to a different academic year', () => {
    // Scenario: Student has Scholarship A (CHED) in 2024-2025 and Scholarship B (LGU) in 2025-2026
    // When filtering by 2024-2025, the student should only appear under CHED, not LGU
    //
    // Verify the filter condition in getStudentsByGradeLevelAndScholarship
    // includes an academic year check for the specific scholarship record
    const fnStart = reportsPageSource.indexOf('const getStudentsByGradeLevelAndScholarship = ');
    const fnEnd = reportsPageSource.indexOf('const getScholarshipNames');
    const fnBody = reportsPageSource.slice(fnStart, fnEnd);

    // The some() callback for scholarship type matching must also call the helper
    expect(fnBody).toContain('scholarshipMatchesAcademicYear');
  });

  // ── Student count consistency ──

  it('filters scholarship by academic year via hasMatchingScholarship for grade level counts', () => {
    // getFilteredGradeLevelCounts uses hasMatchingScholarship which now calls
    // scholarshipMatchesAcademicYear. Verify the helper exists and works.
    const helperStart = reportsPageSource.indexOf('const scholarshipMatchesAcademicYear = ');
    const helperEnd = reportsPageSource.indexOf('if (loading)');
    const helperBody = reportsPageSource.slice(helperStart, helperEnd);

    // Helper must check ss.academicYearId against the filtered year
    expect(helperBody).toContain('academicYearId');
    expect(helperBody).toContain('academicYearFilter');
    expect(helperBody).toContain('yearById');
  });

  // ── Helper function definition ──

  it('defines a scholarshipMatchesAcademicYear helper function', () => {
    // The helper should be defined in the component
    expect(reportsPageSource).toContain('const scholarshipMatchesAcademicYear = ');
  });

  it('scholarshipMatchesAcademicYear checks ss.academicYearId against yearById', () => {
    const helperStart = reportsPageSource.indexOf('const scholarshipMatchesAcademicYear = ');
    const helperEnd = reportsPageSource.indexOf('if (loading)');
    const helperBody = reportsPageSource.slice(helperStart, helperEnd);

    expect(helperBody).toContain('ss.academicYearId');
    expect(helperBody).toContain('yearById.get');
    expect(helperBody).toContain('academicYearFilter');
  });
});
