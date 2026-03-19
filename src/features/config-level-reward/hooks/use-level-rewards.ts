import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  levelRewardService,
  LevelRewardFilter
} from '@/services/level-reward.service';
import { LevelReward } from '../types';
import { toast } from 'sonner';

export function useLevelRewards(filter: LevelRewardFilter) {
  return useQuery({
    queryKey: ['level-rewards', filter],
    queryFn: () => levelRewardService.getList(filter)
  });
}

export function useLevelReward(id: string | number) {
  return useQuery({
    queryKey: ['level-reward', id],
    queryFn: () => levelRewardService.getDetail(id),
    enabled: !!id
  });
}

export function useCreateLevelReward() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<LevelReward>) =>
      levelRewardService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['level-rewards'] });
      toast.success('Created level reward successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create level reward');
    }
  });
}

export function useUpdateLevelReward() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload
    }: {
      id: string | number;
      payload: Partial<LevelReward>;
    }) => levelRewardService.update(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['level-rewards'] });
      queryClient.invalidateQueries({ queryKey: ['level-reward', data.id] });
      toast.success('Updated level reward successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update level reward');
    }
  });
}

export function useDeleteLevelReward() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => levelRewardService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['level-rewards'] });
      toast.success('Deleted level reward successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete level reward');
    }
  });
}
