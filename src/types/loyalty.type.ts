export interface ILoyaltyFilters {
  pageSize: number;
  pageIndex: number;
  userId?: number;
}

export interface ILoyalty {
  id: number;
  msisdn: string;
  createTime: string;
  transId: string;
  userId: number;
  packageCode: string;
  reason: string;
  status: number;
  refCode: string;
  refMessage: string;
  resultData: string;
  updateTime: string;
}

export interface ILoyaltyResponse {
  data: ILoyalty[];
  totalRecords: number;
}
