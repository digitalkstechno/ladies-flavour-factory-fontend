import api from './api';

export interface BarcodeProduct {
  _id: string;
  name: string;
  sku: string;
  unitPrice: number;
}

export const barcodeService = {
  getBarcodeProducts: async (keyword?: string): Promise<BarcodeProduct[]> => {
    const params = keyword ? { keyword } : {};
    const response = await api.get('/barcodes/products', { params });
    return response.data;
  },
};
