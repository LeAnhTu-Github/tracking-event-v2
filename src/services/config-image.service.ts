import { api } from './api';
import {
  ConfigImageListResponse,
  ConfigActionGroup,
  ConfigImageFilters,
  ConfigImage,
  CreateConfigImagePayload,
  UpdateConfigImagePayload
} from '@/types/config-image.type';

const CONFIG_IMAGE_API_URL = '/config-image';

const configImageService = {
  getList: async (
    filters: ConfigImageFilters
  ): Promise<ConfigImageListResponse> => {
    const cleanParams = Object.fromEntries(
      Object.entries(filters).filter(
        ([_, v]) => v !== undefined && v !== null && v !== ''
      )
    );
    return api.get(CONFIG_IMAGE_API_URL, { params: cleanParams });
  },

  getById: async (id: number): Promise<ConfigActionGroup> => {
    return api.get(`${CONFIG_IMAGE_API_URL}/${id}`);
  },

  create: async (payload: CreateConfigImagePayload): Promise<ConfigImage> => {
    return api.post(`${CONFIG_IMAGE_API_URL}/with-action`, payload);
  },

  update: async (
    id: number,
    payload: UpdateConfigImagePayload
  ): Promise<ConfigImage> => {
    return api.put(`${CONFIG_IMAGE_API_URL}/with-action/${id}`, payload);
  },

  delete: async (id: number): Promise<void> => {
    return api.delete(`${CONFIG_IMAGE_API_URL}/${id}`);
  }
};

export default configImageService;
