/**
 * Tests for Issue 1: Scholarship visibility filtering by education level
 * Tests for Issue 2: Immediate UI updates after create/edit/delete mutations
 *
 * TDD: These tests are written first, then code is implemented to pass them.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// ============================================
// ISSUE 1: Scholarship Visibility by Education Level
// ============================================

describe('scholarship visibility by education level', () => {
  // UI test: scholarships page must have an education level filter
  it('renders education level filter tabs on the scholarships page', () => {
    const pageSource = readFileSync(
      join(process.cwd(), 'src/app/(dashboard)/scholarships/page.tsx'),
      'utf8'
    );

    // Must have grade level filter options
    expect(pageSource).toContain('eligibleGradeLevels');
    // Must have labels for BED/JHS/SHS/College
    expect(pageSource).toContain('BED');
    expect(pageSource).toContain('JHS');
    expect(pageSource).toContain('SHS');
    expect(pageSource).toContain('College');
    // Must have a filter field or select for grade level
    expect(pageSource).toContain('Education Level');
    expect(pageSource).toContain('All Levels');
  });

  // The API must accept an eligibleGradeLevels search param
  it('accepts eligibleGradeLevels query parameter in scholarships API route', () => {
    const routeSource = readFileSync(
      join(process.cwd(), 'src/app/api/scholarships/route.ts'),
      'utf8'
    );

    expect(routeSource).toContain('eligibleGradeLevels');
    // The search param should be extracted
    expect(routeSource).toContain("searchParams.get('eligibleGradeLevels')");
    // It should be added to the where clause
    expect(routeSource).toContain('eligibleGradeLevels');
  });

  // The ScholarshipFilters type must have an eligibleGradeLevels field
  it('includes eligibleGradeLevels in ScholarshipFilters type', () => {
    const hooksSource = readFileSync(
      join(process.cwd(), 'src/hooks/use-queries.ts'),
      'utf8'
    );

    expect(hooksSource).toContain('eligibleGradeLevels');
  });
});

// ============================================
// ISSUE 2: Immediate UI Updates After Mutations
// ============================================

describe('scholarship mutation immediate UI updates', () => {
  it('forces immediate refetch on scholarship create', () => {
    const hooksSource = readFileSync(
      join(process.cwd(), 'src/hooks/use-queries.ts'),
      'utf8'
    );

    // Find the useCreateScholarship function and verify refetchType: 'all'
    const createFnStart = hooksSource.indexOf('export function useCreateScholarship');
    const createFnEnd = hooksSource.indexOf('export function useUpdateScholarship');
    const createFnBody = hooksSource.slice(createFnStart, createFnEnd);

    // Must use refetchType: 'all' for immediate refetch
    expect(createFnBody).toContain('refetchType');
    expect(createFnBody).toContain("'all'");
  });

  it('forces immediate refetch on scholarship delete', () => {
    const hooksSource = readFileSync(
      join(process.cwd(), 'src/hooks/use-queries.ts'),
      'utf8'
    );

    // Find the useDeleteScholarship function
    const deleteFnStart = hooksSource.indexOf('export function useDeleteScholarship');
    const deleteFnEnd = hooksSource.indexOf('export function useScholarshipFlow');
    const deleteFnBody = hooksSource.slice(deleteFnStart, deleteFnEnd);

    // Must use refetchType: 'all' for immediate refetch
    expect(deleteFnBody).toContain('refetchType');
    expect(deleteFnBody).toContain("'all'");
  });

  it('refetches dashboard statistics after scholarship mutations', () => {
    const hooksSource = readFileSync(
      join(process.cwd(), 'src/hooks/use-queries.ts'),
      'utf8'
    );

    // All three mutation hooks must invalidate dashboard queries
    const mutations = ['useCreateScholarship', 'useUpdateScholarship', 'useDeleteScholarship'];

    for (const mutationName of mutations) {
      const fnStart = hooksSource.indexOf(`export function ${mutationName}`);
      const fnEnd = hooksSource.indexOf('export function', fnStart + 10);
      const fnBody = fnEnd > fnStart
        ? hooksSource.slice(fnStart, fnEnd)
        : hooksSource.slice(fnStart);

      expect(fnBody).toContain('queryKeys.dashboard.all');
    }
  });
});

// ============================================
// ISSUE 1: API Integration Test
// ============================================

const prismaMock = vi.hoisted(() => ({
  scholarship: {
    findMany: vi.fn(),
    count: vi.fn(),
  },
}));

const queryOptimizerMock = vi.hoisted(() => ({
  get: vi.fn(),
  set: vi.fn(),
  invalidatePattern: vi.fn(),
}));

const buildSearchWhereMock = vi.hoisted(() =>
  vi.fn(
    (search: string, _fields: string[], additional: Record<string, unknown>) => ({
      ...(search
        ? {
            OR: _fields.map((field: string) => ({
              [field]: { contains: search, mode: 'insensitive' as const },
            })),
          }
        : {}),
      ...additional,
    })
  )
);

const generateQueryKeyMock = vi.hoisted(() => vi.fn(() => 'mock-key'));
const getPaginationParamsMock = vi.hoisted(() => vi.fn(() => ({ skip: 0, take: 10 })));

vi.mock('@/lib/prisma', () => ({
  default: prismaMock,
}));

vi.mock('@/lib/query-optimizer', () => ({
  buildSearchWhere: buildSearchWhereMock,
  generateQueryKey: generateQueryKeyMock,
  getPaginationParams: getPaginationParamsMock,
  queryOptimizer: queryOptimizerMock,
}));

vi.mock('@/lib/auth', () => ({
  getSession: vi.fn().mockResolvedValue({ id: 1, role: 'ADMIN', username: 'admin' }),
}));

describe('scholarships API eligibleGradeLevels filter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryOptimizerMock.get.mockReturnValue(null);
    prismaMock.scholarship.findMany.mockResolvedValue([]);
    prismaMock.scholarship.count.mockResolvedValue(0);
  });

  it('passes eligibleGradeLevels filter to Prisma query when provided', async () => {
    prismaMock.scholarship.findMany.mockResolvedValueOnce([
      {
        id: 1,
        scholarshipName: 'College Grant',
        eligibleGradeLevels: 'COLLEGE',
      },
    ]);
    prismaMock.scholarship.count.mockResolvedValueOnce(1);

    const { GET } = await import('@/app/api/scholarships/route');
    const response = await GET(
      new NextRequest('http://localhost/api/scholarships?eligibleGradeLevels=COLLEGE&page=1&limit=10')
    );

    expect(response.status).toBe(200);

    // Verify Prisma was called with the eligibleGradeLevels contains filter in where clause
    const findManyCall = prismaMock.scholarship.findMany.mock.calls[0];
    const whereClause = findManyCall[0].where;
    expect(whereClause).toHaveProperty('eligibleGradeLevels');
    expect(whereClause.eligibleGradeLevels).toEqual({ contains: 'COLLEGE' });
  });

  it('passes eligibleGradeLevels filter to count query when provided', async () => {
    prismaMock.scholarship.findMany.mockResolvedValueOnce([]);
    prismaMock.scholarship.count.mockResolvedValueOnce(0);

    const { GET } = await import('@/app/api/scholarships/route');
    await GET(
      new NextRequest('http://localhost/api/scholarships?eligibleGradeLevels=JUNIOR_HIGH&page=1&limit=10')
    );

    const countCall = prismaMock.scholarship.count.mock.calls[0];
    const whereClause = countCall[0].where;
    expect(whereClause).toHaveProperty('eligibleGradeLevels');
    expect(whereClause.eligibleGradeLevels).toEqual({ contains: 'JUNIOR_HIGH' });
  });

  it('does not include eligibleGradeLevels filter when not provided', async () => {
    prismaMock.scholarship.findMany.mockResolvedValueOnce([]);
    prismaMock.scholarship.count.mockResolvedValueOnce(0);

    const { GET } = await import('@/app/api/scholarships/route');
    await GET(
      new NextRequest('http://localhost/api/scholarships?page=1&limit=10')
    );

    const findManyCall = prismaMock.scholarship.findMany.mock.calls[0];
    const whereClause = findManyCall[0].where;
    // eligibleGradeLevels should NOT be in the where clause when not provided
    expect(Object.keys(whereClause)).not.toContain('eligibleGradeLevels');
  });
});
