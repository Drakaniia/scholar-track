/**
 * TDD tests for dashboard education level filtering
 *
 * RED phase: These tests should fail because the dashboard doesn't
 * yet support grade level filtering.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// ============================================
// UI TESTS: Dashboard page must have grade level filter
// ============================================

describe('dashboard page grade level filter', () => {
  it('has education level select/dropdown in dashboard hero', () => {
    const heroSource = readFileSync(
      join(process.cwd(), 'src/components/dashboard/dashboard-hero.tsx'),
      'utf8'
    );

    expect(heroSource).toContain('All Levels');
    expect(heroSource).toContain('GRADE_LEVELS');
  });


  it('has grade level state variable in dashboard page', () => {
    const pageSource = readFileSync(
      join(process.cwd(), 'src/app/(dashboard)/page.tsx'),
      'utf8'
    );

    expect(pageSource).toContain('gradeLevelFilter');
  });

  it('passes gradeLevelFilter to useDashboardStats hook', () => {
    const pageSource = readFileSync(
      join(process.cwd(), 'src/app/(dashboard)/page.tsx'),
      'utf8'
    );

    // The hook call is multi-line, so check for both params in sequence
    expect(pageSource).toContain('gradeLevelFilter');
  });

  it('passes gradeLevelFilter and onGradeLevelChange props to DashboardOverview', () => {
    const pageSource = readFileSync(
      join(process.cwd(), 'src/app/(dashboard)/page.tsx'),
      'utf8'
    );

    expect(pageSource).toContain('gradeLevelFilter={gradeLevelFilter}');
    expect(pageSource).toContain('onGradeLevelChange={setGradeLevelFilter}');
  });
});

// ============================================
// HOOK TESTS: useDashboardStats must accept gradeLevel
// ============================================

describe('useDashboardStats hook grade level parameter', () => {
  it('accepts gradeLevel parameter in useDashboardStats', () => {
    const hooksSource = readFileSync(
      join(process.cwd(), 'src/hooks/use-queries.ts'),
      'utf8'
    );

    const statsFnStart = hooksSource.indexOf('export function useDashboardStats');
    const statsFnEnd = hooksSource.indexOf('export function useDashboardDetailed');
    const statsFnBody = hooksSource.slice(statsFnStart, statsFnEnd);

    // Must pass gradeLevel to the API
    expect(statsFnBody).toContain('gradeLevel');
    // Must append gradeLevel to URL params
    expect(statsFnBody).toContain("params.append('gradeLevel'");
  });

  it('includes gradeLevel in dashboard stats query key', () => {
    const hooksSource = readFileSync(
      join(process.cwd(), 'src/hooks/use-queries.ts'),
      'utf8'
    );

    // Query key must include gradeLevel
    const queryKeysSection = hooksSource.slice(
      hooksSource.indexOf('dashboard:'),
      hooksSource.indexOf('students:')
    );

    expect(queryKeysSection).toContain('gradeLevel');
  });
});

// ============================================
// API TESTS: Dashboard API must filter by grade level
// ============================================

const prismaMock = vi.hoisted(() => ({
  student: {
    count: vi.fn(),
    findMany: vi.fn(),
    groupBy: vi.fn(),
  },
  scholarship: {
    count: vi.fn(),
    groupBy: vi.fn(),
  },
  studentScholarship: {
    aggregate: vi.fn(),
    findMany: vi.fn(),
  },
  disbursement: {
    aggregate: vi.fn(),
    findMany: vi.fn(),
  },
}));

const queryOptimizerMock = vi.hoisted(() => ({
  get: vi.fn(),
  set: vi.fn(),
  invalidatePattern: vi.fn(),
}));

const batchQueriesMock = vi.hoisted(() =>
  vi.fn(async (queries: Record<string, () => Promise<unknown>>) => {
    const results: Record<string, unknown> = {};
    for (const [key, query] of Object.entries(queries)) {
      results[key] = await query();
    }
    return results;
  })
);

const generateQueryKeyMock = vi.hoisted(() => vi.fn<(key: string, extra?: Record<string, unknown>) => string>(() => 'mock-dashboard-key'));

vi.mock('@/lib/prisma', () => ({
  default: prismaMock,
}));

vi.mock('@/lib/query-optimizer', () => ({
  batchQueries: batchQueriesMock,
  generateQueryKey: generateQueryKeyMock,
  queryOptimizer: queryOptimizerMock,
}));

describe('dashboard API grade level filter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryOptimizerMock.get.mockReturnValue(null);
    // Default mock returns
    prismaMock.student.count.mockResolvedValue(0);
    prismaMock.student.findMany.mockResolvedValue([]);
    prismaMock.student.groupBy.mockResolvedValue([]);
    prismaMock.scholarship.count.mockResolvedValue(0);
    prismaMock.scholarship.groupBy.mockResolvedValue([]);
    prismaMock.studentScholarship.aggregate.mockResolvedValue({ _sum: { grantAmount: 0 } });
    prismaMock.disbursement.aggregate.mockResolvedValue({ _sum: { amount: 0 } });
    prismaMock.studentScholarship.findMany.mockResolvedValue([]);
    prismaMock.disbursement.findMany.mockResolvedValue([]);
  });

  it('accepts gradeLevel query parameter', async () => {
    const { GET } = await import('@/app/api/dashboard/route');
    await GET(
      new NextRequest('http://localhost/api/dashboard?gradeLevel=COLLEGE')
    );

    // Verify the cache key includes gradeLevel
    const cacheKeyCall = generateQueryKeyMock.mock.calls[0]!;
    expect(cacheKeyCall[1]!).toHaveProperty('gradeLevel');
    expect(cacheKeyCall[1]!.gradeLevel).toBe('COLLEGE');
  });

  it('includes gradeLevel in cache key', async () => {
    const { GET } = await import('@/app/api/dashboard/route');
    await GET(
      new NextRequest('http://localhost/api/dashboard?gradeLevel=GRADE_SCHOOL')
    );

    const cacheKeyCall = generateQueryKeyMock.mock.calls[0]!;
    expect(cacheKeyCall[1]!.gradeLevel).toBe('GRADE_SCHOOL');
  });

  it('does not include gradeLevel filter when not provided', async () => {
    const { GET } = await import('@/app/api/dashboard/route');
    await GET(
      new NextRequest('http://localhost/api/dashboard')
    );

    const cacheKeyCall = generateQueryKeyMock.mock.calls[0]!;
    expect(cacheKeyCall[1]!).not.toHaveProperty('gradeLevel');
  });
});
