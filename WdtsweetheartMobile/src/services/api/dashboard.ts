import { apiGet, apiGetRaw } from './client';

export type ProfileUser = {
  id?: string;
  fullName: string;
  email: string;
  phone?: string;
  avatar?: string;
};

export type SavedAddress = {
  _id: string;
  fullName: string;
  phone: string;
  address: string;
  latitude: number;
  longitude: number;
  isDefault?: boolean;
};

export const getProfile = async () => {
  return apiGet<ProfileUser>('/api/v1/client/dashboard/profile');
};

export const getAddresses = async (): Promise<SavedAddress[]> => {
  const candidates = [
    '/api/v1/client/dashboard/address',
    '/api/v1/client/dashboard/addresses',
  ];

  let lastError: unknown = null;

  for (const path of candidates) {
    try {
      const res = await apiGetRaw<{
        success?: boolean;
        data?: SavedAddress[];
        addresses?: SavedAddress[];
      }>(path);

      if (Array.isArray((res as any)?.data)) {
        return (res as any).data;
      }

      if (Array.isArray((res as any)?.addresses)) {
        return (res as any).addresses;
      }
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError) {
    throw lastError;
  }

  return [];
};
