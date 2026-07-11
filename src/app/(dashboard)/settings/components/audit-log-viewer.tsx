'use client';

import { useEffect, useState } from 'react';

import { FileText, Filter, RotateCcw, Search } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import type { AuditLog } from '../settings-types';
import { AuditLogsTableSkeleton } from './settings-table-skeleton';

export function AuditLogViewer() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loadingAuditLogs, setLoadingAuditLogs] = useState(false);
  const [auditLogPage, setAuditLogPage] = useState(1);
  const [auditLogTotal, setAuditLogTotal] = useState(0);
  const [auditLogTotalPages, setAuditLogTotalPages] = useState(0);
  const [auditLogFilters, setAuditLogFilters] = useState({
    action: 'ALL' as string,
    resourceType: 'ALL' as string,
    startDate: '',
    endDate: '',
  });
  const [auditLogFilterOptions, setAuditLogFilterOptions] = useState<{
    actions: string[];
    resourceTypes: string[];
  }>({ actions: [], resourceTypes: [] });

  const fetchAuditLogFilterOptions = async () => {
    try {
      const res = await fetch('/api/audit-logs/filter-options', { credentials: 'include' });
      const result = await res.json();

      if (result.success) {
        setAuditLogFilterOptions(result.data);
      }
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const fetchAuditLogs = async (page = 1) => {
    setLoadingAuditLogs(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
      });

      if (auditLogFilters.action !== 'ALL') {
        params.append('action', auditLogFilters.action);
      }
      if (auditLogFilters.resourceType !== 'ALL') {
        params.append('resourceType', auditLogFilters.resourceType);
      }
      if (auditLogFilters.startDate) {
        params.append('startDate', auditLogFilters.startDate);
      }
      if (auditLogFilters.endDate) {
        params.append('endDate', auditLogFilters.endDate);
      }

      const res = await fetch(`/api/audit-logs?${params}`, { credentials: 'include' });
      const result = await res.json();

      if (result.success) {
        setAuditLogs(result.data);
        setAuditLogPage(result.pagination.page);
        setAuditLogTotal(result.pagination.total);
        setAuditLogTotalPages(result.pagination.totalPages);
      } else {
        toast.error('Failed to load audit logs');
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast.error('Failed to load audit logs');
    } finally {
      setLoadingAuditLogs(false);
    }
  };

  useEffect(() => {
    queueMicrotask(() => {
      fetchAuditLogFilterOptions();
    });
    queueMicrotask(() => {
      fetchAuditLogs(1);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAuditLogFilterChange = (key: string, value: string) => {
    setAuditLogFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyAuditLogFilters = () => {
    setAuditLogPage(1);
    fetchAuditLogs(1);
  };

  const clearAuditLogFilters = () => {
    setAuditLogFilters({
      action: 'ALL',
      resourceType: 'ALL',
      startDate: '',
      endDate: '',
    });
    setAuditLogPage(1);
    fetchAuditLogs(1);
  };

  if (loadingAuditLogs) {
    return <AuditLogsTableSkeleton />;
  }

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <FileText className="h-5 w-5" />
          Audit Logs
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Select
              value={auditLogFilters.action}
              onValueChange={(value) => handleAuditLogFilterChange('action', value)}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="Filter by action" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Actions</SelectItem>
                {auditLogFilterOptions.actions.map((action) => (
                  <SelectItem key={action} value={action}>
                    {action}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={auditLogFilters.resourceType}
              onValueChange={(value) => handleAuditLogFilterChange('resourceType', value)}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="Filter by type" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Resources</SelectItem>
                {auditLogFilterOptions.resourceTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex-1">
              <Label htmlFor="start-date" className="sr-only">
                Start Date
              </Label>
              <Input
                id="start-date"
                type="date"
                value={auditLogFilters.startDate}
                onChange={(e) => handleAuditLogFilterChange('startDate', e.target.value)}
              />
            </div>

            <div className="flex-1">
              <Label htmlFor="end-date" className="sr-only">
                End Date
              </Label>
              <Input
                id="end-date"
                type="date"
                value={auditLogFilters.endDate}
                onChange={(e) => handleAuditLogFilterChange('endDate', e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={applyAuditLogFilters} size="sm" className="gap-2">
              <Search className="h-4 w-4" />
              Apply Filters
            </Button>
            <Button onClick={clearAuditLogFilters} size="sm" variant="outline" className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Clear
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            Total: {auditLogTotal} log entries (Page {auditLogPage} of {auditLogTotalPages})
          </div>
        </div>

        {auditLogs.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No audit logs found</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Try adjusting your filters or date range.
            </p>
          </div>
        ) : (
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
              <TableBody>
                {auditLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {log.user ? (
                        <span className="font-medium">
                          {log.user.firstName} {log.user.lastName}
                          <br />
                          <span className="text-xs text-muted-foreground">@{log.user.username}</span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground">System</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{log.action}</Badge>
                    </TableCell>
                    <TableCell>
                      {log.resourceType && (
                        <span>
                          {log.resourceType}
                          {log.resourceId ? ` #${log.resourceId}` : ''}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                        {log.ipAddress || '-'}
                      </code>
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      {log.details ? (
                        <details>
                          <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                            View details
                          </summary>
                          <pre className="mt-1 max-h-[200px] overflow-auto rounded bg-muted p-2 text-xs">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </details>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination */}
        {auditLogTotalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Page {auditLogPage} of {auditLogTotalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={auditLogPage <= 1}
                onClick={() => {
                  const newPage = auditLogPage - 1;
                  setAuditLogPage(newPage);
                  fetchAuditLogs(newPage);
                }}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={auditLogPage >= auditLogTotalPages}
                onClick={() => {
                  const newPage = auditLogPage + 1;
                  setAuditLogPage(newPage);
                  fetchAuditLogs(newPage);
                }}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
