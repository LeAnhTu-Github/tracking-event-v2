import { ApiResponsePagination } from '@/types/api.type';
import { api } from './api';
import { ICardReq, ICardRes, ICardSpendRes } from '@/types/card.type';
import Cookies from 'js-cookie';

const API_BASE_URL = '/card';

export interface ICard {
  id: number;
  name: string;
  code: string;
  amount: string;
}
interface GetCardsFilters {
  pageSize: number;
  pageIndex: number;
  status?: number;
}

const cardService = {
  getListCard: async (params: GetCardsFilters) => {
    return await api.get<ApiResponsePagination<ICardRes>>(`${API_BASE_URL}`, {
      params
    });
  },
  getListCardSpend: async (params: GetCardsFilters) => {
    return await api.get<ApiResponsePagination<ICardSpendRes>>(
      `${API_BASE_URL}/cardSpend`,
      {
        params
      }
    );
  },
  async getCardById(id: number): Promise<ICardRes> {
    const response = await api.get<ICardRes>(`${API_BASE_URL}/${id}`);
    return response;
  },
  createCard: async (data: ICardReq) => {
    const response = await api.post(`${API_BASE_URL}`, data);
    return response;
  },
  updateCard: async (id: number, data: ICardReq) => {
    const response = await api.put(`${API_BASE_URL}/${id}`, data);
    return response;
  },

  deleteCard: async (id: number) => {
    return await api.delete(`${API_BASE_URL}/${id}`);
  },

  getCards: async () => {
    return await api.get<ICard[]>(`${API_BASE_URL}/denomination`);
  },

  importFile: async (data: FormData, denominationId: string) => {
    return await api.post(
      `${API_BASE_URL}/import?denominationId=${denominationId}`,
      data,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
  },
  tempExportCard: async () => {
    return await fetch(`${process.env.NEXT_PUBLIC_API_URL}/card/template`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Cookies.get('token')}`
      }
    });
  }
};

export default cardService;
