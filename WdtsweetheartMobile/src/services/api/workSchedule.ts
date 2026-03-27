import { apiGet, apiPatch, ApiResponse } from './client';

export type WorkSchedule = {
  _id: string;
  staffId: any;
  date: string;
  shiftId: {
    _id: string;
    name: string;
    startTime: string;
    endTime: string;
    color?: string;
  };
  status: 'scheduled' | 'checked-in' | 'checked-out' | 'absent';
  checkInTime?: string;
  checkOutTime?: string;
  note?: string;
};

export const getMySchedules = async (params?: { startDate?: string; endDate?: string }) => {
  const query = params ? `?startDate=${params.startDate}&endDate=${params.endDate}` : '';
  const data = await apiGet<any>(`/api/v1/admin/schedules/my-schedule${query}`);
  return data || [];
};

export const checkInSchedule = async (id: string) => {
  const res = await apiPatch<any>(`/api/v1/admin/schedules/check-in/${id}`, {});
  return res.data;
};

export const checkOutSchedule = async (id: string) => {
  const res = await apiPatch<any>(`/api/v1/admin/schedules/check-out/${id}`, {});
  return res.data;
};

export const getCalendarData = async (month?: number, year?: number) => {
  const query = `?month=${month}&year=${year}`;
  const data = await apiGet<any>(`/api/v1/admin/schedules/calendar${query}`);
  return data || [];
};
