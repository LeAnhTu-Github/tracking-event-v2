import axiosInstance from '@/services/api';
import { z } from 'zod';

import { TrackingAppsResponseSchema, type TrackingApp } from './types';

/**
 * Fetch tracking apps list from raw endpoint (non ApiResponse wrapper).
 */
export const getApps = async (): Promise<TrackingApp[]> => {
  const response = await axiosInstance.get<unknown>('/apps');
  const parsed = TrackingAppsResponseSchema.safeParse(response.data);
  if (parsed.success) return parsed.data;
  throw new z.ZodError(parsed.error.issues);
};

