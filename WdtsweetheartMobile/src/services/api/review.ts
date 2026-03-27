import { apiGet, apiPost, apiPatch, apiGetRaw, apiDelete } from './client';

export type MyReview = {
  _id: string;
  rating?: number;
  comment?: string;
  createdAt?: string;
  productId?: {
    _id?: string;
    name?: string;
    slug?: string;
    images?: string[];
  };
};

export type StaffReview = {
  _id: string;
  rating: number;
  comment: string;
  status: 'active' | 'inactive';
  createdAt: string;
  userId?: {
    _id: string;
    fullName: string;
    avatar?: string;
  };
  productId?: {
    _id: string;
    name: string;
  };
};

export const getReviewsByProduct = async (productId: string) => {
  return apiGet<any>(`/api/v1/client/review/${productId}`);
};

export const createReview = async (data: any) => {
  return apiPost<any>('/api/v1/client/review/create', data);
};

export const updateReview = async (id: string, data: any) => {
  return apiPatch<any>(`/api/v1/client/review/update/${id}`, data);
};

export const getMyReviews = async (): Promise<MyReview[]> => {
  const res = await apiGetRaw<{
    success?: boolean;
    message?: string;
    data?: MyReview[];
  }>('/api/v1/client/review/my-reviews');

  return res.data || [];
};

export const getStaffReviews = async (params?: { page?: number; limit?: number; search?: string }) => {
  const query = new URLSearchParams(params as any).toString();
  const data = await apiGet<any>(`/api/v1/admin/review?${query}`);
  return data?.recordList || data || [];
};

export const changeStaffReviewStatus = async (id: string, status: string) => {
  return apiPatch<any>(`/api/v1/admin/review/change-status/${id}`, { status });
};

export const deleteStaffReview = async (id: string) => {
  return apiDelete<any>(`/api/v1/admin/review/delete/${id}`);
};
