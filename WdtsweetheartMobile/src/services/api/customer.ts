import { apiGet } from './client';

export type Customer = {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  avatar?: string;
  gender?: 'male' | 'female' | 'other';
  birthday?: string;
};

export type CustomerListResponse = {
  recordList: Customer[];
  statusCounts: { all: number; active: number; inactive: number };
  pagination: { totalRecords: number; totalPages: number; currentPage: number; limit: number };
};

export const getCustomers = async (params?: { 
  page?: number; 
  limit?: number; 
  q?: string; 
  status?: string; 
}) => {
  // Build params object – omit undefined so URLSearchParams doesn't add "undefined"
  const cleanParams: Record<string, string> = {};
  if (params?.page) cleanParams.page = String(params.page);
  if (params?.limit) cleanParams.limit = String(params.limit);
  if (params?.q) cleanParams.q = params.q;
  if (params?.status && params.status !== 'all') cleanParams.status = params.status;

  const query = new URLSearchParams(cleanParams).toString();
  const url = `/api/v1/admin/account-user/list${query ? '?' + query : ''}`;
  
  console.log('[customer API] GET', url);
  const data = await apiGet<CustomerListResponse>(url);
  console.log('[customer API] raw data:', JSON.stringify(data)?.slice(0, 200));
  
  return data;
};

export const getCustomerDetail = async (id: string) => {
  const data = await apiGet<Customer>(`/api/v1/admin/account-user/detail/${id}`);
  return data;
};
