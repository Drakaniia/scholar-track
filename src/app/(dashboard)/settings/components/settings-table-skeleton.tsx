'use client';

import { Users } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function SettingsTableBodySkeleton({
  widths,
  rows = 6,
}: {
  widths: string[];
  rows?: number;
}) {
  return (
    <TableBody>
      {[...Array(rows)].map((_, rowIndex) => (
        <TableRow key={rowIndex}>
          {widths.map((width, columnIndex) => (
            <TableCell key={`${rowIndex}-${columnIndex}`}>
              <Skeleton className={width} />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  );
}

export function UserManagementCardSkeleton() {
  return (
    <Card className="border-gray-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Users className="h-5 w-5" />
            User Management
          </CardTitle>
          <Skeleton className="h-10 w-32 rounded-md" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <SettingsTableBodySkeleton
              widths={[
                'h-5 w-32',
                'h-5 w-40',
                'h-5 w-56',
                'h-10 w-[140px] rounded-md',
                'h-6 w-20 rounded-full',
                'h-5 w-36',
                'ml-auto h-8 w-24 rounded-md',
              ]}
            />
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

export function SessionsTableSkeleton() {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>IP Address</TableHead>
            <TableHead>Device/Browser</TableHead>
            <TableHead>Started</TableHead>
            <TableHead>Expires</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <SettingsTableBodySkeleton
          widths={[
            'h-8 w-44',
            'h-6 w-20 rounded-full',
            'h-6 w-28 rounded-md',
            'h-5 w-48',
            'h-5 w-36',
            'h-5 w-36',
            'ml-auto h-8 w-16 rounded-md',
          ]}
        />
      </Table>
    </div>
  );
}

export function ProfileInformationSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      ))}
      <div className="pt-2">
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    </div>
  );
}

export function AuditLogsTableSkeleton() {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Resource</TableHead>
            <TableHead>IP Address</TableHead>
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>
        <SettingsTableBodySkeleton
          widths={[
            'h-5 w-36',
            'h-8 w-40',
            'h-6 w-24 rounded-full',
            'h-8 w-32',
            'h-6 w-28 rounded-md',
            'h-5 w-24',
          ]}
        />
      </Table>
    </div>
  );
}

export function ArchivedItemsSkeleton() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="mb-4 h-7 w-44" />
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Grade Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <SettingsTableBodySkeleton
              rows={4}
              widths={[
                'h-5 w-44',
                'h-5 w-40',
                'h-6 w-24 rounded-full',
                'h-6 w-20 rounded-full',
                'ml-auto h-8 w-24 rounded-md',
              ]}
            />
          </Table>
        </div>
      </div>
      <div>
        <Skeleton className="mb-4 h-7 w-52" />
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Scholarship Name</TableHead>
                <TableHead>Sponsor</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <SettingsTableBodySkeleton
              rows={4}
              widths={[
                'h-5 w-48',
                'h-5 w-36',
                'h-6 w-24 rounded-full',
                'h-6 w-20 rounded-full',
                'h-5 w-28',
                'ml-auto h-8 w-24 rounded-md',
              ]}
            />
          </Table>
        </div>
      </div>
    </div>
  );
}

export function AcademicYearSettingsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-4 border-b border-gray-200 pb-6">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-56" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <Skeleton className="h-16 w-full rounded-md" />
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <Skeleton className="h-10 w-40 rounded-md" />
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-9 w-36 rounded-md" />
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Academic Year</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Promotion Date</TableHead>
                <TableHead>Promotion Status</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <SettingsTableBodySkeleton
              rows={4}
              widths={[
                'h-5 w-32',
                'h-6 w-20 rounded-full',
                'h-5 w-24',
                'h-5 w-24',
                'h-5 w-32',
                'h-6 w-20 rounded-full',
                'h-6 w-20 rounded-full',
                'ml-auto h-8 w-24 rounded-md',
              ]}
            />
          </Table>
        </div>
      </div>
    </div>
  );
}
