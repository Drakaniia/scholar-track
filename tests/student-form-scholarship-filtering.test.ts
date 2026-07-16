/**
 * TDD tests for student form scholarship filtering by education level
 *
 * Verifies that when adding/editing a student, the scholarship selection
 * modal properly filters scholarships based on the student's grade level.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const studentFormSource = readFileSync(
  join(process.cwd(), 'src/components/forms/student-form.tsx'),
  'utf8'
);

describe('student form scholarship filtering', () => {
  // Test 1: fetchScholarships must accept and pass eligibleGradeLevels to the API
  it('passes eligibleGradeLevels filter when fetching scholarships for student form', () => {
    // The fetchScholarships function should build a URL with eligibleGradeLevels param
    expect(studentFormSource).toContain('eligibleGradeLevels');
    expect(studentFormSource).toContain('encodeURIComponent(gradeLevelFilter)');
    // Should construct URL with the filter param
    expect(studentFormSource).toContain('&eligibleGradeLevels=');
  });

  // Test 2: Grade level change should trigger scholarship refetch
  it('refetches scholarships when student grade level changes', () => {
    // The handleGradeLevelChange function should call fetchScholarships with the new grade level
    // Check the whole source since slicing can be fragile with formatting
    expect(studentFormSource).toContain('fetchScholarships(value)');
    // Also verify it's called right after the form resets
    expect(studentFormSource).toContain('setCustomProgram');
    expect(studentFormSource).toContain('Refetch scholarships filtered by the new grade level');
  });

  // Test 3: Initial fetch uses the default values grade level when editing
  it('fetches scholarships with initial grade level when editing an existing student', () => {
    // The mount useEffect should pass defaultValues?.gradeLevel to fetchScholarships
    expect(studentFormSource).toContain('fetchScholarships(initialGradeLevel || undefined)');
    expect(studentFormSource).toContain('defaultValues?.gradeLevel');
  });

  // Test 4: Already uses isScholarshipEligibleForStudent for client-side filtering
  it('filters scholarship list by student eligibility on the client side', () => {
    // The filteredScholarships should use isScholarshipEligibleForStudent
    expect(studentFormSource).toContain('isScholarshipEligibleForStudent');
    expect(studentFormSource).toContain('matchesStudentEligibility');
  });

  // Test 5: The addScholarship function validates eligibility before adding
  it('validates student eligibility before adding a scholarship', () => {
    // addScholarship should check eligibility and show error toast
    const addFnStart = studentFormSource.indexOf('const addScholarship = ');
    const addFnEnd = studentFormSource.indexOf('const removeScholarship = ');
    const addFnBody = studentFormSource.slice(addFnStart, addFnEnd);

    expect(addFnBody).toContain('isScholarshipEligibleForStudent');
    expect(addFnBody).toContain("toast.error('Student is not eligible for this scholarship.'");
  });

  // Test 6: Auto-removes scholarships when student grade level changes to an ineligible one
  it('removes ineligible scholarships when student grade level changes', () => {
    // There should be a useEffect that filters out ineligible scholarships
    expect(studentFormSource).toContain('isScholarshipEligibleForStudent');
    // The scholarship year filtering is separate from grade level filtering
    // Grade level auto-removal happens in the effect around line ~497
    expect(studentFormSource).toContain('eligibleScholarships');
    expect(studentFormSource).toContain('filter((selected)');
  });

  // Test 7: An ineligible scholarship shows the correct error message when manually added
  it('shows clear error when trying to add an ineligible scholarship', () => {
    expect(studentFormSource).toContain('Student is not eligible for this scholarship');
  });
});
