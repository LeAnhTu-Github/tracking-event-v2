import { useQuery } from '@tanstack/react-query';
import itemService from '@/services/item.service';
import { ItemSearchParams } from '../types';

export const useItems = (params: ItemSearchParams) => {
  return useQuery({
    queryKey: ['items', params],
    queryFn: () => itemService.getItems(params),
    placeholderData: (previousData) => previousData
  });
};

export const useItem = (id: string | number) => {
  return useQuery({
    queryKey: ['item', id],
    queryFn: () => itemService.getItemById(id),
    enabled: !!id
  });
};
