import { apiGet, apiPost, apiPatch, apiDelete, ApiResponse } from './client';

export interface Department {
  _id: string;
  name: string;
  managerId?: { _id: string; fullName: string };
  status: 'active' | 'inactive';
}

export const getDepartments = async (params?: { page?: number; limit?: number; keyword?: string }) => {
  const query = new URLSearchParams(params as any).toString();
  const data = await apiGet<any>(`/api/v1/admin/departments?${query}`);
  return data?.recordList || data || [];
};

export const getDepartmentDetail = async (id: string) => {
  const data = await apiGet<Department>(`/api/v1/admin/departments/${id}`);
  return data;
};

export const createDepartment = async (body: Partial<Department>) => {
  const res = await apiPost('/api/v1/admin/departments', body);
  return res.data;
};

export const updateDepartment = async (id: string, body: Partial<Department>) => {
  const res = await apiPatch(`/api/v1/admin/departments/${id}`, body);
  return res.data;
};

export const deleteDepartment = async (id: string) => {
  const res = await apiDelete(`/api/v1/admin/departments/${id}`);
  return res.data;
};
