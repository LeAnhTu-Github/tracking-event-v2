import { api } from '@/services/api';
import { Package, PackageSearchParams } from '@/features/config-package/types';
import { PaginatedResponse } from '@/features/config-item/types';

const packageService = {
  getPackages: async (
    params: PackageSearchParams
  ): Promise<PaginatedResponse<Package>> => {
    return api.get<PaginatedResponse<Package>>(`/cms/packages`, {
      params
    });
  },

  getPackageById: async (id: string | number): Promise<Package> => {
    return api.get<Package>(`/cms/packages/${id}`);
  },

  createPackage: async (data: any): Promise<any> => {
    return api.post(`/cms/packages`, data);
  },

  updatePackage: async (id: string | number, data: any): Promise<any> => {
    return api.put(`/cms/packages/${id}`, data);
  },

  deletePackage: async (id: string | number): Promise<any> => {
    return api.delete(`/cms/packages/${id}`);
  }
};

export default packageService;
