import * as React from 'react';
import { Search } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DashboardBalanceRow } from '@/api/dashboard/types';
import type { DashboardOverview } from '@/lib/types/dashboard';

import LevelFocusChart from '@/features/dashboard/components/charts/level-focus-chart';

export type LevelInspectorTabProps = {
  readonly overview: DashboardOverview;
};

const clampToNumber = (value: string, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export default function LevelInspectorTab({ overview }: LevelInspectorTabProps) {
  const [minLevel, setMinLevel] = React.useState<number>(1);
  const [maxLevel, setMaxLevel] = React.useState<number>(60);
  const [query, setQuery] = React.useState<string>('');

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return overview.balance_chart
      .filter((row) => row.level_index >= minLevel && row.level_index <= maxLevel)
      .filter((row) => (q ? row.name.toLowerCase().includes(q) : true));
  }, [overview.balance_chart, minLevel, maxLevel, query]);

  const summary = React.useMemo(() => {
    if (filtered.length === 0) {
      return { sessions: 0, revenue: 0, avgFailRate: 0 };
    }
    const sessions = filtered.reduce((acc, row) => acc + row.sessions, 0);
    const revenue = filtered.reduce((acc, row) => acc + row.revenue, 0);
    const avgFailRate =
      filtered.reduce((acc, row) => acc + row.fail_rate, 0) / filtered.length;
    return { sessions, revenue, avgFailRate };
  }, [filtered]);

  return (
    <div className='grid grid-cols-1 gap-4 xl:grid-cols-12'>
      <Card className='py-0 xl:col-span-12'>
        <CardHeader className='px-4 pt-4 pb-0'>
          <CardTitle className='text-sm font-semibold'>Filters</CardTitle>
        </CardHeader>
        <CardContent className='px-4 pb-4'>
          <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
            <div className='flex flex-wrap items-center gap-2'>
              <div className='text-muted-foreground text-sm font-medium'>Level range</div>
              <input
                type='number'
                inputMode='numeric'
                className='bg-background w-24 rounded-md border px-3 py-2 text-sm'
                value={minLevel}
                onChange={(e) => setMinLevel(clampToNumber(e.target.value, 1))}
              />
              <span className='text-muted-foreground text-sm font-medium'>-</span>
              <input
                type='number'
                inputMode='numeric'
                className='bg-background w-24 rounded-md border px-3 py-2 text-sm'
                value={maxLevel}
                onChange={(e) => setMaxLevel(clampToNumber(e.target.value, 60))}
              />
            </div>

            <div className='relative w-full md:w-80'>
              <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
              <input
                placeholder='Search level…'
                className='bg-background w-full rounded-md border py-2 pr-3 pl-9 text-sm'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className='py-0 xl:col-span-5'>
        <CardHeader className='px-4 pt-4 pb-0'>
          <CardTitle className='text-sm font-semibold'>Range summary</CardTitle>
        </CardHeader>
        <CardContent className='px-4 pb-4'>
          <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
            <div className='rounded-lg border p-3'>
              <div className='text-muted-foreground text-xs'>Sessions</div>
              <div className='mt-1 text-lg font-semibold'>
                {summary.sessions.toLocaleString()}
              </div>
            </div>
            <div className='rounded-lg border p-3'>
              <div className='text-muted-foreground text-xs'>Revenue</div>
              <div className='mt-1 text-lg font-semibold'>
                {summary.revenue.toLocaleString()}
              </div>
            </div>
            <div className='rounded-lg border p-3'>
              <div className='text-muted-foreground text-xs'>Avg fail rate</div>
              <div className='mt-1 text-lg font-semibold'>
                {summary.avgFailRate.toFixed(1)}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className='py-0 xl:col-span-7'>
        <CardHeader className='px-4 pt-4 pb-0'>
          <CardTitle className='text-sm font-semibold'>
            Sessions vs fail rate (range)
          </CardTitle>
        </CardHeader>
        <CardContent className='px-4 pb-4'>
          <LevelFocusChart data={filtered} />
        </CardContent>
      </Card>

      <Card className='py-0 xl:col-span-12'>
        <CardHeader className='px-4 pt-4 pb-0'>
          <CardTitle className='text-sm font-semibold'>Level table</CardTitle>
        </CardHeader>
        <CardContent className='px-4 pb-4'>
          <LevelTable rows={filtered} />
        </CardContent>
      </Card>
    </div>
  );
}

const LevelTable = ({ rows }: { readonly rows: readonly DashboardBalanceRow[] }) => {
  if (rows.length === 0) {
    return (
      <div className='text-muted-foreground flex h-40 items-center justify-center text-sm'>
        No levels match your filters.
      </div>
    );
  }

  return (
    <div className='overflow-x-auto rounded-lg border'>
      <table className='w-full text-sm'>
        <thead className='bg-muted/50 text-muted-foreground'>
          <tr>
            <th className='px-4 py-3 text-left font-semibold'>Level</th>
            <th className='px-4 py-3 text-right font-semibold'>Sessions</th>
            <th className='px-4 py-3 text-right font-semibold'>Revenue</th>
            <th className='px-4 py-3 text-right font-semibold'>Fail rate</th>
          </tr>
        </thead>
        <tbody className='divide-y'>
          {rows.map((row) => (
            <tr key={row.level_index} className='hover:bg-muted/30'>
              <td className='px-4 py-3 font-medium'>{row.name}</td>
              <td className='px-4 py-3 text-right font-mono'>
                {row.sessions.toLocaleString()}
              </td>
              <td className='px-4 py-3 text-right font-mono'>
                {row.revenue.toLocaleString()}
              </td>
              <td className='px-4 py-3 text-right font-mono'>
                {row.fail_rate.toFixed(1)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

