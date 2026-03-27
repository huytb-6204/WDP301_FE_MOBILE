import { apiGet, apiPost, apiPatch, apiDelete, ApiResponse } from './client';

export interface Shift {
  _id: string;
  name: string;
  startTime: string;
  endTime: string;
  color?: string;
  location?: 'offline' | 'online';
  status: 'active' | 'inactive';
  departmentId?: { _id: string; name: string };
}

export const getShifts = async (params?: { page?: number; limit?: number; keyword?: string }) => {
  const query = new URLSearchParams(params as any).toString();
  const data = await apiGet<any>(`/api/v1/admin/shifts?${query}`);
  return data?.recordList || data || [];
};

export const getShiftDetail = async (id: string) => {
  const data = await apiGet<Shift>(`/api/v1/admin/shifts/${id}`);
  return data;
};

export const createShift = async (body: Partial<Shift>) => {
  const res = await apiPost('/api/v1/admin/shifts', body);
  return res.data;
};

export const updateShift = async (id: string, body: Partial<Shift>) => {
  const res = await apiPatch(`/api/v1/admin/shifts/${id}`, body);
  return res.data;
};

export const deleteShift = async (id: string) => {
  const res = await apiDelete(`/api/v1/admin/shifts/${id}`);
  return res.data;
};
