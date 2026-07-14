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
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-5))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-3))',
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

  const handleSectorEnter = useCallback((index: number) => setActiveIndex(index), []);
  const handleSectorLeave = useCallback(() => setActiveIndex(-1), []);

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
            transform: isThisActive ? 'scale(1.06)' : 'scale(1)',
            opacity: isDimmed ? 0.25 : 1,
            transition: 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease',
            cursor: 'pointer',
          }}
          onMouseEnter={() => handleSectorEnter(index)}
          onMouseLeave={handleSectorLeave}
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
    [activeIndex, isAnyActive, handleSectorEnter, handleSectorLeave]
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
                      onMouseEnter={() => setActiveIndex(index)}
                      onMouseLeave={() => setActiveIndex(-1)}
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
