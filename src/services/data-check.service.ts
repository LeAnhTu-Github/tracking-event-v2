import {
  DataCheckFilterOptions,
  DataCheckListParams,
  DataCheckListResponse,
  DataCheckPagination,
  TrackingApp
} from '@/features/data-check/types';
import axiosInstance, { getAbsoluteApiUrl } from '@/services/api';

type DataCheckFilterOptionsApiResponse = {
  versions?: unknown;
  geos?: unknown;
};

type DataCheckListApiResponse = {
  data?: unknown;
  pagination?: DataCheckPagination;
};

const isDataCheckFilterOptionsApiResponse = (
  value: unknown
): value is DataCheckFilterOptionsApiResponse => {
  return !!value && typeof value === 'object';
};

const isDataCheckListApiResponse = (value: unknown): value is DataCheckListApiResponse => {
  return !!value && typeof value === 'object';
};

const dataCheckService = {
  getApps: async (): Promise<TrackingApp[]> => {
    const res = await axiosInstance.get<TrackingApp[]>('/apps');
    return Array.isArray(res.data) ? res.data : [];
  },

  getFilterOptions: async (appId: number): Promise<DataCheckFilterOptions> => {
    const res = await axiosInstance.get<unknown>(`/api/filters/options/${appId}`);
    const json = isDataCheckFilterOptionsApiResponse(res.data) ? res.data : {};

    const versions = Array.isArray(json?.versions) ? json.versions : [];
    const geos = Array.isArray(json?.geos) ? json.geos : [];

    return {
      versions: ['All', ...versions.filter((item: string) => item !== 'All')],
      geos: ['All', ...geos.filter((item: string) => item !== 'All')]
    };
  },

  getList: async (params: DataCheckListParams): Promise<DataCheckListResponse> => {
    const query = new URLSearchParams({
      page: String(params.page ?? 1),
      limit: String(params.limit ?? 50)
    });

    if (params.startDate) query.append('start_date', params.startDate);
    if (params.endDate) query.append('end_date', params.endDate);
    if (params.version && params.version.toLowerCase() !== 'all') {
      query.append('version', params.version);
    }
    if (params.geo && params.geo.toLowerCase() !== 'all') {
      query.append('geo', params.geo);
    }

    const res = await axiosInstance.get<unknown>(
      `/api/data-check/${params.appId}?${query.toString()}`
    );
    const json = isDataCheckListApiResponse(res.data) ? res.data : {};

    if (Array.isArray(json)) {
      return {
        data: json,
        pagination: {
          current_page: params.page ?? 1,
          total_pages: 1,
          total_records: json.length,
          limit: params.limit ?? 50
        }
      };
    }

    if (Array.isArray(json?.data)) {
      return {
        data: json.data,
        pagination: json?.pagination
      };
    }

    return {
      data: [],
      pagination: {
        current_page: params.page ?? 1,
        total_pages: 1,
        total_records: 0,
        limit: params.limit ?? 50
      }
    };
  },

  getExportUrl: (params: DataCheckListParams) => {
    const query = new URLSearchParams();

    if (params.startDate) query.append('start_date', params.startDate);
    if (params.endDate) query.append('end_date', params.endDate);
    if (params.version && params.version.toLowerCase() !== 'all') {
      query.append('version', params.version);
    }
    if (params.geo && params.geo.toLowerCase() !== 'all') {
      query.append('geo', params.geo);
    }

    return getAbsoluteApiUrl(`/api/datacheck/export/${params.appId}?${query.toString()}`);
  }
};

export default dataCheckService;
