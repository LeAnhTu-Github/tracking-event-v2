export interface PageItem {
  id: number;
  webPages?: {
    id: number;
    name: string;
  };
  webPage?: {
    id: number;
    slug: string;
    code: string;
    type: number;
    order: number;
    displayOnMenu: any;
    isActive: number;
  };
  webPageItem?: {
    id: number;
    itemType: string;
    styleId: string;
    slug: string;
    code: string;
    order: number;
    isActive: number;
    limitNumber: number;
  };
  webPagesItemTranslation?: Array<{
    id: number;
    langCode: string;
    name: string;
  }>;
  // Legacy fields for backward compatibility
  itemType?: string;
  refCategoryCode?: string;
  slug?: string | null;
  styleId?: string;
  order?: number;
  isActive?: number;
  limitNumber?: number;
  langCode?: string;
  name?: string;
}
