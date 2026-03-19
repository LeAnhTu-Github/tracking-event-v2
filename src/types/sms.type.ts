export interface ISmsFilters {
  pageSize: number;
  pageIndex: number;
  userId?: number;
}

export interface ISms {
  id: number;
  msisdn: string;
  content: string;
  shortcode: string;
  alias: string;
  params: string;
  createdTime: string;
  updateTime: string;
}

export interface ISmsResponse {
  data: ISms[];
  totalRecords: number;
}
