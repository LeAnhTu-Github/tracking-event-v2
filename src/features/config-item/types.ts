import { z } from 'zod';

export const ItemTypeEnum = z.enum(['TOKEN', 'ADS', 'VIP', 'GAME_ITEM']);

export const itemFormSchema = z.object({
  gameId: z.string().min(1, 'Game ID is required'),
  itemCode: z.string().min(1, 'Item Code is required'),
  name: z.string().min(1, 'Name is required'),
  urlIcon: z
    .string()
    .url('Invalid icon URL')
    .or(z.string().min(1, 'Icon URL is required')),
  description: z.string().optional().default(''),
  type: ItemTypeEnum.default('TOKEN')
});

export type ItemFormValues = z.infer<typeof itemFormSchema>;

export interface Item {
  id: number;
  gameId: string;
  itemCode: string;
  name: string;
  urlIcon: string;
  description: string;
  type: string;
  createdTime: string;
  lastUpdatedTime: string;
}

export interface ItemSearchParams {
  gameId?: string;
  type?: string;
  keyword?: string;
  page?: number;
  size?: number;
  sort?: string[];
}

export interface PaginatedResponse<T> {
  pageIndex: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
  beginIndex: number;
  endIndex: number;
  data: T[];
  total: number;
}
