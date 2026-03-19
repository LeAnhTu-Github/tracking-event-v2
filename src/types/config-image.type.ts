export type PaymentType =
  | 'VIP_BENEFITS'
  | 'WATCH_ADS'
  | 'TOKEN'
  | 'ITEM'
  | 'MONEY';
export type ActionType = 'PLAY' | 'DOWNLOAD';
export type ConfigImageType = 'GENERAL' | 'INDIVIDUAL';

export interface ActionConfigPaymentVendor {
  paymentType: PaymentType;
  status: string;
  itemCode?: string;
  amount?: number;
  iosPackageId?: string;
  ggPackageId?: string;
  currency?: string;
  amountAfterDiscount?: number;
}

export interface ActionConfigItem {
  type: ActionType;
  paymentVendor: ActionConfigPaymentVendor[];
}

export interface ActionConfig {
  actions: ActionConfigItem[];
}

export interface ConfigImage {
  id: number;
  type: ConfigImageType;
  playImagesId: number | null;
  gameId: string;
  actionConfigId: number;
  actionConfigName: string;
  actionConfig: ActionConfig;
}

export interface ConfigAction {
  actionConfig: ActionConfig;
  createdTime?: string;
  lastUpdatedTime?: string;
}

export interface ConfigActionGroup {
  id: number;
  type: ConfigImageType;
  name: string;
  gameId: string;
  action: ConfigAction;
  configs: ConfigImage[];
}

export interface ConfigImageListResponse {
  pageIndex: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
  beginIndex: number;
  endIndex: number;
  data: ConfigActionGroup[];
}

export interface ConfigImageFilters {
  type?: string;
  playImagesId?: number;
  gameId?: string;
  pageIndex?: number;
  pageSize?: number;
}

export interface CreateConfigImagePayload {
  type: ConfigImageType;
  name: string;
  gameId: string;
  actionConfig: ActionConfig;
  playImagesIds?: number[];
}

export interface UpdateConfigImagePayload {
  type?: ConfigImageType;
  name?: string;
  gameId?: string;
  actionConfig?: ActionConfig;
  playImagesIds?: number[];
}
