import { api } from './api';
import {
  ICategoryInsights,
  IKeyword,
  ILineChart,
  ITrendingVideo
} from '@/types/statistical';

const API_BASE_URL = '/statistical';

const statisticalService = {
  getTrendingVideo: async (params: any) => {
    return await api.get<ITrendingVideo[]>(`${API_BASE_URL}/topVideo`, {
      params
    });
  },

  getCategoryInsights: async (params: any) => {
    return await api.get<ICategoryInsights[]>(
      `${API_BASE_URL}/category-insights`,
      {
        params
      }
    );
  },

  getKeywords: async (params: any) => {
    return await api.get<IKeyword[]>(`${API_BASE_URL}/top-search`, {
      params
    });
  },

  getLineChart: async (params: any) => {
    return await api.get<ILineChart[]>(
      `${API_BASE_URL}/category-insights/line-char`,
      {
        params
      }
    );
  },

  getListCategory: async (params: any) => {
    return await api.get<string[]>(`${API_BASE_URL}/list-category`, {
      params
    });
  }
};

export default statisticalService;
