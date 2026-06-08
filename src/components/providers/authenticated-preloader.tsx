'use client';

import { useEffect, useRef } from 'react';

import { useRouter } from 'next/navigation';

import { useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/components/auth/auth-provider';
import {
  buildPreloadEndpoints,
  buildPreloadQueries,
  getPreloadRoutes,
  hasCompletedSessionPreload,
  markSessionPreloadComplete,
  prefetchApplicationEndpoints,
  prefetchApplicationQueries,
} from '@/lib/app-preload';
import {
  persistQueryCache,
  restoreQueryCache,
  subscribeQueryCachePersistence,
} from '@/lib/query-persistence';

function scheduleIdleWork(callback: () => void) {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const browserWindow = window as Window & {
    requestIdleCallback?: (handler: IdleRequestCallback, options?: IdleRequestOptions) => number;
    cancelIdleCallback?: (handle: number) => void;
  };

  if (browserWindow.requestIdleCallback && browserWindow.cancelIdleCallback) {
    const id = browserWindow.requestIdleCallback(callback, { timeout: 1200 });
    return () => browserWindow.cancelIdleCallback?.(id);
  }

  const id = browserWindow.setTimeout(callback, 0);
  return () => browserWindow.clearTimeout(id);
}

function preloadCommonComponentChunks() {
  return Promise.allSettled([
    import('@/components/forms/student-form'),
    import('@/components/forms/scholarship-form'),
    import('@/components/forms/student-fees-manager'),
    import('@/components/shared/export-button'),
  ]);
}

export function AuthenticatedPreloader() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isLoading } = useAuth();
  const preloadStartedForUser = useRef<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      return;
    }

    restoreQueryCache(queryClient, user.id);
    const unsubscribe = subscribeQueryCachePersistence(queryClient, user.id);

    return unsubscribe;
  }, [isAuthenticated, queryClient, user?.id]);

  useEffect(() => {
    if (!isAuthenticated || isLoading || !user?.id) {
      return;
    }

    const userId = String(user.id);
    if (preloadStartedForUser.current === userId || hasCompletedSessionPreload(user.id)) {
      return;
    }

    preloadStartedForUser.current = userId;

    const routes = getPreloadRoutes(user.role);
    routes.forEach((route) => router.prefetch(route));

    let cancelled = false;
    const cancelIdleWork = scheduleIdleWork(() => {
      const queries = buildPreloadQueries({ role: user.role });
      const endpoints = buildPreloadEndpoints({ role: user.role });
      const highPriorityQueries = queries.slice(0, 6);
      const remainingQueries = queries.slice(6);

      void (async () => {
        await prefetchApplicationQueries(queryClient, highPriorityQueries);

        if (cancelled) {
          return;
        }

        await Promise.allSettled([
          prefetchApplicationQueries(queryClient, remainingQueries),
          prefetchApplicationEndpoints(endpoints),
          preloadCommonComponentChunks(),
        ]);

        if (!cancelled) {
          markSessionPreloadComplete(user.id);
          persistQueryCache(queryClient, user.id);
        }
      })();
    });

    return () => {
      cancelled = true;
      cancelIdleWork();
    };
  }, [isAuthenticated, isLoading, queryClient, router, user?.id, user?.role]);

  return null;
}
