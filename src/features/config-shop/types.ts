import { z } from 'zod';

export const shopPackageSchema = z.object({
  quantity: z.coerce.number().min(1),
  startTime: z.string().optional().nullable(),
  endTime: z.string().optional().nullable(),
  packageCode: z.string().min(1, 'Package Code is required')
});

export const SHOP_TYPES = ['SHOP1', 'SHOP_VIP'] as const;

export const shopFormSchema = z.object({
  gameId: z.string().min(1, 'Game ID is required'),
  name: z.string().min(1, 'Name is required'),
  type: z.enum(SHOP_TYPES, {
    message: 'Type is required'
  }),
  packageConfig: z.object({
    package: z
      .array(shopPackageSchema)
      .min(1, 'At least one package is required')
  }),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  isActive: z.boolean().default(true)
});

export type ShopPackage = z.infer<typeof shopPackageSchema>;
export type ShopFormValues = z.infer<typeof shopFormSchema>;

export interface Shop {
  id: number;
  gameId: string;
  name: string;
  type: 'SHOP1' | 'SHOP_VIP';
  packageConfig: {
    package: ShopPackage[];
  };
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface ShopSearchParams {
  gameId?: string;
  name?: string;
  type?: string;
  isActive?: boolean;
  page?: number;
  size?: number;
  sort?: string[];
}
