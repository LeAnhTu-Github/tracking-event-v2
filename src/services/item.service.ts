import { api } from '@/services/api';
import {
  Item,
  ItemSearchParams,
  PaginatedResponse
} from '@/features/config-item/types';

const itemService = {
  getItems: async (
    params: ItemSearchParams
  ): Promise<PaginatedResponse<Item>> => {
    return api.get<PaginatedResponse<Item>>(`/cms/item`, {
      params
    });
  },

  getItemById: async (id: string | number): Promise<Item> => {
    return api.get<Item>(`/cms/item/${id}`);
  },

  createItem: async (data: any): Promise<any> => {
    return api.post(`/cms/item`, data);
  },

  updateItem: async (id: string | number, data: any): Promise<any> => {
    return api.put(`/cms/item/${id}`, data);
  },

  deleteItem: async (id: string | number): Promise<any> => {
    return api.delete(`/cms/item/${id}`);
  }
};

export default itemService;
