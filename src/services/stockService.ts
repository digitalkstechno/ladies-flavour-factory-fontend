import api from './api';

export const stockService = {
  getTransactions: async () => {
    const { data } = await api.get('/stock');
    return data;
  },

  createTransaction: async (transactionData: any) => {
    const { data } = await api.post('/stock', transactionData);
    return data;
  },
};
