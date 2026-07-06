'use client';

import Link from 'next/link';

import { ChevronLeft, Shield } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import type { SettingsConsoleUser } from '../settings-types';

export function SettingsConsoleHeaderSkeleton() {
  return (
    <section className="overflow-hidden rounded-lg border border-emerald-100 bg-white shadow-sm">
      <div className="h-1 bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-700" />
      <div className="flex flex-col gap-4 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-6 w-28 rounded-full" />
            <Skeleton className="h-5 w-36 rounded-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-8 w-40 sm:h-9" />
            <Skeleton className="h-5 w-full max-w-xl" />
          </div>
        </div>
        <Skeleton className="h-9 w-full rounded-md sm:w-40" />
      </div>
    </section>
  );
}

export function SettingsConsoleHeader({ currentUser }: { currentUser: SettingsConsoleUser | null }) {
  const fullName = [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(' ');
  const displayName = fullName || currentUser?.username || 'Administrator';

  return (
    <section className="overflow-hidden rounded-lg border border-emerald-100 bg-white shadow-sm">
      <div className="h-1 bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-700" />
      <div className="flex flex-col gap-4 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge className="gap-1.5 bg-emerald-50 text-emerald-700">
              <Shield className="h-3.5 w-3.5" />
              Admin Console
            </Badge>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
              {displayName}
              {currentUser?.role ? ` - ${currentUser.role}` : ''}
            </span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            Settings
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600 sm:text-base">
            Manage users, sessions, audit logs, archives, and academic year controls.
          </p>
        </div>
        <Button asChild variant="outline" className="w-full justify-center sm:w-auto">
          <Link href="/" prefetch={true}>
            <ChevronLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
    </section>
  );
}
