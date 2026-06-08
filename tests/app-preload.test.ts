import { describe, expect, it } from 'vitest';

import {
  DEFAULT_PRELOAD_ROUTES,
  buildPreloadEndpoints,
  buildPreloadQueries,
  clearSessionPreloadMarkers,
  getPreloadRoutes,
  getQueryCacheStorageKey,
  getSessionPreloadMarkerKey,
} from '@/lib/app-preload';

class MemoryStorage implements Pick<Storage, 'getItem' | 'setItem' | 'removeItem' | 'key' | 'length'> {
  private readonly values = new Map<string, string>();

  get length() {
    return this.values.size;
  }

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  key(index: number) {
    return Array.from(this.values.keys())[index] ?? null;
  }

  removeItem(key: string) {
    this.values.delete(key);
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

describe('application preload manifest', () => {
  it('prefetches every major dashboard route for administrators', () => {
    expect(getPreloadRoutes('ADMIN')).toEqual([
      '/',
      '/students',
      '/registry',
      '/scholarships',
      '/scholarship-flow',
      '/reports',
      '/settings',
    ]);
  });

  it('does not prefetch the admin-only settings route for non-admin users', () => {
    expect(getPreloadRoutes('STAFF')).toEqual(DEFAULT_PRELOAD_ROUTES);
    expect(getPreloadRoutes('VIEWER')).not.toContain('/settings');
  });

  it('builds stable per-user cache keys that are invalidated by a cache buster', () => {
    expect(getQueryCacheStorageKey(42)).toMatch(
      /^scholartrack:query-cache:v\d+:user:42$/
    );
    expect(getSessionPreloadMarkerKey(42)).toMatch(
      /^scholartrack:preload-complete:v\d+:user:42$/
    );
  });

  it('preloads core query-backed pages before optional admin endpoints', () => {
    const queries = buildPreloadQueries({ role: 'ADMIN', now: new Date('2026-06-08T00:00:00Z') });
    const labels = queries.map((query) => query.label);

    expect(labels.slice(0, 6)).toEqual([
      'dashboard:stats:all',
      'students:list:default',
      'students:filters:default',
      'scholarships:list:default',
      'scholarships:filters:default',
      'academic-years:active',
    ]);
    expect(labels).toContain('dashboard:detailed:all');
    expect(labels).toContain('scholarship-flow:all');
  });

  it('adds admin-only endpoint cache warmups for settings data', () => {
    expect(buildPreloadEndpoints({ role: 'STAFF' }).map((endpoint) => endpoint.url)).toContain(
      '/api/registry?page=1&limit=12&lane=all&status=all'
    );
    expect(buildPreloadEndpoints({ role: 'STAFF' }).map((endpoint) => endpoint.url)).not.toContain(
      '/api/users?page=1&limit=25'
    );
    expect(buildPreloadEndpoints({ role: 'ADMIN' }).map((endpoint) => endpoint.url)).toContain(
      '/api/users?page=1&limit=25'
    );
  });

  it('clears only ScholarTrack preload completion markers', () => {
    const storage = new MemoryStorage();
    const markerKey = getSessionPreloadMarkerKey(42);
    storage.setItem(markerKey, 'true');
    storage.setItem('unrelated', 'keep');

    clearSessionPreloadMarkers(storage);

    expect(storage.getItem(markerKey)).toBeNull();
    expect(storage.getItem('unrelated')).toBe('keep');
  });
});
