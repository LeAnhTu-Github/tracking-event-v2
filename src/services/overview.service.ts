import { api } from './api';

const API_BASE_URL = '/overview';

export interface IOverviewPaidFeeUser {
  date_time: string;
  revenue_register: number;
  revenue_renew: number;
}

export interface IOverviewNewRegisterUser {
  date_time: string;
  daily_cnt: number;
  weekly_cnt: number;
  weekly_percent: number;
}

export interface IOverviewDailyRevenue {
  date_time: string;
  daily_revenue: number;
  weekly_revenue: number;
  total_revenue: number;
  total_revenue_backdate: number;
  total_revenue_grow_percent: number;
}

export interface IOverviewRevenueByMonth {
  month_time: string;
  daily_revenue: number;
  weekly_revenue: number;
  total_revenue: number;
  total_revenue_backdate: number;
  total_revenue_grow_percent: number;
}

const overviewService = {
  getPaidFeeUser: async (params: any) => {
    return await api.get<IOverviewPaidFeeUser[]>(
      `${API_BASE_URL}/daily-paid-user`,
      {
        params
      }
    );
  },
  getNewRegisterUser: async (params: any) => {
    return await api.get<IOverviewNewRegisterUser[]>(
      `${API_BASE_URL}/new-register-user`,
      {
        params
      }
    );
  },
  getDailyRevenue: async (params: any) => {
    return await api.get<IOverviewDailyRevenue[]>(
      `${API_BASE_URL}/daily-revenue`,
      {
        params
      }
    );
  },
  getRevenueByMonth: async (params: any) => {
    return await api.get<IOverviewRevenueByMonth[]>(`${API_BASE_URL}/revenue`, {
      params
    });
  }
};

export default overviewService;
