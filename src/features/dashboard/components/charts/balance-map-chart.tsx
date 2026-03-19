import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

import type { DashboardBalanceRow } from '@/api/dashboard/types';

export type BalanceMapChartProps = {
  readonly data: readonly DashboardBalanceRow[];
};

export default function BalanceMapChart({ data }: BalanceMapChartProps) {
  if (data.length === 0) {
    return (
      <div className='text-muted-foreground flex h-[420px] items-center justify-center text-sm'>
        No data for selected range.
      </div>
    );
  }

  const chartData = [...data];

  return (
    <div className='h-[420px]'>
      <ResponsiveContainer width='100%' height='100%'>
        <ComposedChart
          data={chartData}
          margin={{ top: 8, right: 12, left: 0, bottom: 32 }}
        >
          <CartesianGrid strokeDasharray='3 3' vertical={false} />
          <XAxis
            dataKey='name'
            tick={{ fontSize: 11 }}
            height={56}
            angle={-45}
            textAnchor='end'
            interval='preserveStartEnd'
          />
          <YAxis yAxisId='left' orientation='left' tick={{ fontSize: 11 }} />
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
          <Bar
            yAxisId='left'
            dataKey='revenue'
            fill='hsl(var(--chart-3, 42 93% 56%))'
            radius={[6, 6, 0, 0]}
            barSize={18}
          />
          <Line
            yAxisId='right'
            type='monotone'
            dataKey='fail_rate'
            stroke='hsl(var(--destructive))'
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 5 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

