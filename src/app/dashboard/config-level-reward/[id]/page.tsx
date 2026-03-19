'use client';

import * as React from 'react';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import RewardConfigForm from '@/features/config-level-reward/components/reward-config-form';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { useLevelReward } from '@/features/config-level-reward/hooks/use-level-rewards';
import { useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditRewardPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: initialData, isLoading } = useLevelReward(id);

  const breadcrumbItems = [
    { title: 'Dashboard', link: '/dashboard' },
    { title: 'Level Rewards', link: '/dashboard/config-level-reward' },
    { title: 'Edit', link: `/dashboard/config-level-reward/${id}` }
  ];

  if (isLoading) {
    return (
      <PageContainer scrollable={true}>
        <div className='flex-1 space-y-4'>
          <Breadcrumbs items={breadcrumbItems} />
          <div className='flex items-start justify-between'>
            <Heading
              title='Edit Level Reward'
              description='Update reward configuration'
            />
          </div>
          <Separator />
          <div className='space-y-6'>
            <Skeleton className='h-40 w-full' />
            <Skeleton className='h-40 w-full' />
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer scrollable={true}>
      <div className='flex-1 space-y-4'>
        <Breadcrumbs items={breadcrumbItems} />
        <div className='flex items-start justify-between'>
          <Heading
            title='Edit Level Reward'
            description='Update reward configuration'
          />
        </div>
        <Separator />
        <RewardConfigForm initialData={initialData} isEdit={true} />
      </div>
    </PageContainer>
  );
}
