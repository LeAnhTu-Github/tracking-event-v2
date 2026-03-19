import {
  ICodePoolLuckyDraw,
  IGetLuckyDraw,
  ILuckyDraw,
  ILuckyDrawCode,
  ILuckyDrawHistory,
  ILuckyDrawReq,
  ILuckyDrawRes,
  IPoolLuckyDraw,
  IPoolLuckyDrawReq,
  IRankingLuckyDraw,
  IRankingLuckyDrawReq
} from '@/types/lucky-draw.type';
import { api } from './api';
import { ApiResponsePagination } from '@/types/api.type';

const API_BASE_URL = '/luckyDraw';

// Interface for API filters
interface GetLuckyDrawFilters {
  pageSize: number;
  pageIndex: number;
  poolId?: number;
  type?: string;
  status?: number;
  name?: string;
  username?: string;
  code?: string;
  phoneNumber?: string;
}
export enum EPoolType {
  WEEK = 'WEEK',
  MONTH = 'MONTH'
}

export enum EPrizeType {
  PACKAGE = 'PACKAGE',
  OTHER = 'OTHER',
  CARD = 'CARD',
  SPIN_ROLL = 'SPIN_ROLL'
}

export interface IResultLuckyDraw {
  id: number;
  rewardStatus: number;
  rewardTime: string;
  code: string;
  userId: number;
  userName: string;
  userPhoneNumber: string;
  poolId: number;
  poolName: string;
  poolType: EPoolType;
  prizeName: string;
  prizeIcon: string;
  prizeLevel: number;
  prizeLevelName: string;
  prizeType: EPrizeType;
}

interface ResultLuckyDraw {
  uuid: string;
  results: IResultLuckyDraw[];
}

const luckyDrawService = {
  getLuckyDraws: async (params: GetLuckyDrawFilters) => {
    return await api.get<ApiResponsePagination<ILuckyDrawRes>>(
      `${API_BASE_URL}`,
      { params }
    );
  },

  getLuckyDrawsByPoolId: async (id: number) => {
    const response = await api.get<IGetLuckyDraw>(`${API_BASE_URL}/${id}`);
    return response;
  },

  createLuckyDraw: async (data: ILuckyDrawReq) => {
    const response = await api.post(`${API_BASE_URL}`, data);
    return response;
  },

  updateLuckyDraw: async (id: number, data: ILuckyDrawReq) => {
    const response = await api.put(`${API_BASE_URL}/${id}`, data);
    return response;
  },

  deteleLuckyDraw: async (id: number) => {
    const response = await api.delete(`${API_BASE_URL}/${id}`);
    return response;
  },

  getLuckyDrawsCode: async (params: GetLuckyDrawFilters) => {
    return await api.get<ApiResponsePagination<ILuckyDrawCode>>(
      `${API_BASE_URL}/code`,
      { params }
    );
  },

  getLuckyDrawsResultByCustomerId: async (params: GetLuckyDrawFilters) => {
    return await api.get<ApiResponsePagination<ILuckyDraw>>(
      `${API_BASE_URL}/result`,
      { params }
    );
  },

  getLuckyDrawHistory: async (params: GetLuckyDrawFilters) => {
    return await api.get<ApiResponsePagination<ILuckyDrawHistory>>(
      `${API_BASE_URL}/result`,
      { params }
    );
  },

  getLuckyDrawCode: async (params: GetLuckyDrawFilters) => {
    return await api.get<ApiResponsePagination<ILuckyDrawCode>>(
      `${API_BASE_URL}/code`,
      { params }
    );
  },

  // @@@ list ranking lucky draw
  getRankingLuckyDraw: async (id: number, params: any) => {
    return await api.get<ApiResponsePagination<IRankingLuckyDraw>>(
      `${API_BASE_URL}/${id}/prizeLevel`,
      { params }
    );
  },

  getRankingLuckyDrawById: async (id: number) => {
    return await api.get<IRankingLuckyDraw>(`${API_BASE_URL}/prizeLevel/${id}`);
  },
  // @@@ add ranking lucky draw
  createRankingLuckyDraw: async (id: number, data: IRankingLuckyDrawReq) => {
    const response = await api.post(`${API_BASE_URL}/${id}/prizeLevel`, data);
    return response;
  },

  updateRankingLuckyDraw: async (id: number, data: IRankingLuckyDrawReq) => {
    const response = await api.put(`${API_BASE_URL}/prizeLevel/${id}`, data);
    return response;
  },

  deleteRankingLuckyDraw: async (id: number) => {
    const response = await api.delete(`${API_BASE_URL}/prizeLevel/${id}`);
    return response;
  },

  deletePrizeFromRanking: async (rankingId: number, prizeId: string) => {
    return await api.delete(
      `${API_BASE_URL}/prizeLevel/${rankingId}/prize/${prizeId}`
    );
  },

  addPrizeToRanking: async (rankingId: number, prizeData: any) => {
    return await api.post(
      `${API_BASE_URL}/prizeLevel/${rankingId}/prize`,
      prizeData
    );
  },

  getPackageBonuses: async () => {
    return await api.get(`${API_BASE_URL}/package-bonuses`);
  },

  // @@@ list pool lucky draw
  getPoolLuckyDraw: async (id: number, params: GetLuckyDrawFilters) => {
    return await api.get<ApiResponsePagination<IPoolLuckyDraw>>(
      `${API_BASE_URL}/${id}/pool`,
      { params }
    );
  },

  getPoolLuckyDrawById: async (id: number) => {
    return await api.get<IPoolLuckyDraw>(`${API_BASE_URL}/pool/${id}`);
  },

  createPoolLuckyDraw: async (data: IPoolLuckyDrawReq) => {
    const response = await api.post(`${API_BASE_URL}/pool`, data);
    return response;
  },

  deletePoolLuckyDraw: async (id: number) => {
    const response = await api.delete(`${API_BASE_URL}/pool/${id}`);
    return response;
  },
  // @@@ get code pool lucky draw
  getCodePoolLuckyDraw: async (params: GetLuckyDrawFilters) => {
    return await api.get<ApiResponsePagination<ICodePoolLuckyDraw>>(
      `${API_BASE_URL}/pool/code`,
      { params }
    );
  },

  getCodePoolLuckyDrawDetail: async (params: GetLuckyDrawFilters) => {
    return await api.get<ApiResponsePagination<ICodePoolLuckyDraw>>(
      `${API_BASE_URL}/pool/codeDetail`,
      { params }
    );
  },

  getPoolLuckyDrawDetail: async (poolId: number) => {
    return await api.get<IPoolLuckyDraw>(`${API_BASE_URL}/pool/${poolId}`);
  },

  getAvailablePrize: async (poolId: number) => {
    return await api.get<IPoolLuckyDraw>(
      `${API_BASE_URL}/pool/${poolId}/availablePrize`
    );
  },

  updatePrizeWithCode: async (id: number, data: any) => {
    return await api.put(`${API_BASE_URL}/pool/code/${id}/prize`, data);
  },

  resultLuckyDraw: async (id: number) => {
    return await api.post<ResultLuckyDraw>(`${API_BASE_URL}/pool/${id}/draw`);
  },

  // saveResult
  savePrizeLuckyDraw: async (uuid: string, sms: number) => {
    return await api.post(`${API_BASE_URL}/saveResult`, {
      uuid,
      sms
    });
  },

  // codeDetail
  getPrizeLuckyDraw: async (id: number) => {
    return await api.get<IPoolLuckyDraw>(`${API_BASE_URL}/pool/${id}/prize`);
  }
};

export default luckyDrawService;
