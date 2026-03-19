import Cookies from 'js-cookie';
import { api } from './api';
import { User } from '@/types/user.type';

const AUTH_API_URL = '/auth';

const authService = {
  login: async (username: string, password: string) => {
    const response = await api.post<{
      token: string;
    }>(`${AUTH_API_URL}/login`, {
      username,
      password
    });
    return response;
  },
  logout: async () => {
    const token = Cookies.get('token');
    const response = await api.post(`${AUTH_API_URL}/logout`, {
      token
    });
    return response;
  },
  updateMe: (data: User) => api.put(`${AUTH_API_URL}/info`, data)
};

export default authService;
