'use client';

import { CSSProperties, ReactNode, useRef } from 'react';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

import { cn } from '@/lib/utils';

gsap.registerPlugin(useGSAP);

const NUMBER_PATTERN = /-?\d[\d,]*(?:\.\d+)?/g;

type NumberToken =
  | {
      type: 'text';
      value: string;
    }
  | {
      type: 'number';
      value: number;
      decimals: number;
      useGrouping: boolean;
    };

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function tokenizeNumberText(text: string) {
  const tokens: NumberToken[] = [];
  let cursor = 0;

  for (const match of text.matchAll(NUMBER_PATTERN)) {
    const raw = match[0];
    const index = match.index ?? 0;

    if (index > cursor) {
      tokens.push({ type: 'text', value: text.slice(cursor, index) });
    }

    const normalized = raw.replace(/,/g, '');
    const value = Number(normalized);

    if (Number.isFinite(value)) {
      tokens.push({
        type: 'number',
        value,
        decimals: raw.includes('.') ? raw.split('.')[1]?.length || 0 : 0,
        useGrouping: raw.includes(','),
      });
    } else {
      tokens.push({ type: 'text', value: raw });
    }

    cursor = index + raw.length;
  }

  if (cursor < text.length) {
    tokens.push({ type: 'text', value: text.slice(cursor) });
  }

  return tokens;
}

function renderNumberTokens(tokens: NumberToken[], progress: number) {
  return tokens
    .map((token) => {
      if (token.type === 'text') return token.value;

      const value = token.value * progress;

      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: token.decimals,
        maximumFractionDigits: token.decimals,
        useGrouping: token.useGrouping,
      }).format(value);
    })
    .join('');
}

export function AnimatedNumber({
  value,
  className,
  duration = 0.75,
  delay = 0,
}: {
  value: string | number;
  className?: string;
  duration?: number;
  delay?: number;
}) {
  const valueRef = useRef<HTMLSpanElement>(null);
  const targetText = String(value);

  useGSAP(
    () => {
      const element = valueRef.current;

      if (!element) return;

      const tokens = tokenizeNumberText(targetText);
      const hasNumbers = tokens.some((token) => token.type === 'number');

      if (!hasNumbers || prefersReducedMotion()) {
        element.textContent = targetText;
        return;
      }

      const state = { progress: 0 };
      element.textContent = renderNumberTokens(tokens, 0);

      gsap.to(state, {
        progress: 1,
        duration,
        delay,
        ease: 'power2.out',
        onUpdate: () => {
          element.textContent = renderNumberTokens(tokens, state.progress);
        },
        onComplete: () => {
          element.textContent = targetText;
        },
      });
    },
    { dependencies: [targetText, duration, delay], scope: valueRef, revertOnUpdate: true }
  );

  return (
    <span ref={valueRef} className={cn('tabular-nums', className)}>
      {targetText}
    </span>
  );
}

export function AnimatedProgressBar({
  width,
  className,
  style,
  delay = 0,
  duration = 0.65,
}: {
  width: number | string;
  className?: string;
  style?: CSSProperties;
  delay?: number;
  duration?: number;
}) {
  const barRef = useRef<HTMLDivElement>(null);
  const widthValue = typeof width === 'number' ? `${Math.min(Math.max(width, 0), 100)}%` : width;

  useGSAP(
    () => {
      const element = barRef.current;

      if (!element) return;

      if (prefersReducedMotion()) {
        gsap.set(element, { scaleX: 1, autoAlpha: 1, clearProps: 'transform,opacity,visibility' });
        return;
      }

      gsap.set(element, { willChange: 'transform, opacity' });

      gsap.fromTo(
        element,
        { scaleX: 0, autoAlpha: 0.45 },
        {
          scaleX: 1,
          autoAlpha: 1,
          duration,
          delay,
          ease: 'power3.out',
          clearProps: 'transform,opacity,visibility,willChange',
        }
      );
    },
    { dependencies: [widthValue, delay, duration], scope: barRef, revertOnUpdate: true }
  );

  return (
    <div
      ref={barRef}
      className={cn('h-full rounded-full', className)}
      style={{
        ...style,
        width: widthValue,
        transformOrigin: 'left center',
      }}
    />
  );
}

type ChartAnimationMode = 'vertical-bars' | 'horizontal-bars' | 'mixed' | 'pie';

