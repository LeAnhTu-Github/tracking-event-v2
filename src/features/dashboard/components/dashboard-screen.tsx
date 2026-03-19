'use client';

import * as React from 'react';
import { AlertTriangle, LayoutDashboard, Puzzle } from 'lucide-react';
import { parseAsString, useQueryState } from 'nuqs';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDashboardOverview } from '@/lib/hooks/use-dashboard-overview';
import { useSelectedAppId } from '@/lib/hooks/use-selected-app-id';
import type { DashboardTimeRange } from '@/lib/types/dashboard';

import KpiCards from '@/features/dashboard/components/kpi-cards';
import LevelInspectorTab from '@/features/dashboard/components/level-inspector-tab';
import StrategicOverviewTab from '@/features/dashboard/components/strategic-overview-tab';
import TimeRangeFilter from '@/features/dashboard/components/time-range-filter';
import { getDefaultDateRange } from '@/features/dashboard/utils/date-range';

const START_DATE_KEY = 'startDate';
const END_DATE_KEY = 'endDate';

const useDashboardTimeRange = (): [DashboardTimeRange, (next: DashboardTimeRange) => void] => {
  const defaults = React.useMemo(() => getDefaultDateRange(), []);

  const [startDate, setStartDate] = useQueryState(
    START_DATE_KEY,
    parseAsString.withDefault(defaults.startDate)
  );
  const [endDate, setEndDate] = useQueryState(
    END_DATE_KEY,
    parseAsString.withDefault(defaults.endDate)
  );

  const value = React.useMemo(
    () => ({ startDate: startDate ?? defaults.startDate, endDate: endDate ?? defaults.endDate }),
    [startDate, endDate, defaults]
  );

  const setValue = React.useCallback(
    (next: DashboardTimeRange) => {
      void setStartDate(next.startDate);
      void setEndDate(next.endDate);
    },
    [setStartDate, setEndDate]
  );

  return [value, setValue];
};

export default function DashboardScreen() {
  const appId = useSelectedAppId();
  const [timeRange, setTimeRange] = useDashboardTimeRange();
  const [tab, setTab] = React.useState<'strategic-overview' | 'level-inspector'>(
    'strategic-overview'
  );

  const overviewQuery = useDashboardOverview({
    appId: appId ?? 0,
    startDate: timeRange.startDate,
    endDate: timeRange.endDate
  });

  if (!appId) {
    return (
      <div className='flex flex-col gap-4 p-6'>
        <div>
          <h1 className='text-2xl font-semibold tracking-tight'>Dashboard</h1>
          <p className='text-muted-foreground mt-1 text-sm'>
            Select a project from the sidebar to load analytics.
          </p>
        </div>
        <div className='text-muted-foreground flex h-56 items-center justify-center rounded-xl border border-dashed text-sm'>
          No active project selected.
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-6 p-6'>
      <div className='flex flex-col gap-2'>
        <h1 className='text-2xl font-semibold tracking-tight'>Dashboard</h1>
        <p className='text-muted-foreground text-sm'>
          Strategic overview and level inspector for the selected project.
        </p>
      </div>

      <TimeRangeFilter value={timeRange} onChange={setTimeRange} />

      {overviewQuery.isLoading ? <DashboardSkeleton /> : null}

      {overviewQuery.isError ? (
        <div className='bg-card rounded-xl border p-6'>
          <div className='flex items-start gap-3'>
            <div className='bg-destructive/10 text-destructive flex h-10 w-10 items-center justify-center rounded-lg'>
              <AlertTriangle className='h-5 w-5' />
            </div>
            <div className='min-w-0'>
              <div className='text-sm font-semibold'>Failed to load dashboard</div>
              <div className='text-muted-foreground mt-1 text-sm'>
                Please retry, or adjust the time range.
              </div>
              <div className='mt-4'>
                <Button type='button' onClick={() => overviewQuery.refetch()}>
                  Retry
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {overviewQuery.data ? (
        <>
          <KpiCards cards={overviewQuery.data.cards} />

          <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
            <TabsList>
              <TabsTrigger value='strategic-overview'>
                <LayoutDashboard className='h-4 w-4' />
                Strategic overview
              </TabsTrigger>
              <TabsTrigger value='level-inspector'>
                <Puzzle className='h-4 w-4' />
                Level inspector
              </TabsTrigger>
            </TabsList>

            <TabsContent value='strategic-overview'>
              <StrategicOverviewTab overview={overviewQuery.data} />
            </TabsContent>
            <TabsContent value='level-inspector'>
              <LevelInspectorTab overview={overviewQuery.data} />
            </TabsContent>
          </Tabs>
        </>
      ) : null}
    </div>
  );
}

const DashboardSkeleton = () => {
  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4'>
      <Skeleton className='h-24' />
      <Skeleton className='h-24' />
      <Skeleton className='h-24' />
      <Skeleton className='h-24' />
    </div>
  );
};

