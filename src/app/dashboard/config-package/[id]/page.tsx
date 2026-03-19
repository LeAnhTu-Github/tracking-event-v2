'use client';

import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { usePackage } from '@/features/config-package/hooks/use-packages';
import PackageConfigForm from '@/features/config-package/components/package-config-form';
import { Skeleton } from '@/components/ui/skeleton';

export default function PackageDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params.id as string;
  const isReadOnly = searchParams.get('view') === 'true';

  const { data: packageData, isLoading } = usePackage(id);

  if (isLoading) {
    return (
      <PageContainer>
        <div className='space-y-4'>
          <Skeleton className='h-8 w-64' />
          <Separator />
          <div className='grid grid-cols-1 gap-8'>
            <Skeleton className='h-[400px] w-full' />
            <Skeleton className='h-[300px] w-full' />
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!packageData) {
    return (
      <PageContainer>
        <div className='flex flex-col items-center justify-center space-y-4 py-20'>
          <Heading
            title='Package Not Found'
            description='The requested package does not exist.'
          />
          <Button onClick={() => router.push('/dashboard/config-package')}>
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
              onClick={() => router.push('/dashboard/config-package')}
            >
              <ChevronLeft className='h-4 w-4' />
            </Button>
            <Heading
              title={
                isReadOnly
                  ? `View Package: ${packageData.name}`
                  : `Edit Package: ${packageData.name}`
              }
              description={`Configuration for ${packageData.packageCode} - ${packageData.gameId}`}
            />
          </div>
        </div>
        <Separator />
        <PackageConfigForm
          initialData={packageData}
          isEdit={true}
          isReadOnly={isReadOnly}
        />
      </div>
    </PageContainer>
  );
}
