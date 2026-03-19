export interface IPopupTranslation {
  id: number;
  languageCode: string;
  content: string;
  backgroundImage: string;
}

export interface IPopup {
  id: number;
  startDate: string;
  endDate: string;
  isActive: number;
  redirectLink: string;
  webPageId: any;
  translations: IPopupTranslation[];
}

export interface IPopupReq {
  id: number;
  startDate: string;
  endDate: string;
  isActive: number;
  redirectLink: string;
  webPageIds: any;
  translations: IPopupTranslation[];
}
export interface IPopupFilters {
  languageCode: string;
  pageSize: number;
  pageIndex: number;
}

export interface IPopupResponse {
  data: IPopup[];
  totalRecords: number;
}
