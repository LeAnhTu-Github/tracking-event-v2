'use client';

import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import RewardListingPage from '@/features/config-level-reward/components/reward-listing';

export default function ConfigLevelRewardPage() {
  return (
    <PageContainer scrollable={false}>
      <div className='flex w-full flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title='Level Reward Configuration'
            description='Manage game level rewards and bonuses'
          />
        </div>
        <Separator />
        <RewardListingPage />
      </div>
    </PageContainer>
  );
}
