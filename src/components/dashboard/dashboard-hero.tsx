'use client';

import Link from 'next/link';

import { ArrowRight, Filter } from 'lucide-react';

import { getSourceLabel } from '@/components/dashboard/dashboard-formatters';
import { ExportButton } from '@/components/shared';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  GRADE_LEVELS,
  GRADE_LEVEL_LABELS,
  SCHOLARSHIP_SOURCES,
  SCHOLARSHIP_SOURCE_LABELS,
} from '@/types';

const HEADER_BACKGROUND_IMAGE_URL = '/images/background2.jpg';

interface DashboardHeroProps {
  readonly scholarshipSourceFilter: string;
  readonly onScholarshipSourceChange: (value: string) => void;
  readonly gradeLevelFilter: string;
  readonly onGradeLevelChange: (value: string) => void;
}

export function DashboardHero({
  scholarshipSourceFilter,
  onScholarshipSourceChange,
  gradeLevelFilter,
  onGradeLevelChange,
}: DashboardHeroProps) {
  const sourceLabel = getSourceLabel(scholarshipSourceFilter);

  return (
    <section className="relative isolate mb-6 overflow-hidden rounded-xl border-[0.5px] border-border/60 bg-card/85 backdrop-blur-xl saturate-[1.4]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-1/2 overflow-hidden"
      >
        <div
          className="absolute inset-0 -scale-x-100 bg-cover bg-center bg-no-repeat opacity-55 saturate-[0.95]"
          style={{ backgroundImage: `url(${HEADER_BACKGROUND_IMAGE_URL})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-background/20 to-background" />
      </div>

      <div className="relative z-10 flex min-h-[104px] flex-col gap-4 px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div className="min-w-0 max-w-2xl">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            <span className="h-px w-8 bg-primary/60" />
            {sourceLabel}
          </div>
          <h1 className="text-3xl font-black leading-tight text-foreground md:text-4xl">
            Scholarship dashboard
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            A cleaner read on student coverage, funding release, program mix, and recent scholarship
            movement.
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2 self-end sm:justify-end">
          <Select value={gradeLevelFilter} onValueChange={onGradeLevelChange}>
            <SelectTrigger className="h-10 w-full sm:w-[180px]">
              <Filter className="mr-2 h-4 w-4 text-primary" />
              <SelectValue placeholder="All Levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              {GRADE_LEVELS.map((level) => (
                <SelectItem key={level} value={level}>
                  {GRADE_LEVEL_LABELS[level]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={scholarshipSourceFilter} onValueChange={onScholarshipSourceChange}>
            <SelectTrigger className="h-10 w-full sm:w-[220px]">
              <Filter className="mr-2 h-4 w-4 text-primary" />
              <SelectValue placeholder="Filter by source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              {SCHOLARSHIP_SOURCES.map((source) => (
                <SelectItem key={source} value={source}>
                  {SCHOLARSHIP_SOURCE_LABELS[source]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button asChild variant="outline">
            <Link href="/reports">
              Reports
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>

          <ExportButton
            endpoint="/api/export/summary"
            filename="scholarship-summary-by-grade-level"
            formats={['xlsx']}
            label="Export Summary"
            variant="default"
          />
        </div>
      </div>
    </section>
  );
}
