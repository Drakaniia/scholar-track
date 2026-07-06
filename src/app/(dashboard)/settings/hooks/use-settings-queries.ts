'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Query key factory for settings-related queries
export const settingsQueryKeys = {
  all: ['settings'] as const,
  users: {
    all: () => [...settingsQueryKeys.all, 'users'] as const,
    list: (params?: Record<string, string>) =>
      [...settingsQueryKeys.users.all(), 'list', params] as const,
  },
  sessions: {
    all: () => [...settingsQueryKeys.all, 'sessions'] as const,
    list: () => [...settingsQueryKeys.sessions.all(), 'list'] as const,
  },
  profile: {
    all: () => [...settingsQueryKeys.all, 'profile'] as const,
    detail: () => [...settingsQueryKeys.profile.all(), 'detail'] as const,
  },
  auditLogs: {
    all: () => [...settingsQueryKeys.all, 'audit-logs'] as const,
    list: (params?: Record<string, string>) =>
      [...settingsQueryKeys.auditLogs.all(), 'list', params] as const,
    filterOptions: () => [...settingsQueryKeys.auditLogs.all(), 'filter-options'] as const,
  },
  archived: {
    all: () => [...settingsQueryKeys.all, 'archived'] as const,
    students: (params?: Record<string, string>) =>
      [...settingsQueryKeys.archived.all(), 'students', params] as const,
    scholarships: (params?: Record<string, string>) =>
      [...settingsQueryKeys.archived.all(), 'scholarships', params] as const,
  },
  academicYears: {
    all: () => [...settingsQueryKeys.all, 'academic-years'] as const,
    list: (params?: Record<string, string>) =>
      [...settingsQueryKeys.academicYears.all(), 'list', params] as const,
    promotion: {
      all: () => [...settingsQueryKeys.academicYears.all(), 'promotion'] as const,
      preview: () => [...settingsQueryKeys.academicYears.promotion.all(), 'preview'] as const,
      run: (id?: number) => [...settingsQueryKeys.academicYears.promotion.all(), 'run', id] as const,
    },
  },
};

// Generic fetch helper
async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    credentials: 'include',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.error || 'API request failed');
  }
  return data;
}

// User Management Hooks
export function useUsers(params?: Record<string, string>) {
  const searchParams = new URLSearchParams(params || {});
  return useQuery({
    queryKey: settingsQueryKeys.users.list(params),
    queryFn: () =>
      fetchApi<{
        success: boolean;
        data: Array<{
          id: number;
          username: string;
          email: string;
          firstName: string;
          lastName: string;
          role: string;
          status: string;
          lastLogin: string | null;
          createdAt: string;
        }>;
        pagination: { page: number; limit: number; total: number; totalPages: number };
      }>(`/api/users?${searchParams.toString()}`),
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, status }: { userId: number; status: string }) =>
      fetchApi(`/api/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsQueryKeys.users.all() });
      toast.success('User status updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update user status');
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: string }) =>
      fetchApi(`/api/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify({ role }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsQueryKeys.users.all() });
      toast.success('User role updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update user role');
    },
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchApi('/api/users', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsQueryKeys.users.all() });
      toast.success('User created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create user');
    },
  });
}

// Session Hooks
export function useSessions() {
  return useQuery({
    queryKey: settingsQueryKeys.sessions.list(),
    queryFn: () =>
      fetchApi<{ success: boolean; data: Array<Record<string, unknown>> }>('/api/sessions'),
    enabled: false,
  });
}

export function useRevokeSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) =>
      fetchApi(`/api/sessions/${sessionId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsQueryKeys.sessions.all() });
      toast.success('Session revoked successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to revoke session');
    },
  });
}

// User Info, Delete, Reset Password Hooks
export function useUpdateUserInfo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, data }: { userId: number; data: { firstName: string; lastName: string; email: string } }) =>
      fetchApi(`/api/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsQueryKeys.users.all() });
      toast.success('User updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update user');
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) =>
      fetchApi(`/api/users/${userId}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsQueryKeys.users.all() });
      toast.success('User deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete user');
    },
  });
}

export function useResetPassword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, newPassword }: { userId: number; newPassword: string }) =>
      fetchApi(`/api/users/${userId}/reset-password`, {
        method: 'POST',
        body: JSON.stringify({ newPassword }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsQueryKeys.users.all() });
      toast.success('Password reset successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reset password');
    },
  });
}

// Profile Hooks
export function useProfile() {
  return useQuery({
    queryKey: settingsQueryKeys.profile.detail(),
    queryFn: () =>
      fetchApi<{ success: boolean; data: { firstName: string; lastName: string; email: string } }>(
        '/api/profile'
      ),
    enabled: false,
  });
}

export function useUpdateProfile() {
  return useMutation({
    mutationFn: (data: { firstName: string; lastName: string; email: string }) =>
      fetchApi('/api/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      toast.success('Profile updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update profile');
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      fetchApi('/api/profile/change-password', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      toast.success('Password changed successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to change password');
    },
  });
}
