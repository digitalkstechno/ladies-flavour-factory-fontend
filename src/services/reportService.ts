import api from './api';

export interface ReportData {
  products: any[];
  page: number;
  pages: number;
  total: number;
}

export const reportService = {
  getInventoryReport: async (page = 1, limit = 10, search = ''): Promise<ReportData> => {
    const response = await api.get(`/reports/inventory?page=${page}&limit=${limit}&search=${search}`);
    return response.data;
  },

  exportInventoryExcel: async (search = '') => {
    const response = await api.get(`/reports/inventory/excel?search=${search}`, { responseType: 'blob' });
    return response.data;
  },

  exportInventoryPDF: async (search = '') => {
    const response = await api.get(`/reports/inventory/pdf?search=${search}`, { responseType: 'blob' });
    return response.data;
  },
};
