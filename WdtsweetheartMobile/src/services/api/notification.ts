import { apiGetRaw, apiPatch, apiDelete } from './client';

export type NotificationStatus = 'read' | 'unread' | 'archived';

export interface Notification {
  _id: string;
  title: string;
  content: string;
  status: NotificationStatus;
  type?: string;
  category?: string;
  senderId?: {
    fullName: string;
    avatar?: string;
  };
  createdAt: string;
}

const BASE_PATH = '/api/v1/admin/notifications';

export const getNotifications = async (status?: NotificationStatus) => {
  const query = status ? `?status=${status}` : '';
  const res = await apiGetRaw<any>(`${BASE_PATH}${query}`);
  return res.data as Notification[];
};

export const markAsRead = async (id: string) => {
  const res = await apiPatch(`${BASE_PATH}/mark-read/${id}`, {});
  return res.success;
};

export const markAllAsRead = async () => {
  const res = await apiPatch(`${BASE_PATH}/mark-read/all`, {});
  return res.success;
};

export const archiveNotification = async (id: string) => {
  const res = await apiPatch(`${BASE_PATH}/archive/${id}`, {});
  return res.success;
};

export const archiveAllNotifications = async () => {
    const res = await apiPatch(`${BASE_PATH}/archive/all`, {});
    return res.success;
};

export const deleteNotification = async (id: string) => {
  const res = await apiDelete(`${BASE_PATH}/${id}`);
  return res.success;
};

export const deleteAllNotifications = async () => {
  const res = await apiDelete(`${BASE_PATH}/all`);
  return res.success;
};
