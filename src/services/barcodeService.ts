import api from './api';

export interface BarcodeProduct {
  _id: string;
  name: string;
  sku: string;
  unitPrice: number;
}

export const barcodeService = {
  getBarcodeProducts: async (params?: { page?: number; limit?: number; search?: string }): Promise<{
    products: BarcodeProduct[];
    page: number;
    pages: number;
    total: number;
  }> => {
    const { data } = await api.get('/barcodes/products', { params });
    return data;
  },
};
