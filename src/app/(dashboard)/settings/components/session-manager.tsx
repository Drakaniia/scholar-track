'use client';

import { useEffect, useState } from 'react';

import { Monitor, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import type { SessionData } from '../settings-types';
import { SessionsTableSkeleton } from './settings-table-skeleton';

export function SessionManager() {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [revokingSession, setRevokingSession] = useState<string | null>(null);

  useEffect(() => {
    fetchSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSessions = async () => {
    setLoadingSessions(true);
    try {
      const res = await fetch('/api/sessions', { credentials: 'include' });
      const result = await res.json();

      if (result.success) {
        setSessions(result.data);
      } else {
        toast.error('Failed to load sessions');
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error('Failed to load sessions');
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    setRevokingSession(sessionId);
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const result = await res.json();

      if (result.success) {
        toast.success('Session revoked successfully');
        fetchSessions();
      } else {
        toast.error(result.error || 'Failed to revoke session');
      }
    } catch (error) {
      console.error('Error revoking session:', error);
      toast.error('Failed to revoke session');
    } finally {
      setRevokingSession(null);
    }
  };

  if (loadingSessions) {
    return <SessionsTableSkeleton />;
  }

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Monitor className="h-5 w-5" />
            Active Sessions
          </CardTitle>
          <Button onClick={fetchSessions} variant="outline" size="sm" className="gap-2">
            <Monitor className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <div className="text-center py-12">
            <Monitor className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No active sessions</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Click Refresh to load active sessions.
            </p>
          </div>
        ) : (
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
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell>
                      <span className="font-medium">
                        {session.user.firstName} {session.user.lastName}
                      </span>
                      <br />
                      <span className="text-xs text-muted-foreground">
                        @{session.user.username}
                      </span>
                    </TableCell>
                    <TableCell>{session.user.role}</TableCell>
                    <TableCell>
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                        {session.ipAddress || 'Unknown'}
                      </code>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate" title={session.userAgent || ''}>
                      {session.userAgent
                        ? session.userAgent.length > 40
                          ? `${session.userAgent.slice(0, 40)}...`
                          : session.userAgent
                        : 'Unknown'}
                    </TableCell>
                    <TableCell>{new Date(session.createdAt).toLocaleString()}</TableCell>
                    <TableCell>{new Date(session.expiresAt).toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRevokeSession(session.id)}
                        disabled={revokingSession === session.id}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Revoke session"
                      >
                        {revokingSession === session.id ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
