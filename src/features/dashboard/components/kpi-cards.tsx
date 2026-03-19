import { Coins, Gauge, Timer, Users } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DashboardCard } from '@/api/dashboard/types';

export type KpiCardsProps = {
  readonly cards: DashboardCard;
};

const KpiCard = ({
  title,
  value,
  helper,
  icon: Icon
}: {
  readonly title: string;
  readonly value: string;
  readonly helper?: string;
  readonly icon: typeof Users;
}) => {
  return (
    <Card className='py-0'>
      <CardHeader className='px-4 pt-4 pb-0'>
        <CardTitle className='text-sm font-semibold'>{title}</CardTitle>
      </CardHeader>
      <CardContent className='px-4 pb-4'>
        <div className='flex items-start justify-between gap-4'>
          <div className='min-w-0'>
            <div className='text-2xl font-bold tracking-tight'>{value}</div>
            {helper ? (
              <div className='text-muted-foreground mt-1 text-xs'>{helper}</div>
            ) : null}
          </div>
          <div className='bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg'>
            <Icon className='h-5 w-5' />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function KpiCards({ cards }: KpiCardsProps) {
  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4'>
      <KpiCard
        title='Avg Playtime'
        value={`${cards.avg_time.toFixed(1)}s`}
        helper='Average session duration'
        icon={Timer}
      />
      <KpiCard
        title='Total Sessions'
        value={cards.active_users.toLocaleString()}
        helper='Total sessions in range'
        icon={Users}
      />
      <KpiCard
        title='Virtual Economy'
        value={cards.total_spent.toLocaleString()}
        helper='Total currency spent'
        icon={Coins}
      />
      <KpiCard
        title='Avg fail rate'
        value={`${cards.avg_fail_rate.toFixed(1)}%`}
        helper='Average difficulty'
        icon={Gauge}
      />
    </div>
  );
}

