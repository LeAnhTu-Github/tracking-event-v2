'use client';

import { useRouter } from 'next/navigation';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import ConfigImageListingPage from '@/features/config-image/components/config-image-listing';
import { Plus } from 'lucide-react';

export default function Page() {
  const router = useRouter();

  return (
    <PageContainer scrollable={false}>
      <div className='flex w-full flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title='Config Image'
            description='Manage image configurations'
          />
          <Button onClick={() => router.push('/dashboard/config-image/add')}>
            <Plus className='mr-2 h-4 w-4' />
            Add Config
          </Button>
        </div>
        <Separator />
        <ConfigImageListingPage />
      </div>
    </PageContainer>
  );
}
