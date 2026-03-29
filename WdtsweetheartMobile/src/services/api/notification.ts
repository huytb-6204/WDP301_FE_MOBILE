import { apiDelete, apiGet, apiPatch } from './client';

export type StaffNotification = {
  _id: string;
  title?: string;
  message?: string;
  content?: string;
  type?: string;
  status?: 'unread' | 'read' | 'archived' | string;
  senderId?: {
    _id?: string;
    fullName?: string;
    avatar?: string;
  };
  createdAt?: string;
  updatedAt?: string;
};

export const getNotifications = async (status?: string) => {
  const query = status ? `?status=${encodeURIComponent(status)}` : '';
  const data = await apiGet<StaffNotification[]>(`/api/v1/admin/notifications${query}`);
  return Array.isArray(data) ? data : [];
};

export const markNotificationRead = async (id: string) => {
  return apiPatch(`/api/v1/admin/notifications/mark-read/${id}`, {});
};

export const markAllNotificationsRead = async () => {
  return apiPatch('/api/v1/admin/notifications/mark-read/all', {});
};

export const archiveNotification = async (id: string) => {
  return apiPatch(`/api/v1/admin/notifications/archive/${id}`, {});
};

export const archiveAllNotifications = async () => {
  return apiPatch('/api/v1/admin/notifications/archive/all', {});
};

export const deleteNotification = async (id: string) => {
  return apiDelete(`/api/v1/admin/notifications/${id}`);
};

export const deleteAllNotifications = async () => {
  return apiDelete('/api/v1/admin/notifications/all');
};
