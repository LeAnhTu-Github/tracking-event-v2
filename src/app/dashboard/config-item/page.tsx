'use client';

import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import ItemListing from '@/features/config-item/components/item-listing';

export default function ConfigItemPage() {
  return (
    <PageContainer scrollable={false}>
      <div className='flex w-full flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title='Item Configuration'
            description='Manage game items and settings'
          />
        </div>
        <Separator />
        <ItemListing />
      </div>
    </PageContainer>
  );
}
