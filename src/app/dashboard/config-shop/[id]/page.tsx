'use client';

import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useShop } from '@/features/config-shop/hooks/use-shops';
import ShopForm from '@/features/config-shop/components/shop-form';
import { Skeleton } from '@/components/ui/skeleton';

export default function ShopDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params.id as string;
  const isReadOnly = searchParams.get('view') === 'true';

  const { data: shopData, isLoading } = useShop(id);

  if (isLoading) {
    return (
      <PageContainer>
        <div className='mx-auto max-w-5xl space-y-4 pt-4'>
          <div className='flex items-center gap-4'>
            <Skeleton className='h-9 w-9 rounded-full' />
            <div className='space-y-2'>
              <Skeleton className='h-8 w-64' />
              <Skeleton className='h-4 w-48' />
            </div>
          </div>
          <Separator />
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-12'>
            <div className='space-y-6 lg:col-span-4'>
              <Skeleton className='h-64 w-full rounded-xl' />
              <Skeleton className='h-48 w-full rounded-xl' />
            </div>
            <div className='lg:col-span-8'>
              <Skeleton className='h-[600px] w-full rounded-xl' />
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!shopData) {
    return (
      <PageContainer>
        <div className='flex flex-col items-center justify-center space-y-4 py-20 text-center'>
          <div className='bg-muted/50 mb-4 rounded-full p-6'>
            <Heading
              title='Configuration Not Found'
              description='The requested shop configuration does not exist or has been removed.'
            />
          </div>
          <Button
            onClick={() => router.push('/dashboard/config-shop')}
            variant='outline'
            className='rounded-xl px-8'
          >
            Back to Shop Manager
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer scrollable={true}>
      <ShopForm initialData={shopData} isEdit={true} isReadOnly={isReadOnly} />
    </PageContainer>
  );
}
