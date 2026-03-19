import { IDynamic, IDynamicReq } from '@/types/dynamic.type';
import { api } from './api';
import { ApiResponsePagination } from '@/types/api.type';

const DYNAMIC_API_URL = '/dct-universe';

export interface IParams {
  pageIndex?: number;
  pageSize?: number;
  languageCode?: string;
}

type IBodyOrderDynamic = Array<{
  id: number;
  order: number;
}>;

const dynamicService = {
  getDynamic: async (filters: IParams) => {
    const params = {
      ...filters
    };
    const response = await api.get<ApiResponsePagination<IDynamic>>(
      DYNAMIC_API_URL,
      { params }
    );
    return response;
  },

  getDynamicById: async (id: number) => {
    const response = await api.get<IDynamic>(`${DYNAMIC_API_URL}/${id}`);
    return response;
  },

  createDynamic: async (data: IDynamicReq) => {
    const response = await api.post(`${DYNAMIC_API_URL}`, data);
    return response;
  },

  updateDynamic: async (id: number, data: IDynamicReq) => {
    const response = await api.put(`${DYNAMIC_API_URL}/${id}`, data);
    return response;
  },

  deleteDynamic: async (id: number) => {
    const response = await api.delete(`${DYNAMIC_API_URL}/${id}`);
    return response;
  },

  orderDynamic: async (data: IBodyOrderDynamic) => {
    return await api.post(`${DYNAMIC_API_URL}/order`, data);
  },

  getListDynamic: async () => {
    const response = await api.get<IDynamic[]>(`dynamic`);
    return response;
  }
};

export default dynamicService;
