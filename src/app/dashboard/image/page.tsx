'use client';

import { useRouter } from 'next/navigation';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import ImageListingPage from '@/features/image/components/image-listing';

export default function ImagePage() {
  const router = useRouter();

  return (
    <PageContainer scrollable={false}>
      <div className='flex w-full flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading title='Image Management' description='List View Image' />
          <Button onClick={() => router.push('/dashboard/image/add')}>
            Add Image
          </Button>
        </div>
        <Separator />

        <ImageListingPage />
      </div>
    </PageContainer>
  );
}
