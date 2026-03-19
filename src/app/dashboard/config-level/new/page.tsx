'use client';

import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import LevelConfigForm from '@/features/config-level/components/level-config-form';

export default function NewLevelPage() {
  const router = useRouter();

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
              title='Add New Level'
              description='Configure a new level for a game'
            />
          </div>
        </div>
        <Separator />
        <LevelConfigForm isEdit={false} />
      </div>
    </PageContainer>
  );
}
