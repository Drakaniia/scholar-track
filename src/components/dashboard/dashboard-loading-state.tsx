'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function KpiSkeleton() {
  return (
    <div className="space-y-3 border-b border-slate-200 p-4 last:border-b-0 sm:border-r sm:last:border-r-0 xl:border-b-0">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-3 w-full" />
    </div>
  );
}

export function DashboardLoadingState() {
  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-slate-200 bg-white px-5 py-5 shadow-sm sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl space-y-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-64 sm:h-10" />
            <Skeleton className="h-5 w-full max-w-xl" />
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Skeleton className="h-10 w-[180px] rounded-lg" />
            <Skeleton className="h-10 w-[220px] rounded-lg" />
          </div>
        </div>
      </section>

      <div className="grid overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm sm:grid-cols-2 xl:grid-cols-4">
        {[...Array(4)].map((_, index) => (
          <KpiSkeleton key={index} />
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.9fr)]">
        <Card className="rounded-lg border-slate-200 bg-white py-0 shadow-sm">
          <CardHeader className="border-b border-slate-200 px-5 py-4">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent className="px-5 py-5">
            <Skeleton className="h-[320px] w-full" />
          </CardContent>
        </Card>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-1">
          <Skeleton className="h-[250px] rounded-lg" />
          <Skeleton className="h-[250px] rounded-lg" />
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <div className="space-y-1">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="divide-y divide-slate-100">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex items-center gap-4 px-5 py-3">
              <Skeleton className="size-8 rounded-lg shrink-0" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-36" />
              </div>
              <Skeleton className="h-4 w-24 hidden sm:block" />
              <Skeleton className="h-4 w-20 hidden md:block" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-4 w-24 shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
