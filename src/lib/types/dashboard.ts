import type { z } from 'zod';

import type { DashboardOverviewSchema } from '@/api/dashboard/types';

export type DashboardOverview = z.infer<typeof DashboardOverviewSchema>;

export type DashboardTimeRange = {
  readonly startDate: string;
  readonly endDate: string;
};

