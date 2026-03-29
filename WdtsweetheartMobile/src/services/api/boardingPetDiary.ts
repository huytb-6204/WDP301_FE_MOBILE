import { apiGet, apiPostRaw } from './client';

export type BoardingPetDiaryRecord = {
  _id: string;
  bookingId: string;
  petId: string;
  date: string;
  meal: string;
  eatingStatus?: string;
  digestionStatus?: string;
  moodStatus?: string;
  note?: string;
  proofMedia?: Array<{ url: string; kind: 'image' | 'video' }>;
  staffId?: string;
  staffName?: string;
  createdAt?: string;
  updatedAt?: string;
};

export const getBoardingPetDiaries = async (params: { bookingId: string; petId: string; date?: string }) => {
  const query = new URLSearchParams();
  query.append('bookingId', params.bookingId);
  query.append('petId', params.petId);
  if (params.date) query.append('date', params.date);
  const res = await apiGet<{ data?: BoardingPetDiaryRecord[] } | BoardingPetDiaryRecord[]>(
    `/api/v1/admin/boarding-pet-diary?${query.toString()}`
  );
  if (Array.isArray(res)) return res;
  return Array.isArray(res?.data) ? res.data : [];
};

export const upsertBoardingPetDiary = async (payload: {
  bookingId: string;
  petId: string;
  date: string;
  meal: string;
  eatingStatus: string;
  digestionStatus: string;
  moodStatus: string;
  note?: string;
  proofMedia?: Array<{ url: string; kind: 'image' | 'video' }>;
}) => {
  return apiPostRaw<{ data?: BoardingPetDiaryRecord; message?: string }>('/api/v1/admin/boarding-pet-diary/upsert', payload);
};
