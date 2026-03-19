import { api } from '@/services/api';
import { AdsConfig, AdsConfigSearchParams } from '@/features/config-ads/types';
import { PaginatedResponse } from '@/features/config-item/types';

const adsConfigService = {
  getAdsConfigs: async (
    params: AdsConfigSearchParams
  ): Promise<PaginatedResponse<AdsConfig>> => {
    return api.get<PaginatedResponse<AdsConfig>>(`/cms/ads-config`, {
      params
    });
  },

  getAdsConfigById: async (id: string | number): Promise<AdsConfig> => {
    return api.get<AdsConfig>(`/cms/ads-config/${id}`);
  },

  createAdsConfig: async (data: any): Promise<any> => {
    return api.post(`/cms/ads-config`, data);
  },

  updateAdsConfig: async (id: string | number, data: any): Promise<any> => {
    return api.put(`/cms/ads-config/${id}`, data);
  },

  deleteAdsConfig: async (id: string | number): Promise<any> => {
    return api.delete(`/cms/ads-config/${id}`);
  }
};

export default adsConfigService;
