import { SCHOLARSHIP_TERMS, SCHOLARSHIP_TERM_LABELS, ScholarshipTerm } from '@/types';

export const DEFAULT_COVERED_TERMS = '1ST,2ND';
export const LGU_COVERED_TERMS = '1ST,2ND,3RD';

export function parseCoveredTerms(value: string | null | undefined): ScholarshipTerm[] {
  const parsedTerms = (value || DEFAULT_COVERED_TERMS)
    .split(',')
    .map((term) => normalizeTermCode(term))
    .filter((term): term is ScholarshipTerm => term !== null);

  return parsedTerms.length > 0 ? Array.from(new Set(parsedTerms)) : ['1ST', '2ND'];
}

export function serializeCoveredTerms(terms: ScholarshipTerm[]): string {
  const uniqueTerms = SCHOLARSHIP_TERMS.filter((term) => terms.includes(term));
  return (uniqueTerms.length > 0 ? uniqueTerms : ['1ST', '2ND']).join(',');
}

export function scholarshipCoversTerm(
  coveredTerms: string | null | undefined,
  term: string | null | undefined
): boolean {
  const termCode = normalizeTermCode(term);
  return !!termCode && parseCoveredTerms(coveredTerms).includes(termCode);
}

export function getAcademicTermCode(semester: string | null | undefined): ScholarshipTerm {
  return normalizeTermCode(semester) || '1ST';
}

export function getAcademicTermLabel(semester: string | null | undefined): string {
  return SCHOLARSHIP_TERM_LABELS[getAcademicTermCode(semester)];
}

export function getCoveredTermsLabel(coveredTerms: string | null | undefined): string {
  return parseCoveredTerms(coveredTerms)
    .map((term) => SCHOLARSHIP_TERM_LABELS[term])
    .join(', ');
}

export function normalizeTermCode(value: string | null | undefined): ScholarshipTerm | null {
  if (!value) return null;

  const normalized = value.trim().toUpperCase();

  if (
    normalized === '1ST' ||
    normalized.includes('1ST SEMESTER') ||
    normalized.includes('FIRST SEMESTER')
  ) {
    return '1ST';
  }

  if (
    normalized === '2ND' ||
    normalized.includes('2ND SEMESTER') ||
    normalized.includes('SECOND SEMESTER')
  ) {
    return '2ND';
  }

  if (
    normalized === '3RD' ||
    normalized.includes('3RD SEMESTER') ||
    normalized.includes('THIRD SEMESTER')
  ) {
    return '3RD';
  }

  return null;
}
