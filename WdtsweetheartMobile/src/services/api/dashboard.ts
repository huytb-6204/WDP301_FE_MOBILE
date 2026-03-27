import { apiGet, apiGetRaw, apiPatch, apiPost, apiDelete } from './client';

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
  status?: string; // for backward compatibility
};

export const getProfile = async () => {
  return apiGet<ProfileUser>('/api/v1/client/dashboard/profile');
};

export const updateProfile = async (data: Partial<ProfileUser>) => {
  return apiPatch<any>('/api/v1/client/dashboard/profile/edit', data);
};

export const changePassword = async (data: { newPassword: string; confirmPassword: string }) => {
  const res = await apiPatch<any>('/api/v1/client/dashboard/change-password', data);

  if (!res.success) {
    throw new Error(res.message || 'Khong the doi mat khau');
  }

  return res;
};

export const changeAvatar = async (avatar: string) => {
  return apiPatch<any>('/api/v1/client/dashboard/profile/change-avatar', { avatar });
};

export const getAddresses = async (): Promise<SavedAddress[]> => {
  const res = await apiGetRaw<{ success?: boolean; data?: SavedAddress[]; addresses?: SavedAddress[] }>('/api/v1/client/dashboard/address');
  return (res as any).data || (res as any).addresses || [];
};

export const createAddress = async (data: any) => {
  return apiPost<any>('/api/v1/client/dashboard/address/create', data);
};

export const getAddressDetail = async (id: string) => {
  return apiGet<SavedAddress>(`/api/v1/client/dashboard/address/detail/${id}`);
};

export const updateAddress = async (id: string, data: any) => {
  return apiPatch<any>(`/api/v1/client/dashboard/address/edit/${id}`, data);
};

export const deleteAddress = async (id: string) => {
  return apiDelete<any>(`/api/v1/client/dashboard/address/delete/${id}`);
};

export const changeDefaultAddress = async (id: string) => {
  return apiPatch<any>(`/api/v1/client/dashboard/address/change-default/${id}`, {});
};

export const getOrderList = async (): Promise<DashboardOrder[]> => {
  const res = await apiGetRaw<{ success: boolean; orders: DashboardOrder[] }>('/api/v1/client/dashboard/order/list');
  return res.orders || [];
};

export const getOrderDetail = async (id: string) => {
  return apiGet<any>(`/api/v1/client/dashboard/order/detail/${id}`);
};

export const getBoardingBookingDetail = async (id: string) => {
  return apiGet<any>(`/api/v1/client/boarding/boarding-bookings/${id}`);
};

export const getDashboardOverview = async () => {
  return apiGet<any>('/api/v1/client/dashboard/overview');
};

export const getTransactionHistory = async () => {
  return apiGet<any[]>('/api/v1/client/dashboard/transactions');
};

export const getWishlist = async () => {
  return apiGet<any[]>('/api/v1/client/dashboard/wishlist');
};

export const toggleWishlist = async (productId: string) => {
  return apiPost<any>('/api/v1/client/dashboard/wishlist/toggle', { productId });
};
