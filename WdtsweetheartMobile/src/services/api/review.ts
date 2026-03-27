import { apiGet, apiPost, apiPatch, apiGetRaw } from './client';

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
