import api from './api';

export const roleService = {
  getRoles: async () => {
    const { data } = await api.get('/roles');
    return data;
  },

  getRole: async (id: string) => {
    const { data } = await api.get(`/roles/${id}`);
    return data;
  },

  createRole: async (roleData: any) => {
    const { data } = await api.post('/roles', roleData);
    return data;
  },

  updateRole: async (id: string, roleData: any) => {
    const { data } = await api.put(`/roles/${id}`, roleData);
    return data;
  },

  deleteRole: async (id: string) => {
    const { data } = await api.delete(`/roles/${id}`);
    return data;
  },
};