export function AnimatedChart({
  children,
  className,
  animationKey,
  mode = 'mixed',
}: {
  children: ReactNode;
  className?: string;
  animationKey?: string | number;
  mode?: ChartAnimationMode;
}) {
  const chartRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const scope = chartRef.current;

      if (!scope) return;

      let attempts = 0;

      const animateChart = () => {
        const bars = gsap.utils.toArray<SVGGraphicsElement>(
          '.recharts-bar-rectangle path, .recharts-bar-rectangle rect',
          scope
        );
        const lines = gsap.utils.toArray<SVGPathElement>('.recharts-line-curve', scope);
        const dots = gsap.utils.toArray<SVGGraphicsElement>(
          '.recharts-line-dot, .recharts-active-dot',
          scope
        );
        const sectors = gsap.utils.toArray<SVGGraphicsElement>('.recharts-pie-sector path', scope);
        const frame = gsap.utils.toArray<SVGGraphicsElement | HTMLDivElement>(
          '.recharts-cartesian-grid, .recharts-cartesian-axis, .recharts-legend-wrapper',
          scope
        );
        const targets = [...bars, ...lines, ...dots, ...sectors, ...frame];

        if (!targets.length && attempts < 6) {
          attempts += 1;
          gsap.delayedCall(0.05, animateChart);
          return;
        }

        if (prefersReducedMotion()) {
          gsap.set(targets, {
            clearProps: 'all',
          });
          return;
        }

        const timeline = gsap.timeline({ defaults: { ease: 'power2.out' } });

        if (frame.length) {
          timeline.fromTo(
            frame,
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: 0.28, stagger: 0.02, clearProps: 'opacity,visibility' },
            0
          );
        }

        if (bars.length) {
          const isHorizontal = mode === 'horizontal-bars';

          gsap.set(bars, {
            transformOrigin: isHorizontal ? 'left center' : 'center bottom',
            willChange: 'transform, opacity',
          });

          timeline.fromTo(
            bars,
            isHorizontal ? { scaleX: 0, autoAlpha: 0.25 } : { scaleY: 0, autoAlpha: 0.25 },
            {
              ...(isHorizontal ? { scaleX: 1 } : { scaleY: 1 }),
              autoAlpha: 1,
              duration: 0.58,
              ease: 'power3.out',
              stagger: { each: 0.045, from: 'start' },
              clearProps: 'transform,opacity,visibility,willChange',
            },
            0.08
          );
        }

        lines.forEach((line, index) => {
          const length = line.getTotalLength();

          if (!length) return;

          gsap.set(line, {
            strokeDasharray: length,
            strokeDashoffset: length,
            autoAlpha: 0,
          });

          timeline.to(
            line,
            {
              strokeDashoffset: 0,
              autoAlpha: 1,
              duration: 0.8,
              ease: 'power2.out',
              clearProps: 'strokeDasharray,strokeDashoffset,opacity,visibility',
            },
            0.22 + index * 0.08
          );
        });

        if (dots.length) {
          timeline.fromTo(
            dots,
            { scale: 0, autoAlpha: 0, transformOrigin: 'center center' },
            {
              scale: 1,
              autoAlpha: 1,
              duration: 0.34,
              stagger: 0.035,
              clearProps: 'transform,opacity,visibility',
            },
            0.45
          );
        }

        if (sectors.length) {
          gsap.set(sectors, { transformOrigin: 'center center', willChange: 'transform, opacity' });

          timeline.fromTo(
            sectors,
            { scale: 0.9, autoAlpha: 0 },
            {
              scale: 1,
              autoAlpha: 1,
              duration: 0.46,
              stagger: 0.055,
              clearProps: 'transform,opacity,visibility,willChange',
            },
            0.08
          );
        }
      };

      gsap.delayedCall(0.05, animateChart);
    },
    { dependencies: [animationKey, mode], scope: chartRef, revertOnUpdate: true }
  );

  return (
    <div ref={chartRef} className={cn('h-full w-full', className)}>
      {children}
    </div>
  );
}

export function StaggeredReveal({
  children,
  className,
  animationKey,
  stagger = 0.06,
}: {
  children: ReactNode;
  className?: string;
  animationKey?: string | number;
  stagger?: number;
}) {
  const scopeRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const scope = scopeRef.current;

      if (!scope) return;

      const items = Array.from(scope.children);

      if (!items.length || prefersReducedMotion()) {
        gsap.set(items, { clearProps: 'all' });
        return;
      }

      gsap.fromTo(
        items,
        { y: 10, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.4,
          ease: 'power2.out',
          stagger,
          clearProps: 'transform,opacity,visibility',
        }
      );
    },
    { dependencies: [animationKey, stagger], scope: scopeRef, revertOnUpdate: true }
  );

  return (
    <div ref={scopeRef} className={className}>
      {children}
    </div>
  );
}
