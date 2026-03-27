import { apiGetRaw } from './client';

export interface Breed {
  _id: string;
  name: string;
  type: string;
  description?: string;
  image?: string;
}

export const getBreeds = async (type?: string, unique: boolean = false) => {
  const query = [];
  if (type) query.push(`type=${type}`);
  if (unique) query.push(`unique=${unique}`);
  const queryString = query.length > 0 ? `?${query.join('&')}` : '';
  return apiGetRaw<{ success: boolean; data: Breed[] }>(`/api/v1/client/breed${queryString}`);
};
