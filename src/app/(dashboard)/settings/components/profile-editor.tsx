'use client';

import { useEffect, useState } from 'react';

import { Lock, Save, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import type { ChangePasswordFormData, ProfileFormData } from '../settings-types';
import { ProfileInformationSkeleton } from './settings-table-skeleton';

export function ProfileEditor() {
  const [profileData, setProfileData] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    email: '',
  });
  const [profileErrors, setProfileErrors] = useState<
    Partial<Record<keyof ProfileFormData, string>>
  >({});
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const [changePasswordData, setChangePasswordData] = useState<ChangePasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [changePasswordErrors, setChangePasswordErrors] = useState<
    Partial<Record<keyof ChangePasswordFormData, string>>
  >({});
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const fetchProfile = async () => {
    setLoadingProfile(true);
    try {
      const res = await fetch('/api/profile', { credentials: 'include' });
      const result = await res.json();

      if (result.success) {
        setProfileData({
          firstName: result.data.firstName,
          lastName: result.data.lastName,
          email: result.data.email,
        });
      } else {
        toast.error('Failed to load profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    queueMicrotask(() => {
      fetchProfile();
    });
  }, []);

  const validateProfileForm = (): boolean => {
    const newErrors: Partial<Record<keyof ProfileFormData, string>> = {};

    if (!profileData.firstName) {
      newErrors.firstName = 'First name is required';
    }
    if (!profileData.lastName) {
      newErrors.lastName = 'Last name is required';
    }
    if (!profileData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      newErrors.email = 'Invalid email address';
    }

    setProfileErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateProfile = async () => {
    if (!validateProfileForm()) return;

    setIsUpdatingProfile(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
        credentials: 'include',
      });

      const result = await res.json();

      if (result.success) {
        toast.success('Profile updated successfully');
      } else {
        toast.error(result.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const validateChangePasswordForm = (): boolean => {
    const newErrors: Partial<Record<keyof ChangePasswordFormData, string>> = {};

    if (!changePasswordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    if (!changePasswordData.newPassword || changePasswordData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }
    if (changePasswordData.newPassword !== changePasswordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setChangePasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validateChangePasswordForm()) return;

    setIsChangingPassword(true);
    try {
      const res = await fetch('/api/profile/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: changePasswordData.currentPassword,
          newPassword: changePasswordData.newPassword,
        }),
        credentials: 'include',
      });

      const result = await res.json();

      if (result.success) {
        toast.success('Password changed successfully');
        setChangePasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error(result.error || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (loadingProfile) {
    return (
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <UserIcon className="h-5 w-5" />
            My Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileInformationSkeleton />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <UserIcon className="h-5 w-5" />
            My Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profile-firstName">First Name *</Label>
            <Input
              id="profile-firstName"
              value={profileData.firstName}
              onChange={(e) => {
                setProfileData((prev) => ({ ...prev, firstName: e.target.value }));
                setProfileErrors((prev) => ({ ...prev, firstName: undefined }));
              }}
              className={profileErrors.firstName ? 'border-red-500' : ''}
            />
            {profileErrors.firstName && (
              <p className="text-xs text-red-500">{profileErrors.firstName}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-lastName">Last Name *</Label>
            <Input
              id="profile-lastName"
              value={profileData.lastName}
              onChange={(e) => {
                setProfileData((prev) => ({ ...prev, lastName: e.target.value }));
                setProfileErrors((prev) => ({ ...prev, lastName: undefined }));
              }}
              className={profileErrors.lastName ? 'border-red-500' : ''}
            />
            {profileErrors.lastName && (
              <p className="text-xs text-red-500">{profileErrors.lastName}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-email">Email *</Label>
            <Input
              id="profile-email"
              type="email"
              value={profileData.email}
              onChange={(e) => {
                setProfileData((prev) => ({ ...prev, email: e.target.value }));
                setProfileErrors((prev) => ({ ...prev, email: undefined }));
              }}
              className={profileErrors.email ? 'border-red-500' : ''}
            />
            {profileErrors.email && <p className="text-xs text-red-500">{profileErrors.email}</p>}
          </div>
          <Button
            onClick={handleUpdateProfile}
            disabled={isUpdatingProfile}
            className="w-full gap-2"
            style={{
              background: 'linear-gradient(to right, #22c55e, #10b981, #14b8a6)',
              boxShadow: '0 4px 15px 0 rgba(34, 197, 94, 0.3)',
            }}
          >
            {isUpdatingProfile ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Update Profile
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Lock className="h-5 w-5" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password *</Label>
            <Input
              id="current-password"
              type="password"
              placeholder="Enter current password"
              value={changePasswordData.currentPassword}
              onChange={(e) => {
                setChangePasswordData((prev) => ({ ...prev, currentPassword: e.target.value }));
                setChangePasswordErrors((prev) => ({ ...prev, currentPassword: undefined }));
              }}
              className={changePasswordErrors.currentPassword ? 'border-red-500' : ''}
            />
            {changePasswordErrors.currentPassword && (
              <p className="text-xs text-red-500">{changePasswordErrors.currentPassword}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password *</Label>
            <Input
              id="new-password"
              type="password"
              placeholder="Enter new password (min 8 characters)"
              value={changePasswordData.newPassword}
              onChange={(e) => {
                setChangePasswordData((prev) => ({ ...prev, newPassword: e.target.value }));
                setChangePasswordErrors((prev) => ({ ...prev, newPassword: undefined }));
              }}
              className={changePasswordErrors.newPassword ? 'border-red-500' : ''}
            />
            {changePasswordErrors.newPassword && (
              <p className="text-xs text-red-500">{changePasswordErrors.newPassword}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password *</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="Confirm new password"
              value={changePasswordData.confirmPassword}
              onChange={(e) => {
                setChangePasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }));
                setChangePasswordErrors((prev) => ({ ...prev, confirmPassword: undefined }));
              }}
              className={changePasswordErrors.confirmPassword ? 'border-red-500' : ''}
            />
            {changePasswordErrors.confirmPassword && (
              <p className="text-xs text-red-500">{changePasswordErrors.confirmPassword}</p>
            )}
          </div>
          <Button
            onClick={handleChangePassword}
            disabled={isChangingPassword}
            className="w-full gap-2"
            variant="outline"
          >
            {isChangingPassword ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                Changing...
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" />
                Change Password
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
