import { api } from '@/services/api';
import {
  MediaFilters,
  MediaApiResponse,
  SensitiveRegionsMetadata,
  CloudflareUploadResponse
} from '@/types/image.type';

const IMAGE_API_URL = '/media/upload';

const imageService = {
  getMedia: async (
    filters: MediaFilters,
    pageIndex: number,
    pageSize: number
  ) => {
    // Build query parameters
    const params: Record<string, any> = {
      pageIndex,
      pageSize
    };

    // Add filters to query params
    if (filters.keyword) params.keyword = filters.keyword;
    if (filters.vip !== undefined) params.vip = filters.vip;
    if (filters.type) params.type = filters.type;
    if (filters.active !== undefined) params.active = filters.active;
    if (filters.processed !== undefined) params.processed = filters.processed;
    if (filters.esSynced !== undefined) params.esSynced = filters.esSynced;
    if (filters.gameId) params.gameId = filters.gameId;

    return api.get(IMAGE_API_URL, { params });
  },

  getMediaById: async (id: number): Promise<MediaApiResponse> => {
    return api.get(`${IMAGE_API_URL}/${id}`);
  },

  updateMedia: async (
    id: number,
    data: {
      imageUrl: string;
      thumbnailUrl?: string;
      downloadImageUrl?: string;
      videoUrl?: string;
      gameId?: string;
      vip?: boolean;
      type?: string;
      sexyLevel?: number;
      isActive?: boolean;
      metaData?: string;
      embedding?: string;
      annotation?: string;
    }
  ): Promise<MediaApiResponse> => {
    return api.put(`${IMAGE_API_URL}/${id}`, data);
  },

  updateSensitiveRegions: async (
    id: number,
    data: SensitiveRegionsMetadata
  ): Promise<void> => {
    return api.put(`${IMAGE_API_URL}/sensitive/${id}`, data);
  },

  uploadCloudflare: async (
    file: File,
    folder: string = 'normal'
  ): Promise<CloudflareUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`${IMAGE_API_URL}/cloudflare?folder=${folder}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  createMedia: async (data: {
    imageUrl: string;
    thumbnailUrl?: string;
    downloadImageUrl?: string;
    videoUrl?: string;
    gameId?: string;
    vip?: boolean;
    type?: string;
    sexyLevel?: number;
    isActive?: boolean;
    metaData?: string;
    embedding?: string;
    annotation?: string;
  }): Promise<MediaApiResponse> => {
    return api.post(IMAGE_API_URL, data);
  }
};

export default imageService;
