import { apiGet } from './client';
import { Service, ServiceCategory, ServiceListParams } from '../../types/service';
import { env } from '../../config';
import { tokenStorage } from '../auth/token';

const buildHeaders = async () => {
  const token = await tokenStorage.get();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

export const getServices = async (params?: ServiceListParams) => {
  try {
    // Default params
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    
    const query = new URLSearchParams();
    query.append('page', page.toString());
    query.append('limit', limit.toString());
    
    if (params?.categoryId) {
      query.append('categoryId', params.categoryId);
    }
    // Note: backend expects `petTypes` query param (e.g. DOG/CAT/ALL)
    if (params?.petType) {
      query.append('petTypes', params.petType);
    }

    const queryString = query.toString();
    const path = `/api/v1/client/service?${queryString}`;
    
    console.log('Fetching services from:', `${env.apiBaseUrl}${path}`);
    
    const headers = await buildHeaders();
    const res = await fetch(`${env.apiBaseUrl}${path}`, {
      headers,
      method: 'GET',
    });

    const contentType = res.headers.get('content-type') || '';

    // If the response isn't JSON, read it as text so we can show the full error.
    if (!contentType.includes('application/json')) {
      const text = await res.text();
      console.error('Service response (non-json):', text);
      throw new Error(`Server returned non-JSON response (status ${res.status}): ${text.slice(0, 300)}`);
    }

    const json = await res.json();

    console.log('Service response:', json);

    if (!res.ok) {
      throw new Error(json?.message || `Server error (${res.status})`);
    }

    return {
      data: json.data || [],
      pagination: {
        currentPage: json.pagination?.currentPage || page,
        limit: json.pagination?.limit || limit,
        total: json.pagination?.total || 0,
        totalPages: json.pagination?.totalPages || 0,
      },
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Network error';
    console.error('getServices error:', errorMsg);
    throw new Error(errorMsg);
  }
};

export const getServiceDetail = async (id: string) => {
  return apiGet<Service>(`/api/v1/client/service/detail/${id}`);
};

export const getServiceCategories = async () => {
  return apiGet<ServiceCategory[]>('/api/v1/client/service/categories');
};
