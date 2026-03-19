import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import shopService from '@/services/shop.service';
import { ShopSearchParams } from '../types';
import { toast } from 'sonner';

export const useShops = (params: ShopSearchParams) => {
  return useQuery({
    queryKey: ['shops', params],
    queryFn: () => shopService.getShops(params),
    placeholderData: (previousData) => previousData
  });
};

export const useShop = (id: string | number) => {
  return useQuery({
    queryKey: ['shop', id],
    queryFn: () => shopService.getShopById(id),
    enabled: !!id
  });
};

export const useCreateShop = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => shopService.createShop(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shops'] });
      toast.success('Shop configuration created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create shop configuration');
    }
  });
};

export const useUpdateShop = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: any }) =>
      shopService.updateShop(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['shops'] });
      queryClient.invalidateQueries({ queryKey: ['shop', id] });
      toast.success('Shop configuration updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update shop configuration');
    }
  });
};

export const useDeleteShop = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => shopService.deleteShop(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shops'] });
      toast.success('Shop configuration deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete shop configuration');
    }
  });
};
