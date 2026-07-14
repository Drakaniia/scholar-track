'use client';

import Link from 'next/link';

import { Award } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency, formatDate } from '@/lib/utils';

interface RecentAward {
  readonly id: number;
  readonly studentName: string;
  readonly scholarshipName: string;
  readonly scholarshipCount?: number;
  readonly scholarshipNames?: readonly string[];
  readonly type: string;
  readonly amount?: number;
  readonly date: string;
  readonly status: 'active' | 'pending' | 'completed';
}

interface RecentAwardsProps {
  readonly awards: readonly RecentAward[];
  limit?: number;
}

const statusStyles = {
  active: 'border-primary/20 bg-primary/10 text-primary',
  pending: 'border-chart-4/20 bg-chart-4/10 text-chart-4',
  completed: 'border-chart-3/20 bg-chart-3/10 text-chart-3',
};

export function RecentAwards({ awards, limit = 5 }: RecentAwardsProps) {
  const displayAwards = awards.slice(0, limit);

  return (
    <Card className="border-[0.5px] border-border/60 bg-card/85 backdrop-blur-xl py-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between border-b-[0.5px] border-border/60 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Award className="h-4 w-4" />
          </span>
          <div>
            <CardTitle className="text-base text-foreground">Recent Awards</CardTitle>
            <CardDescription>Latest student scholarship activity</CardDescription>
          </div>
        </div>
        <Link href="/students" className="text-sm font-medium text-primary hover:underline">
          View all
        </Link>
      </CardHeader>
      <CardContent className="px-0 py-0 sm:px-0">
        {displayAwards.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-5">Student</TableHead>
                <TableHead>Scholarship</TableHead>
                <TableHead className="hidden sm:table-cell">Type</TableHead>
                <TableHead className="hidden md:table-cell">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right pr-5">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayAwards.map((award) => (
                <TableRow key={award.id}>
                  <TableCell className="px-5">
                    <div className="flex items-center gap-3">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-semibold text-muted-foreground">
                        {award.studentName.charAt(0)}
                      </span>
                      <span className="truncate font-medium text-foreground">
                        {award.studentName}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="truncate text-sm text-muted-foreground">
                        {award.scholarshipCount && award.scholarshipCount > 1
                          ? `${award.scholarshipCount} programs`
                          : award.scholarshipName}
                      </span>
                      {award.scholarshipCount && award.scholarshipCount > 1 && (
                        <Badge
                          className="border-chart-4/20 bg-chart-4/10 text-chart-4 text-[10px] leading-none"
                          variant="outline"
                        >
                          {award.scholarshipCount}x
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <span className="text-sm text-muted-foreground">{award.type}</span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {typeof award.amount === 'number' ? (
                      <span className="font-medium text-foreground">
                        {formatCurrency(award.amount)}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground/60">&mdash;</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusStyles[award.status]} variant="outline">
                      {award.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-5 text-muted-foreground">
                    {formatDate(award.date)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="px-5 py-10">
            <div className="rounded-lg border border-dashed border-border/60 py-10 text-center text-sm text-muted-foreground">
              No recent awards
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
