import { useQuery } from '@tanstack/react-query';
import adsConfigService from '@/services/ads-config.service';
import { AdsConfigSearchParams } from '../types';

export const useAdsConfigs = (params: AdsConfigSearchParams) => {
  return useQuery({
    queryKey: ['ads-configs', params],
    queryFn: () => adsConfigService.getAdsConfigs(params),
    placeholderData: (previousData) => previousData
  });
};

export const useAdsConfig = (id: string | number) => {
  return useQuery({
    queryKey: ['ads-config', id],
    queryFn: () => adsConfigService.getAdsConfigById(id),
    enabled: !!id
  });
};
