import { apiGet, apiPost } from './client';

export const getAdminUsers = async () => {
  const res = await apiGet<any>('/api/v1/admin/account-user/list?limit=1000');
  return res.data?.recordList || res.data || [];
};

export const getAdminPets = async (userId: string) => {
  const res = await apiGet<any>(`/api/v1/admin/pet?userId=${userId}&limit=100`);
  return res.data?.recordList || res.data || [];
};

export const getAdminCages = async () => {
  const res = await apiGet<any>('/api/v1/admin/boarding-cage');
  return (res.data?.recordList || res.data || []).filter((c: any) => c.status !== 'maintenance');
};

export const createAdminBoardingBooking = async (payload: any) => {
  const res = await apiPost<any>('/api/v1/admin/boarding-booking/create', payload);
  return res.data;
};
