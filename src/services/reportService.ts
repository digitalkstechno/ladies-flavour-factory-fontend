import api from './api';

export interface ReportStats {
  totalStockValue: number;
  lowStockCount: number;
  totalItems: number;
}

export interface ReportData {
  stats: ReportStats;
  products: any[]; // Using any for product type for now, or import from productService/types
}

export const reportService = {
  getInventoryReport: async (): Promise<ReportData> => {
    const response = await api.get('/reports/inventory');
    return response.data;
  },

  exportInventoryExcel: async () => {
    const response = await api.get('/reports/inventory/excel', { responseType: 'blob' });
    return response.data;
  },

  exportInventoryPDF: async () => {
    const response = await api.get('/reports/inventory/pdf', { responseType: 'blob' });
    return response.data;
  },
};
