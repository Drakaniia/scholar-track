/**
 * TDD tests for hiding the Program column in the student list table
 * for non-College grade levels.
 *
 * The Program column should only be visible when the grade level filter
 * is set to 'COLLEGE'. For all other grade levels (KINDERGARTEN,
 * GRADE_SCHOOL, JUNIOR_HIGH, SENIOR_HIGH) and 'all', the column
 * should be hidden.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const studentPageSource = readFileSync(
  join(process.cwd(), 'src/app/(dashboard)/students/page.tsx'),
  'utf8'
);

describe('student list page - Program column visibility', () => {
  // Test 1: The main table should contain the conditional pattern wrapping the Program header.
  // The skeleton also has a Program header, so we look for the conditional JSX pattern.
  it('wraps the main table Program header in gradeLevelFilter === COLLEGE conditional', () => {
    // Look for the conditional pattern directly: "gradeLevelFilter === 'COLLEGE'" followed by
    // a <TableHead>Program</TableHead> within the same block expression
    expect(studentPageSource).toContain('gradeLevelFilter');
    expect(studentPageSource).toContain('COLLEGE');
    expect(studentPageSource).toContain('<TableHead>Program</TableHead>');

    // Verify the Program TableHead appears AFTER the gradeLevelFilter === 'COLLEGE' check
    const gradeLevelFilterIndex = studentPageSource.indexOf("gradeLevelFilter === 'COLLEGE'");
    const programHeadIndex = studentPageSource.indexOf(
      '<TableHead>Program</TableHead>',
      gradeLevelFilterIndex
    );
    // There should be a Program TableHead after the COLLEGE check
    expect(programHeadIndex).toBeGreaterThan(gradeLevelFilterIndex);
  });

  // Test 2: The Program data cell must be wrapped in a conditional for gradeLevelFilter === 'COLLEGE'
  it('wraps the program table cell in gradeLevelFilter === COLLEGE conditional', () => {
    // Find the second occurrence of student.program (the first is in the type definition,
    // the second should be in the conditional table cell)
    const firstProgOccurrence = studentPageSource.indexOf('student.program');
    const secondProgOccurrence = studentPageSource.indexOf(
      'student.program',
      firstProgOccurrence + 1
    );
    expect(secondProgOccurrence).toBeGreaterThan(0);

    // Look before the second occurrence for the COLLEGE condition
    const contextBefore = studentPageSource.slice(
      Math.max(0, secondProgOccurrence - 80),
      secondProgOccurrence
    );
    expect(contextBefore).toContain('gradeLevelFilter');
    expect(contextBefore).toContain("=== 'COLLEGE'");
  });

  // Test 3: The skeleton should accept a showProgramColumn prop
  it('accepts showProgramColumn prop in StudentsTableLoading', () => {
    const skeletonStart = studentPageSource.indexOf('function StudentsTableLoading');
    const skeletonEnd = studentPageSource.indexOf('function StudentDetailSkeleton');
    const skeletonSection = studentPageSource.slice(skeletonStart, skeletonEnd);

    // The skeleton should now expect a showProgramColumn prop
    expect(skeletonSection).toContain('showProgramColumn');
  });

  // Test 4: The skeleton now conditionally renders Program header based on showProgramColumn
  it('conditionally renders skeleton Program header based on showProgramColumn', () => {
    const skeletonStart = studentPageSource.indexOf('function StudentsTableLoading');
    const skeletonEnd = studentPageSource.indexOf('function StudentDetailSkeleton');
    const skeletonSection = studentPageSource.slice(skeletonStart, skeletonEnd);

    // The skeleton's Program TableHead should be wrapped in showProgramColumn &&
    expect(skeletonSection).toContain('showProgramColumn');
    expect(skeletonSection).toContain('<TableHead>Program</TableHead>');

    // Verify they're linked: showProgramColumn appears before Program TableHead
    const showProgIdx = skeletonSection.indexOf('showProgramColumn');
    const progHeadIdx = skeletonSection.indexOf('<TableHead>Program</TableHead>');
    expect(progHeadIdx).toBeGreaterThan(showProgIdx);
  });

  // Test 5: The parent passes showProgramColumn prop to StudentsTableLoading
  it('passes showProgramColumn={gradeLevelFilter === "COLLEGE"} to StudentsTableLoading', () => {
    // The parent should pass showProgramColumn based on gradeLevelFilter
    expect(studentPageSource).toContain('showProgramColumn={gradeLevelFilter ===');
  });
});
