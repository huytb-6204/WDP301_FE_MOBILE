import { apiGet, apiPost, apiPatch, apiDelete } from './client';

export interface Pet {
  _id: string;
  name: string;
  type: "dog" | "cat";
  breed?: string;
  weight?: number;
  age?: number;
  color?: string;
  gender?: "male" | "female";
  notes?: string;
  avatar?: string;
  healthStatus?: "accepted" | "rejected";
  status: string;
}

export interface PetPayload {
  name: string;
  type: "dog" | "cat";
  breed?: string;
  weight?: number;
  age?: number;
  color?: string;
  gender?: "male" | "female";
  healthStatus?: "accepted" | "rejected";
  notes?: string;
  avatar?: string;
}

export const getMyPets = async () => {
  return apiGet<Pet[]>('/api/v1/client/pet/my-pets');
};

export const getPetDetail = async (id: string) => {
  return apiGet<Pet>(`/api/v1/client/pet/my-pets/${id}`);
};

export const createMyPet = async (data: PetPayload) => {
  return apiPost<Pet>('/api/v1/client/pet/my-pets', data);
};

export const updateMyPet = async (id: string, data: Partial<PetPayload>) => {
  return apiPatch<Pet>(`/api/v1/client/pet/my-pets/${id}`, data);
};

export const deletePet = async (id: string) => {
  return apiDelete<any>(`/api/v1/client/pet/my-pets/${id}`);
};
