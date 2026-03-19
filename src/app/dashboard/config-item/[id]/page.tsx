'use client';

import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useItem } from '@/features/config-item/hooks/use-items';
import ItemConfigForm from '@/features/config-item/components/item-config-form';
import { Skeleton } from '@/components/ui/skeleton';

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: item, isLoading } = useItem(id);

  if (isLoading) {
    return (
      <PageContainer>
        <div className='space-y-4'>
          <Skeleton className='h-8 w-64' />
          <Separator />
          <div className='grid grid-cols-1 gap-8'>
            <Skeleton className='h-[400px] w-full' />
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!item) {
    return (
      <PageContainer>
        <div className='flex flex-col items-center justify-center space-y-4'>
          <Heading
            title='Item Not Found'
            description='The requested item does not exist.'
          />
          <Button onClick={() => router.push('/dashboard/config-item')}>
            Back to List
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer scrollable={true}>
      <div className='w-full space-y-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-2'>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => router.push('/dashboard/config-item')}
            >
              <ChevronLeft className='h-4 w-4' />
            </Button>
            <Heading
              title={`Item Detail: ${item.name}`}
              description={`Configuration for Item ${item.itemCode} - ${item.gameId}`}
            />
          </div>
        </div>
        <Separator />
        <ItemConfigForm initialData={item} isEdit={true} />
      </div>
    </PageContainer>
  );
}
