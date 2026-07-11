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
  active: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  pending: 'border-amber-200 bg-amber-50 text-amber-800',
  completed: 'border-sky-200 bg-sky-50 text-sky-800',
};

export function RecentAwards({ awards, limit = 5 }: RecentAwardsProps) {
  const displayAwards = awards.slice(0, limit);

  return (
    <Card className="rounded-lg border-slate-200 bg-white py-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between border-b border-slate-200 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
            <Award className="h-4 w-4" />
          </span>
          <div>
            <CardTitle className="text-base text-slate-950">Recent Awards</CardTitle>
            <CardDescription>Latest student scholarship activity</CardDescription>
          </div>
        </div>
        <Link href="/students" className="text-sm font-medium text-emerald-700 hover:underline">
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
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-semibold text-slate-800">
                        {award.studentName.charAt(0)}
                      </span>
                      <span className="truncate font-medium text-slate-950">
                        {award.studentName}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="truncate text-sm text-slate-700">
                        {award.scholarshipCount && award.scholarshipCount > 1
                          ? `${award.scholarshipCount} programs`
                          : award.scholarshipName}
                      </span>
                      {award.scholarshipCount && award.scholarshipCount > 1 && (
                        <Badge
                          className="border-amber-200 bg-amber-50 text-amber-900 text-[10px] leading-none"
                          variant="outline"
                        >
                          {award.scholarshipCount}x
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <span className="text-sm text-slate-500">{award.type}</span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {typeof award.amount === 'number' ? (
                      <span className="font-medium text-slate-950">
                        {formatCurrency(award.amount)}
                      </span>
                    ) : (
                      <span className="text-sm text-slate-400">&mdash;</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusStyles[award.status]} variant="outline">
                      {award.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-5 text-slate-500">
                    {formatDate(award.date)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="px-5 py-10">
            <div className="rounded-lg border border-dashed border-[#d4dfd9] py-10 text-center text-sm text-slate-500">
              No recent awards
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
