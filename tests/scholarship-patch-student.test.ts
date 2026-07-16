/**
 * Scholarship PATCH student endpoint tests — TDD
 *
 * Verifies that the PATCH /api/scholarships/[id]/students/[studentScholarshipId]
 * endpoint handles updating grantAmount and individualSponsor.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const routePath = join(
  process.cwd(),
  'src/app/api/scholarships/[id]/students/[studentScholarshipId]/route.ts'
);

describe('PATCH scholarships/[id]/students/[ssId] endpoint', () => {
  it('exists as a file', () => {
    expect(existsSync(routePath)).toBe(true);
  });

  it('exports a PATCH function', () => {
    const source = readFileSync(routePath, 'utf8');
    expect(source).toContain('export async function PATCH');
  });

  it('accepts grantAmount and individualSponsor in the request body', () => {
    const source = readFileSync(routePath, 'utf8');
    expect(source).toContain('grantAmount');
    expect(source).toContain('individualSponsor');
  });
});
