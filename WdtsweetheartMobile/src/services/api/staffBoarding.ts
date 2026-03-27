import { apiGet, apiPut, ApiResponse } from './client';

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
};

export const getStaffBoardingBookings = async (params?: { limit?: number; page?: number }) => {
  const query = params ? `?limit=${params.limit || 1000}&page=${params.page || 1}` : '';
  return apiGet<BoardingBooking[]>(`/api/v1/admin/boarding-booking${query}`);
};

export const updateStaffCareSchedule = async (id: string, payload: any) => {
  const res = (await apiPut<any>(`/api/v1/admin/boarding-booking/update-care-schedule/${id}`, payload)) as ApiResponse<any>;
  return res.data;
};

export const getStaffMeData = async () => {
  return apiGet<any>('/api/v1/admin/auth/me');
};

export const getBoardingStats = async (date: string) => {
  return apiGet<any>(`/api/v1/admin/dashboard/boarding-stats?date=${date}`);
};
