'use client';

import { useState } from 'react';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { AnimatedChart } from '@/components/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StudentsChartData {
  readonly name: string;
  readonly students: number;
}

interface StudentsChartProps {
  readonly data: readonly StudentsChartData[];
  title?: string;
  description?: string;
  className?: string;
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-5))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-3))',
] as const;

export function StudentsChart({
  data,
  title = 'Students by Grade Level',
  description = 'Distribution of students',
  className,
}: StudentsChartProps) {
  const [activeIndex, setActiveIndex] = useState(-1);
  const animationKey = data.map((item) => `${item.name}:${item.students}`).join('|');
  const isAnyActive = activeIndex >= 0;

  return (
    <Card
      className={cn(
        'border-[0.5px] border-border/60 bg-card/85 backdrop-blur-xl py-0 shadow-sm',
        className
      )}
    >
      <CardHeader className="border-b-[0.5px] border-border/60 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base text-foreground">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <span className="mt-1 h-2.5 w-2.5 rounded-full bg-chart-2" />
        </div>
      </CardHeader>
      <CardContent className="px-5 py-5">
        <div className="h-[250px]">
          <AnimatedChart animationKey={animationKey} mode="horizontal-bars">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 10, right: 14, left: 12, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="hsl(var(--muted-foreground) / 0.14)"
                />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={96}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(15, 23, 42, 0.04)' }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border-[0.5px] border-border/60 bg-popover/95 p-3 shadow-lg">
                          <p className="mb-2 font-medium text-foreground">{label}</p>
                          {payload.map((entry, index) => (
                            <p
                              key={index}
                              className="flex items-center gap-2 text-sm text-muted-foreground"
                            >
                              <span
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: entry.color }}
                              />
                              {entry.value} students
                            </p>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="students"
                  name="Total Students"
                  radius={[0, 6, 6, 0]}
                  barSize={28}
                  isAnimationActive={false}
                >
                  {data.map((entry, index) => {
                    const isThisActive = index === activeIndex;
                    const isDimmed = isAnyActive && !isThisActive;
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        fillOpacity={isDimmed ? 0.25 : 1}
                        style={{
                          transition: 'fill-opacity 0.3s ease',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={() => setActiveIndex(index)}
                        onMouseLeave={() => setActiveIndex(-1)}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </AnimatedChart>
        </div>

        {/* Interactive Legend — hover these indicators to highlight bars */}
        {data.length > 1 && (
          <div className="mt-3 flex w-full flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
            {data.map((entry, index) => {
              const isThisActive = index === activeIndex;
              const isDimmed = isAnyActive && !isThisActive;
              return (
                <button
                  key={entry.name}
                  type="button"
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
                      backgroundColor: COLORS[index % COLORS.length],
                    }}
                  />
                  <span
                    style={{
                      fontWeight: isThisActive ? 600 : 400,
                      transition: 'font-weight 0.2s ease',
                    }}
                  >
                    {entry.name}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
