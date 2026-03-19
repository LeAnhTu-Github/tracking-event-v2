'use client';

import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import ShopListingPage from '@/features/config-shop/components/shop-listing';

export default function ConfigShopPage() {
  return (
    <PageContainer scrollable={false}>
      <div className='flex w-full flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title='Shop Configuration'
            description='Manage in-game shop entries and package availability'
          />
        </div>
        <Separator />
        <ShopListingPage />
      </div>
    </PageContainer>
  );
}
