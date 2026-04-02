import { apiGet, apiPatch } from './client';

export type StaffTaskPet = {
  _id?: string;
  name?: string;
  avatar?: string;
  breed?: string;
};

export type StaffTaskPetMap = {
  petId?: StaffTaskPet | string;
  staffId?: string | { _id?: string; fullName?: string };
  status?: 'pending' | 'in-progress' | 'completed' | string;
  startedAt?: string;
  completedAt?: string;
};

export type StaffServiceTask = {
  _id: string;
  code?: string;
  start?: string;
  end?: string;
  originalStart?: string;
  bookingStatus?: string;
  paymentStatus?: string;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
  userId?: {
    _id?: string;
    fullName?: string;
    phone?: string;
    email?: string;
    avatar?: string;
  };
  serviceId?: {
    _id?: string;
    name?: string;
    basePrice?: number;
    duration?: number;
    minDuration?: number;
    maxDuration?: number;
  };
  petIds?: StaffTaskPet[];
  petStaffMap?: StaffTaskPetMap[];
  isOverrun?: boolean;
};

export const getStaffServiceTasks = async (params?: { date?: string; noLimit?: boolean; status?: string }) => {
  const query = new URLSearchParams();
  if (params?.date) query.set('date', params.date);
  if (params?.status) query.set('status', params.status);
  if (params?.noLimit) query.set('noLimit', 'true');
  const suffix = query.toString() ? `?${query.toString()}` : '';

  const res = await apiGet<any>(`/api/v1/admin/booking/bookings/staff-tasks${suffix}`);
  return res?.data || [];
};

export const getStaffServiceTaskDetail = async (id: string) => {
  const res = await apiGet<any>(`/api/v1/admin/booking/bookings/staff-detail/${id}`);
  return (res?.data || res) as StaffServiceTask;
};

export const startStaffServiceTask = async (id: string, petId?: string) => {
  const res = await apiPatch<any, { petId?: string }>(`/api/v1/admin/booking/bookings/${id}/start`, { petId });
  return res?.data || res;
};

export const completeStaffServiceTask = async (id: string, petId?: string) => {
  const res = await apiPatch<any, { petId?: string }>(`/api/v1/admin/booking/bookings/${id}/complete`, { petId });
  return res?.data || res;
};
