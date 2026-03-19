import {
  ICustomer,
  ITransaction,
  ITransactionList
} from '@/types/customer.type';
import { api } from './api';
import { ApiResponsePagination } from '@/types/api.type';
import { IFavoriteFilters, IFavoriteRes } from '@/types/favorite.service';
import { ISms, ISmsFilters } from '@/types/sms.type';
import { ILoyalty, ILoyaltyFilters } from '@/types/loyalty.type';
import { IRate, IRateFilters } from '@/types/rate.type';

const API_BASE_URL = '/customers';

// Interface for API filters
interface GetCustomersFilters {
  pageSize: number;
  pageIndex: number;
  username?: string;
  status?: string;
}

interface IVipReq {
  status?: number;
  vipExpiredAt?: string;
}

const customerService = {
  getCustomers: async (params: GetCustomersFilters, config = {}) => {
    return await api.get<ApiResponsePagination<ICustomer>>(`${API_BASE_URL}`, {
      params,
      ...config
    });
  },

  async getCustomerById(id: number): Promise<ICustomer> {
    const response = await api.get<ICustomer>(`${API_BASE_URL}/${id}`);
    return response;
  },

  getFavoritesByUser: async (params: IFavoriteFilters) => {
    return await api.get<ApiResponsePagination<IFavoriteRes>>(
      `${API_BASE_URL}/favorite`,
      { params }
    );
  },

  getTransactionsList: async (params: GetCustomersFilters, config = {}) => {
    return await api.get<ApiResponsePagination<ITransactionList>>(
      `${API_BASE_URL}/transaction`,
      { params, ...config }
    );
  },

  getTransactionsByCustomerId: async (params: GetCustomersFilters) => {
    return await api.get<ApiResponsePagination<ITransaction>>(
      `${API_BASE_URL}/transaction-user`,
      { params }
    );
  },

  openCommentByCustomerId: async (id: number) => {
    await api.post(`${API_BASE_URL}/unblock/${id}`);
  },

  updateVipStatus: async (id: number, data: IVipReq) => {
    await api.put(`${API_BASE_URL}/isVip/${id}`, data);
  },

  historySmsByCustomerId: async (params: ISmsFilters) => {
    return await api.get<ApiResponsePagination<ISms>>(
      `${API_BASE_URL}/history-sms`,
      { params }
    );
  },

  historyLoyaltyByCustomerId: async (params: ILoyaltyFilters, config = {}) => {
    return await api.get<ApiResponsePagination<ILoyalty>>(
      `${API_BASE_URL}/history-loyalty`,
      { params, ...config }
    );
  },

  historyRateByCustomerId: async (params: IRateFilters) => {
    return await api.get<ApiResponsePagination<IRate>>(
      `${API_BASE_URL}/history-rate`,
      { params }
    );
  },

  retryLoyalty: async (id: string | number) => {
    return await api.post(`${API_BASE_URL}/retry-loyalty/${id}`);
  }
};

export default customerService;
