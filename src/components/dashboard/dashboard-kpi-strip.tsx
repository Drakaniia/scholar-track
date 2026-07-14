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
    iconBg: 'bg-gradient-to-br from-primary/25 to-primary/10 text-primary',
    accent: 'bg-gradient-to-r from-primary/50 to-primary/10',
    gradient: 'bg-gradient-to-br from-primary/[0.06] via-transparent to-primary/[0.02]',
    progress: 'bg-primary/40',
  },
  programs: {
    iconBg: 'bg-gradient-to-br from-chart-2/25 to-chart-2/10 text-chart-2',
    accent: 'bg-gradient-to-r from-chart-2/50 to-chart-2/10',
    gradient: 'bg-gradient-to-br from-chart-2/[0.06] via-transparent to-chart-2/[0.02]',
    progress: 'bg-chart-2/40',
  },
  awarded: {
    iconBg: 'bg-gradient-to-br from-chart-3/25 to-chart-3/10 text-chart-3',
    accent: 'bg-gradient-to-r from-chart-3/50 to-chart-3/10',
    gradient: 'bg-gradient-to-br from-chart-3/[0.06] via-transparent to-chart-3/[0.02]',
    progress: 'bg-chart-3/40',
  },
  released: {
    iconBg: 'bg-gradient-to-br from-chart-4/25 to-chart-4/10 text-chart-4',
    accent: 'bg-gradient-to-r from-chart-4/50 to-chart-4/10',
    gradient: 'bg-gradient-to-br from-chart-4/[0.06] via-transparent to-chart-4/[0.02]',
    progress: 'bg-chart-4/40',
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
    <Card className="group relative overflow-hidden border-[0.5px] border-border/60 bg-card/85 backdrop-blur-xl py-0 shadow-sm">
      {/* Gradient background tint */}
      <div aria-hidden="true" className={cn('pointer-events-none absolute inset-0', theme.gradient)} />

      {/* Top accent bar */}
      <div aria-hidden="true" className={cn('absolute inset-x-0 top-0 h-0.5', theme.accent)} />

      <CardHeader className="relative z-10 flex flex-row items-center justify-between px-4 pt-4 pb-1">
        <CardTitle className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
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

      <CardContent className="relative z-10 px-4 pb-4">
        <div className="text-xl font-bold tracking-tight text-foreground">
          <AnimatedNumber value={value} />
        </div>
        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{detail}</p>
        {normalizedProgress !== null && progressLabel && (
          <div className="mt-3">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[9px] font-medium text-muted-foreground/70">
                {progressLabel}
              </span>
              <span className="text-[9px] font-semibold text-muted-foreground">
                {normalizedProgress}%
              </span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-muted">
              <AnimatedProgressBar
                width={normalizedProgress}
                className={cn('h-full rounded-full', theme.progress)}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
