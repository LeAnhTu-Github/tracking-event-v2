'use client';

import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import PackageListingPage from '@/features/config-package/components/package-listing';

export default function ConfigPackagePage() {
  return (
    <PageContainer scrollable={false}>
      <div className='flex w-full flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title='Package Configuration'
            description='Manage game packages, prices, and discounts'
          />
        </div>
        <Separator />
        <PackageListingPage />
      </div>
    </PageContainer>
  );
}
