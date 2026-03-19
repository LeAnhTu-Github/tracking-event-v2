import {
  ManualJobPayload,
  MonitorHistoryParams,
  MonitorHistoryResponse,
  TrackingApp
} from '@/features/system-monitor/types';
import {
  APPS_ENDPOINT,
  BASE_URL
} from '@/lib/endpoints';

const readJson = async (res: Response) => {
  try {
    return await res.json();
  } catch {
    return null;
  }
};

const systemMonitorService = {
  getApps: async (): Promise<TrackingApp[]> => {
    const res = await fetch(APPS_ENDPOINT);
    const data = await readJson(res);
    return Array.isArray(data) ? data : [];
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

    const res = await fetch(
      `${BASE_URL}/monitor/history?${query.toString()}`
    );
    const json = await readJson(res);

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

    const res = await fetch(`${BASE_URL}/etl/run/${appId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      throw new Error('Failed to trigger job');
    }

    return readJson(res);
  },

  createManualJob: async (payload: ManualJobPayload) => {
    const res = await fetch(`${BASE_URL}/api/create_manual_job`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        app_id: payload.appId,
        start_time: payload.startTime,
        end_time: payload.endTime,
        execution_time: payload.executionTime || null
      })
    });

    const json = await readJson(res);

    if (!res.ok) {
      throw new Error(json?.error || 'Create manual job failed');
    }

    return json;
  },

  stopJob: async (jobId: number) => {
    const res = await fetch(`${BASE_URL}/etl/stop/${jobId}`, {
      method: 'POST'
    });
    if (!res.ok) {
      throw new Error('Failed to stop job');
    }
  },

  deleteAllHistory: async (appId: number) => {
    const res = await fetch(`${BASE_URL}/monitor/purge?app_id=${appId}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      throw new Error('Failed to delete all history');
    }
  },

  deleteHistory: async (jobId: number) => {
    const res = await fetch(`${BASE_URL}/monitor/history/${jobId}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      throw new Error('Failed to delete record');
    }
  },

  getExportUrl: (jobId: number) => `${BASE_URL}/monitor/export/${jobId}`
};

export default systemMonitorService;
