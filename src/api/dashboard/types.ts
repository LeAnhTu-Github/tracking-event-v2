import { z } from 'zod';

export const DashboardCardSchema = z.object({
  revenue: z.number(),
  active_users: z.number(),
  avg_fail_rate: z.number(),
  total_spent: z.number(),
  avg_time: z.number()
});

export const DashboardNamedValueSchema = z.object({
  name: z.string(),
  value: z.number()
});

export const DashboardBalanceRowSchema = z.object({
  name: z.string(),
  level_index: z.number(),
  fail_rate: z.number(),
  revenue: z.number(),
  sessions: z.number()
});

export const DashboardOverviewSchema = z.object({
  cards: DashboardCardSchema,
  chart_main: z.array(DashboardNamedValueSchema),
  booster_chart: z.array(DashboardNamedValueSchema),
  balance_chart: z.array(DashboardBalanceRowSchema)
});

export const DashboardOverviewResponseSchema = z.object({
  success: z.boolean(),
  overview: DashboardOverviewSchema,
  data_warning: z.unknown().nullable().optional()
});

export type DashboardCard = z.infer<typeof DashboardCardSchema>;
export type DashboardNamedValue = z.infer<typeof DashboardNamedValueSchema>;
export type DashboardBalanceRow = z.infer<typeof DashboardBalanceRowSchema>;
export type DashboardOverview = z.infer<typeof DashboardOverviewSchema>;
export type DashboardOverviewResponse = z.infer<
  typeof DashboardOverviewResponseSchema
>;

