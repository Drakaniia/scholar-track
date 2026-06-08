'use client';

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { AnimatedChart } from '@/components/shared';

interface PieChartData {
  name: string;
  value: number;
}

interface CustomPieChartProps {
  data: PieChartData[];
  colors?: string[];
}

const THEME_COLORS = [
  'hsl(var(--pastel-purple))',
  'hsl(var(--pastel-blue))',
  'hsl(var(--pastel-pink))',
  'hsl(var(--pastel-orange))',
  'hsl(var(--pastel-green))',
];

export function CustomPieChart({ data, colors = THEME_COLORS }: CustomPieChartProps) {
  const animationKey = data.map((item) => `${item.name}:${item.value}`).join('|');

  return (
    <div className="h-[300px]">
      <AnimatedChart animationKey={animationKey} mode="pie">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="46%"
              innerRadius={62}
              outerRadius={86}
              paddingAngle={2}
              dataKey="value"
              stroke="#ffffff"
              strokeWidth={4}
              isAnimationActive={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                borderColor: '#dce6e1',
                borderRadius: '8px',
                color: '#0f172a',
                boxShadow: '0 10px 30px rgb(15 23 42 / 0.12)',
              }}
              itemStyle={{ color: '#0f172a' }}
            />
            <Legend
              verticalAlign="bottom"
              height={48}
              iconType="circle"
              iconSize={8}
              formatter={(value) => (
                <span style={{ color: '#475569', fontSize: '12px', marginLeft: '4px' }}>
                  {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </AnimatedChart>
    </div>
  );
}
