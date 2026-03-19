import {
  ICategoryDetail,
  ICategoryReq,
  ICategoryTree,
  ICategoryUpdateReq
} from '@/types/category.type';

import { api } from './api';
import { ApiResponsePagination } from '@/types/api.type';

const CATEGORY_API_URL = '/category';

interface GetCategoriesFilters {
  pageSize?: number;
  pageIndex?: number;
}

export interface ICategoryMovie {
  categoryId: number;
  videoIds: number[];
}

const categoryService = {
  getCategoryById: async (id: number) => {
    const response = await api.get<ICategoryDetail>(
      `${CATEGORY_API_URL}/${id}`
    );
    return response;
  },

  createCategory: async (data: ICategoryReq) => {
    const response = await api.post(`${CATEGORY_API_URL}`, data);
    return response;
  },

  updateCategory: async (data: ICategoryUpdateReq) => {
    const response = await api.put(`${CATEGORY_API_URL}/${data.id}`, data);
    return response;
  },

  deleteCategory: async (id: number) => {
    const response = await api.delete(`${CATEGORY_API_URL}/${id}`);
    return response;
  },

  getCategoryTree: async (params?: GetCategoriesFilters) => {
    return await api.get<ApiResponsePagination<ICategoryTree>>(
      `${CATEGORY_API_URL}/tree`,
      {
        params
      }
    );
  },

  fnAddMovieCategory: async (data: ICategoryMovie) => {
    const response = await api.post(`${CATEGORY_API_URL}/add-videos`, data);
    return response;
  }
};

export default categoryService;
