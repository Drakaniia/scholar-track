import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';

import { queryKeys } from '@/hooks/use-queries';
import { getQueryCacheStorageKey } from '@/lib/app-preload';
import {
  QUERY_CACHE_MAX_AGE,
  createQueryCacheSnapshot,
  persistQueryCache,
  restoreQueryCache,
} from '@/lib/query-persistence';

class MemoryStorage implements Pick<
  Storage,
  'getItem' | 'setItem' | 'removeItem' | 'key' | 'length'
> {
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

describe('query cache persistence', () => {
  it('serializes only successful ScholarTrack application queries', () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(queryKeys.dashboard.stats('all'), { success: true, data: 'stats' });
    queryClient.setQueryData(['unrelated'], { value: 'skip' });

    const snapshot = createQueryCacheSnapshot(queryClient, 1000);

    expect(snapshot.clientState.queries).toHaveLength(1);
    expect(snapshot.clientState.queries[0].queryKey).toEqual(queryKeys.dashboard.stats('all'));
  });

  it('restores a fresh persisted cache for the matching user', () => {
    const storage = new MemoryStorage();
    const sourceClient = new QueryClient();
    const targetClient = new QueryClient();
    const queryKey = queryKeys.students.list({ page: 1, limit: 11, archived: false });

    sourceClient.setQueryData(queryKey, { success: true, data: [{ id: 1 }] });
    persistQueryCache(sourceClient, 7, storage, 1000);

    expect(restoreQueryCache(targetClient, 7, storage, 1000 + QUERY_CACHE_MAX_AGE - 1)).toBe(true);
    expect(targetClient.getQueryData(queryKey)).toEqual({ success: true, data: [{ id: 1 }] });
  });

  it('rejects expired persisted cache data', () => {
    const storage = new MemoryStorage();
    const sourceClient = new QueryClient();
    const targetClient = new QueryClient();
    const queryKey = queryKeys.scholarships.list({ page: 1, limit: 10 });

    sourceClient.setQueryData(queryKey, { success: true, data: [{ id: 2 }] });
    persistQueryCache(sourceClient, 9, storage, 1000);

    expect(restoreQueryCache(targetClient, 9, storage, 1000 + QUERY_CACHE_MAX_AGE + 1)).toBe(false);
    expect(targetClient.getQueryData(queryKey)).toBeUndefined();
    expect(storage.getItem(getQueryCacheStorageKey(9))).toBeNull();
  });
});
