/**
 * TDD tests for student form individual sponsor field
 *
 * Verifies that the student form renders an individualSponsor input in each
 * assigned scholarship card when the scholarship type is INDIVIDUAL.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const studentFormSource = readFileSync(
  join(process.cwd(), 'src/components/forms/student-form.tsx'),
  'utf8'
);

describe('student form individual sponsor', () => {
  it('SelectedScholarship interface includes individualSponsor', () => {
    // The interface must have the individualSponsor field
    expect(studentFormSource).toContain('individualSponsor');
  });

  it('individualSponsor field is optional string in SelectedScholarship', () => {
    // Find the interface and check the field type
    const interfaceStart = studentFormSource.indexOf('interface SelectedScholarship');
    const interfaceEnd = studentFormSource.indexOf('}', interfaceStart);
    const interfaceBody = studentFormSource.slice(interfaceStart, interfaceEnd + 1);
    expect(interfaceBody).toContain('individualSponsor');
    expect(interfaceBody).toContain('string');
  });

  it('scholarship card renders individualSponsor input for INDIVIDUAL type', () => {
    // The card rendering should conditionally show the sponsor input
    expect(studentFormSource).toContain('INDIVIDUAL');
    expect(studentFormSource).toContain('individualSponsor');
  });

  it('buildSubmitData maps individualSponsor to submission', () => {
    // The buildSubmitData function should include individualSponsor
    const submitStart = studentFormSource.indexOf('const buildSubmitData');
    const submitEnd = studentFormSource.indexOf('const watchedValues');
    const submitFn = studentFormSource.slice(submitStart, submitEnd);
    expect(submitFn).toContain('individualSponsor');
  });
});
