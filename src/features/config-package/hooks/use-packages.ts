import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import packageService from '@/services/package.service';
import { PackageSearchParams } from '../types';
import { toast } from 'sonner';

export const usePackages = (
  params: PackageSearchParams,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ['packages', params],
    queryFn: () => packageService.getPackages(params),
    placeholderData: (previousData) => previousData,
    enabled
  });
};

export const usePackage = (id: string | number) => {
  return useQuery({
    queryKey: ['package', id],
    queryFn: () => packageService.getPackageById(id),
    enabled: !!id
  });
};

export const useCreatePackage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => packageService.createPackage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      toast.success('Package created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create package');
    }
  });
};

export const useUpdatePackage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: any }) =>
      packageService.updatePackage(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      queryClient.invalidateQueries({ queryKey: ['package', id] });
      toast.success('Package updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update package');
    }
  });
};

export const useDeletePackage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => packageService.deletePackage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      toast.success('Package deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete package');
    }
  });
};
