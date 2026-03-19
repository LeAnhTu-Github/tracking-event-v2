import { ApiResponsePagination } from '@/types/api.type';
import { api } from './api';

interface IWebPageTranslation {
  id: number;
  name: string;
  langCode: string;
}

interface ILanguage {
  name: string;
  code: string;
}

export interface IPageRes {
  id: number;
  type: number;
  order: number;
  isActive: number;
  slug: string;
  code: string;
  displayOnMenu: boolean;
  isDefaultPage: boolean;
  webPageTranslation: IWebPageTranslation[];
}

interface IPageBody {
  slug?: string;
  code?: string;
  isActive: number;
  isDefaultPage?: boolean;
  displayOnMenu: boolean;
  languages: ILanguage[];
  category?: string;
}

interface IPamrams {
  languageCode?: string;
  pageIndex?: number;
  pageSize?: number;
}

export interface IPageListRes {
  id: number;
  name: string;
  slug: string;
}

const pageService = {
  getListPage: async (params?: IPamrams) =>
    api.get<ApiResponsePagination<IPageRes>>('/web-page', { params }),

  getPageDetail: async (id: number) => api.get<IPageRes>(`/web-page/${id}`),

  createPage: async (data: IPageBody) => api.post('/web-page', data),

  updatePage: async (id: number, data: IPageBody) =>
    api.put(`/web-page/${id}`, data),

  updatePageOrder: async (
    data: {
      id: number;
      order: number;
    }[]
  ) => api.put(`/web-page/order`, data),

  deletePage: async (id: number) => api.delete(`/web-page/${id}`),

  togglePage: async (id: number) => api.put(`/web-page/hidden/${id}`),

  getAllPage: async () => api.get<IPageListRes[]>(`/web-page/list`)
};

export default pageService;
