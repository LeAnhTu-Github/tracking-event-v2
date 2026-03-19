import { api } from './api';
import {
  LevelReward,
  LevelRewardResponse,
  ConfigType
} from '@/features/config-level-reward/types';

export interface LevelRewardFilter {
  keyword?: string;
  gameId?: string;
  configType?: ConfigType;
  page?: number;
  size?: number;
  sort?: string;
}

export const levelRewardService = {
  getList: async (filter: LevelRewardFilter): Promise<LevelRewardResponse> => {
    return api.get<LevelRewardResponse>('/cms/level-reward', {
      params: filter
    });
  },

  getDetail: async (id: string | number): Promise<LevelReward> => {
    return api.get<LevelReward>(`/cms/level-reward/${id}`);
  },

  create: async (payload: Partial<LevelReward>): Promise<LevelReward> => {
    return api.post<LevelReward>('/cms/level-reward/with-reward', payload);
  },

  update: async (
    id: string | number,
    payload: Partial<LevelReward>
  ): Promise<LevelReward> => {
    return api.put<LevelReward>(`/cms/level-reward/with-reward/${id}`, payload);
  },

  delete: async (id: string | number): Promise<void> => {
    return api.delete(`/cms/level-reward/${id}`);
  }
};
