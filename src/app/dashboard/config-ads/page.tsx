'use client';

import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import AdsConfigListing from '@/features/config-ads/components/ads-config-listing';

export default function ConfigAdsPage() {
  return (
    <PageContainer scrollable={false}>
      <div className='flex w-full flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title='Ads Configuration'
            description='Manage advertisement settings'
          />
        </div>
        <Separator />
        <AdsConfigListing />
      </div>
    </PageContainer>
  );
}
