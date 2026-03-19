import { api } from '@/services/api';
import { Shop, ShopSearchParams } from '@/features/config-shop/types';
import { PaginatedResponse } from '@/features/config-item/types';

const shopService = {
  getShops: async (
    params: ShopSearchParams
  ): Promise<PaginatedResponse<Shop>> => {
    return api.get<PaginatedResponse<Shop>>(`/cms/shop`, {
      params
    });
  },

  getShopById: async (id: string | number): Promise<Shop> => {
    return api.get<Shop>(`/cms/shop/${id}`);
  },

  createShop: async (data: any): Promise<any> => {
    return api.post(`/cms/shop`, data);
  },

  updateShop: async (id: string | number, data: any): Promise<any> => {
    return api.put(`/cms/shop/${id}`, data);
  },

  deleteShop: async (id: string | number): Promise<any> => {
    return api.delete(`/cms/shop/${id}`);
  }
};

export default shopService;
