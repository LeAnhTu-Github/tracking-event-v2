import { z } from 'zod';

export const TrackingAppSchema = z.object({
  id: z.number(),
  name: z.string()
});

export const TrackingAppsResponseSchema = z.array(TrackingAppSchema);

export type TrackingApp = z.infer<typeof TrackingAppSchema>;

