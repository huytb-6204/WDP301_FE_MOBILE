import { apiDeleteRaw, apiGetRaw, apiPatchRaw, apiPostRaw } from './client';
import type { Booking, CreateBookingPayload, Pet, ServiceItem, ShiftSlotGroup } from '../../types';

type CodeResponse<T> = {
  code: number | string;
  message: string;
  data: T;
  pagination?: {
    currentPage: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

type CreatePetPayload = {
  name: string;
  type: 'dog' | 'cat';
  breed?: string;
  weight: number;
  age?: number;
  color?: string;
  gender?: 'male' | 'female' | 'unknown';
  notes?: string;
  avatar?: string;
};

const assertSuccess = <T>(res: CodeResponse<T>) => {
  if (res.code !== 200 && res.code !== 201) {
    throw new Error(res.message || 'Request failed');
  }
  return res;
};

export const getServices = async (params?: { petType?: 'DOG' | 'CAT' | 'ALL' }) => {
  const search = new URLSearchParams();
  if (params?.petType && params.petType !== 'ALL') {
    search.set('petTypes', params.petType);
  }
  const query = search.toString();
  const res = await apiGetRaw<CodeResponse<ServiceItem[]>>(
    `/api/v1/client/booking/services${query ? `?${query}` : ''}`
  );
  return assertSuccess(res);
};

export const getTimeSlots = async (params: { serviceId?: string; date?: string; count?: number; petIds?: string[] }) => {
  const search = new URLSearchParams();
  if (params.serviceId) search.set('serviceId', params.serviceId);
  if (params.date) search.set('date', params.date);
  if (params.count) search.set('count', String(params.count));
  if (params.petIds && params.petIds.length > 0) search.set('petIds', params.petIds.join(','));
  const query = search.toString();

  const res = await apiGetRaw<CodeResponse<{ shifts: ShiftSlotGroup[] }>>(
    `/api/v1/client/booking/time-slots${query ? `?${query}` : ''}`
  );
  return assertSuccess(res);
};

export const getMyPets = async () => {
  const res = await apiGetRaw<CodeResponse<Pet[]>>('/api/v1/client/pet/my-pets');
  return assertSuccess(res);
};

export const getMyPet = async (id: string) => {
  const res = await apiGetRaw<CodeResponse<Pet>>(`/api/v1/client/pet/my-pets/${id}`);
  return assertSuccess(res);
};

export const createPet = async (payload: CreatePetPayload) => {
  const res = await apiPostRaw<CodeResponse<Pet>, CreatePetPayload>('/api/v1/client/pet/my-pets', payload);
  return assertSuccess(res);
};

export const updateMyPet = async (id: string, payload: Partial<CreatePetPayload>) => {
  const res = await apiPatchRaw<CodeResponse<Pet>, Partial<CreatePetPayload>>(
    `/api/v1/client/pet/my-pets/${id}`,
    payload
  );
  return assertSuccess(res);
};

export const deleteMyPet = async (id: string) => {
  const res = await apiDeleteRaw<CodeResponse<undefined>>(`/api/v1/client/pet/my-pets/${id}`);
  return assertSuccess(res);
};

export const createBooking = async (payload: CreateBookingPayload) => {
  const res = await apiPostRaw<CodeResponse<Booking>, CreateBookingPayload>(
    '/api/v1/client/booking/bookings',
    payload
  );
  return assertSuccess(res);
};

export const getMyBookings = async (params?: { status?: string; page?: number; limit?: number }) => {
  const search = new URLSearchParams();
  if (params?.status) search.set('status', params.status);
  if (params?.page) search.set('page', String(params.page));
  if (params?.limit) search.set('limit', String(params.limit));
  const query = search.toString();

  const res = await apiGetRaw<CodeResponse<Booking[]>>(
    `/api/v1/client/booking/bookings${query ? `?${query}` : ''}`
  );
  return assertSuccess(res);
};

export const cancelBooking = async (id: string, reason?: string) => {
  const res = await apiPatchRaw<CodeResponse<Booking>, { reason?: string }>(
    `/api/v1/client/booking/bookings/${id}/cancel`,
    { reason }
  );
  return assertSuccess(res);
};
