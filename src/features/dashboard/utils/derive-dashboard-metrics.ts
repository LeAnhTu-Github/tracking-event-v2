import type { DashboardOverview } from '@/lib/types/dashboard';

export type DerivedDashboardMetrics = {
  readonly topFailingLevels: readonly DashboardOverview['balance_chart'][number][];
  readonly topRevenueLevels: readonly DashboardOverview['balance_chart'][number][];
};

const DEFAULT_TOP_COUNT = 5;

export const deriveDashboardMetrics = (overview: DashboardOverview): DerivedDashboardMetrics => {
  const balance = overview.balance_chart ?? [];

  const topFailingLevels = [...balance]
    .sort((a, b) => b.fail_rate - a.fail_rate)
    .slice(0, DEFAULT_TOP_COUNT);

  const topRevenueLevels = [...balance]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, DEFAULT_TOP_COUNT);

  return { topFailingLevels, topRevenueLevels };
};

