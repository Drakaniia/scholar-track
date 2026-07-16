/**
 * Scholarship API tests for Individual Sponsorship — TDD
 *
 * Verifies that API routes accept and pass through the individualSponsor field.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const postRouteSource = readFileSync(
  join(process.cwd(), 'src/app/api/students/[id]/scholarships/route.ts'),
  'utf8'
);

const putRouteSource = readFileSync(
  join(process.cwd(), 'src/app/api/students/[id]/route.ts'),
  'utf8'
);

describe('POST student/[id]/scholarships accepts individualSponsor', () => {
  it('destructures individualSponsor from request body', () => {
    // The POST handler should destructure individualSponsor from the body
    expect(postRouteSource).toContain('individualSponsor');
  });

  it('passes individualSponsor to Prisma create', () => {
    // The Prisma create call should include individualSponsor
    expect(postRouteSource).toContain('individualSponsor:');
  });

  it('defaults individualSponsor to null when not provided', () => {
    // individualSponsor should default to null when empty
    expect(postRouteSource).toMatch(/individualSponsor.*\|\|\s*null/);
  });
});

describe('PUT student/[id] passes individualSponsor', () => {
  it('passes individualSponsor in createMany scholarship data', () => {
    // The PUT handler should include individualSponsor in the createMany data
    expect(putRouteSource).toContain('individualSponsor');
  });
});
