import { apiDelete, apiGet, apiGetRaw, apiPatch, apiPost } from './client';

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

export type DashboardOrder = {
  _id: string;
  code: string;
  orderStatus: string;
  total: number;
  createdAt: string;
  paymentStatus?: string;
  status?: string;
};

export const getProfile = async () => apiGet<ProfileUser>('/api/v1/client/dashboard/profile');

export const updateProfile = async (data: Partial<ProfileUser>) => {
  const res = await apiPatch<ProfileUser>('/api/v1/client/dashboard/profile/edit', data);
  return (res.data ?? {}) as ProfileUser;
};

export const changePassword = async (data: unknown) =>
  apiPatch<unknown>('/api/v1/client/dashboard/change-password', data);

export const changeAvatar = async (avatar: string) =>
  apiPatch<unknown>('/api/v1/client/dashboard/profile/change-avatar', { avatar });

export const getAddresses = async (): Promise<SavedAddress[]> => {
  const res = await apiGetRaw<{ success?: boolean; data?: SavedAddress[]; addresses?: SavedAddress[] }>(
    '/api/v1/client/dashboard/address'
  );
  return res.data || res.addresses || [];
};

export const createAddress = async (data: unknown) =>
  apiPost<unknown>('/api/v1/client/dashboard/address/create', data);

export const getAddressDetail = async (id: string) =>
  apiGet<SavedAddress>(`/api/v1/client/dashboard/address/detail/${id}`);

export const updateAddress = async (id: string, data: unknown) =>
  apiPatch<unknown>(`/api/v1/client/dashboard/address/edit/${id}`, data);

export const deleteAddress = async (id: string) =>
  apiDelete<unknown>(`/api/v1/client/dashboard/address/delete/${id}`);

export const changeDefaultAddress = async (id: string) =>
  apiPatch<unknown>(`/api/v1/client/dashboard/address/change-default/${id}`, {});

export const getOrderList = async (): Promise<DashboardOrder[]> => {
  const res = await apiGetRaw<{ success?: boolean; orders?: DashboardOrder[]; data?: DashboardOrder[] }>(
    '/api/v1/client/dashboard/order/list'
  );
  return res.orders || res.data || [];
};

export const getOrderDetail = async (id: string) =>
  apiGet<unknown>(`/api/v1/client/dashboard/order/detail/${id}`);

export const getBoardingBookingDetail = async (id: string) =>
  apiGet<unknown>(`/api/v1/client/boarding/boarding-bookings/${id}`);

export const getDashboardOverview = async () => apiGet<unknown>('/api/v1/client/dashboard/overview');

export const getTransactionHistory = async () => apiGet<unknown[]>('/api/v1/client/dashboard/transactions');

export const getWishlist = async () => apiGet<unknown[]>('/api/v1/client/dashboard/wishlist');

export const toggleWishlist = async (productId: string) =>
  apiPost<unknown>('/api/v1/client/dashboard/wishlist/toggle', { productId });
