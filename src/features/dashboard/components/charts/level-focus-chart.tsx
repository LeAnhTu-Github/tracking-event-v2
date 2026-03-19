import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

import type { DashboardBalanceRow } from '@/api/dashboard/types';

export type LevelFocusChartProps = {
  readonly data: readonly DashboardBalanceRow[];
};

export default function LevelFocusChart({ data }: LevelFocusChartProps) {
  if (data.length === 0) {
    return (
      <div className='text-muted-foreground flex h-[320px] items-center justify-center text-sm'>
        No levels in selected range.
      </div>
    );
  }

  const chartData = [...data];

  return (
    <div className='h-[320px]'>
      <ResponsiveContainer width='100%' height='100%'>
        <ComposedChart
          data={chartData}
          margin={{ top: 8, right: 12, left: 0, bottom: 24 }}
        >
          <CartesianGrid strokeDasharray='3 3' vertical={false} />
          <XAxis dataKey='name' tick={{ fontSize: 11 }} height={44} />
          <YAxis yAxisId='left' tick={{ fontSize: 11 }} />
          <YAxis
            yAxisId='right'
            orientation='right'
            tick={{ fontSize: 11 }}
            domain={[0, 100]}
            unit='%'
          />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: '1px solid hsl(var(--border))',
              background: 'hsl(var(--background))'
            }}
          />
          <Area
            yAxisId='left'
            type='monotone'
            dataKey='sessions'
            fill='hsl(var(--muted))'
            stroke='hsl(var(--muted-foreground))'
          />
          <Line
            yAxisId='right'
            type='monotone'
            dataKey='fail_rate'
            stroke='hsl(var(--primary))'
            strokeWidth={2}
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

