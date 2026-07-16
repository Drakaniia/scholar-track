'use client';

import { LucideIcon, TrendingDown, TrendingUp } from 'lucide-react';

import { AnimatedNumber, AnimatedProgressBar } from '@/components/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  iconClassName?: string;
  progress?: number;
  variant?: 'default' | 'blue' | 'amber' | 'green' | 'rose';
}

const VARIANTS = {
  default: {
    icon: 'bg-primary/10 text-primary',
    accent: 'bg-primary/20',
  },
  blue: {
    icon: 'bg-chart-2/10 text-chart-2',
    accent: 'bg-chart-2/20',
  },
  amber: {
    icon: 'bg-chart-4/10 text-chart-4',
    accent: 'bg-chart-4/20',
  },
  green: {
    icon: 'bg-chart-1/10 text-chart-1',
    accent: 'bg-chart-1/20',
  },
  rose: {
    icon: 'bg-chart-5/10 text-chart-5',
    accent: 'bg-chart-5/20',
  },
};

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
  iconClassName,
  progress,
  variant = 'default',
}: StatsCardProps) {
  const styles = VARIANTS[variant];
  const normalizedProgress =
    typeof progress === 'number' ? Math.min(Math.max(progress, 0), 100) : null;

  return (
    <Card
      className={cn(
        'group relative overflow-hidden border-[0.5px] border-border/60 bg-card/85 backdrop-blur-xl py-0 shadow-sm',
        className
      )}
    >
      <div className={cn('absolute inset-x-0 top-0 h-0.5', styles.accent)} />

      <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 px-5 pt-5 pb-2">
        <CardTitle className="text-sm font-semibold text-muted-foreground">{title}</CardTitle>
        <div
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-lg',
            styles.icon,
            iconClassName
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>

      <CardContent className="relative z-10 px-5 pb-5">
        <div className="text-2xl font-bold text-foreground">
          <AnimatedNumber value={value} />
        </div>
        {(description || trend) && (
          <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
            {trend && (
              <span
                className={cn(
                  'flex items-center gap-0.5 font-medium',
                  trend.isPositive ? 'text-primary' : 'text-destructive'
                )}
              >
                {trend.isPositive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {trend.isPositive ? '+' : ''}
                {trend.value}%
              </span>
            )}
            {trend && description && <span className="text-border">/</span>}
            {description}
          </div>
        )}
        {normalizedProgress !== null && (
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
            <AnimatedProgressBar width={normalizedProgress} className={cn(styles.accent)} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
