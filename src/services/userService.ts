import api from './api';

export const userService = {
  getUsers: async () => {
    const { data } = await api.get('/users');
    return data;
  },

  getUser: async (id: string) => {
    const { data } = await api.get(`/users/${id}`);
    return data;
  },

  createUser: async (userData: any) => {
    const { data } = await api.post('/users', userData);
    return data;
  },

  updateUser: async (id: string, userData: any) => {
    const { data } = await api.put(`/users/${id}`, userData);
    return data;
  },

  deleteUser: async (id: string) => {
    const { data } = await api.delete(`/users/${id}`);
    return data;
  },

  updateProfile: async (profileData: any) => {
    const { data } = await api.put('/users/profile', profileData);
    return data;
  }
};
