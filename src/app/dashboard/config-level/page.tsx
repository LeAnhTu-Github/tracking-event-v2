'use client';

import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import LevelListingPage from '@/features/config-level/components/level-listing';

export default function ConfigLevelPage() {
  return (
    <PageContainer scrollable={false}>
      <div className='flex w-full flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title='Level Configuration'
            description='Manage game levels and settings'
          />
        </div>
        <Separator />
        <LevelListingPage />
      </div>
    </PageContainer>
  );
}
