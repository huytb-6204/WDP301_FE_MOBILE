import { apiGet } from './client';

export type FoodTemplate = {
  _id: string;
  name: string;
  group?: string;
  petType?: string;
  brand?: string;
  ageGroup?: string;
  description?: string;
  isActive?: boolean;
};

export type ExerciseTemplate = {
  _id: string;
  name: string;
  petType?: string;
  durationMinutes?: number;
  intensity?: string;
  description?: string;
  isActive?: boolean;
};

export const getFoodTemplates = async (params?: { petType?: string; group?: string; isActive?: boolean }) => {
  const query = new URLSearchParams();
  if (params?.petType) query.append('petType', params.petType);
  if (params?.group) query.append('group', params.group);
  if (typeof params?.isActive === 'boolean') query.append('isActive', String(params.isActive));
  const suffix = query.toString() ? `?${query.toString()}` : '';
  const data = await apiGet<FoodTemplate[]>(`/api/v1/admin/pet-care-template/food${suffix}`);
  return Array.isArray(data) ? data : [];
};

export const getExerciseTemplates = async (params?: { petType?: string; intensity?: string }) => {
  const query = new URLSearchParams();
  if (params?.petType) query.append('petType', params.petType);
  if (params?.intensity) query.append('intensity', params.intensity);
  const suffix = query.toString() ? `?${query.toString()}` : '';
  const data = await apiGet<ExerciseTemplate[]>(`/api/v1/admin/pet-care-template/exercise${suffix}`);
  return Array.isArray(data) ? data : [];
};
