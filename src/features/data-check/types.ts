export type TrackingApp = {
  id: number;
  name: string;
};

export type DataCheckRow = {
  level: string | number;
  user_start: number;
  user_win: number;
  level_drop: number;
  drop_lost: number;
  next_drop: number | string;
  play_count: number;
  boosters: Record<string, number>;
  total_booster: number;
  avg_booster: number;
  unlock?: number;
  revive_full?: number;
  revive_moves?: number;
  total_revive?: number;
  avg_coin: number;
  avg_time: number;
  total_coin: number;
  level_drop_diff?: number;
  coin_spend_diff?: number;
};

export type DataCheckFilterOptions = {
  versions: string[];
  geos: string[];
};

export type DataCheckPagination = {
  current_page: number;
  total_pages: number;
  total_records: number;
  limit?: number;
};

export type DataCheckListParams = {
  appId: number;
  startDate?: string;
  endDate?: string;
  version?: string;
  geo?: string;
  page?: number;
  limit?: number;
};

export type DataCheckListResponse = {
  data: DataCheckRow[];
  pagination?: DataCheckPagination;
};
