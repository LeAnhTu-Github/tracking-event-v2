'use client';

import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useAdsConfig } from '@/features/config-ads/hooks/use-ads-configs';
import AdsConfigForm from '@/features/config-ads/components/ads-config-form';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdsConfigDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: adsConfig, isLoading } = useAdsConfig(id);

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

  if (!adsConfig) {
    return (
      <PageContainer>
        <div className='flex flex-col items-center justify-center space-y-4'>
          <Heading
            title='Ads Config Not Found'
            description='The requested ads configuration does not exist.'
          />
          <Button onClick={() => router.push('/dashboard/config-ads')}>
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
              onClick={() => router.push('/dashboard/config-ads')}
            >
              <ChevronLeft className='h-4 w-4' />
            </Button>
            <Heading
              title={`Ads Config Detail: ${adsConfig.configKey}`}
              description={`Configuration for ${adsConfig.gameId}`}
            />
          </div>
        </div>
        <Separator />
        <AdsConfigForm initialData={adsConfig} isEdit={true} />
      </div>
    </PageContainer>
  );
}
