import { ApiResponsePagination } from '@/types/api.type';
import { api } from './api';

const SPIN_API_URL = '/luckySpin';

export type TSpin = {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  status: number;
  limitReward: number;
  type: number;
};

export type SPINTYPE =
  | 'REAL'
  | 'POINT'
  | 'SPIN'
  | 'LUCKY'
  | 'NOTHING'
  | 'KYATS';

interface IParams {
  pageIndex?: number;
  pageSize?: number;
  userId?: number;
  periodId?: number;
  type?: number;
}

interface Request {
  name: string;
  startTime: string;
  endTime: string;
  prizes: [
    {
      name: string;
      description: string;
      icon: string;
      randomWeight: number;
      quantity: number;
      type: string;
    }
  ];
  rule: {
    description: string;
  };
}

const spinPrizeService = {
  getSpinPrize: async (params: IParams) => {
    const response = await api.get<ApiResponsePagination<TSpin>>(
      `${SPIN_API_URL}`,
      {
        params
      }
    );
    return response;
  },
  getSpinPrizeResult: async (params: IParams) => {
    const response = await api.get(`${SPIN_API_URL}/luckySpin/result`, {
      params
    });
    return response;
  },
  getSpinPrizeHistory: async (params: IParams) => {
    const response = await api.get(`${SPIN_API_URL}/luckySpin/history`, {
      params
    });
    return response;
  },
  getDetailPrize: async (id: number) => {
    const response = await api.get(`${SPIN_API_URL}/${id}`);
    return response;
  },
  createSpinPrize: async (body: Request) => {
    const response = await api.put(`${SPIN_API_URL}`, body);
    return response;
  },
  updateSpinPrize: async (id: number, body: Request) => {
    const response = await api.put(`${SPIN_API_URL}/prize/${id}`, body);
    return response;
  }
};

export default spinPrizeService;
