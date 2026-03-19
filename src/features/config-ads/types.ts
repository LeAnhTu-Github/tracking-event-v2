import { z } from 'zod';

export const adsConfigFormSchema = z.object({
  gameId: z.string().min(1, 'Game ID is required'),
  configKey: z.string().min(1, 'Config Key is required'),
  configValue: z.coerce.number().min(0, 'Config Value must be at least 0'),
  description: z.string().optional().default('')
});

export type AdsConfigFormValues = z.infer<typeof adsConfigFormSchema>;

export interface AdsConfig {
  id: number;
  gameId: string;
  configKey: string;
  configValue: number;
  description: string;
  updatedAt: string;
}

export interface AdsConfigSearchParams {
  gameId?: string;
  configKey?: string;
  keyword?: string;
  page?: number;
  size?: number;
  sort?: string[];
}
