'use client';

import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import DataCheckListing from '@/features/data-check/components/data-check-listing';

export default function CheckDataPage() {
  return (
    <PageContainer scrollable={false}>
      <div
        className='flex h-[calc(100dvh-100px)] w-full min-w-0 flex-1 flex-col space-y-4 overflow-y-auto overflow-x-hidden pr-1 pb-4'
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}
      >
        <div className='flex items-start justify-between'>
          <Heading
            title='Check Data'
            description='Analyze level performance and in-game economy by date/version/geo'
          />
        </div>
        <Separator />
        <DataCheckListing />
      </div>
    </PageContainer>
  );
}
