import { z } from 'zod';

export const PackageTypeEnum = z.enum([
  'COMBO',
  'SINGLE',
  'ADS',
  'FREE',
  'BUNDLE',
  'PROP',
  'RESOURCE_COIN',
  'RESOURCE_GEM'
]);
export const IapTypeEnum = z.enum(['OneTimePurchase', 'Subscription']);
export const PaymentTypeEnum = z.enum([
  'VIP_BENEFITS',
  'WATCH_ADS',
  'TOKEN',
  'GAME_ITEM'
]);
export const DiscountConditionEnum = z.enum(['FIRST_BUY', 'NONE']);

export const paymentVendorSchema = z.object({
  status: z.string().optional().default('active'),
  paymentType: PaymentTypeEnum,
  itemCode: z.string().optional(),
  amount: z.coerce.number().optional(),
  currency: z.string().optional()
});

export const packageItemSchema = z.object({
  id: z.number().optional(),
  configItemId: z.coerce.number(),
  quantity: z.coerce.number().min(1),
  durationDays: z.coerce.number().optional().default(0)
});

export const discountSchema = z.object({
  gameId: z.string().optional(),
  name: z.string().min(1, 'Discount name is required'),
  percent: z.coerce.number().min(0).max(100),
  startTime: z.string().optional().nullable(),
  endTime: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  urlImage: z.string().optional().nullable(),
  discountIcon: z.string().optional().nullable(),
  description: z.string().optional().default(''),
  condition: DiscountConditionEnum.default('NONE')
});

export const packageFormSchema = z.object({
  gameId: z.string().min(1, 'Game ID is required'),
  packageCode: z.string().min(1, 'Package Code is required'),
  name: z.string().min(1, 'Name is required'),
  urlImage: z.string().optional().nullable(),
  description: z.string().optional().default(''),
  purchaseOptions: z.object({
    paymentVendor: z.array(paymentVendorSchema).default([])
  }),
  packageType: PackageTypeEnum,
  iapType: IapTypeEnum.default('OneTimePurchase'),
  types: z.array(z.string()).nullable().default([]),
  items: z.array(packageItemSchema).default([]),
  discount: discountSchema.optional().nullable()
});

export type PackageFormValues = z.infer<typeof packageFormSchema>;

type PaymentType = z.infer<typeof PaymentTypeEnum>;

export interface PaymentVendor {
  status: string;
  paymentType: PaymentType;
  itemCode?: string;
  amount?: number;
  currency?: string;
}

export interface PurchaseOptions {
  paymentVendor: PaymentVendor[];
}

export interface PackageItem {
  id: number;
  configItemId: number;
  itemCode: string;
  name: string;
  urlIcon: string;
  quantity: number;
  durationDays: number;
}

export interface Discount {
  id?: number;
  gameId: string;
  name: string;
  percent: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
  active?: boolean;
  urlImage: string;
  discountIcon: string;
  description: string;
  condition: string;
}

export interface Package {
  id: number;
  gameId: string;
  packageCode: string;
  name: string;
  urlImage: string;
  description: string;
  purchaseOptions: PurchaseOptions;
  packageType: string;
  iapType: string;
  types: string[] | null;
  items: PackageItem[] | null;
  discount: Discount | null;
}

export interface PackageSearchParams {
  gameId?: string;
  packageCode?: string;
  name?: string;
  type?: string;
  page?: number;
  size?: number;
  sort?: string[];
}
