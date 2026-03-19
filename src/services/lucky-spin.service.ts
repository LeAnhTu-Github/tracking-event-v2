import { api } from './api';
import { ApiResponsePagination } from '@/types/api.type';
import {
  CardDenomination,
  IUpdateLuckySpin,
  ILuckySpin,
  ILuckySpinDetail,
  ILuckySpinHistory,
  ILuckySpinList,
  IUpdatePrize,
  PackageBonus,
  TBodyPrize,
  TLuckySpinPrize,
  ICreateLuckySpin
} from '@/types/lucky-spin.type';

const API_BASE_URL = '/luckySpin';

// Interface for API filters
interface GetLuckySpinFilters {
  pageSize: number;
  pageIndex: number;
  userId?: number;
  code?: string;
  status?: string;
  formatDate?: string;
  toDate?: string;
  prizeType?: string;
  phoneNumber?: string;
}

const luckySpinService = {
  getLuckySpinsResultByCustomerId: async (params: GetLuckySpinFilters) => {
    return await api.get<ApiResponsePagination<ILuckySpin>>(
      `${API_BASE_URL}/result`,
      { params }
    );
  },
  getLuckySpinsHistoryByCustomerId: async (params: GetLuckySpinFilters) => {
    return await api.get<ApiResponsePagination<ILuckySpinHistory>>(
      `${API_BASE_URL}/history`,
      { params }
    );
  },

  // Lucky Spin
  getLuckySpin: async (params: GetLuckySpinFilters) => {
    return await api.get<ApiResponsePagination<ILuckySpinList>>(
      `${API_BASE_URL}`,
      { params }
    );
  },

  getLuckySpinById: async (id: number) => {
    return await api.get<ILuckySpinDetail>(`${API_BASE_URL}/${id}`);
  },

  addLuckySpin: async (body: ICreateLuckySpin) => {
    return await api.post(`${API_BASE_URL}`, body);
  },

  updateLuckySpin: async (id: number, body: IUpdateLuckySpin) => {
    return await api.put(`${API_BASE_URL}/${id}`, body);
  },

  toggleLuckySpin: async (id: number, body: { status: number }) => {
    return await api.put(`${API_BASE_URL}/${id}/status`, body);
  },

  // Prize
  addPrize: async (body: TBodyPrize) => {
    return await api.post(`${API_BASE_URL}/${body.id}/prize`, body);
  },

  getPrize: async (periodId: number) => {
    return await api.get<TLuckySpinPrize[]>(
      `${API_BASE_URL}/${periodId}/prize`
    );
  },

  getPrizeById: async (prizeId: number) => {
    return await api.get<TLuckySpinPrize>(`${API_BASE_URL}/prize/${prizeId}`);
  },

  updatePrize: async (body: IUpdatePrize) => {
    return await api.put(`${API_BASE_URL}/prize/${body.id}`, body);
  },

  deletePrize: async (prizeId: number) => {
    return await api.delete(`${API_BASE_URL}/prize/${prizeId}`);
  },

  // Other
  getPackageBonus: async () => {
    return await api.get<PackageBonus[]>(`/packageBonus/package`);
  },

  getCardDenomination: async () => {
    return await api.get<CardDenomination[]>(`/card/denomination`);
  }
};

export default luckySpinService;
