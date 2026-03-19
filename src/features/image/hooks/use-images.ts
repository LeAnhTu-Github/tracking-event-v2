import { useQuery } from '@tanstack/react-query';
import imageService from '@/services/image.service';
import { MediaFilters } from '@/types/image.type';
import { transformApiImage } from '@/store/useImage';

export const useImages = (
  filters: MediaFilters,
  pageIndex: number,
  pageSize: number
) => {
  return useQuery({
    queryKey: ['images', filters, pageIndex, pageSize],
    queryFn: async () => {
      const response = await imageService.getMedia(
        filters,
        pageIndex,
        pageSize
      );
      return {
        images: response.data.map(transformApiImage),
        totalRecords: response.totalRecords
      };
    }
  });
};
