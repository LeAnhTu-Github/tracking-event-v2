import { api } from './api';
import { ApiResponsePagination } from '@/types/api.type';

const BANNER_API_URL = '/banner';

interface IBannerRes {
  id: number;
  imageUrl: string;
  redirectUrl?: string;
  videoId?: number;
  position: string;
  order: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  movieUrl?: string;
  moviePicture?: string;
  title?: string;
  webPageId: {
    id: number;
    slug: string;
    code: string;
    type: number;
    order: number;
    isActive: number;
    name: string;
  };
}

interface IBannerReq {
  imageUrl: string;
  videoId?: number | null;
  redirectUrl?: string | null;
  position?: string;
  order: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  webPageId: number;
}

interface IParams {
  pageIndex?: number;
  pageSize?: number;
}

export interface ISearchVideoFoBanner {
  videoId: number;
  title: string;
  moviePicture?: string;
}

const bannerService = {
  getBanners: async (params: IParams) => {
    const response = await api.get<ApiResponsePagination<IBannerRes>>(
      `${BANNER_API_URL}`,
      { params }
    );
    return response;
  },
  getBannerDetail: async (id: number) => {
    const response = await api.get<IBannerRes>(`${BANNER_API_URL}/${id}`);
    return response;
  },
  addBanner: async (data: IBannerReq) => {
    const response = await api.post(`${BANNER_API_URL}`, data);
    return response;
  },
  updateBanner: async (id: number, data: IBannerReq) => {
    const response = await api.put(`${BANNER_API_URL}/${id}`, data);
    return response;
  },
  deleteBanner: async (id: number) => {
    const response = await api.delete(`${BANNER_API_URL}/${id}`);
    return response;
  },
  searchVideoForBanner: async (title: string) => {
    const response = await api.get<ISearchVideoFoBanner[]>(
      `${BANNER_API_URL}/search`,
      {
        params: { title }
      }
    );

    return response;
  }
};

export default bannerService;

export type { IBannerReq, IBannerRes };
