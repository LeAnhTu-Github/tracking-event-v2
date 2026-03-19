export type TrackingApp = {
  id: number;
  name: string;
};

export type TrackingEventRow = {
  id: number;
  event_name: string;
  created_at: string;
  key_info: string;
  event_json: unknown;
};

export type EventsSearchPagination = {
  current_page: number;
  total_pages: number;
  total_records: number;
  limit?: number;
};

export type EventsSearchResponse = {
  success: boolean;
  data: TrackingEventRow[];
  pagination?: EventsSearchPagination;
};

export type EventsSearchParams = {
  appId: number;
  page: number;
  limit: number;
  startDate: string;
  endDate: string;
  keyword?: string;
  eventName?: string;
  level?: string;
};

export type DroppedUsersResponse = {
  success: boolean;
  total_start: number;
  total_win: number;
  dropped_count: number;
  dropped_uuids: string[];
  error?: string;
};

