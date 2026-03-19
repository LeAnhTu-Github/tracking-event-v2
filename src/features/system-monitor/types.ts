export type TrackingApp = {
  id: number;
  name: string;
};

export type MonitorJob = {
  id: number;
  run_type: string;
  app_id: number;
  app_name?: string;
  date_since: string | null;
  date_until: string | null;
  start_time: string | null;
  end_time: string | null;
  scheduled_at: string | null;
  status: string;
  total_events: number;
  logs: string | null;
  duration?: string;
};

export type MonitorPagination = {
  current_page: number;
  total_pages: number;
  total_records: number;
  limit?: number;
};

export type MonitorHistoryResponse = {
  data: MonitorJob[];
  pagination?: MonitorPagination;
};

export type MonitorHistoryParams = {
  appId: number;
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
};

export type ManualJobPayload = {
  appId: string;
  startTime: string;
  endTime: string;
  executionTime?: string;
};
