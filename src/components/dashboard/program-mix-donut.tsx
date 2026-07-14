'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

import { PieChart, Pie, Sector, Cell, ResponsiveContainer } from 'recharts';
import type { PieSectorShapeProps } from 'recharts/types/polar/Pie';

import { AnimatedChart } from '@/components/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import type { ScholarshipTypeDatum } from './dashboard-types';

interface ProgramMixDonutProps {
  readonly data: readonly ScholarshipTypeDatum[];
  readonly sourceLabel: string;
}

const DONUT_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-5))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-3))',
] as const;

const EXPANSION_DEGREES = 4;

const CENTER_LABELS: Record<string, string> = {
  PAEB: 'PAEB',
  CHED: 'CHED',
  LGU: 'LGU',
  'School Grant': 'School Grant',
  Other: 'Other',
};

function totalStudents(data: readonly ScholarshipTypeDatum[]) {
  return data.reduce((sum, item) => sum + item.value, 0);
}

interface SectorAngles {
  startAngle: number;
  endAngle: number;
  opacity: number;
}

interface SectorAnimationState {
  sectors: SectorAngles[];
}

function computeRestingAngles(data: readonly ScholarshipTypeDatum[]): SectorAngles[] {
  const total = totalStudents(data);
  if (total === 0) return [];

  return data.map((item) => {
    const angle = (item.value / total) * 360;
    return { startAngle: 0, endAngle: angle, opacity: 1 };
  });
}

function computeAccumulatedAngles(sectors: SectorAngles[]): SectorAngles[] {
  let cursor = 0;
  return sectors.map((sector) => {
    const startAngle = cursor;
    cursor += sector.endAngle - sector.startAngle;
    return { ...sector, startAngle, endAngle: cursor };
  });
}

function computeHoverAngles(
  restingAngles: SectorAngles[],
  hoveredIndex: number
): SectorAngles[] {
  const expanded: SectorAngles[] = restingAngles.map((s, i) => ({
    ...s,
    startAngle: s.startAngle,
    endAngle: s.endAngle,
    opacity: i === hoveredIndex ? 1 : 0.25,
  }));

  // Calculate the hovered sector's original arc span
  const hoveredSpan = expanded[hoveredIndex].endAngle - expanded[hoveredIndex].startAngle;

  // Redistribute: hovered sector gains EXPANSION_DEGREES, others shrink proportionally
  const remainingDegrees = 360 - hoveredSpan - EXPANSION_DEGREES;
  const otherTotalSpan = expanded.reduce(
    (sum, s, i) => (i === hoveredIndex ? sum : sum + (s.endAngle - s.startAngle)),
    0
  );

  if (otherTotalSpan === 0) return expanded;

  let cursor = 0;
  return expanded.map((s, i) => {
    const originalSpan = restingAngles[i].endAngle - restingAngles[i].startAngle;
    const span =
      i === hoveredIndex
        ? hoveredSpan + EXPANSION_DEGREES
        : (originalSpan / otherTotalSpan) * remainingDegrees;

    const startAngle = cursor;
    cursor += span;
    return { ...s, startAngle, endAngle: cursor };
  });
}

