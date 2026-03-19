'use client';

import * as React from 'react';
import { AlertTriangle, LayoutDashboard, Puzzle, RefreshCw, X } from 'lucide-react';
import { parseAsString, useQueryState } from 'nuqs';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApps } from '@/lib/hooks/use-apps';
import { useDashboardOverview } from '@/lib/hooks/use-dashboard-overview';
import { useSelectedAppId } from '@/lib/hooks/use-selected-app-id';
import type { DashboardTimeRange } from '@/lib/types/dashboard';

import KpiCards from '@/features/dashboard/components/kpi-cards';
import LevelInspectorTab from '@/features/dashboard/components/level-inspector-tab';
import StrategicOverviewTab from '@/features/dashboard/components/strategic-overview-tab';
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

  const appsQuery = useApps();
  const selectedAppName = React.useMemo(() => {
    if (!appId) return null;
    const apps = appsQuery.data ?? [];
    return apps.find((item) => item.id === appId)?.name ?? null;
  }, [appsQuery.data, appId]);

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
      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList className='w-full justify-start gap-6 overflow-x-auto rounded-none bg-transparent p-0 border-b border-border'>
          <TabsTrigger
            value='strategic-overview'
            className='text-muted-foreground hover:text-foreground relative -mb-px flex-none justify-start whitespace-nowrap rounded-none border-b-2 border-transparent px-0 py-3 font-semibold data-[state=active]:text-primary data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none'
          >
            <LayoutDashboard className='h-4 w-4' />
            Strategic Overview
          </TabsTrigger>
          <TabsTrigger
            value='level-inspector'
            className='text-muted-foreground hover:text-foreground relative -mb-px flex-none justify-start whitespace-nowrap rounded-none border-b-2 border-transparent px-0 py-3 font-semibold data-[state=active]:text-primary data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none'
          >
            <Puzzle className='h-4 w-4' />
            Level Inspector{' '}
            <span className='hidden sm:inline'>(Deep Dive)</span>
          </TabsTrigger>
        </TabsList>

        <div className='bg-card flex flex-col gap-3 rounded-xl border p-4 lg:flex-row lg:items-center lg:justify-between'>
          <div className='min-w-0'>
            <div className='flex flex-wrap items-center gap-2'>
              <div className='text-base font-semibold min-w-0 truncate'>
                {selectedAppName ?? 'Dashboard'}
              </div>
              <div className='text-muted-foreground text-sm'>| Global Stats</div>
            </div>
          </div>

          <div className='flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-end'>
            <div className='text-muted-foreground inline-flex w-fit items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium'>
              TIME RANGE
            </div>
            <div className='flex flex-wrap items-center gap-2'>
              <input
                aria-label='Start date'
                type='date'
                className='bg-background w-full rounded-md border px-3 py-2 text-sm sm:w-auto'
                value={timeRange.startDate}
                onChange={(e) => setTimeRange({ ...timeRange, startDate: e.target.value })}
              />
              <span className='text-muted-foreground hidden text-sm font-medium sm:inline'>-</span>
              <input
                aria-label='End date'
                type='date'
                className='bg-background w-full rounded-md border px-3 py-2 text-sm sm:w-auto'
                value={timeRange.endDate}
                onChange={(e) => setTimeRange({ ...timeRange, endDate: e.target.value })}
              />
              <Button
                type='button'
                variant='ghost'
                size='icon'
                onClick={() => setTimeRange(getDefaultDateRange())}
                aria-label='Clear'
              >
                <X className='h-4 w-4' />
              </Button>
              <Button
                type='button'
                variant='outline'
                size='icon'
                onClick={() => overviewQuery.refetch()}
                aria-label='Refresh'
              >
                <RefreshCw
                  className={overviewQuery.isFetching ? 'h-4 w-4 animate-spin' : 'h-4 w-4'}
                />
              </Button>
            </div>
          </div>
        </div>

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

          <TabsContent value='strategic-overview'>
            <StrategicOverviewTab overview={overviewQuery.data} isLoading={overviewQuery.isFetching} />
          </TabsContent>
          <TabsContent value='level-inspector'>
            <LevelInspectorTab overview={overviewQuery.data} />
          </TabsContent>
        </>
      ) : null}
      </Tabs>
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

