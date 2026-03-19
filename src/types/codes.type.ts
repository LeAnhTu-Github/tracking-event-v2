export interface IUser {
  id: number;
  phoneNumber: string;
  username: string;
  avatar: string | null;
  lang: string;
  status: string;
  lastLoginTime: string;
}

export interface ICode {
  id: number;
  code: string;
  obtainTime: string;
  userId: number;
  username: string;
  userPhoneNumber: string;
}

export interface ICodeListResponse {
  pageIndex: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
  beginIndex: number;
  endIndex: number;
  data: ICode[];
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
