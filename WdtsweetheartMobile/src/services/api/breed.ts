import { apiGetRaw } from './client';

export type BreedItem = {
  _id?: string;
  name: string;
  type?: 'dog' | 'cat' | string;
  description?: string;
};

type BreedResponse = {
  code?: number;
  message?: string;
  data?: BreedItem[];
};

export const getBreeds = async (type?: 'dog' | 'cat') => {
  const query = type ? `?type=${encodeURIComponent(type)}` : '';
  const res = await apiGetRaw<BreedResponse>(`/api/v1/client/breed${query}`);
  return Array.isArray(res?.data) ? res.data : [];
};
