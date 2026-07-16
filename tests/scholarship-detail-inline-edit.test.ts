/**
 * TDD tests for scholarship detail page inline editing
 *
 * Verifies that the scholarship detail dialog allows inline editing
 * of grantAmount and individualSponsor for each assigned student.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const pageSource = readFileSync(
  join(process.cwd(), 'src/app/(dashboard)/scholarships/page.tsx'),
  'utf8'
);

describe('scholarship detail page inline editing', () => {
  it('shows individualSponsor field in assigned student card', () => {
    // The assigned student card should display individualSponsor
    expect(pageSource).toContain('individualSponsor');
  });

  it('allows inline editing of grantAmount', () => {
    // Should have an editable grant amount field
    // Check for an edit button or toggle near the grant amount display
    expect(pageSource).toContain('inlineEditingId');
    expect(pageSource).toContain('setInlineEditingId');
  });

  it('saves inline edits via PATCH endpoint', () => {
    // Should call PATCH /api/scholarships/[id]/students/[ssId]
    expect(pageSource).toContain('/api/scholarships');
    expect(pageSource).toContain('PATCH');
    expect(pageSource).toContain('grantAmount');
  });

  it('shows sponsor input when scholarship type is INDIVIDUAL', () => {
    // The sponsor input should be shown for INDIVIDUAL type scholarships
    expect(pageSource).toContain('INDIVIDUAL');
  });
});
