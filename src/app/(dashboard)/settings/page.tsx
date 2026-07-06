'use client';

import { Archive, FileText, GraduationCap, Monitor, User as UserIcon, Users } from 'lucide-react';

import { useAuth } from '@/components/auth/auth-provider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { AcademicYearManager } from './components/academic-year-manager';
import { ArchivedItemsManager } from './components/archived-items-manager';
import { AuditLogViewer } from './components/audit-log-viewer';
import { ProfileEditor } from './components/profile-editor';
import { SessionManager } from './components/session-manager';
import { SettingsConsoleHeader } from './components/settings-header';
import { UserManagement } from './components/user-management';

export default function SettingsPage() {
  const { user: currentUser } = useAuth();

  return (
    <div className="space-y-6">
      <SettingsConsoleHeader currentUser={currentUser} />

      <Tabs defaultValue="users" className="space-y-4">
        <div className="-mx-1 overflow-x-auto px-1 pb-1">
          <TabsList className="h-auto min-w-max justify-start rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
            <TabsTrigger value="users" className="h-9 flex-none gap-2 px-3">
              <Users className="h-4 w-4" />
              User Management
            </TabsTrigger>
            <TabsTrigger value="sessions" className="h-9 flex-none gap-2 px-3">
              <Monitor className="h-4 w-4" />
              Active Sessions
            </TabsTrigger>
            <TabsTrigger value="profile" className="h-9 flex-none gap-2 px-3">
              <UserIcon className="h-4 w-4" />
              My Profile
            </TabsTrigger>
            <TabsTrigger value="audit-logs" className="h-9 flex-none gap-2 px-3">
              <FileText className="h-4 w-4" />
              Audit Logs
            </TabsTrigger>
            <TabsTrigger value="archived" className="h-9 flex-none gap-2 px-3">
              <Archive className="h-4 w-4" />
              Archived Items
            </TabsTrigger>
            <TabsTrigger value="academic-year" className="h-9 flex-none gap-2 px-3">
              <GraduationCap className="h-4 w-4" />
              Academic Year
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="users">
          <UserManagement currentUser={currentUser} />
        </TabsContent>

        <TabsContent value="sessions">
          <SessionManager />
        </TabsContent>

        <TabsContent value="profile">
          <ProfileEditor />
        </TabsContent>

        <TabsContent value="audit-logs">
          <AuditLogViewer />
        </TabsContent>

        <TabsContent value="archived">
          <ArchivedItemsManager />
        </TabsContent>

        <TabsContent value="academic-year">
          <AcademicYearManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
