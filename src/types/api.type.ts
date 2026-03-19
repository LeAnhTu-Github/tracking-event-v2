export interface ApiResponsePagination<T> {
  pageIndex: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
  totalRegister: number;
  totalRenew: number;
  totalRenewFailed: number;
  totalUnRegister: number;
  totalAmount: number;
  beginIndex: number;
  endIndex: number;
  data: T[];
}
