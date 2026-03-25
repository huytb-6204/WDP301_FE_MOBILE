import { apiDeleteRaw, apiGet, apiGetRaw, apiPatchRaw, apiPostRaw } from './client';

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

export type AddressPayload = {
  fullName: string;
  phone: string;
  address: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
};

export type ClientOrderItem = {
  _id?: string;
  productId?: string;
  quantity?: number;
  price?: number;
  variant?: string[];
  image?: string;
  name?: string;
  reviewed?: boolean;
  reviewStatus?: string | null;
};

export type ClientOrder = {
  _id: string;
  code?: string;
  fullName?: string;
  phone?: string;
  address?: string;
  note?: string;
  items?: ClientOrderItem[];
  subTotal?: number;
  discount?: number;
  total?: number;
  paymentMethod?: string;
  paymentStatus?: string;
  orderStatus?: string;
  shipping?: {
    carrierName?: string;
    fee?: number;
  };
  createdAt?: string;
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

export const createAddress = async (payload: AddressPayload) => {
  return apiPostRaw<{ success: boolean; message: string }, AddressPayload>(
    '/api/v1/client/dashboard/address/create',
    payload
  );
};

export const deleteAddress = async (id: string) => {
  return apiDeleteRaw<{ success: boolean; message: string }>(`/api/v1/client/dashboard/address/delete/${id}`);
};

export const changeDefaultAddress = async (id: string) => {
  return apiPatchRaw<{ success: boolean; message: string }, Record<string, never>>(
    `/api/v1/client/dashboard/address/change-default/${id}`,
    {}
  );
};

export const getOrderList = async (): Promise<ClientOrder[]> => {
  const res = await apiGetRaw<{ success?: boolean; orders?: ClientOrder[]; data?: ClientOrder[] }>(
    '/api/v1/client/dashboard/order/list'
  );

  if (Array.isArray((res as any)?.orders)) {
    return (res as any).orders;
  }

  if (Array.isArray((res as any)?.data)) {
    return (res as any).data;
  }

  return [];
};
