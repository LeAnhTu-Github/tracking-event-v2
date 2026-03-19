'use client';

import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useLevelDetail } from '@/features/config-level/hooks/use-levels';
import LevelConfigForm from '@/features/config-level/components/level-config-form';
import { Skeleton } from '@/components/ui/skeleton';

export default function LevelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: level, isLoading } = useLevelDetail(id);

  if (isLoading) {
    return (
      <PageContainer>
        <div className='space-y-4'>
          <Skeleton className='h-8 w-64' />
          <Separator />
          <div className='grid grid-cols-1 gap-8 lg:grid-cols-12'>
            <div className='lg:col-span-8'>
              <Skeleton className='h-[400px] w-full' />
            </div>
            <div className='lg:col-span-4'>
              <Skeleton className='h-[300px] w-full' />
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!level) {
    return (
      <PageContainer>
        <div className='flex flex-col items-center justify-center space-y-4'>
          <Heading
            title='Level Not Found'
            description='The requested level does not exist.'
          />
          <Button onClick={() => router.push('/dashboard/config-level')}>
            Back to List
          </Button>
        </div>
      </PageContainer>
    );
  }

  // Map LevelItem to LevelConfig expected by LevelConfigForm
  // Note: LevelConfigForm expects certain fields like 'isVip', 'totalImages' etc.
  // We might need to adjust based on actual LevelItem structure.
  const initialData: any = {
    ...level,
    totalImages: level.vipCount + level.normalCount,
    isVip: level.vipCount > 0,
    vipImages: level.vipCount,
    normalImages: level.normalCount,
    imagePool: Array.isArray(level.imagePool) ? level.imagePool : []
  };

  return (
    <PageContainer scrollable={true}>
      <div className='w-full space-y-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-2'>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => router.push('/dashboard/config-level')}
            >
              <ChevronLeft className='h-4 w-4' />
            </Button>
            <Heading
              title={`Level Detail: ${level.name}`}
              description={`Configuration for Level ${level.levelNumber} - ${level.gameId}`}
            />
          </div>
        </div>
        <Separator />
        <LevelConfigForm initialData={initialData} isEdit={true} />
      </div>
    </PageContainer>
  );
}
