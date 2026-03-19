import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

import type { DashboardNamedValue } from '@/api/dashboard/types';

export type EventContributionChartProps = {
  readonly data: readonly DashboardNamedValue[];
};

export default function EventContributionChart({
  data
}: EventContributionChartProps) {
  if (data.length === 0) {
    return (
      <div className='text-muted-foreground flex h-[360px] items-center justify-center text-sm'>
        No data for selected range.
      </div>
    );
  }

  return (
    <div className='h-[360px]'>
      <ResponsiveContainer width='100%' height='100%'>
        <BarChart data={[...data].slice(0, 30)} layout='vertical' margin={{ left: 24, right: 16 }}>
          <CartesianGrid strokeDasharray='3 3' horizontal={false} />
          <XAxis type='number' tick={{ fontSize: 12 }} />
          <YAxis
            type='category'
            dataKey='name'
            width={180}
            tick={{ fontSize: 12 }}
            interval={0}
          />
          <Tooltip
            cursor={{ fill: 'hsl(var(--muted))' }}
            contentStyle={{
              borderRadius: 12,
              border: '1px solid hsl(var(--border))',
              background: 'hsl(var(--background))'
            }}
          />
          <Bar dataKey='value' fill='hsl(var(--primary))' radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

