import { ApiResponsePagination } from '@/types/api.type';
import { PageItem } from '@/types/page-item.type';
import { api } from './api';

const API_BASE_URL = '/web-page/items';

interface IParams {
  pageIndex?: number;
  pageSize?: number;
  languageCode?: string;
  slug?: string;
  status?: string;
  webPageId?: number;
}

interface ITranslation {
  id?: number;
  langCode: string;
  name: string;
}

interface IBodyCreatePageItem {
  webPageId?: number;
  itemType: string;
  slug?: string;
  styleId: string;
  isActive: number;
  limitNumber: number;
  translations: ITranslation[];
}

interface IBodyUpdatePageItem {
  id: number;
  webPageId?: number;
  itemType?: string;
  refCategoryCode?: string;
  slug?: string;
  styleId?: string;
  isActive?: number;
  limitNumber?: number;
  translations?: ITranslation[];
}

type IBodyOrderPageItems = Array<{
  id: number;
  order: number;
}>;

const pageItemService = {
  getPageItems: async (params: IParams) => {
    return await api.get<ApiResponsePagination<PageItem>>(`${API_BASE_URL}`, {
      params
    });
  },

  getPageItem: async (id: number) => {
    return await api.get<PageItem>(`${API_BASE_URL}/detail/${id}`);
  },

  createPageItem: async (data: IBodyCreatePageItem) => {
    return await api.post(`${API_BASE_URL}`, data);
  },

  updatePageItem: async (data: IBodyUpdatePageItem) => {
    return await api.put<PageItem>(`${API_BASE_URL}/${data.id}`, data);
  },

  deletePageItem: async (id: number) => {
    return await api.delete(`${API_BASE_URL}/${id}`);
  },

  orderPageItems: async (data: IBodyOrderPageItems) => {
    return await api.put(`${API_BASE_URL}/order`, data);
  }
};

export default pageItemService;
export type { IBodyCreatePageItem, IBodyUpdatePageItem, ITranslation, IParams };
