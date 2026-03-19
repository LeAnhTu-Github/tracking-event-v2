'use client';

import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import MonitorListing from '@/features/system-monitor/components/monitor-listing';

export default function SystemMonitorPage() {
  return (
    <PageContainer scrollable={false}>
      <div
        className='flex h-[calc(100dvh-100px)] w-full min-w-0 flex-1 flex-col space-y-4 overflow-y-auto overflow-x-hidden pr-1 pb-4'
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}
      >
        <div className='flex items-start justify-between'>
          <Heading
            title='System Monitor'
            description='Monitor ETL jobs and execute manual actions'
          />
        </div>
        <Separator />
        <MonitorListing />
      </div>
    </PageContainer>
  );
}
