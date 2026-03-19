import { api } from './api';
import { Group, TGroupDetail } from '@/types/user.type';

const AUTH_API_URL = '/auth/group';
interface BodyUpdateGroup {
  groupId: number;
  groupName: string;
  description: string;
  status?: number;
  groupPage: string;
}

interface BodyCreateGroup {
  groupName: string;
  description: string;
  status: number;
  groupPage: string;
}

const groupService = {
  getGroups: async () => {
    const response = await api.get<Group[]>(`${AUTH_API_URL}`);
    return response;
  },
  createGroup: async (data: BodyCreateGroup) => {
    const response = await api.post<Group>(`${AUTH_API_URL}`, data);
    return response;
  },
  getGroupById: async (id: number) => {
    const response = await api.get<TGroupDetail>(`${AUTH_API_URL}/${id}`);
    return response;
  },
  updateGroup: async (data: BodyUpdateGroup) =>
    await api.put(`${AUTH_API_URL}/${data.groupId}`, data),

  deleteGroup: async (id: number) => await api.delete(`${AUTH_API_URL}/${id}`),

  updateAccountUser: async (data: { id: number; userIds: string }) =>
    await api.put(`${AUTH_API_URL}/user/${data.id}`, data)
};

export default groupService;
