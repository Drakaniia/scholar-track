// Validation schemas and helpers
import { CreateScholarshipInput, CreateStudentInput } from '@/types';

export function validateStudent(data: Partial<CreateStudentInput>): string[] {
  const errors: string[] = [];

  if (!data.lastName?.trim()) {
    errors.push('Last name is required');
  }

  if (!data.firstName?.trim()) {
    errors.push('First name is required');
  }

  if (!data.program?.trim()) {
    errors.push('Program is required');
  }

  if (!data.yearLevel) {
    errors.push('Year level is required');
  }

  return errors;
}

export function validateScholarship(data: Partial<CreateScholarshipInput>): string[] {
  const errors: string[] = [];

  if (!data.scholarshipName?.trim()) {
    errors.push('Scholarship name is required');
  }

  if (!data.sponsor?.trim()) {
    errors.push('Sponsor is required');
  }

  if (!data.type) {
    errors.push('Scholarship type is required');
  }

  if (data.amount === undefined || data.amount <= 0) {
    errors.push('Amount must be greater than 0');
  }

  return errors;
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhoneNumber(phone: string): boolean {
  // Philippine phone number format
  const phoneRegex = /^(09|\+639)\d{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

export function getGradeLevelForStudent(studentGradeLevel: string): string[] {
  const normalizedGradeLevel = normalizeEligibilityValue(studentGradeLevel);

  if (isKnownGradeLevel(normalizedGradeLevel, GRADE_LEVEL_CATEGORY_ALIASES.KINDERGARTEN)) {
    return [...GRADE_LEVEL_CATEGORY_ALIASES.KINDERGARTEN];
  }

  if (isKnownGradeLevel(normalizedGradeLevel, GRADE_LEVEL_CATEGORY_ALIASES.GRADE_SCHOOL)) {
    return [...GRADE_LEVEL_CATEGORY_ALIASES.GRADE_SCHOOL];
  }

  if (isKnownGradeLevel(normalizedGradeLevel, GRADE_LEVEL_CATEGORY_ALIASES.JUNIOR_HIGH)) {
    return [...GRADE_LEVEL_CATEGORY_ALIASES.JUNIOR_HIGH];
  }

  if (isKnownGradeLevel(normalizedGradeLevel, GRADE_LEVEL_CATEGORY_ALIASES.SENIOR_HIGH)) {
    return [...GRADE_LEVEL_CATEGORY_ALIASES.SENIOR_HIGH];
  }

  if (isKnownGradeLevel(normalizedGradeLevel, GRADE_LEVEL_CATEGORY_ALIASES.COLLEGE)) {
    return [...GRADE_LEVEL_CATEGORY_ALIASES.COLLEGE];
  }

  return [studentGradeLevel.toUpperCase(), normalizedGradeLevel];
}

/**
 * Normalizes a year level string for matching (e.g., "Grade 1" -> "GRADE 1")
 */
export function normalizeYearLevel(yearLevel: string | null | undefined): string {
  if (!yearLevel) return '';
  return normalizeEligibilityValue(yearLevel);
}

/**
 * Checks if a student is eligible based on their grade level category and specific year level.
 *
 * Logic:
 * 1. Normalize both the student's yearLevel and the scholarship's eligibility list.
 * 2. A match is found if:
 *    a) The student's normalized yearLevel is directly in the eligibility list.
 *    b) The student's grade level category alias (e.g., "BED", "COLLEGE") is in the list.
 */
export function isGradeLevelEligibleForScholarship(
  studentGradeLevel: string | null | undefined,
  eligibleGradeLevels: string | null | undefined,
  studentYearLevel?: string | null | undefined
): boolean {
  if (!studentGradeLevel) {
    return false;
  }

  const eligibleLevels = parseGradeEligibilityList(eligibleGradeLevels);

  if (eligibleLevels.length === 0) {
    return false;
  }

  // Check 1: Direct year level match (e.g., "GRADE 1" matches "Grade 1")
  if (studentYearLevel) {
    const normalizedYear = normalizeYearLevel(studentYearLevel);
    if (eligibleLevels.includes(normalizedYear)) {
      return true;
    }
  }

  // Check 2: Category alias match (e.g., "BED" matches a Grade School student)
  const categoryAliases = getGradeLevelForStudent(studentGradeLevel).map(normalizeEligibilityValue);

  return eligibleLevels.some((level) => categoryAliases.includes(level));
}

export function isProgramEligibleForScholarship(
  studentProgram: string | null | undefined,
  eligiblePrograms: string | null | undefined
): boolean {
  const programs = parseCommaSeparatedEligibilityList(eligiblePrograms);

  if (programs.length === 0) {
    return true;
  }

  if (!studentProgram?.trim()) {
    return false;
  }

  const normalizedStudentProgram = normalizeProgramValue(studentProgram);

  return programs.some((program) => normalizeProgramValue(program) === normalizedStudentProgram);
}

export function isScholarshipEligibleForStudent(
  student: { gradeLevel?: string | null; program?: string | null; yearLevel?: string | null },
  scholarship: { eligibleGradeLevels?: string | null; eligiblePrograms?: string | null }
): boolean {
  return (
    isGradeLevelEligibleForScholarship(
      student.gradeLevel,
      scholarship.eligibleGradeLevels,
      student.yearLevel
    ) && isProgramEligibleForScholarship(student.program, scholarship.eligiblePrograms)
  );
}

const GRADE_LEVEL_CATEGORY_ALIASES = {
  KINDERGARTEN: [
    'KINDERGARTEN',
    'KINDER',
    'PREP',
    'PREPARATORY',
    'K',
    'PRESCHOOL',
    'BED',
    'BASIC_EDUCATION',
    'BASIC EDUCATION',
    'ELEMENTARY',
    'GS',
  ],
  GRADE_SCHOOL: [
    'GRADE_SCHOOL',
    'GRADE SCHOOL',
    'BED',
    'BASIC_EDUCATION',
    'BASIC EDUCATION',
    'BASIC EDUCATION DEPARTMENT',
    'ELEMENTARY',
    'GRADE SCHOOL DEPARTMENT',
    'GS',
    'KINDERGARTEN',
    'KINDER',
    'PREP',
  ],
  JUNIOR_HIGH: ['JUNIOR_HIGH', 'JUNIOR HIGH', 'JUNIOR HIGH SCHOOL', 'JHS'],
  SENIOR_HIGH: ['SENIOR_HIGH', 'SENIOR HIGH', 'SENIOR HIGH SCHOOL', 'SHS'],
  COLLEGE: [
    'COLLEGE',
    'HIED',
    'HI ED',
    'HI-ED',
    'HIGHER EDUCATION',
    'HIGHER_EDUCATION',
    'HIGHER EDUCATION DEPARTMENT',
    'TERTIARY',
    'UNIVERSITY',
  ],
} as const;

function isKnownGradeLevel(normalizedGradeLevel: string, aliases: readonly string[]): boolean {
  return aliases.some((alias) => normalizeEligibilityValue(alias) === normalizedGradeLevel);
}

function parseGradeEligibilityList(value: string | null | undefined): string[] {
  return (value || '')
    .split(/[,;/|]+/)
    .map(normalizeEligibilityValue)
    .filter(Boolean);
}

function parseCommaSeparatedEligibilityList(value: string | null | undefined): string[] {
  return (value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeEligibilityValue(value: string): string {
  return value.trim().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').toUpperCase();
}

function normalizeProgramValue(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}
