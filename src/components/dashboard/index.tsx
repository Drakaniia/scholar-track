'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Re-export existing dashboard components
export { StatsCard } from './stats-card';
export { ScholarshipChart } from './scholarship-chart';
export { StudentsChart } from './students-chart';
export { RecentAwards } from './recent-awards';

// Skeleton components for loading states
export function StatsCardSkeleton() {
  return (
    <Card className="relative overflow-hidden rounded-lg border-[#e1e8e4] bg-white py-0 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
      <Skeleton className="absolute inset-x-0 top-0 h-1 rounded-none" />
      <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 px-5 pt-5 pb-2">
        <Skeleton className="h-4 w-[110px]" />
        <Skeleton className="h-9 w-9 rounded-lg" />
      </CardHeader>
      <CardContent className="relative z-10 px-5 pb-5">
        <Skeleton className="h-8 w-[120px]" />
        <Skeleton className="mt-2 h-3 w-[150px]" />
        <Skeleton className="mt-4 h-1.5 w-full rounded-full" />
      </CardContent>
    </Card>
  );
}

export function StatsGridSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <StatsCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ChartCardSkeleton() {
  return (
    <Card className="rounded-lg border-[#e1e8e4] bg-white py-0 shadow-sm">
      <CardHeader className="border-b border-[#e4ece8] px-5 py-5">
        <div className="flex items-center gap-2">
          <Skeleton className="h-2.5 w-2.5 rounded-full" />
          <Skeleton className="h-6 w-[180px]" />
        </div>
        <Skeleton className="h-4 w-[240px]" />
      </CardHeader>
      <CardContent className="px-5 py-5">
        <Skeleton className="h-[350px] w-full" />
      </CardContent>
    </Card>
  );
}

export function PieChartSkeleton() {
  return (
    <Card className="border-gray-200">
      <CardHeader>
        <Skeleton className="h-6 w-[160px]" />
        <Skeleton className="h-4 w-[200px]" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center">
          <Skeleton className="h-[200px] w-[200px] rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}

export function TableSkeleton() {
  return (
    <Card className="border-gray-200">
      <CardHeader>
        <Skeleton className="h-6 w-[200px]" />
        <Skeleton className="h-4 w-[300px]" />
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-3 p-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-[80px]" />
              <Skeleton className="h-4 w-[120px]" />
              <Skeleton className="h-6 w-[80px]" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function RecentAwardsSkeleton() {
  return (
    <Card className="border-gray-200">
      <CardHeader>
        <Skeleton className="h-6 w-[180px]" />
        <Skeleton className="h-4 w-[240px]" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-[180px]" />
                <Skeleton className="h-3 w-[120px]" />
              </div>
              <Skeleton className="h-6 w-[80px]" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function TabsSkeleton() {
  return (
    <Card className="border-gray-200">
      <CardHeader>
        <Skeleton className="h-6 w-[220px]" />
        <Skeleton className="h-4 w-[280px]" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Tab triggers */}
          <div className="flex gap-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-9 w-[120px]" />
            ))}
          </div>
          {/* Tab content placeholder */}
          <div className="space-y-3">
            <Skeleton className="h-5 w-[200px]" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-4 w-[150px]" />
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[80px]" />
                <Skeleton className="h-4 w-[100px]" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