export function ProgramMixDonut({ data, sourceLabel }: ProgramMixDonutProps) {
  const [activeIndex, setActiveIndex] = useState(-1);
  const total = totalStudents(data);
  const animationKey = data.map((item) => `${item.name}:${item.value}`).join('|');
  const isAnyActive = activeIndex >= 0;

  const animStateRef = useRef<SectorAnimationState>({ sectors: [] });
  const [, forceRender] = useState(0);

  // Compute resting angles (memoized on data)
  const restingAngles = useMemo(() => {
    const raw = computeRestingAngles(data);
    return computeAccumulatedAngles(raw);
  }, [data]);

  // Sync resting angles into the mutable ref when data changes
  useGSAP(
    () => {
      const state = animStateRef.current;
      const target = computeAccumulatedAngles(
        computeRestingAngles(data)
      );

      // If state is empty (first mount), snap to resting
      if (state.sectors.length !== target.length) {
        state.sectors = target.map((s) => ({ ...s }));
        forceRender((n) => n + 1);
      }
    },
    { dependencies: [data], scope: animStateRef }
  );

  // Animate hover / leave
  const animateToHover = useCallback(
    (index: number) => {
      if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        // Show final state immediately
        const target = computeHoverAngles(restingAngles, index);
        animStateRef.current.sectors = target.map((s) => ({ ...s }));
        forceRender((n) => n + 1);
        return;
      }

      const target = computeHoverAngles(restingAngles, index);
      const state = animStateRef.current;

      gsap.to(state.sectors, {
        startAngle: (i: number) => target[i].startAngle,
        endAngle: (i: number) => target[i].endAngle,
        opacity: (i: number) => target[i].opacity,
        duration: 0.4,
        ease: 'power2.out',
        onUpdate: () => forceRender((n) => n + 1),
      });
    },
    [restingAngles]
  );

  const animateToRest = useCallback(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const target = restingAngles;
      animStateRef.current.sectors = target.map((s) => ({ ...s }));
      forceRender((n) => n + 1);
      return;
    }

    const state = animStateRef.current;

    gsap.to(state.sectors, {
      startAngle: (i: number) => restingAngles[i].startAngle,
      endAngle: (i: number) => restingAngles[i].endAngle,
      opacity: 1,
      duration: 0.35,
      ease: 'power2.out',
      onUpdate: () => forceRender((n) => n + 1),
    });
  }, [restingAngles]);

  const renderCustomShape = useCallback(
    (props: PieSectorShapeProps) => {
      const {
        cx,
        cy,
        innerRadius = 0,
        outerRadius = 0,
        fill = '#94a3b8',
        payload,
        value = 0,
        index,
      } = props;

      const animated = animStateRef.current.sectors[index];
      const startAngle = animated?.startAngle ?? props.startAngle;
      const endAngle = animated?.endAngle ?? props.endAngle;
      const sectorOpacity = animated?.opacity ?? 1;
      const isThisActive = index === activeIndex;
      const name = payload?.name ?? '';
      const centerLabel = name ? CENTER_LABELS[name] : undefined;

      return (
        <g
          style={{ opacity: sectorOpacity, cursor: 'pointer' }}
          onMouseEnter={() => {
            setActiveIndex(index);
            animateToHover(index);
          }}
          onMouseLeave={() => {
            setActiveIndex(-1);
            animateToRest();
          }}
        >
          <Sector
            cx={cx}
            cy={cy}
            innerRadius={isThisActive ? innerRadius - 3 : innerRadius}
            outerRadius={isThisActive ? outerRadius + 8 : outerRadius}
            startAngle={startAngle}
            endAngle={endAngle}
            fill={fill}
          />
          <text
            x={cx}
            y={cy - 8}
            textAnchor="middle"
            fill="hsl(var(--foreground))"
            fontSize={15}
            fontWeight={700}
            fontFamily="var(--font-sans, system-ui)"
            style={{
              opacity: isThisActive ? 1 : 0,
              transition: 'opacity 0.2s ease',
              pointerEvents: 'none',
            }}
          >
            {centerLabel ?? name}
          </text>
          <text
            x={cx}
            y={cy + 14}
            textAnchor="middle"
            fill="hsl(var(--muted-foreground))"
            fontSize={11}
            fontFamily="var(--font-sans, system-ui)"
            style={{
              opacity: isThisActive ? 1 : 0,
              transition: 'opacity 0.2s ease',
              pointerEvents: 'none',
            }}
          >
            {value} student{value !== 1 ? 's' : ''}
          </text>
        </g>
      );
    },
    [activeIndex, animateToHover, animateToRest]
  );

  return (
    <Card className="border-[0.5px] border-border/60 bg-card/85 backdrop-blur-xl py-0 shadow-sm">
      <CardHeader className="border-b-[0.5px] border-border/60 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base text-foreground">Program Mix</CardTitle>
            <CardDescription>{sourceLabel}</CardDescription>
          </div>
          <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground text-xs font-semibold tabular-nums">
            {total}
          </span>
        </div>
      </CardHeader>
      <CardContent className="px-5 py-5">
        {data.length > 0 ? (
          <div className="flex flex-col items-center">
            <div className="h-[240px] w-full max-w-[280px]">
              <AnimatedChart animationKey={animationKey} mode="pie">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={88}
                      dataKey="value"
                      stroke="#ffffff"
                      strokeWidth={3}
                      shape={renderCustomShape}
                      isAnimationActive={false}
                    >
                      {data.map((_entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={DONUT_COLORS[index % DONUT_COLORS.length]}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </AnimatedChart>
            </div>

            {/* Interactive Legend — hover these indicators to highlight sectors */}
            {data.length > 1 && (
              <div className="flex w-full flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
                {data.map((item, index) => {
                  const isThisActive = index === activeIndex;
                  const isDimmed = isAnyActive && !isThisActive;

                  return (
                    <span
                      key={item.name}
                      className="inline-flex cursor-pointer items-center gap-1.5 text-xs transition-all duration-300"
                      style={{
                        opacity: isDimmed ? 0.35 : 1,
                        color: isThisActive
                          ? 'hsl(var(--foreground))'
                          : 'hsl(var(--muted-foreground))',
                        transform: isThisActive ? 'scale(1.08)' : 'scale(1)',
                      }}
                      onMouseEnter={() => {
                        setActiveIndex(index);
                        animateToHover(index);
                      }}
                      onMouseLeave={() => {
                        setActiveIndex(-1);
                        animateToRest();
                      }}
                    >
                      <span
                        className="size-2 shrink-0 rounded-full"
                        style={{
                          backgroundColor:
                            DONUT_COLORS[index % DONUT_COLORS.length],
                        }}
                      />
                      <span
                        style={{
                          fontWeight: isThisActive ? 600 : 400,
                          transition: 'font-weight 0.2s ease',
                        }}
                      >
                        {item.name}
                      </span>
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="flex min-h-[220px] items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/40 text-sm text-muted-foreground">
            No scholarship type data
          </div>
        )}
      </CardContent>
    </Card>
  );
}
