import { apiPost, ApiResponse } from './client';
import { tokenStorage } from '../auth/token';

export type AuthUser = {
  fullName: string;
  email: string;
  phone?: string;
  avatar?: string;
};

type LoginResponse = ApiResponse<null> & {
  token?: string;
  user?: AuthUser;
};

type RegisterResponse = ApiResponse<null> & {
  token?: string;
  user?: AuthUser;
};

type SocialLoginResponse = ApiResponse<null> & {
  token?: string;
  user?: AuthUser;
};

export const login = async (email: string, password: string, rememberPassword = true) => {
  const res = (await apiPost<null, { email: string; password: string; rememberPassword?: boolean }>(
    '/api/v1/client/auth/login',
    { email, password, rememberPassword }
  )) as LoginResponse;

  if (res.token) {
    await tokenStorage.set(res.token);
  }

  return res.user ?? null;
};

export const register = async (payload: {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}) => {
  const res = (await apiPost<null, typeof payload>('/api/v1/client/auth/register', payload)) as RegisterResponse;
  return res;
};

export const forgotPassword = async (email: string) => {
  return apiPost<null, { email: string }>('/api/v1/client/auth/forgot-password', { email });
};

export const verifyOTP = async (email: string, otp: string) => {
  return apiPost<null, { email: string; otp: string }>('/api/v1/client/auth/otp-password', { email, otp });
};

export const resetPassword = async (password: string) => {
  return apiPost<null, { password: string }>('/api/v1/client/auth/reset-password', { password });
};

export const logout = async () => {
  await apiPost<null, Record<string, never>>('/api/v1/client/auth/logout', {});
  await tokenStorage.clear();
};

export const loginWithGoogleToken = async (payload: {
  accessToken?: string;
  idToken?: string;
  authCode?: string;
  redirectUri?: string;
}) => {
  const res = (await apiPost<null, typeof payload>(
    '/api/v1/client/auth/google/token',
    payload
  )) as SocialLoginResponse;

  if (!res.success) {
    throw new Error(res.message || 'Đăng nhập Google thất bại!');
  }

  if (res.token) {
    await tokenStorage.set(res.token);
  }

  return res.user ?? null;
};

export const loginWithFacebookToken = async (payload: { accessToken: string }) => {
  const res = (await apiPost<null, typeof payload>(
    '/api/v1/client/auth/facebook/token',
    payload
  )) as SocialLoginResponse;

  if (!res.success) {
    throw new Error(res.message || 'Đăng nhập Facebook thất bại!');
  }

  if (res.token) {
    await tokenStorage.set(res.token);
  }

  return res.user ?? null;
};
