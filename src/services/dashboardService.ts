import api from './api';

export interface DashboardStats {
  counts: {
    products: number;
    catalogs: number;
    todayIn: number;
    todayOut: number;
  };
  recentTransactions: any[];
  chartData: {
    name: string;
    in: number;
    out: number;
  }[];
}

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/dashboard');
    return response.data;
  },
};
