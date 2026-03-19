'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import configImageService from '@/services/config-image.service';
import {
  CreateConfigImagePayload,
  UpdateConfigImagePayload
} from '@/types/config-image.type';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export const useCreateConfigImage = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: CreateConfigImagePayload) =>
      configImageService.create(payload),
    onSuccess: () => {
      toast.success('Config image created successfully');
      queryClient.invalidateQueries({ queryKey: ['config-images'] });
      router.push('/dashboard/config-image');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create config image');
    }
  });
};

export const useUpdateConfigImage = (id: number) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: UpdateConfigImagePayload) =>
      configImageService.update(id, payload),
    onSuccess: () => {
      toast.success('Config image updated successfully');
      queryClient.invalidateQueries({ queryKey: ['config-images'] });
      queryClient.invalidateQueries({ queryKey: ['config-image', id] });
      router.push('/dashboard/config-image');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update config image');
    }
  });
};

export const useDeleteConfigImage = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (id: number) => configImageService.delete(id),
    onSuccess: () => {
      toast.success('Config image deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['config-images'] });
      router.push('/dashboard/config-image');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete config image');
    }
  });
};
