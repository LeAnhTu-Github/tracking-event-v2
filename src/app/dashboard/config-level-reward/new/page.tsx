'use client';

import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import RewardConfigForm from '@/features/config-level-reward/components/reward-config-form';
import { Breadcrumbs } from '@/components/breadcrumbs';

const breadcrumbItems = [
  { title: 'Dashboard', link: '/dashboard' },
  { title: 'Level Rewards', link: '/dashboard/config-level-reward' },
  { title: 'New', link: '/dashboard/config-level-reward/new' }
];

export default function NewRewardPage() {
  return (
    <PageContainer scrollable={true}>
      <div className='flex-1 space-y-4'>
        <Breadcrumbs items={breadcrumbItems} />
        <div className='flex items-start justify-between'>
          <Heading
            title='Create Level Reward'
            description='Add a new reward configuration'
          />
        </div>
        <Separator />
        <RewardConfigForm />
      </div>
    </PageContainer>
  );
}
