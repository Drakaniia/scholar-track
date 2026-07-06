'use client';

import { useEffect, useMemo, useState } from 'react';

import {
  Filter,
  KeyRound,
  Pencil,
  Search,
  Shield,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import {
  useCreateUser,
  useDeleteUser,
  useResetPassword,
  useUpdateUserInfo,
  useUpdateUserRole,
  useUpdateUserStatus,
  useUsers,
} from '../hooks/use-settings-queries';
import { USER_ROLE_LABELS, USER_STATUS_LABELS } from '@/types';

import type { User, CreateUserFormData, EditUserFormData, ResetPasswordFormData } from '../settings-types';
import { initialCreateUserFormData } from '../settings-types';
import { UserManagementCardSkeleton } from './settings-table-skeleton';

interface UserManagementProps {
  currentUser: { id?: number; username?: string; firstName?: string; lastName?: string; role?: string } | null;
}

export function UserManagement({ currentUser }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [updating, setUpdating] = useState<number | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<CreateUserFormData>(initialCreateUserFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof CreateUserFormData, string>>>({});

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Pagination state
  const [userPage, setUserPage] = useState(1);
  const [userLimit, setUserLimit] = useState(25);
  const [userTotal, setUserTotal] = useState(0);
  const [userTotalPages, setUserTotalPages] = useState(0);

  // Edit user state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState<EditUserFormData>({
    firstName: '',
    lastName: '',
    email: '',
  });
  const [editErrors, setEditErrors] = useState<Partial<Record<keyof EditUserFormData, string>>>({});
  const [isEditing, setIsEditing] = useState(false);

  // Delete user state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Reset password state
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);
  const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(null);
  const [resetPasswordFormData, setResetPasswordFormData] = useState<ResetPasswordFormData>({
    newPassword: '',
    confirmPassword: '',
  });
  const [resetPasswordErrors, setResetPasswordErrors] = useState<
    Partial<Record<keyof ResetPasswordFormData, string>>
  >({});
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  // Build query params from filter/pagination state — auto-refetches when deps change
  const queryParams = useMemo(() => {
    const params: Record<string, string> = { page: String(userPage), limit: String(userLimit) };
    if (searchQuery) params.search = searchQuery;
    if (roleFilter !== 'ALL') params.role = roleFilter;
    if (statusFilter !== 'ALL') params.status = statusFilter;
    return params;
  }, [userPage, userLimit, searchQuery, roleFilter, statusFilter]);

  const usersQuery = useUsers(queryParams);

  // Sync query results to local state (preserving JSX compatibility)
  useEffect(() => {
    if (usersQuery.data?.success) {
      setUsers(usersQuery.data.data as User[]);
      setUserPage(usersQuery.data.pagination.page);
      setUserTotal(usersQuery.data.pagination.total);
      setUserTotalPages(usersQuery.data.pagination.totalPages);
    } else if (usersQuery.error) {
      console.error('Error fetching users:', usersQuery.error);
      toast.error('Failed to load users');
    }
  }, [usersQuery.data, usersQuery.error]);

  const loading = usersQuery.isLoading && !usersQuery.data;

  const applyUserFilters = () => {
    setUserPage(1);
  };

  const updateUserRole = useUpdateUserRole();
  const updateUserStatus = useUpdateUserStatus();
  const createUser = useCreateUser();
  const updateUserInfo = useUpdateUserInfo();
  const deleteUser = useDeleteUser();
  const resetPasswordMutation = useResetPassword();

  const handleRoleChange = async (userId: number, newRole: string) => {
    setUpdating(userId);
    try {
      await updateUserRole.mutateAsync({ userId, role: newRole });
    } catch (error) {
      console.error('Error updating user role:', error);
    } finally {
      setUpdating(null);
    }
  };

  const handleStatusChange = async (userId: number, newStatus: string) => {
    setUpdating(userId);
    try {
      await updateUserStatus.mutateAsync({ userId, status: newStatus });
    } catch (error) {
      console.error('Error updating user status:', error);
    } finally {
      setUpdating(null);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CreateUserFormData, string>> = {};

    if (!formData.username || formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    if (!formData.password || formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.firstName) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName) {
      newErrors.lastName = 'Last name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateUser = async () => {
    if (!validateForm()) return;

    setIsCreating(true);
    try {
      await createUser.mutateAsync({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
        status: formData.status,
      });
      setFormData(initialCreateUserFormData);
      setErrors({});
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Error creating user:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleInputChange = (field: keyof CreateUserFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const resetForm = () => {
    setFormData(initialCreateUserFormData);
    setErrors({});
  };

  // Edit user handlers
  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setEditFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    });
    setEditErrors({});
    setIsEditDialogOpen(true);
  };

  const validateEditForm = (): boolean => {
    const newErrors: Partial<Record<keyof EditUserFormData, string>> = {};

    if (!editFormData.firstName) {
      newErrors.firstName = 'First name is required';
    }
    if (!editFormData.lastName) {
      newErrors.lastName = 'Last name is required';
    }
    if (!editFormData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editFormData.email)) {
      newErrors.email = 'Invalid email address';
    }

    setEditErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEditUser = async () => {
    if (!validateEditForm() || !editingUser) return;

    setIsEditing(true);
    try {
      await updateUserInfo.mutateAsync({ userId: editingUser.id, data: editFormData });
      setIsEditDialogOpen(false);
      setEditingUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
    } finally {
      setIsEditing(false);
    }
  };

  // Delete user handlers
  const openDeleteDialog = (user: User) => {
    setDeletingUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;

    setIsDeleting(true);
    try {
      await deleteUser.mutateAsync(deletingUser.id);
      setIsDeleteDialogOpen(false);
      setDeletingUser(null);
    } catch (error) {
      console.error('Error deleting user:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Reset password handlers
  const openResetPasswordDialog = (user: User) => {
    setResetPasswordUser(user);
    setResetPasswordFormData({ newPassword: '', confirmPassword: '' });
    setResetPasswordErrors({});
    setIsResetPasswordDialogOpen(true);
  };

  const validateResetPasswordForm = (): boolean => {
    const newErrors: Partial<Record<keyof ResetPasswordFormData, string>> = {};

    if (!resetPasswordFormData.newPassword || resetPasswordFormData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }
    if (resetPasswordFormData.newPassword !== resetPasswordFormData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setResetPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async () => {
    if (!validateResetPasswordForm() || !resetPasswordUser) return;

    setIsResettingPassword(true);
    try {
      await resetPasswordMutation.mutateAsync({
        userId: resetPasswordUser.id,
        newPassword: resetPasswordFormData.newPassword,
      });
      setIsResetPasswordDialogOpen(false);
      setResetPasswordUser(null);
    } catch (error) {
      console.error('Error resetting password:', error);
    } finally {
      setIsResettingPassword(false);
    }
  };

  if (loading) {
    return <UserManagementCardSkeleton />;
  }

  return (
    <>
      <Card className="border-gray-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Users className="h-5 w-5" />
              User Management
            </CardTitle>
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={(open) => {
                setIsCreateDialogOpen(open);
                if (!open) resetForm();
              }}
            >
              <DialogTrigger asChild>
                <Button
                  className="gap-2"
                  style={{
                    background: 'linear-gradient(to right, #22c55e, #10b981, #14b8a6)',
                    boxShadow: '0 4px 15px 0 rgba(34, 197, 94, 0.3)',
                  }}
                >
                  <UserPlus className="h-4 w-4" />
                  Create User
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create New User</DialogTitle>
                  <DialogDescription>
                    Add a new user to the system. The user will be able to login with the credentials you set.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        placeholder="Enter first name"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className={errors.firstName ? 'border-red-500' : ''}
                      />
                      {errors.firstName && (
                        <p className="text-xs text-red-500">{errors.firstName}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        placeholder="Enter last name"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className={errors.lastName ? 'border-red-500' : ''}
                      />
                      {errors.lastName && (
                        <p className="text-xs text-red-500">{errors.lastName}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Username *</Label>
                    <Input
                      id="username"
                      placeholder="Enter username"
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      className={errors.username ? 'border-red-500' : ''}
                    />
                    {errors.username && (
                      <p className="text-xs text-red-500">{errors.username}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter email address"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Password *</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className={errors.password ? 'border-red-500' : ''}
                      />
                      {errors.password && (
                        <p className="text-xs text-red-500">{errors.password}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password *</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className={errors.confirmPassword ? 'border-red-500' : ''}
                      />
                      {errors.confirmPassword && (
                        <p className="text-xs text-red-500">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select
                        value={formData.role}
                        onValueChange={(value: 'ADMIN' | 'STAFF' | 'VIEWER') =>
                          handleInputChange('role', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ADMIN">
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4" />
                              {USER_ROLE_LABELS.ADMIN}
                            </div>
                          </SelectItem>
                          <SelectItem value="STAFF">{USER_ROLE_LABELS.STAFF}</SelectItem>
                          <SelectItem value="VIEWER">{USER_ROLE_LABELS.VIEWER}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED') =>
                          handleInputChange('status', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ACTIVE">{USER_STATUS_LABELS.ACTIVE}</SelectItem>
                          <SelectItem value="INACTIVE">{USER_STATUS_LABELS.INACTIVE}</SelectItem>
                          <SelectItem value="SUSPENDED">{USER_STATUS_LABELS.SUSPENDED}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreateDialogOpen(false);
                      resetForm();
                    }}
                    disabled={isCreating}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    onClick={handleCreateUser}
                    disabled={isCreating}
                    className="gap-2"
                    style={{
                      background: 'linear-gradient(to right, #22c55e, #10b981, #14b8a6)',
                      boxShadow: '0 4px 15px 0 rgba(34, 197, 94, 0.3)',
                    }}
                  >
                    {isCreating ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4" />
                        Create User
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filter Section */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by username, email, or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && applyUserFilters()}
                  className="pl-10"
                />
              </div>

              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="Filter by role" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Roles</SelectItem>
                  <SelectItem value="ADMIN">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      {USER_ROLE_LABELS.ADMIN}
                    </div>
                  </SelectItem>
                  <SelectItem value="STAFF">{USER_ROLE_LABELS.STAFF}</SelectItem>
                  <SelectItem value="VIEWER">{USER_ROLE_LABELS.VIEWER}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="Filter by status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="ACTIVE">{USER_STATUS_LABELS.ACTIVE}</SelectItem>
                  <SelectItem value="INACTIVE">{USER_STATUS_LABELS.INACTIVE}</SelectItem>
                  <SelectItem value="SUSPENDED">{USER_STATUS_LABELS.SUSPENDED}</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={applyUserFilters} size="default">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {users.length} of {userTotal} users
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-sm">Per page:</Label>
                <Select
                  value={userLimit.toString()}
                  onValueChange={(value) => {
                    setUserLimit(parseInt(value));
                    setUserPage(1);
                  }}
                >
                  <SelectTrigger className="w-[80px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">
                {users.length === 0 ? 'No users found' : 'No matching users'}
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                {users.length === 0
                  ? 'Click "Create User" to add your first user'
                  : 'Try adjusting your search or filters'}
              </p>
            </div>
          ) : (
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
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.username}
                        {user.id === currentUser?.id && (
                          <Badge variant="outline" className="ml-2">
                            You
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{user.firstName} {user.lastName}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Select
                          value={user.role}
                          onValueChange={(value) => handleRoleChange(user.id, value)}
                          disabled={updating === user.id || user.id === currentUser?.id}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ADMIN">
                              <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4" />
                                {USER_ROLE_LABELS.ADMIN}
                              </div>
                            </SelectItem>
                            <SelectItem value="STAFF">{USER_ROLE_LABELS.STAFF}</SelectItem>
                            <SelectItem value="VIEWER">{USER_ROLE_LABELS.VIEWER}</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={user.status}
                          onValueChange={(value) => handleStatusChange(user.id, value)}
                          disabled={updating === user.id || user.id === currentUser?.id}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ACTIVE">{USER_STATUS_LABELS.ACTIVE}</SelectItem>
                            <SelectItem value="INACTIVE">{USER_STATUS_LABELS.INACTIVE}</SelectItem>
                            <SelectItem value="SUSPENDED">{USER_STATUS_LABELS.SUSPENDED}</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(user)}
                            disabled={updating === user.id}
                            className="h-8 w-8 p-0"
                            title="Edit user"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openResetPasswordDialog(user)}
                            disabled={updating === user.id}
                            className="h-8 w-8 p-0"
                            title="Reset password"
                          >
                            <KeyRound className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(user)}
                            disabled={updating === user.id || user.id === currentUser?.id}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Delete user"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          {updating === user.id && (
                            <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information for {editingUser?.username}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-firstName">First Name *</Label>
                <Input
                  id="edit-firstName"
                  value={editFormData.firstName}
                  onChange={(e) => {
                    setEditFormData((prev) => ({ ...prev, firstName: e.target.value }));
                    setEditErrors((prev) => ({ ...prev, firstName: undefined }));
                  }}
                  className={editErrors.firstName ? 'border-red-500' : ''}
                />
                {editErrors.firstName && <p className="text-xs text-red-500">{editErrors.firstName}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-lastName">Last Name *</Label>
                <Input
                  id="edit-lastName"
                  value={editFormData.lastName}
                  onChange={(e) => {
                    setEditFormData((prev) => ({ ...prev, lastName: e.target.value }));
                    setEditErrors((prev) => ({ ...prev, lastName: undefined }));
                  }}
                  className={editErrors.lastName ? 'border-red-500' : ''}
                />
                {editErrors.lastName && <p className="text-xs text-red-500">{editErrors.lastName}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={editFormData.email}
                onChange={(e) => {
                  setEditFormData((prev) => ({ ...prev, email: e.target.value }));
                  setEditErrors((prev) => ({ ...prev, email: undefined }));
                }}
                className={editErrors.email ? 'border-red-500' : ''}
              />
              {editErrors.email && <p className="text-xs text-red-500">{editErrors.email}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isEditing}>
              Cancel
            </Button>
            <Button
              onClick={handleEditUser}
              disabled={isEditing}
              style={{
                background: 'linear-gradient(to right, #22c55e, #10b981, #14b8a6)',
                boxShadow: '0 4px 15px 0 rgba(34, 197, 94, 0.3)',
              }}
            >
              {isEditing ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete user <strong>{deletingUser?.username}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={isDeleting}
              className="gap-2"
            >
              {isDeleting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Delete User
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={isResetPasswordDialogOpen} onOpenChange={setIsResetPasswordDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Set a new password for {resetPasswordUser?.username}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password *</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Enter new password"
                value={resetPasswordFormData.newPassword}
                onChange={(e) => {
                  setResetPasswordFormData((prev) => ({ ...prev, newPassword: e.target.value }));
                  setResetPasswordErrors((prev) => ({ ...prev, newPassword: undefined }));
                }}
                className={resetPasswordErrors.newPassword ? 'border-red-500' : ''}
              />
              {resetPasswordErrors.newPassword && (
                <p className="text-xs text-red-500">{resetPasswordErrors.newPassword}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password *</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm new password"
                value={resetPasswordFormData.confirmPassword}
                onChange={(e) => {
                  setResetPasswordFormData((prev) => ({ ...prev, confirmPassword: e.target.value }));
                  setResetPasswordErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                }}
                className={resetPasswordErrors.confirmPassword ? 'border-red-500' : ''}
              />
              {resetPasswordErrors.confirmPassword && (
                <p className="text-xs text-red-500">{resetPasswordErrors.confirmPassword}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsResetPasswordDialogOpen(false)}
              disabled={isResettingPassword}
            >
              Cancel
            </Button>
            <Button onClick={handleResetPassword} disabled={isResettingPassword} className="gap-2">
              {isResettingPassword ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Resetting...
                </>
              ) : (
                <>
                  <KeyRound className="h-4 w-4" />
                  Reset Password
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
