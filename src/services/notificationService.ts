import api from './api';

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  createdAt: string;
}

export const notificationService = {
  getNotifications: async () => {
    const { data } = await api.get('/notifications');
    return data;
  },

  markAsRead: async (id: string) => {
    const { data } = await api.put(`/notifications/${id}/read`);
    return data;
  },

  markAllAsRead: async () => {
    const { data } = await api.put('/notifications/read-all');
    return data;
  },

  deleteNotification: async (id: string) => {
    const { data } = await api.delete(`/notifications/${id}`);
    return data;
  },

  clearAllNotifications: async () => {
    const { data } = await api.delete('/notifications');
    return data;
  }
};
