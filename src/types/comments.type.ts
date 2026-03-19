export interface IUser {
  id: number;
  phoneNumber: string;
  username: string;
  avatar: string | null;
  lang: string;
  status: string;
  lastLoginTime: string;
}

export interface IComment {
  id: number;
  createdTime: string;
  createdBy: number;
  createdByAccount: IUser;
  video: {
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
  };
  content: string;
  parentId: number | null;
  replies: IComment[];
  isBlocked: boolean;
}

export interface ICommentFlat {
  id: number;
  createdTime: string;
  createdBy: number;
  createdByAccount: IUser;
  videoId: number;
  content: string;
  parentId: number | null;
}

export interface ICommentListResponse {
  pageIndex: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
  beginIndex: number;
  endIndex: number;
  data: IComment[];
}
