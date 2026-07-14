'use client';

import { useEffect, useState } from 'react';

/**
 * React hook that returns whether the user prefers reduced motion.
 * Reactively updates if the user changes their system setting while the app is open.
 *
 * Usage:
 * ```tsx
 * const reducedMotion = useReducedMotion();
 * // Skip animations when true
 * ```
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    queueMicrotask(() => setReduced(mq.matches));

    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return reduced;
}
