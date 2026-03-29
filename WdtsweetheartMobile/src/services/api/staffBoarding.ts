import { apiGet, apiPatch } from './client';

export type FeedingItem = {
  _id?: string;
  time: string;
  food: string;
  amount: string;
  note?: string;
  status: 'pending' | 'done' | 'skipped';
  staffId?: string;
  staffName?: string;
  proofMedia?: Array<{ url: string; kind: 'image' | 'video' }>;
};

export type ExerciseItem = {
  _id?: string;
  time: string;
  activity: string;
  durationMinutes: number;
  note?: string;
  status: 'pending' | 'done' | 'skipped';
  staffId?: string;
  staffName?: string;
  proofMedia?: Array<{ url: string; kind: 'image' | 'video' }>;
};

export type BoardingBooking = {
  _id: string;
  code: string;
  checkInDate: string;
  checkOutDate: string;
  fullName: string;
  phone: string;
  email: string;
  boardingStatus: string;
  paymentStatus: string;
  petIds: any[];
  cageId?: any;
  feedingSchedule?: FeedingItem[];
  exerciseSchedule?: ExerciseItem[];
  scheduleSummary?: {
    feedingCount: number;
    exerciseCount: number;
    hasMyAssigned: boolean;
  };
  userId?: any;
  actualCheckInDate?: string;
  actualCheckOutDate?: string;
  notes?: string;
  specialCare?: string;
  total?: number;
  paidAmount?: number;
  depositAmount?: number;
  numberOfDays?: number;
};

export const getStaffBoardingBookings = async (params?: { limit?: number; page?: number }) => {
  const query = params ? `?limit=${params.limit || 1000}&page=${params.page || 1}` : '';
  const data = await apiGet<any>(`/api/v1/admin/boarding-booking${query}`);
  return data?.recordList || data || [];
};

export const getCages = async (params?: { limit?: number; page?: number }) => {
  const query = new URLSearchParams(params as any).toString();
  const data = await apiGet<any>(`/api/v1/admin/boarding-cage?${query}`);
  return data?.recordList || data || [];
};


export const updateStaffCareSchedule = async (id: string, payload: any) => {
  const res = await apiPatch<any>(`/api/v1/admin/boarding-booking/${id}/care-schedule`, payload);
  return res.data;
};

export const getStaffBoardingBookingDetail = async (id: string) => {
  const data = await apiGet<any>(`/api/v1/admin/boarding-booking/${id}`);
  return data as BoardingBooking;
};

export const updateStaffBoardingBookingStatus = async (id: string, boardingStatus: string) => {
  const res = await apiPatch<any>(`/api/v1/admin/boarding-booking/${id}/status`, { boardingStatus });
  return res.data;
};

export const updateStaffBoardingPaymentStatus = async (id: string, paymentStatus: string) => {
  const res = await apiPatch<any>(`/api/v1/admin/boarding-booking/${id}/payment-status`, { paymentStatus });
  return res.data;
};

export const getStaffMeData = async () => {
    const data = await apiGet<any>('/api/v1/admin/auth/me');
    return data;
};
