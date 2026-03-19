export interface IVideo {
  id: number;
  slug: string;
  thumbnailUrl: string;
  backdrop: string;
  videoUrl: string;
  duration: number;
  isSeries: boolean;
  seriesId: number;
  seriesPart: number;
  isPremium: boolean;
  viewCount: number;
  rating: number;
  ratingCount: number;
  publishedAt: string;
  languageCode: string;
  title: string;
  description: string;
}

export interface IFavoriteRes {
  id: number;
  userId: number;
  watchDuration: number;
  video: IVideo;
  isFavorite: boolean;
  createdTime: string;
  lastUpdatedTime: string;
}

export interface IFavoriteFilters {
  pageSize: number;
  pageIndex: number;
  search?: string;
}

export interface IFavoriteReq {
  videoId: number;
  isFavorite: boolean;
}
