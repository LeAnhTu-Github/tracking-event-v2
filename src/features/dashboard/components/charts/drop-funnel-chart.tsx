import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

import type { DashboardBalanceRow } from '@/api/dashboard/types';

export type DropFunnelChartProps = {
  readonly data: readonly DashboardBalanceRow[];
  readonly minLevel?: number;
  readonly maxLevel?: number;
};

type DropFunnelRow = {
  readonly name: string;
  readonly start: number;
  readonly win: number;
  readonly dropLost: number;
};

const clampToInt = (value: number, fallback: number): number => {
  if (!Number.isFinite(value)) return fallback;
  return Math.max(0, Math.round(value));
};

const buildFunnelRows = ({
  data,
  minLevel,
  maxLevel
}: {
  readonly data: readonly DashboardBalanceRow[];
  readonly minLevel: number;
  readonly maxLevel: number;
}): DropFunnelRow[] => {
  return data
    .filter((row) => row.level_index >= minLevel && row.level_index <= maxLevel)
    .slice(0, 18)
    .map((row) => {
      const start = clampToInt(row.sessions, 0);
      const dropLost = clampToInt((start * row.fail_rate) / 100, 0);
      const win = clampToInt(start - dropLost, 0);
      return {
        name: row.name,
        start,
        win,
        dropLost
      };
    });
};

export default function DropFunnelChart({
  data,
  minLevel = 1,
  maxLevel = 60
}: DropFunnelChartProps) {
  const rows = buildFunnelRows({ data, minLevel, maxLevel });
  if (rows.length === 0) {
    return (
      <div className='text-muted-foreground flex h-[320px] items-center justify-center text-sm'>
        No data for selected range.
      </div>
    );
  }

  return (
    <div className='h-[320px]'>
      <ResponsiveContainer width='100%' height='100%'>
        <BarChart
          data={rows}
          layout='vertical'
          margin={{ left: 18, right: 12, top: 8, bottom: 8 }}
        >
          <CartesianGrid strokeDasharray='3 3' horizontal={false} />
          <XAxis type='number' tick={{ fontSize: 11 }} />
          <YAxis
            type='category'
            dataKey='name'
            width={120}
            tick={{ fontSize: 11 }}
            interval='preserveStartEnd'
          />
          <Tooltip
            cursor={{ fill: 'transparent' }}
            contentStyle={{
              borderRadius: 12,
              border: '1px solid hsl(var(--border))',
              background: 'hsl(var(--background))'
            }}
          />
          <Legend />
          <Bar dataKey='start' stackId='a' fill='hsl(var(--primary))' name='Start' />
          <Bar dataKey='win' stackId='a' fill='hsl(var(--chart-2, 142 72% 45%))' name='Win' />
          <Bar
            dataKey='dropLost'
            stackId='a'
            fill='hsl(var(--destructive))'
            name='DropLost'
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

