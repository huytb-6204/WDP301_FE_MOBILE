import { apiGet, apiPost, apiPatch, apiDelete, ApiResponse } from './client';

export interface FoodTemplate {
  _id: string;
  name: string;
  group: string;
  petType: "dog" | "cat" | "all";
  brand?: string;
  ageGroup?: "puppy" | "adult" | "senior" | "all";
  description?: string;
  isActive: boolean;
}

export interface ExerciseTemplate {
  _id: string;
  name: string;
  petType: "dog" | "cat" | "all";
  durationMinutes: number;
  intensity: "low" | "medium" | "high";
  description?: string;
  isActive: boolean;
}

export const getFoodTemplates = async (params?: { petType?: string; group?: string }) => {
  const query = new URLSearchParams(params as any).toString();
  const data = await apiGet<FoodTemplate[]>(`/api/v1/admin/pet-care-template/food?${query}`);
  return data || [];
};

export const createFoodTemplate = async (body: Partial<FoodTemplate>) => {
  const res = await apiPost('/api/v1/admin/pet-care-template/food', body);
  return res.data;
};

export const updateFoodTemplate = async (id: string, body: Partial<FoodTemplate>) => {
  const res = await apiPatch(`/api/v1/admin/pet-care-template/food/${id}`, body);
  return res.data;
};

export const deleteFoodTemplate = async (id: string) => {
  const res = await apiDelete(`/api/v1/admin/pet-care-template/food/${id}`);
  return res.data;
};

export const getExerciseTemplates = async (params?: { petType?: string; intensity?: string }) => {
  const query = new URLSearchParams(params as any).toString();
  const data = await apiGet<ExerciseTemplate[]>(`/api/v1/admin/pet-care-template/exercise?${query}`);
  return data || [];
};

export const createExerciseTemplate = async (body: Partial<ExerciseTemplate>) => {
  const res = await apiPost('/api/v1/admin/pet-care-template/exercise', body);
  return res.data;
};

export const updateExerciseTemplate = async (id: string, body: Partial<ExerciseTemplate>) => {
  const res = await apiPatch(`/api/v1/admin/pet-care-template/exercise/${id}`, body);
  return res.data;
};

export const deleteExerciseTemplate = async (id: string) => {
  const res = await apiDelete(`/api/v1/admin/pet-care-template/exercise/${id}`);
  return res.data;
};
