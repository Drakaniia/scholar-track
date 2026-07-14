'use client';

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const HEADER_BACKGROUND_IMAGE_URL = '/images/background2.jpg';

interface PageHeaderSkeletonProps {
  actionWidths?: string[];
  className?: string;
}

export function PageHeaderSkeleton({ actionWidths = [], className }: PageHeaderSkeletonProps) {
  return (
    <Card className="relative mb-6 overflow-hidden border-border/60 border-t-4 border-t-primary bg-card">
      <div
        aria-hidden="true"
        className="absolute inset-y-0 right-0 w-1/2 -scale-x-100 bg-cover bg-center bg-no-repeat opacity-60"
        style={{ backgroundImage: `url(${HEADER_BACKGROUND_IMAGE_URL})` }}
      />
      <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-transparent via-background/20 to-background" />
      <div
        className={cn(
          'relative z-10 flex flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between',
          className
        )}
      >
        <div className="space-y-2">
          <Skeleton className="h-8 w-44 sm:h-9 sm:w-56" />
          <Skeleton className="h-5 w-72 max-w-full sm:w-96" />
        </div>
        {actionWidths.length > 0 && (
          <div className="flex flex-wrap items-center justify-end gap-2">
            {actionWidths.map((width, index) => (
              <Skeleton key={`${width}-${index}`} className={cn('h-9 rounded-lg', width)} />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
