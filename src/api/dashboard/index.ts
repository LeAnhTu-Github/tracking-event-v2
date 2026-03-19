import axiosInstance, { API_BASE_URL } from '@/services/api';
import { z } from 'zod';

import {
  DashboardOverviewResponseSchema,
  type DashboardOverview
} from './types';

export type GetDashboardOverviewInput = {
  readonly appId: number;
  readonly startDate?: string;
  readonly endDate?: string;
};

const buildDashboardUrl = ({
  appId,
  startDate,
  endDate
}: GetDashboardOverviewInput): string => {
  const url = new URL(`/dashboard/${appId}`, API_BASE_URL);
  if (startDate) url.searchParams.set('start_date', startDate);
  if (endDate) url.searchParams.set('end_date', endDate);
  return url.toString();
};

/**
 * Fetch dashboard overview from raw endpoint (non ApiResponse wrapper).
 */
export const getDashboardOverview = async (
  input: GetDashboardOverviewInput
): Promise<DashboardOverview> => {
  const url = buildDashboardUrl(input);
  const response = await axiosInstance.get<unknown>(url);
  const parsed = DashboardOverviewResponseSchema.safeParse(response.data);
  if (parsed.success) return parsed.data.overview;
  throw new z.ZodError(parsed.error.issues);
};

