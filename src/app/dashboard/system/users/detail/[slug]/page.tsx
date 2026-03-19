'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import userService from '@/services/user.service';
import { User } from '@/types/user.type';
import { Heading } from '@/components/ui/heading';
import PageContainer from '@/components/layout/page-container';
import Image from 'next/image';

export default function PageDetailUser() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const params = useParams();
  const slug = Number(params.slug);

  const fetchUser = useCallback(async () => {
    try {
      if (!slug) return;
      setIsLoading(true);
      const res = await userService.getUserById(slug);
      setUser(res);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  if (isLoading) {
    return (
      <PageContainer>
        <div className='flex items-center justify-center p-8'>
          <p>Loading...</p>
        </div>
      </PageContainer>
    );
  }

  if (!user) {
    return (
      <PageContainer>
        <div className='flex items-center justify-center p-8'>
          <p>User not found</p>
        </div>
      </PageContainer>
    );
  }

  const getInitials = (name: string | undefined) => {
    if (!name) return 'CN';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <PageContainer>
      <div className='space-y-4'>
        <Heading title='Users' description='User details' />
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                View and manage user account information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='flex items-center space-x-4'>
                <Avatar className='h-20 w-20'>
                  <AvatarImage alt={user?.fullName} src={user?.avatar || ''} />
                  <AvatarFallback>{getInitials(user?.fullName)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className='text-2xl font-bold'>{user?.fullName}</h3>
                  <p className='text-gray-500'>@{user?.username}</p>
                </div>
              </div>
              <div className='mt-6 grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm text-gray-500'>Phone number</p>
                  <p>{user?.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className='text-sm text-gray-500'>Status</p>
                  <Badge
                    variant={
                      user?.status === 'ACTIVE' ? 'default' : 'destructive'
                    }
                    className={
                      user?.status === 'ACTIVE'
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                    }
                  >
                    {user?.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div>
                  <p className='text-sm text-gray-500'>Creation time</p>
                  <p>{user?.createTime || 'N/A'}</p>
                </div>
                <div>
                  <p className='text-sm text-gray-500'>Last updated</p>
                  <p>{user?.updateTime || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Groups</CardTitle>
              <CardDescription>Groups are members</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {user?.groups && user.groups.length > 0 ? (
                  user.groups.map((group) => (
                    <div key={group.id} className='rounded-lg border p-4'>
                      <div className='flex items-center justify-between'>
                        <h4 className='font-semibold'>{group.groupName}</h4>
                        <Badge
                          variant={
                            group.status === 1 ? 'default' : 'destructive'
                          }
                          className={
                            group.status === 1
                              ? 'bg-green-500 text-white'
                              : 'bg-red-500 text-white'
                          }
                        >
                          {group.status === 1 ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className='mt-2 text-sm text-gray-500'>
                        {group.description}
                      </p>
                      <div className='mt-4 text-sm text-gray-500'>
                        Last updated: {group.updateTime || 'N/A'}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className='text-muted-foreground text-center'>
                    No groups assigned
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
