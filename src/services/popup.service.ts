import { IPopup, IPopupReq } from '@/types/popup.type';
import { ApiResponsePagination } from '@/types/api.type';
import { PageItem } from '@/types/page-item.type';
import { api } from './api';

const API_BASE_URL = '/popup';

interface GetPopupsFilters {
  pageSize: number;
  pageIndex: number;
}

export interface WebPageOption {
  label: string;
  value: string;
}

const popupService = {
  getPopups: async (params: GetPopupsFilters) => {
    return await api.get<ApiResponsePagination<IPopup>>(`${API_BASE_URL}`, {
      params
    });
  },

  async getPopupById(id: number): Promise<IPopup> {
    const response = await api.get<IPopup>(`${API_BASE_URL}/${id}`);
    return response;
  },

  createPopup: async (data: IPopupReq) => {
    const response = await api.post<IPopup>(`${API_BASE_URL}`, data);
    return response;
  },

  updatePopup: async (id: number, data: IPopupReq) => {
    return await api.put<PageItem>(`${API_BASE_URL}/${id}`, data);
  },

  deletePopup: async (id: number) => {
    return await api.delete(`${API_BASE_URL}/${id}`);
  }
};

export default popupService;
