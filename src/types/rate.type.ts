export interface IRateFilters {
  pageSize: number;
  pageIndex: number;
  userId?: number;
  actionType: string;
}

export interface IVideo {
  id: number;
  slug: string;
  thumbnailUrl: string;
  backdrop: string;
  videoUrl: string;
  duration: number;
  isSeries: boolean;
  seriesPart: number;
  isPremium: boolean;
  viewCount: number;
  rating: number;
  ratingCount: number;
  publishedAt: string;
  languageCode: string | null;
  title: string | null;
  description: string | null;
}

export interface IRate {
  id: number;
  actionType: string;
  userId: number;
  video: IVideo;
  rating: number;
  isFavorite: boolean;
  watchDuration: number;
  createdTime: string;
  createdBy: number;
  lastUpdatedTime: string;
  lastUpdatedBy: number;
}

export interface IRateResponse {
  data: IRate[];
  totalRecords: number;
}
