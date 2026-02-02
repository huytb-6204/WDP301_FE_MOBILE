import { env } from '../../config';
import { tokenStorage } from '../auth/token';

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
  token?: string;
  user?: unknown;
};

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

const parseJsonSafely = async <T>(res: Response): Promise<ApiResponse<T> | null> => {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as ApiResponse<T>;
  } catch {
    throw new Error(text.slice(0, 200));
  }
};

export const apiGet = async <T>(path: string): Promise<T> => {
  const headers = await buildHeaders();
  const res = await fetch(`${env.apiBaseUrl}${path}`, { headers });
  const json = await parseJsonSafely<T>(res);

  if (!json || !res.ok || !json.success) {
    throw new Error(json?.message || `Request failed (${res.status})`);
  }

  return (json.data ?? []) as T;
};

export const apiPost = async <T, B = unknown>(path: string, body: B): Promise<ApiResponse<T>> => {
  const headers = await buildHeaders();
  const res = await fetch(`${env.apiBaseUrl}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  const json = await parseJsonSafely<T>(res);

  if (!json || !res.ok || !json.success) {
    throw new Error(json?.message || `Request failed (${res.status})`);
  }

  return json;
};
