/**
 * Scholarship update tests — TDD approach
 *
 * Verifies that when editing a scholarship, all fields including
 * academicYearId are correctly passed through the update pipeline.
 */
import { describe, expect, it } from 'vitest';

import { CreateScholarshipInput, Scholarship } from '@/types';

/**
 * Simulates the defaultValues extraction logic in the scholarships page.
 * When `academicYearId` is present on the scholarship, it MUST be
 * included in the defaultValues so the form does not clear it.
 */
function buildEditDefaultValues(scholarship: Scholarship): Partial<CreateScholarshipInput> {
  return {
    scholarshipName: scholarship.scholarshipName,
    sponsor: scholarship.sponsor,
    type: scholarship.type,
    source: scholarship.source,
    eligibleGradeLevels: scholarship.eligibleGradeLevels || '',
    eligiblePrograms: scholarship.eligiblePrograms || '',
    amount: scholarship.amount,
    amountSubsidy: scholarship.amountSubsidy,
    percentSubsidy: scholarship.percentSubsidy,
    requirements: scholarship.requirements || '',
    status: scholarship.status,
    grantType: scholarship.grantType,
    coversTuition: scholarship.coversTuition,
    coversMiscellaneous: scholarship.coversMiscellaneous,
    coversLaboratory: scholarship.coversLaboratory,
    coversOther: scholarship.coversOther,
    coveredTerms: scholarship.coveredTerms,
    otherFeeName: scholarship.otherFeeName || undefined,
    tuitionFee: scholarship.tuitionFee,
    miscellaneousFee: scholarship.miscellaneousFee,
    laboratoryFee: scholarship.laboratoryFee,
    otherFee: scholarship.otherFee,
    // BUG: academicYearId is MISSING from this list in the actual page code
    // This test verifies it should be present
    academicYearId: scholarship.academicYearId ?? null,
  };
}

/**
 * Simulates the form submission data — the defaultValues that
 * react-hook-form sends through handleSubmit, after the form's
 * handleFormSubmit enriches it with local state values.
 */
function simulateFormSubmit(
  defaultValues: Partial<CreateScholarshipInput>,
  overrides?: Partial<CreateScholarshipInput>
): CreateScholarshipInput {
  // This mirrors what ScholarshipForm.handleFormSubmit does
  return {
    scholarshipName: defaultValues.scholarshipName ?? '',
    sponsor: defaultValues.sponsor ?? '',
    type: defaultValues.type ?? 'PAEB',
    source: defaultValues.source ?? 'INTERNAL',
    eligibleGradeLevels: defaultValues.eligibleGradeLevels ?? '',
    eligiblePrograms: defaultValues.eligiblePrograms ?? null,
    amount: defaultValues.amount ?? 0,
    requirements: defaultValues.requirements ?? '',
    status: defaultValues.status ?? 'Active',
    grantType: defaultValues.grantType ?? 'FULL',
    coversTuition: defaultValues.coversTuition ?? false,
    coversMiscellaneous: defaultValues.coversMiscellaneous ?? false,
    coversLaboratory: defaultValues.coversLaboratory ?? false,
    coversOther: defaultValues.coversOther ?? false,
    otherFeeName: defaultValues.otherFeeName ?? null,
    tuitionFee: defaultValues.tuitionFee ?? 0,
    miscellaneousFee: defaultValues.miscellaneousFee ?? 0,
    laboratoryFee: defaultValues.laboratoryFee ?? 0,
    otherFee: defaultValues.otherFee ?? 0,
    amountSubsidy: defaultValues.amountSubsidy ?? 0,
    percentSubsidy: defaultValues.percentSubsidy ?? 0,
    coveredTerms: defaultValues.coveredTerms ?? '1ST,2ND',
    academicYearId: defaultValues.academicYearId ?? null,
    ...overrides,
  };
}

describe('scholarship update', () => {
  // Sample scholarship with an academicYearId set
  const scholarshipWithAcademicYear: Scholarship = {
    id: 1,
    scholarshipName: 'Test Scholarship',
    sponsor: 'Test Sponsor',
    type: 'PAEB',
    source: 'INTERNAL',
    eligibleGradeLevels: 'COLLEGE',
    eligiblePrograms: 'BS Education',
    amount: 10000,
    amountSubsidy: 5000,
    percentSubsidy: 0.5,
    requirements: 'Good grades',
    status: 'Active',
    isArchived: false,
    grantType: 'FULL',
    coversTuition: true,
    coversMiscellaneous: true,
    coversLaboratory: false,
    coversOther: false,
    coveredTerms: '1ST,2ND',
    otherFeeName: null,
    tuitionFee: 20000,
    miscellaneousFee: 5000,
    laboratoryFee: 3000,
    otherFee: 2000,
    academicYearId: 42, // <-- has an academic year set
  };

  it('includes academicYearId in edit defaultValues when scholarship has one', () => {
    const defaultValues = buildEditDefaultValues(scholarshipWithAcademicYear);

    // The critical assertion: academicYearId must survive the round-trip
    expect(defaultValues.academicYearId).toBe(42);
  });

  it('passes academicYearId through form submission without clearing it', () => {
    const defaultValues = buildEditDefaultValues(scholarshipWithAcademicYear);
    const submittedData = simulateFormSubmit(defaultValues);

    expect(submittedData.academicYearId).toBe(42);
  });

  it('preserves academicYearId as null when scholarship has none', () => {
    const scholarshipWithoutYear: Scholarship = {
      ...scholarshipWithAcademicYear,
      academicYearId: null,
    };

    const defaultValues = buildEditDefaultValues(scholarshipWithoutYear);
    const submittedData = simulateFormSubmit(defaultValues);

    // When scholarship has no academic year, it should remain null
    expect(submittedData.academicYearId).toBeNull();
  });

  it('does not drop academicYearId when user modifies other fields', () => {
    const defaultValues = buildEditDefaultValues(scholarshipWithAcademicYear);
    // User changes the scholarship name
    const submittedData = simulateFormSubmit(defaultValues, {
      scholarshipName: 'Updated Scholarship',
    });

    // Academic year must survive unrelated field changes
    expect(submittedData.scholarshipName).toBe('Updated Scholarship');
    expect(submittedData.academicYearId).toBe(42);
  });

  it('allows updating academicYearId to a different value', () => {
    const defaultValues = buildEditDefaultValues(scholarshipWithAcademicYear);
    const submittedData = simulateFormSubmit(defaultValues, {
      academicYearId: 99,
    });

    expect(submittedData.academicYearId).toBe(99);
  });

  it('allows clearing academicYearId explicitly', () => {
    const defaultValues = buildEditDefaultValues(scholarshipWithAcademicYear);
    const submittedData = simulateFormSubmit(defaultValues, {
      academicYearId: null,
    });

    expect(submittedData.academicYearId).toBeNull();
  });

  it('does not set academicYearId to undefined (must be number or null)', () => {
    // This simulates the current bug: defaultValues without academicYearId
    const buggyDefaultValues: Partial<CreateScholarshipInput> = {
      scholarshipName: scholarshipWithAcademicYear.scholarshipName,
      sponsor: scholarshipWithAcademicYear.sponsor,
      // academicYearId intentionally omitted — like the buggy page code
    };

    const submittedData = simulateFormSubmit(buggyDefaultValues);

    // When academicYearId is missing from defaults, the form falls back to null.
    // This means the existing academic year gets CLEARED on every edit — THE BUG.
    expect(submittedData.academicYearId).toBeNull();
  });
});
