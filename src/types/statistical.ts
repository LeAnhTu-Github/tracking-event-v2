export interface ITrendingFilters {
  pageSize: number;
  pageIndex: number;
}

export interface ITrendingVideo {
  id: number;
  videoId: number;
  title: string;
  description: string;
  thumbnailUrl: string;
  views: number;
}

export interface ITrendingVideoResponse {
  data: ITrendingVideo[];
  totalRecords: number;
}

export interface ICategoryInsights {
  id: number;
  name: string;
  value: number;
}

export interface IKeyword {
  keyword: string;
  count: number;
}

export interface ILineChart {
  time: string;
  data: {
    name: string;
    value: number;
  }[];
}
