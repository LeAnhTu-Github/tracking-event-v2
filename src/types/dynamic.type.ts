export interface IDynamicReq {
  backgroundImage: string;
  redirectLink: string;
  translations: IDynamicTranslation[];
}

export interface IDynamic {
  id: number;
  backgroundImage: string;
  redirectLink: string;
  order?: number | null;
  name: string;
  translations: IDynamicTranslation[];
}

export interface IDynamicTranslation {
  languageCode: string;
  name: string;
}

export interface IDynamicListResponse {
  pageIndex: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
  beginIndex: number;
  endIndex: number;
  data: IDynamic[];
}
