import { api } from './api';
import {
  LevelItem,
  LevelFilter,
  LevelResponse,
  LevelCreatePayload
} from '@/types/level.type';

export const levelService = {
  getLevelList: async (filter: LevelFilter): Promise<LevelResponse> => {
    return api.get<LevelResponse>('/cms/level', { params: filter });
  },

  getLevelDetail: async (id: string | number): Promise<LevelItem> => {
    return api.get<LevelItem>(`/cms/level/${id}`);
  },

  createLevel: async (payload: LevelCreatePayload): Promise<LevelItem> => {
    return api.post<LevelItem>('/cms/level', payload);
  },

  updateLevel: async (
    id: string | number,
    payload: LevelCreatePayload
  ): Promise<LevelItem> => {
    return api.put<LevelItem>(`/cms/level/${id}`, payload);
  },

  deleteLevel: async (id: string | number): Promise<void> => {
    return api.delete(`/cms/level/${id}`);
  }
};
