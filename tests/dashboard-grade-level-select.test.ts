/**
 * TDD test for dashboard grade level Select hydration crash fix
 *
 * The Radix UI Select.Item throws an error when value is an empty string.
 * This test ensures the "All Levels" option uses a non-empty sentinel value
 * and all related code paths handle it consistently.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const heroSource = readFileSync(
  join(process.cwd(), 'src/components/dashboard/dashboard-hero.tsx'),
  'utf8'
);

const pageSource = readFileSync(join(process.cwd(), 'src/app/(dashboard)/page.tsx'), 'utf8');

const queriesSource = readFileSync(join(process.cwd(), 'src/hooks/use-queries.ts'), 'utf8');

const flowSource = readFileSync(
  join(process.cwd(), 'src/app/(dashboard)/scholarship-flow/page.tsx'),
  'utf8'
);

describe('dashboard grade level Select', () => {
  it('uses a non-empty sentinel value for "All Levels" SelectItem in dashboard hero', () => {
    expect(heroSource).not.toContain('<SelectItem value="">All Levels</SelectItem>');
  });

  it('uses "all" as the sentinel value for "All Levels" SelectItem in dashboard hero', () => {
    expect(heroSource).toContain('<SelectItem value="all">All Levels</SelectItem>');
  });

  it('initializes gradeLevelFilter state to "all" in the dashboard page', () => {
    expect(pageSource).toContain("useState<string>('all')");
    expect(pageSource).not.toContain("useState<string>('')");
  });

  it('does not send "all" as a gradeLevel query parameter via useDashboardStats', () => {
    const queryFnSource = queriesSource.slice(
      queriesSource.indexOf('useDashboardStats'),
      queriesSource.indexOf('useDashboardDetailed')
    );
    expect(queryFnSource).toContain("gradeLevel !== 'all'");
  });
});

describe('scholarship flow grade level Select', () => {
  it('uses a non-empty sentinel value for "All Levels" SelectItem', () => {
    expect(flowSource).not.toContain('<SelectItem value="">All Levels</SelectItem>');
  });

  it('uses "all" as the sentinel value for "All Levels" SelectItem', () => {
    expect(flowSource).toContain('<SelectItem value="all">All Levels</SelectItem>');
  });

  it('initializes gradeLevelFilter state to "all" in the scholarship flow page', () => {
    expect(flowSource).toContain("useState('all')");
    expect(flowSource).not.toContain("useState('')");
  });

  it('does not send "all" as a gradeLevel query parameter via useScholarshipFlow', () => {
    const queryFnSource = queriesSource.slice(
      queriesSource.indexOf('useScholarshipFlow'),
      queriesSource.indexOf('\n/**\n * Hook to prefetch')
    );
    expect(queryFnSource).toContain("gradeLevel !== 'all'");
  });
});
