import api from './api';

export const productService = {
  getProducts: async (params?: any) => {
    const { data } = await api.get('/products', { params });
    return data;
  },

  getProduct: async (id: string) => {
    const { data } = await api.get(`/products/${id}`);
    return data;
  },

  createProduct: async (productData: FormData | any) => {
    const headers = productData instanceof FormData 
      ? { 'Content-Type': 'multipart/form-data' }
      : { 'Content-Type': 'application/json' };
      
    const { data } = await api.post('/products', productData, { headers });
    return data;
  },

  updateProduct: async (id: string, productData: FormData | any) => {
    const headers = productData instanceof FormData 
      ? { 'Content-Type': 'multipart/form-data' }
      : { 'Content-Type': 'application/json' };

    const { data } = await api.put(`/products/${id}`, productData, { headers });
    return data;
  },

  deleteProduct: async (id: string) => {
    const { data } = await api.delete(`/products/${id}`);
    return data;
  },
};
