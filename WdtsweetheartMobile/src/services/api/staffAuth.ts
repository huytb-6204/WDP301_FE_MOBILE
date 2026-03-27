import { apiPost, ApiResponse } from './client';
import { tokenStorage } from '../auth/token';

export type StaffUser = {
  id: string;
  fullName: string;
  email: string;
  avatar?: string;
  permissions: string[];
  roles?: any[];
};

type StaffLoginResponse = ApiResponse<null> & {
  data?: StaffUser & { token: string };
};

export const staffLogin = async (email: string, password: string) => {
  const res = (await apiPost<null, any>('/api/v1/admin/auth/login', {
    email,
    password,
  })) as any;

  console.log('[DEBUG] Full Admin Login Response:', JSON.stringify(res, null, 2));

  // From debug: token is in res.data.token. res.data itself is the user profile.
  const token = res.token ?? res.data?.token;
  const user = res.user ?? res.data ?? null;

  if (token) {
    await tokenStorage.set(token);
  }

  return user;
};

export const getStaffMe = async () => {
  const res = (await apiPost<null, any>('/api/v1/admin/auth/me', {})) as StaffLoginResponse;
  return res.data ?? null;
};
