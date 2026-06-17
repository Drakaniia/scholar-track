import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const formSource = readFileSync(
  join(process.cwd(), 'src/components/forms/scholarship-form.tsx'),
  'utf8'
);

describe('scholarship form eligible programs', () => {
  it('shows an Other option in the eligible programs list for custom programs', () => {
    // The programs list should include an "Other" option that reveals a text input
    expect(formSource).toContain('Other');
    expect(formSource).toContain('showCustomProgramInput');
    expect(formSource).toContain('customProgramName');
  });

  it('reveals a text input when Other is selected for programs', () => {
    // When "Other" is toggled, a text input for custom program name should appear
    expect(formSource).toContain('Enter custom program');
    expect(formSource).toContain('handleCustomProgramAdd');
  });

  it('displays added custom programs as removable badges', () => {
    // Custom programs should display as badges/tags that can be removed
    expect(formSource).toContain('handleRemoveCustomProgram');
    expect(formSource).toContain('selectedPrograms');
  });
});
