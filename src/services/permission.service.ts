import { api } from './api';

const AUTH_API_URL = '/auth/page';

interface Page {
  id: number;
  pageName: string;
  pageUrl: string;
  pageIcon: string;
  parentId: number;
  menuIndex: number;
  level: number;
  isOpen: number;
}

interface Role {
  pageId: number;
  id: number;
  roleName: string;
}

interface Permission {
  pages: Page[];
  roles: Role[];
}

const permissionService = {
  getPermissions: async () => {
    const response = await api.get<Permission>(`${AUTH_API_URL}`);
    return response;
  }
};

export default permissionService;
