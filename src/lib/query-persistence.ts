import {
  QueryClient,
  dehydrate,
  hydrate,
  type DehydratedState,
  type QueryKey,
} from '@tanstack/react-query';

import {
  PRELOAD_CACHE_BUSTER,
  getQueryCacheStorageKey,
} from '@/lib/app-preload';

type QueryCacheStorage = Pick<
  Storage,
  'getItem' | 'setItem' | 'removeItem' | 'key' | 'length'
>;

interface PersistedQueryCache {
  buster: string;
  timestamp: number;
  clientState: DehydratedState;
}

export const QUERY_CACHE_MAX_AGE = 8 * 60 * 60 * 1000;
export const QUERY_CACHE_PERSIST_DELAY = 750;

const PERSISTABLE_QUERY_ROOTS = new Set([
  'academicYears',
  'dashboard',
  'scholarships',
  'students',
  'users',
]);

function getLocalStorage() {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage;
}

export function isPersistableQueryKey(queryKey: QueryKey) {
  return Array.isArray(queryKey) && PERSISTABLE_QUERY_ROOTS.has(String(queryKey[0]));
}

export function createQueryCacheSnapshot(
  queryClient: QueryClient,
  timestamp = Date.now()
): PersistedQueryCache {
  return {
    buster: PRELOAD_CACHE_BUSTER,
    timestamp,
    clientState: dehydrate(queryClient, {
      shouldDehydrateQuery: (query) =>
        query.state.status === 'success' && isPersistableQueryKey(query.queryKey),
    }),
  };
}

function parsePersistedCache(value: string | null) {
  if (!value) return null;

  try {
    return JSON.parse(value) as PersistedQueryCache;
  } catch {
    return null;
  }
}

function isFreshPersistedCache(cache: PersistedQueryCache, now: number) {
  return cache.buster === PRELOAD_CACHE_BUSTER && now - cache.timestamp <= QUERY_CACHE_MAX_AGE;
}

export function persistQueryCache(
  queryClient: QueryClient,
  userId: number | string | null | undefined,
  storage: QueryCacheStorage | null = getLocalStorage(),
  timestamp = Date.now()
) {
  if (!storage || userId === null || userId === undefined) {
    return false;
  }

  try {
    const snapshot = createQueryCacheSnapshot(queryClient, timestamp);
    storage.setItem(getQueryCacheStorageKey(userId), JSON.stringify(snapshot));
    return true;
  } catch {
    return false;
  }
}

export function restoreQueryCache(
  queryClient: QueryClient,
  userId: number | string | null | undefined,
  storage: QueryCacheStorage | null = getLocalStorage(),
  now = Date.now()
) {
  if (!storage || userId === null || userId === undefined) {
    return false;
  }

  const key = getQueryCacheStorageKey(userId);
  const cache = parsePersistedCache(storage.getItem(key));

  if (!cache || !isFreshPersistedCache(cache, now)) {
    storage.removeItem(key);
    return false;
  }

  try {
    hydrate(queryClient, cache.clientState);
    return true;
  } catch {
    storage.removeItem(key);
    return false;
  }
}

export function subscribeQueryCachePersistence(
  queryClient: QueryClient,
  userId: number | string | null | undefined,
  storage: QueryCacheStorage | null = getLocalStorage()
) {
  if (!storage || userId === null || userId === undefined) {
    return () => {};
  }

  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const flush = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    persistQueryCache(queryClient, userId, storage);
  };

  const schedulePersist = () => {
    if (timeoutId) return;
    timeoutId = setTimeout(flush, QUERY_CACHE_PERSIST_DELAY);
  };

  const unsubscribe = queryClient.getQueryCache().subscribe(schedulePersist);

  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', flush);
  }

  return () => {
    unsubscribe();
    flush();
    if (typeof window !== 'undefined') {
      window.removeEventListener('beforeunload', flush);
    }
  };
}

export function clearPersistedQueryCaches(storage: QueryCacheStorage | null = getLocalStorage()) {
  if (!storage) {
    return;
  }

  const keysToRemove: string[] = [];
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (key?.startsWith('scholartrack:query-cache:')) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach((key) => storage.removeItem(key));
}
