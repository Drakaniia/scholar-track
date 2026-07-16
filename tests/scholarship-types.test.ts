/**
 * Scholarship types tests — TDD approach
 *
 * Verifies that the ScholarshipType union, SCHOLARSHIP_TYPES constant,
 * and SCHOLARSHIP_TYPE_LABELS include the new INDIVIDUAL type.
 * Also verifies that StudentScholarship and CreateStudentInput have
 * the individualSponsor field.
 */
import { describe, expect, it } from 'vitest';

import { SCHOLARSHIP_TYPES, SCHOLARSHIP_TYPE_LABELS } from '@/types';
import type { CreateStudentInput, ScholarshipType, StudentScholarship } from '@/types';

describe('scholarship types include INDIVIDUAL', () => {
  it('has INDIVIDUAL in the ScholarshipType union', () => {
    // This is a compile-time check — if INDIVIDUAL is not in the union,
    // the assignment below will fail type-checking
    const individual: ScholarshipType = 'INDIVIDUAL';
    expect(individual).toBe('INDIVIDUAL');
  });

  it('has INDIVIDUAL in the SCHOLARSHIP_TYPES array', () => {
    expect(SCHOLARSHIP_TYPES).toContain('INDIVIDUAL');
  });

  it('has INDIVIDUAL in the SCHOLARSHIP_TYPE_LABELS map', () => {
    expect(SCHOLARSHIP_TYPE_LABELS['INDIVIDUAL']).toBe('Individual Sponsorship');
  });
});

describe('StudentScholarship has individualSponsor', () => {
  it('allows individualSponsor to be set on a StudentScholarship object', () => {
    // TypeScript will compile-time error if individualSponsor is not on the interface
    const ss: StudentScholarship = {
      id: 1,
      studentId: 1,
      scholarshipId: 1,
      awardDate: new Date(),
      grantAmount: 10000,
      grantType: 'FULL',
      scholarshipStatus: 'Active',
      createdAt: new Date(),
      updatedAt: new Date(),
      individualSponsor: 'Ms. Reyes',
    };
    expect(ss.individualSponsor).toBe('Ms. Reyes');
  });

  it('allows individualSponsor to be null or undefined', () => {
    const ss: StudentScholarship = {
      id: 1,
      studentId: 1,
      scholarshipId: 1,
      awardDate: new Date(),
      grantAmount: 10000,
      grantType: 'FULL',
      scholarshipStatus: 'Active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    // individualSponsor is optional — should be undefined when not set
    expect(ss.individualSponsor).toBeUndefined();
  });
});

describe('CreateStudentInput scholarship sub-object has individualSponsor', () => {
  it('allows individualSponsor in the scholarships array', () => {
    // TypeScript will compile-time error if individualSponsor is not on the sub-object
    const input: CreateStudentInput = {
      lastName: 'Doe',
      firstName: 'John',
      program: 'BS IT',
      gradeLevel: 'COLLEGE',
      yearLevel: '1',
      status: 'Active',
      scholarships: [
        {
          scholarshipId: 1,
          awardDate: new Date(),
          grantAmount: 10000,
          scholarshipStatus: 'Active',
          individualSponsor: 'Mr. Cruz',
        },
      ],
    };
    expect(input.scholarships![0].individualSponsor).toBe('Mr. Cruz');
  });
});
