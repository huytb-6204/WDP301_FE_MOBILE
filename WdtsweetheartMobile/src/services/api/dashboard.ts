import { apiGet } from './client';

export type ProfileUser = {
  id?: string;
  fullName: string;
  email: string;
  phone?: string;
  avatar?: string;
};

export const getProfile = async () => {
  return apiGet<ProfileUser>('/api/v1/client/dashboard/profile');
};
