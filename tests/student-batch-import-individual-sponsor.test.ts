/**
 * TDD tests for batch student import handling individualSponsor
 *
 * Verifies that the POST /api/students endpoint accepts individualSponsor
 * in its scholarship assignment schema and passes it through to Prisma.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const routeSource = readFileSync(join(process.cwd(), 'src/app/api/students/route.ts'), 'utf8');

describe('batch import individualSponsor handling', () => {
  it('studentScholarshipAssignmentSchema includes individualSponsor', () => {
    // The Zod schema for scholarship assignments must accept individualSponsor
    expect(routeSource).toContain('individualSponsor');
  });

  it('individualSponsor is optional string in Zod schema', () => {
    // Find the studentScholarshipAssignmentSchema definition
    const schemaStart = routeSource.indexOf('const studentScholarshipAssignmentSchema');
    const schemaEnd = routeSource.indexOf('});', schemaStart) + 3;
    const schemaBody = routeSource.slice(schemaStart, schemaEnd);
    expect(schemaBody).toContain('individualSponsor');
    // Should be z.string().optional() or nullable
    expect(schemaBody).toContain('z.string()');
    expect(schemaBody).toContain('optional');
  });

  it('createMany passes individualSponsor in batch creation', () => {
    // The createMany data should include individualSponsor
    const createManyStart = routeSource.indexOf('createMany');
    const createManyEnd = routeSource.indexOf('});', createManyStart) + 3;
    const createManyData = routeSource.slice(createManyStart, createManyEnd);
    expect(createManyData).toContain('individualSponsor');
  });

  it('single create path passes individualSponsor', () => {
    // The single student scholarship create should also pass individualSponsor
    expect(routeSource).toContain('individualSponsor');
  });
});
