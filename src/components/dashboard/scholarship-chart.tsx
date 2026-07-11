'use client';

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
} from 'recharts';

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, cn } from '@/lib/utils';

interface ScholarshipChartData {
  readonly name: string;
  readonly awarded: number;
  readonly disbursed: number;
  readonly balance: number;
}

interface ScholarshipChartProps {
  readonly data: readonly ScholarshipChartData[];
  title?: string;
  description?: string;
  className?: string;
}

const chartConfig = {
  awarded: {
    label: 'Awarded',
    color: 'hsl(var(--chart-1))',
  },
  disbursed: {
    label: 'Disbursed',
    color: 'hsl(var(--chart-2))',
  },
  balance: {
    label: 'Balance',
    color: 'hsl(var(--chart-3))',
  },
} satisfies ChartConfig;

export function ScholarshipChart({
  data,
  title = 'Fund Movement',
  description = 'Awarded, released, and remaining balance by month',
  className,
}: ScholarshipChartProps) {
  const chartData = data.map((item) => ({
    ...item,
    balance: Math.max(item.balance, 0),
  }));

  return (
    <Card className={cn('rounded-lg border-slate-200 bg-white py-0 shadow-sm', className)}>
      <CardHeader className="border-b border-slate-200 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base text-slate-950">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-700" />
        </div>
      </CardHeader>
      <CardContent className="px-5 py-5">
        {chartData.length > 0 ? (
          <ChartContainer config={chartConfig} className="min-h-[320px] w-full">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="hsl(var(--muted-foreground) / 0.14)"
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis
                domain={[0, (dataMax: number) => Math.max(dataMax, 1)]}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `P${(value / 1000).toFixed(0)}k`}
                dx={-10}
              />
              <ChartTooltip
                cursor={{ fill: 'hsl(var(--muted-foreground) / 0.04)' }}
                content={
                  <ChartTooltipContent
                    formatter={(value: unknown) => {
                      const num = typeof value === 'number' ? value : Number(value || 0);
                      return formatCurrency(num);
                    }}
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar
                dataKey="awarded"
                fill="var(--color-awarded)"
                radius={[5, 5, 0, 0]}
                barSize={24}
                isAnimationActive={false}
              />
              <Bar
                dataKey="disbursed"
                fill="var(--color-disbursed)"
                radius={[5, 5, 0, 0]}
                barSize={24}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="var(--color-balance)"
                strokeWidth={2}
                dot={{
                  r: 4,
                  fill: 'var(--color-balance)',
                  strokeWidth: 2,
                  stroke: 'white',
                }}
                activeDot={{
                  r: 6,
                  fill: 'var(--color-balance)',
                  strokeWidth: 2,
                  stroke: 'white',
                }}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ChartContainer>
        ) : (
          <div className="flex h-[320px] items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
            No fund movement data
          </div>
        )}
      </CardContent>
    </Card>
  );
}
