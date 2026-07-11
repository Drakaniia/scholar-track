'use client';

import { Banknote, BookOpen, CircleDollarSign, UserRound } from 'lucide-react';

import { formatCompactPhp, getPercent } from '@/components/dashboard/dashboard-formatters';
import type { DashboardData } from '@/components/dashboard/dashboard-types';
import { AnimatedNumber, AnimatedProgressBar } from '@/components/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface DashboardKpiStripProps {
  readonly stats: DashboardData['stats'];
}

const CARD_THEME = {
  students: {
    iconBg: 'bg-emerald-100 text-emerald-700',
    accent: 'bg-emerald-500',
    gradient: 'from-emerald-500/8',
  },
  programs: {
    iconBg: 'bg-violet-100 text-violet-700',
    accent: 'bg-violet-500',
    gradient: 'from-violet-500/8',
  },
  awarded: {
    iconBg: 'bg-amber-100 text-amber-700',
    accent: 'bg-amber-500',
    gradient: 'from-amber-500/8',
  },
  released: {
    iconBg: 'bg-sky-100 text-sky-700',
    accent: 'bg-sky-500',
    gradient: 'from-sky-500/8',
  },
} as const;

export function DashboardKpiStrip({ stats }: DashboardKpiStripProps) {
  const coverageRate = getPercent(stats.studentsWithScholarships, stats.totalStudents);
  const activeRate = getPercent(stats.activeScholarships, stats.totalScholarships);
  const disbursementRate = getPercent(stats.totalDisbursed, stats.totalAmountAwarded);

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        title="Total Students"
        value={stats.totalStudents}
        detail={`${stats.studentsWithScholarships} with scholarships`}
        icon={UserRound}
        theme={CARD_THEME.students}
        progress={coverageRate}
        progressLabel="Coverage"
      />
      <KpiCard
        title="Active Programs"
        value={`${stats.activeScholarships}/${stats.totalScholarships}`}
        detail={`${activeRate}% currently active`}
        icon={BookOpen}
        theme={CARD_THEME.programs}
        progress={activeRate}
        progressLabel="Active rate"
      />
      <KpiCard
        title="Amount Awarded"
        value={formatCompactPhp(stats.totalAmountAwarded)}
        detail="Total committed assistance"
        icon={CircleDollarSign}
        theme={CARD_THEME.awarded}
      />
      <KpiCard
        title="Amount Released"
        value={formatCompactPhp(stats.totalDisbursed)}
        detail={`${disbursementRate}% of awarded disbursed`}
        icon={Banknote}
        theme={CARD_THEME.released}
        progress={disbursementRate}
        progressLabel="Release rate"
      />
    </div>
  );
}

function KpiCard({
  title,
  value,
  detail,
  icon: Icon,
  theme,
  progress,
  progressLabel,
}: {
  readonly title: string;
  readonly value: string | number;
  readonly detail: string;
  readonly icon: typeof UserRound;
  readonly theme: (typeof CARD_THEME)[keyof typeof CARD_THEME];
  readonly progress?: number;
  readonly progressLabel?: string;
}) {
  const normalizedProgress =
    typeof progress === 'number' ? Math.min(Math.max(progress, 0), 100) : null;

  return (
    <Card className="group relative overflow-hidden border-slate-200 bg-white py-0 shadow-sm transition-all hover:border-slate-300 hover:shadow-md">
      {/* Top accent bar */}
      <div className={cn('absolute inset-x-0 top-0 h-0.5', theme.accent)} />

      <CardHeader className="flex flex-row items-center justify-between px-4 pt-4 pb-1">
        <CardTitle className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
          {title}
        </CardTitle>
        <div
          className={cn(
            'flex size-7 items-center justify-center rounded-lg',
            theme.iconBg
          )}
        >
          <Icon className="size-3.5" />
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-4">
        <div className="text-xl font-bold tracking-tight text-slate-950">
          <AnimatedNumber value={value} />
        </div>
        <p className="mt-0.5 truncate text-[11px] text-slate-500">{detail}</p>
        {normalizedProgress !== null && progressLabel && (
          <div className="mt-3">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[9px] font-medium text-slate-400">
                {progressLabel}
              </span>
              <span className="text-[9px] font-semibold text-slate-500">
                {normalizedProgress}%
              </span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-slate-100">
              <AnimatedProgressBar
                width={normalizedProgress}
                className={cn('h-full rounded-full', theme.accent)}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
