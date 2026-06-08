'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { AnimatedChart } from '@/components/shared';

interface BarChartData {
  name: string;
  value: number;
}

interface CustomBarChartProps {
  data: BarChartData[];
  color?: string;
  dataKey?: string;
}

export function CustomBarChart({
  data,
  color = '#22c55e',
  dataKey = 'value',
}: CustomBarChartProps) {
  const animationKey = data.map((item) => `${item.name}:${item.value}`).join('|');

  return (
    <div className="h-[300px]">
      <AnimatedChart animationKey={`${animationKey}:${dataKey}`} mode="vertical-bars">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Bar dataKey={dataKey} fill={color} radius={[8, 8, 0, 0]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </AnimatedChart>
    </div>
  );
}
