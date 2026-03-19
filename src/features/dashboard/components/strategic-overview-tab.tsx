import { BarChart3, Flame, Zap } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DashboardOverview } from '@/lib/types/dashboard';

import BalanceMapChart from '@/features/dashboard/components/charts/balance-map-chart';
import BoosterUsageChart from '@/features/dashboard/components/charts/booster-usage-chart';
import EventContributionChart from '@/features/dashboard/components/charts/event-contribution-chart';

export type StrategicOverviewTabProps = {
  readonly overview: DashboardOverview;
};

export default function StrategicOverviewTab({ overview }: StrategicOverviewTabProps) {
  return (
    <div className='grid grid-cols-1 gap-4 xl:grid-cols-12'>
      <Card className='py-0 xl:col-span-7'>
        <CardHeader className='px-4 pt-4 pb-0'>
          <CardTitle className='flex items-center gap-2 text-sm font-semibold'>
            <Flame className='h-4 w-4 text-red-500' />
            Balance map
          </CardTitle>
        </CardHeader>
        <CardContent className='px-4 pb-4'>
          <BalanceMapChart data={overview.balance_chart} />
        </CardContent>
      </Card>

      <Card className='py-0 xl:col-span-5'>
        <CardHeader className='px-4 pt-4 pb-0'>
          <CardTitle className='flex items-center gap-2 text-sm font-semibold'>
            <Zap className='h-4 w-4 text-amber-500' />
            Top boosters
          </CardTitle>
        </CardHeader>
        <CardContent className='px-4 pb-4'>
          <BoosterUsageChart data={overview.booster_chart} />
        </CardContent>
      </Card>

      <Card className='py-0 xl:col-span-12'>
        <CardHeader className='px-4 pt-4 pb-0'>
          <CardTitle className='flex items-center gap-2 text-sm font-semibold'>
            <BarChart3 className='h-4 w-4 text-blue-500' />
            Event contribution
          </CardTitle>
        </CardHeader>
        <CardContent className='px-4 pb-4'>
          <EventContributionChart data={overview.chart_main} />
        </CardContent>
      </Card>
    </div>
  );
}

