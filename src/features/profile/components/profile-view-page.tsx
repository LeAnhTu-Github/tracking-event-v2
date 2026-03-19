'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/useAuth';
import { IconSettings, IconKey, IconLogout } from '@tabler/icons-react';
import { EditProfileModal } from './edit-profile-modal';
import { ChangePasswordModal } from './change-password-modal';

export default function ProfileViewPage() {
  const { user, logOut } = useAuthStore();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  if (!user) {
    return (
      <div className='flex w-full flex-col items-center justify-center p-4'>
        <p className='text-muted-foreground'>
          Please sign in to view your profile
        </p>
      </div>
    );
  }

  const handleLogout = () => {
    logOut();
  };

  const getInitials = (name: string | undefined) => {
    if (!name) return 'CN';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className='flex w-full flex-col gap-6 p-4'>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <div>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              View and manage your account details
            </CardDescription>
          </div>
          <div className='flex flex-col gap-2 sm:flex-row'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setIsEditProfileOpen(true)}
              className='w-full sm:w-auto'
            >
              <IconSettings className='mr-2 h-4 w-4' />
              Edit Profile
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setIsChangePasswordOpen(true)}
              className='w-full sm:w-auto'
            >
              <IconKey className='mr-2 h-4 w-4' />
              Change Password
            </Button>
            <Button
              variant='destructive'
              size='sm'
              onClick={handleLogout}
              className='w-full sm:w-auto'
            >
              <IconLogout className='mr-2 h-4 w-4' />
              Logout
            </Button>
          </div>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='flex flex-col items-center gap-4 sm:flex-row sm:items-start'>
            <Avatar className='h-20 w-20'>
              <AvatarImage src={user.avatar} alt={user.fullName} />
              <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
            </Avatar>
            <div className='text-center sm:text-left'>
              <h2 className='text-2xl font-bold'>{user.fullName}</h2>
              <p className='text-muted-foreground'>@{user.username}</p>
            </div>
          </div>
          <Separator />
          <div className='grid gap-6 sm:gap-4 md:grid-cols-2'>
            <div className='space-y-2'>
              <p className='text-muted-foreground text-sm font-medium'>Phone</p>
              <p>{user.phone || 'N/A'}</p>
            </div>
            <div className='space-y-2'>
              <p className='text-muted-foreground text-sm font-medium'>
                Status
              </p>
              <Badge
                variant={user?.status === 'ACTIVE' ? 'default' : 'destructive'}
                className={
                  user?.status === 'ACTIVE'
                    ? 'bg-green-500 text-white'
                    : 'bg-red-500 text-white'
                }
              >
                {user?.status === 'ACTIVE' ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {user.groups && user.groups.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Groups</CardTitle>
            <CardDescription>Groups you are a member of</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid gap-4 sm:grid-cols-2 md:grid-cols-2'>
              {user.groups.map((group) => (
                <div key={group.id} className='rounded-lg border p-4'>
                  <h3 className='font-semibold'>{group.groupName}</h3>
                  <p className='text-muted-foreground text-sm'>
                    {group.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        user={user}
      />

      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </div>
  );
}
