import {
  CreateManualJobResponse,
  ManualJobPayload,
  MonitorPagination,
  MonitorHistoryParams,
  MonitorHistoryResponse,
  TrackingApp
} from '@/features/system-monitor/types';
import axiosInstance, { getAbsoluteApiUrl } from '@/services/api';

type MonitorHistoryApiResponse = {
  data?: unknown;
  pagination?: MonitorPagination;
};

const isMonitorHistoryApiResponse = (value: unknown): value is MonitorHistoryApiResponse => {
  return !!value && typeof value === 'object';
};

const systemMonitorService = {
  getApps: async (): Promise<TrackingApp[]> => {
    const res = await axiosInstance.get<TrackingApp[]>('/apps');
    return Array.isArray(res.data) ? res.data : [];
  },

  getHistory: async (
    params: MonitorHistoryParams
  ): Promise<MonitorHistoryResponse> => {
    const query = new URLSearchParams({
      app_id: String(params.appId),
      page: String(params.page ?? 1),
      limit: String(params.limit ?? 30)
    });

    if (params.startDate) query.append('start_date', params.startDate);
    if (params.endDate) query.append('end_date', params.endDate);

    const res = await axiosInstance.get<unknown>(
      `/monitor/history?${query.toString()}`
    );
    const json = isMonitorHistoryApiResponse(res.data) ? res.data : {};

    if (Array.isArray(json)) {
      return {
        data: json,
        pagination: {
          current_page: params.page ?? 1,
          total_pages: 1,
          total_records: json.length,
          limit: params.limit ?? 30
        }
      };
    }

    return {
      data: Array.isArray(json?.data) ? json.data : [],
      pagination: json?.pagination
    };
  },

  runJob: async (appId: number, runType: 'demo' | 'retry', retryJobId?: number) => {
    const body: { run_type: 'demo' | 'retry'; retry_job_id?: number } = {
      run_type: runType
    };

    if (retryJobId) body.retry_job_id = retryJobId;

    const res = await axiosInstance.post<unknown>(`/etl/run/${appId}`, body);
    return res.data;
  },

  createManualJob: async (payload: ManualJobPayload): Promise<CreateManualJobResponse> => {
    const res = await axiosInstance.post<CreateManualJobResponse>('/api/create_manual_job', {
      app_id: payload.appId,
      start_time: payload.startTime,
      end_time: payload.endTime,
      execution_time: payload.executionTime || null
    });
    return res.data;
  },

  stopJob: async (jobId: number) => {
    await axiosInstance.post(`/etl/stop/${jobId}`);
  },

  deleteAllHistory: async (appId: number) => {
    await axiosInstance.delete(`/monitor/purge?app_id=${appId}`);
  },

  deleteHistory: async (jobId: number) => {
    await axiosInstance.delete(`/monitor/history/${jobId}`);
  },

  getExportUrl: (jobId: number) => getAbsoluteApiUrl(`/monitor/export/${jobId}`)
};

export default systemMonitorService;
