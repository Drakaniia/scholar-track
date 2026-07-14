'use client';

import { ReactNode } from 'react';

import { usePathname } from 'next/navigation';

import { AnimatePresence, motion } from 'motion/react';

import { useReducedMotion } from '@/hooks/use-reduced-motion';

interface PageTransitionProps {
  children: ReactNode;
}

const variants = {
  hidden: {
    opacity: 0,
    y: 8,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      bounce: 0,
      duration: 0.35,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.1,
      ease: [0.22, 1, 0.36, 1],
    },
  },
} as const;

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <div className="w-full relative">{children}</div>;
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={variants}
        className="w-full relative"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
