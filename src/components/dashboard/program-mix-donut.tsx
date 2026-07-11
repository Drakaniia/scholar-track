'use client';

'use client';

import { useCallback, useState } from 'react';

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
  'hsl(var(--pastel-purple))',
  'hsl(var(--pastel-blue))',
  'hsl(var(--pastel-pink))',
  'hsl(var(--pastel-orange))',
  'hsl(var(--pastel-green))',
] as const;

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

export function ProgramMixDonut({ data, sourceLabel }: ProgramMixDonutProps) {
  const [activeIndex, setActiveIndex] = useState(-1);
  const total = totalStudents(data);
  const animationKey = data.map((item) => `${item.name}:${item.value}`).join('|');
  const isAnyActive = activeIndex >= 0;

  const renderCustomShape = useCallback(
    (props: PieSectorShapeProps) => {
      const {
        cx,
        cy,
        innerRadius = 0,
        outerRadius = 0,
        startAngle,
        endAngle,
        fill = '#94a3b8',
        payload,
        value = 0,
        index,
      } = props;

      const isThisActive = index === activeIndex;
      const isDimmed = isAnyActive && !isThisActive;
      const name = payload?.name ?? '';
      const centerLabel = name ? CENTER_LABELS[name] : undefined;

      return (
        <g
          style={{
            transformOrigin: `${cx}px ${cy}px`,
            transform: isThisActive ? 'scale(1.08)' : 'scale(1)',
            opacity: isDimmed ? 0.25 : 1,
            transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease',
          }}
        >
          <Sector
            cx={cx}
            cy={cy}
            innerRadius={isThisActive ? innerRadius - 4 : innerRadius}
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
    [activeIndex, isAnyActive]
  );

  const handleSectorEnter = useCallback(
    (_data: unknown, index: number) => setActiveIndex(index),
    []
  );
  const handleChartLeave = useCallback(() => setActiveIndex(-1), []);

  return (
    <Card className="rounded-lg border-slate-200 bg-white py-0 shadow-sm">
      <CardHeader className="border-b border-slate-200 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base text-slate-950">Program Mix</CardTitle>
            <CardDescription>{sourceLabel}</CardDescription>
          </div>
          <span className="flex size-9 items-center justify-center rounded-lg bg-slate-100 text-slate-800 text-xs font-semibold tabular-nums">
            {total}
          </span>
        </div>
      </CardHeader>
      <CardContent className="px-5 py-5">
        {data.length > 0 ? (
          <div className="flex flex-col items-center">
            <div
              className="h-[240px] w-full max-w-[280px]"
              onMouseLeave={handleChartLeave}
            >
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
                      onMouseEnter={handleSectorEnter}
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

            {/* Interactive Legend */}
            {data.length > 1 && (
              <div className="flex w-full flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
                {data.map((item, index) => {
                  const isThisActive = index === activeIndex;
                  const isDimmed = isAnyActive && !isThisActive;

                  return (
                    <span
                      key={item.name}
                      className="inline-flex items-center gap-1.5 text-xs transition-all duration-300"
                      style={{
                        opacity: isDimmed ? 0.35 : 1,
                        color: isThisActive
                          ? 'hsl(var(--foreground))'
                          : 'hsl(var(--muted-foreground))',
                      }}
                    >
                      <span
                        className="size-2 shrink-0 rounded-full"
                        style={{
                          backgroundColor:
                            DONUT_COLORS[index % DONUT_COLORS.length],
                        }}
                      />
                      <span style={{ fontWeight: isThisActive ? 600 : 400 }}>
                        {item.name}
                      </span>
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="flex min-h-[220px] items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
            No scholarship type data
          </div>
        )}
      </CardContent>
    </Card>
  );
}
