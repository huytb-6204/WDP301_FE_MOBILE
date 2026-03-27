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

/**
 * Handles error messages from server responses
 * Avoids showing raw HTML to the user
 */
const getErrorMessage = async (res: Response): Promise<string> => {
    try {
        const text = await res.text();
        if (text.trim().startsWith('<!DOCTYPE html>') || text.trim().startsWith('<html>')) {
            return `Lỗi hệ thống (${res.status}). Vui lòng liên hệ kỹ thuật.`;
        }
        
        try {
            const json = JSON.parse(text);
            return json.message || json.error || `Yêu cầu thất bại (${res.status})`;
        } catch {
            return text.slice(0, 100) || `Yêu cầu thất bại (${res.status})`;
        }
    } catch {
        return `Yêu cầu thất bại (${res.status})`;
    }
};

const parseJsonSafely = async <T>(res: Response): Promise<ApiResponse<T> | null> => {
  const text = await res.text();
  if (!text) return null;
  
  if (text.trim().startsWith('<!DOCTYPE html>') || text.trim().startsWith('<html>')) {
    throw new Error(`Lỗi máy chủ (${res.status}). Vui lòng thử lại sau.`);
  }

  try {
    return JSON.parse(text) as ApiResponse<T>;
  } catch {
    throw new Error('Dữ liệu phản hồi không đúng định dạng.');
  }
};

export const apiGet = async <T>(path: string): Promise<T> => {
  const headers = await buildHeaders();
  const res = await fetch(`${env.apiBaseUrl}${path}`, { headers });
  
  if (!res.ok) {
    const errorMsg = await getErrorMessage(res);
    throw new Error(errorMsg);
  }

  const json = await parseJsonSafely<any>(res);
  return (json?.data ?? []) as T;
};

export const apiPost = async <T, B = unknown>(path: string, body: B): Promise<ApiResponse<T>> => {
  const headers = await buildHeaders();
  const res = await fetch(`${env.apiBaseUrl}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorMsg = await getErrorMessage(res);
    throw new Error(errorMsg);
  }

  const json = await parseJsonSafely<any>(res);
  return json as ApiResponse<T>;
};

export const apiPostRaw = async <T, B = unknown>(path: string, body: B): Promise<T> => {
    const headers = await buildHeaders();
    const res = await fetch(`${env.apiBaseUrl}${path}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
  
    if (!res.ok) {
      const errorMsg = await getErrorMessage(res);
      throw new Error(errorMsg);
    }
  
    const text = await res.text();
    return JSON.parse(text) as T;
};

export const apiGetRaw = async <T>(path: string): Promise<T> => {
    const headers = await buildHeaders();
    const res = await fetch(`${env.apiBaseUrl}${path}`, { headers });
  
    if (!res.ok) {
      const errorMsg = await getErrorMessage(res);
      throw new Error(errorMsg);
    }
  
    const text = await res.text();
    return JSON.parse(text) as T;
};

export const apiPatch = async <T, B = unknown>(path: string, body: B): Promise<ApiResponse<T>> => {
  const headers = await buildHeaders();
  const res = await fetch(`${env.apiBaseUrl}${path}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorMsg = await getErrorMessage(res);
    throw new Error(errorMsg);
  }

  const json = await parseJsonSafely<any>(res);
  return json as ApiResponse<T>;
};

export const apiDelete = async <T>(path: string): Promise<ApiResponse<T>> => {
  const headers = await buildHeaders();
  const res = await fetch(`${env.apiBaseUrl}${path}`, {
    method: 'DELETE',
    headers,
  });

  if (!res.ok) {
    const errorMsg = await getErrorMessage(res);
    throw new Error(errorMsg);
  }

  const json = await parseJsonSafely<any>(res);
  return json as ApiResponse<T>;
};

export const apiPut = async <T, B = unknown>(path: string, body: B): Promise<ApiResponse<T>> => {
  const headers = await buildHeaders();
  const res = await fetch(`${env.apiBaseUrl}${path}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorMsg = await getErrorMessage(res);
    throw new Error(errorMsg);
  }

  const json = await parseJsonSafely<any>(res);
  return json as ApiResponse<T>;
};
