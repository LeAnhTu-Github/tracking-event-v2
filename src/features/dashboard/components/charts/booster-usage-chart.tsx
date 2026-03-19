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

export type BoosterUsageChartProps = {
  readonly data: readonly DashboardNamedValue[];
};

export default function BoosterUsageChart({ data }: BoosterUsageChartProps) {
  if (data.length === 0) {
    return (
      <div className='text-muted-foreground flex h-[260px] items-center justify-center text-sm'>
        No data for selected range.
      </div>
    );
  }

  return (
    <div className='h-[260px]'>
      <ResponsiveContainer width='100%' height='100%'>
        <BarChart data={[...data].slice(0, 12)} layout='vertical' margin={{ left: 8, right: 16 }}>
          <CartesianGrid strokeDasharray='3 3' horizontal={false} />
          <XAxis type='number' tick={{ fontSize: 12 }} />
          <YAxis
            type='category'
            dataKey='name'
            width={120}
            tick={{ fontSize: 12 }}
            interval={0}
          />
          <Tooltip
            cursor={{ fill: 'transparent' }}
            contentStyle={{
              borderRadius: 12,
              border: '1px solid hsl(var(--border))',
              background: 'hsl(var(--background))'
            }}
          />
          <Bar dataKey='value' fill='hsl(var(--chart-2, var(--primary)))' radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

