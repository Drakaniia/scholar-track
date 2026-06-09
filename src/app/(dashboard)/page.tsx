'use client';

import { Suspense, useState } from 'react';

import { useSearchParams } from 'next/navigation';

import { DashboardErrorState } from '@/components/dashboard/dashboard-error-state';
import { DashboardLoadingState } from '@/components/dashboard/dashboard-loading-state';
import { DashboardOverview } from '@/components/dashboard/dashboard-overview';
import { useDashboardStats } from '@/hooks/use-queries';

function DashboardContent() {
  const searchParams = useSearchParams();
  const [scholarshipSourceFilter, setScholarshipSourceFilter] = useState<string>(
    searchParams.get('source') || 'all'
  );

  const { data: statsData, isLoading } = useDashboardStats(scholarshipSourceFilter, {
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return <DashboardLoadingState />;
  }

  if (!statsData?.data) {
    return <DashboardErrorState />;
  }

  return (
    <DashboardOverview
      data={statsData.data}
      scholarshipSourceFilter={scholarshipSourceFilter}
      onScholarshipSourceChange={setScholarshipSourceFilter}
    />
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoadingState />}>
      <DashboardContent />
    </Suspense>
  );
}
