import { ApiResponseGetMe, User } from '@/types/user.type';
import { api } from './api';
import { ApiResponsePagination } from '@/types/api.type';

const AUTH_API_URL = '/user';

interface IParams {
  pageIndex?: number;
  pageSize?: number;
  status?: string;
  fullName?: string;
  phone?: string;
}

interface IBodyUpdateUser {
  id: number;
  avatar: string;
  fullName: string;
  groupIds: number[];
  phone?: string;
  status: string;
}

interface IBodyCreateUser {
  avatar: string;
  username: string;
  fullName: string;
  groupIds: number[];
  password: string;
  phone?: string;
  status: string;
}

const userService = {
  createUser: async (data: IBodyCreateUser) => {
    return await api.post(`${AUTH_API_URL}`, data);
  },
  getMe: async () => {
    return await api.get<ApiResponseGetMe>(`${AUTH_API_URL}/info`);
  },
  getUsers: async (params: IParams) => {
    return await api.get<ApiResponsePagination<User>>(`${AUTH_API_URL}/list`, {
      params
    });
  },
  getUserById: async (id: number) => {
    return await api.get<User>(`${AUTH_API_URL}/${id}`);
  },
  resetPassword: async (id: number) => {
    return await api.put(`${AUTH_API_URL}/resetPassword/${id}`);
  },
  deleteUser: async (id: number) => {
    return await api.delete(`${AUTH_API_URL}/${id}`);
  },
  updateUser: async (data: IBodyUpdateUser) => {
    return await api.put(`${AUTH_API_URL}/${data.id}`, data);
  },
  changePassword: async (data: {
    oldPassword: string;
    newPassword: string;
  }) => {
    return await api.put(`${AUTH_API_URL}/changePass`, data);
  }
};

export default userService;
