import { BarChart3, Flame, TrendingUp } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DashboardOverview } from '@/lib/types/dashboard';

import BalanceMapChart from '@/features/dashboard/components/charts/balance-map-chart';
import DropFunnelChart from '@/features/dashboard/components/charts/drop-funnel-chart';
import EventContributionChart from '@/features/dashboard/components/charts/event-contribution-chart';
import LevelFocusChart from '@/features/dashboard/components/charts/level-focus-chart';
import ChartCardSkeleton from '@/features/dashboard/components/chart-card-skeleton';

export type StrategicOverviewTabProps = {
  readonly overview: DashboardOverview;
  readonly isLoading?: boolean;
};

export default function StrategicOverviewTab({
  overview,
  isLoading = false
}: StrategicOverviewTabProps) {
  return (
    <div className='grid grid-cols-1 gap-4 xl:grid-cols-12'>
      <Card className='py-0 xl:col-span-12'>
        <CardHeader className='px-4 pt-4 pb-0'>
          <CardTitle className='flex items-center gap-2 text-sm font-semibold'>
            <Flame className='h-4 w-4 text-red-500' />
            Game Balance Map
          </CardTitle>
        </CardHeader>
        <CardContent className='px-4 pb-4'>
          {isLoading ? (
            <ChartCardSkeleton heightClassName='h-[420px]' />
          ) : (
            <BalanceMapChart data={overview.balance_chart} />
          )}
        </CardContent>
      </Card>

      <Card className='py-0 xl:col-span-6'>
        <CardHeader className='px-4 pt-4 pb-0'>
          <CardTitle className='flex items-center gap-2 text-sm font-semibold'>
            <TrendingUp className='h-4 w-4 text-purple-500' />
            Drop Funnel
          </CardTitle>
        </CardHeader>
        <CardContent className='px-4 pb-4'>
          {isLoading ? (
            <ChartCardSkeleton heightClassName='h-[320px]' />
          ) : (
            <DropFunnelChart data={overview.balance_chart} />
          )}
        </CardContent>
      </Card>

      <Card className='py-0 xl:col-span-6'>
        <CardHeader className='px-4 pt-4 pb-0'>
          <CardTitle className='flex items-center gap-2 text-sm font-semibold'>
            <TrendingUp className='h-4 w-4 text-amber-500' />
            Difficulty vs Monetization
          </CardTitle>
        </CardHeader>
        <CardContent className='px-4 pb-4'>
          {isLoading ? (
            <ChartCardSkeleton heightClassName='h-[320px]' />
          ) : (
            <LevelFocusChart data={overview.balance_chart} />
          )}
        </CardContent>
      </Card>

      <Card className='py-0 xl:col-span-12'>
        <CardHeader className='px-4 pt-4 pb-0'>
          <CardTitle className='flex items-center gap-2 text-sm font-semibold'>
            <BarChart3 className='h-4 w-4 text-blue-500' />
            Full Event Contribution
          </CardTitle>
        </CardHeader>
        <CardContent className='px-4 pb-4'>
          {isLoading ? (
            <ChartCardSkeleton heightClassName='h-[360px]' />
          ) : (
            <EventContributionChart data={overview.chart_main} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

