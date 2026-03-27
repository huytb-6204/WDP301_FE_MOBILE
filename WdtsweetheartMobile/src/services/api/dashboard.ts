import { apiDeleteRaw, apiGet, apiGetRaw, apiPatch, apiPatchRaw, apiPost, apiPostRaw } from './client';

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

export type DashboardOrder = ClientOrder & {
  code: string;
  orderStatus: string;
  total: number;
  createdAt: string;
  paymentStatus?: string;
  status?: string;
};

export const getProfile = async () => {
  return apiGet<ProfileUser>('/api/v1/client/dashboard/profile');
};

export const updateProfile = async (data: Partial<ProfileUser>) => {
  const res = await apiPatch<ProfileUser>('/api/v1/client/dashboard/profile/edit', data);
  return (res.data ?? data) as ProfileUser;
};

export const changePassword = async (data: any) => {
  return apiPatch<any>('/api/v1/client/dashboard/change-password', data);
};

export const changeAvatar = async (avatar: string) => {
  return apiPatch<any>('/api/v1/client/dashboard/profile/change-avatar', { avatar });
};

export const getAddresses = async (): Promise<SavedAddress[]> => {
  const res = await apiGetRaw<{ success?: boolean; data?: SavedAddress[]; addresses?: SavedAddress[] }>('/api/v1/client/dashboard/address');
  return (res as any).data || (res as any).addresses || [];
};

export const getAddressDetail = async (id: string) => {
  return apiGet<SavedAddress>(`/api/v1/client/dashboard/address/detail/${id}`);
};

export const updateAddress = async (id: string, data: any) => {
  return apiPatch<any>(`/api/v1/client/dashboard/address/edit/${id}`, data);
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

export const getOrderList = async (): Promise<DashboardOrder[]> => {
  const res = await apiGetRaw<{ success?: boolean; orders?: DashboardOrder[]; data?: DashboardOrder[] }>(
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
