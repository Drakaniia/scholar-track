import { describe, expect, it } from 'vitest';

import {
  isGradeLevelEligibleForScholarship,
  isScholarshipEligibleForStudent,
} from '@/lib/validations';

describe('scholarship eligibility helpers', () => {
  it('matches the scholarship category labels used by the scholarship setup', () => {
    expect(isGradeLevelEligibleForScholarship('GRADE_SCHOOL', 'BED')).toBe(true);
    expect(isGradeLevelEligibleForScholarship('JUNIOR_HIGH', 'JHS')).toBe(true);
    expect(isGradeLevelEligibleForScholarship('SENIOR_HIGH', 'SHS')).toBe(true);
    expect(isGradeLevelEligibleForScholarship('COLLEGE', 'HIED')).toBe(true);
  });

  it('does not show scholarships from other student level categories', () => {
    expect(isGradeLevelEligibleForScholarship('JUNIOR_HIGH', 'BED')).toBe(false);
    expect(isGradeLevelEligibleForScholarship('SENIOR_HIGH', 'JHS')).toBe(false);
    expect(isGradeLevelEligibleForScholarship('GRADE_SCHOOL', 'SHS')).toBe(false);
    expect(isGradeLevelEligibleForScholarship('COLLEGE', 'BED,JHS,SHS')).toBe(false);
  });

  it('continues to support existing stored grade level values', () => {
    expect(isGradeLevelEligibleForScholarship('JUNIOR_HIGH', 'GRADE_SCHOOL,JUNIOR_HIGH')).toBe(
      true
    );
    expect(isGradeLevelEligibleForScholarship('SENIOR_HIGH', 'JUNIOR_HIGH,SENIOR_HIGH')).toBe(
      true
    );
    expect(isGradeLevelEligibleForScholarship('COLLEGE', 'SENIOR_HIGH,COLLEGE')).toBe(true);
  });

  it('supports slash-separated category labels such as JHS/SHS', () => {
    expect(isGradeLevelEligibleForScholarship('JUNIOR_HIGH', 'JHS/SHS')).toBe(true);
    expect(isGradeLevelEligibleForScholarship('SENIOR_HIGH', 'JHS/SHS')).toBe(true);
    expect(isGradeLevelEligibleForScholarship('COLLEGE', 'JHS/SHS')).toBe(false);
  });

  it('applies college program restrictions after grade level compatibility', () => {
    const scholarship = {
      eligibleGradeLevels: 'COLLEGE',
      eligiblePrograms: 'BS Education,BS Nursing',
    };

    expect(
      isScholarshipEligibleForStudent(
        { gradeLevel: 'COLLEGE', program: 'BS Education' },
        scholarship
      )
    ).toBe(true);
    expect(
      isScholarshipEligibleForStudent(
        { gradeLevel: 'COLLEGE', program: 'BS Computer Science' },
        scholarship
      )
    ).toBe(false);
  });

  it('supports specific year level matching (e.g. Grade 1 only)', () => {
    // Scholarship specifically for Grade 1
    expect(isGradeLevelEligibleForScholarship('GRADE_SCHOOL', 'Grade 1', 'Grade 1')).toBe(true);
    // Scholarship for Grade 1 should not match Grade 2 student
    expect(isGradeLevelEligibleForScholarship('GRADE_SCHOOL', 'Grade 1', 'Grade 2')).toBe(false);
    
    // Scholarship for broad category BED should match any Grade 1-6
    expect(isGradeLevelEligibleForScholarship('GRADE_SCHOOL', 'BED', 'Grade 1')).toBe(true);
    expect(isGradeLevelEligibleForScholarship('GRADE_SCHOOL', 'BED', 'Grade 6')).toBe(true);
  });

  it('supports mixed specific and broad eligibility', () => {
    // Scholarship for Grade 1 OR JHS
    const eligibility = 'Grade 1, JHS';
    expect(isGradeLevelEligibleForScholarship('GRADE_SCHOOL', eligibility, 'Grade 1')).toBe(true);
    expect(isGradeLevelEligibleForScholarship('JUNIOR_HIGH', eligibility, 'Grade 7')).toBe(true);
    expect(isGradeLevelEligibleForScholarship('GRADE_SCHOOL', eligibility, 'Grade 2')).toBe(false);
  });

  it('includes KINDERGARTEN in the GRADE_LEVELS constant', async () => {
    const { GRADE_LEVELS } = await import('@/types');
    expect(GRADE_LEVELS).toContain('KINDERGARTEN');
  });

  it('has a label for KINDERGARTEN', async () => {
    const { GRADE_LEVEL_LABELS } = await import('@/types');
    expect(GRADE_LEVEL_LABELS['KINDERGARTEN']).toBeDefined();
    expect(GRADE_LEVEL_LABELS['KINDERGARTEN']).toBe('Kindergarten');
  });

  it('has year levels defined for KINDERGARTEN', async () => {
    const { YEAR_LEVELS } = await import('@/types');
    expect(YEAR_LEVELS['KINDERGARTEN']).toBeDefined();
    expect(YEAR_LEVELS['KINDERGARTEN']).toContain('Kindergarten');
  });

  it('recognizes Kindergarten student for scholarship eligibility via alias K', () => {
    expect(isGradeLevelEligibleForScholarship('KINDERGARTEN', 'KINDERGARTEN')).toBe(true);
  });

  it('recognizes Kindergarten student for scholarship via broad category aliases', () => {
    // Kindergarten is part of Basic Education so BED should match
    expect(isGradeLevelEligibleForScholarship('KINDERGARTEN', 'BED')).toBe(true);
    expect(isGradeLevelEligibleForScholarship('KINDERGARTEN', 'BASIC_EDUCATION')).toBe(true);
  });

  it('does not match Kindergarten with unrelated grade levels', () => {
    expect(isGradeLevelEligibleForScholarship('KINDERGARTEN', 'SHS')).toBe(false);
    expect(isGradeLevelEligibleForScholarship('KINDERGARTEN', 'COLLEGE')).toBe(false);
    // GRADE_SCHOOL (Grades 1-6) is separate from Kindergarten
    expect(isGradeLevelEligibleForScholarship('KINDERGARTEN', 'GRADE_SCHOOL')).toBe(false);
  });

  it('direct year level match works for Kindergarten', () => {
    expect(isGradeLevelEligibleForScholarship('KINDERGARTEN', 'Kindergarten', 'Kindergarten')).toBe(true);
    expect(isGradeLevelEligibleForScholarship('GRADE_SCHOOL', 'Kindergarten', 'Kindergarten')).toBe(true);
  });
});
