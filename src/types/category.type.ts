export interface ICategory {
  id: number;
  code: string;
  slug: string;
  label: string;
  order: number;
  isActive: boolean;
  displayOnMenu: boolean;
  isDefaultPage: boolean;
  list: IChildrenCategory[];
}

export interface IChildrenCategory {
  id: number;
  code: string;
  name: string;
  slug: string;
  order: number;
}

export interface ICategoryListResponse {
  pageIndex: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
  beginIndex: number;
  endIndex: number;
  data: ICategory[];
}

export interface ICategoryReq {
  id: number;
  webPageId: number;
  category: {
    name: ICategoryTranslation[];
    code: string;
    slug: string;
    isFeatured?: boolean;
    isActive?: boolean;
    order?: number;
  };
}

export interface ICategoryUpdateReq {
  id: number;
  category: {
    name: ICategoryTranslation[];
  };
}

export interface ICategoryTranslation {
  langCode: string;
  name: string;
  description?: string;
}

export interface ICategoryDetail {
  id: number;
  code: string;
  slug: string;
  webPageId: number;
  order: number;
  isFeatured: boolean;
  isActive: boolean;
  translations: ICategoryTranslation[];
}

export interface ICategoryTree {
  id: number;
  code: string;
  slug: string;
  parentId: number;
  menuId: number;
  icons: string | null;
  order: number;
  isFeatured: boolean;
  isActive: boolean;
  level: number;
  translations: ICategoryTranslation[];
  list?: ICategoryTree[];
}
