import { useQuery } from '@tanstack/react-query';
import configImageService from '@/services/config-image.service';
import { ConfigImageFilters } from '@/types/config-image.type';

export const useConfigImages = (filters: ConfigImageFilters) => {
  return useQuery({
    queryKey: ['config-images', filters],
    queryFn: async () => {
      const response = await configImageService.getList(filters);
      return response;
    }
  });
};
