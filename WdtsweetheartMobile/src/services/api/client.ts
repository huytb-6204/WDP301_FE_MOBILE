import { env } from '../../config';
import { tokenStorage } from '../auth/token';

export type ApiResponse<T> = {
  success?: boolean;
  message?: string;
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

const getBaseUrls = () => {
  const candidates = env.apiCandidateBaseUrls;
  if (Array.isArray(candidates) && candidates.length > 0) {
    return candidates;
  }

  const primary = env.apiBaseUrl;
  const local = env.localApiBaseUrl;

  if (!local || local === primary) return [primary];
  return [primary, local];
};

const isRetryableStatus = (status: number) => [502, 503, 504].includes(status);

const requestWithFallback = async (path: string, init?: RequestInit) => {
  const baseUrls = getBaseUrls();
  let lastError: unknown;

  for (let index = 0; index < baseUrls.length; index += 1) {
    const baseUrl = baseUrls[index];

    try {
      const response = await fetch(`${baseUrl}${path}`, init);
      const canRetry = index < baseUrls.length - 1;

      if (response.ok || !canRetry || !isRetryableStatus(response.status)) {
        return response;
      }
    } catch (error) {
      lastError = error;

      if (index === baseUrls.length - 1) {
        break;
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Khong the ket noi may chu.');
};

const readJson = async <T>(res: Response): Promise<T | null> => {
  const text = await res.text();
  if (!text) return null;

  if (text.trim().startsWith('<!DOCTYPE html>') || text.trim().startsWith('<html>')) {
    throw new Error(`Loi may chu (${res.status}). Vui long thu lai sau.`);
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error('Du lieu phan hoi khong dung dinh dang.');
  }
};

const getErrorMessage = async (res: Response) => {
  try {
    const text = await res.text();

    if (!text.trim()) {
      return `Request failed (${res.status})`;
    }

    if (text.includes('ERR_NGROK_3200')) {
      return 'Duong ham API tam thoi khong kha dung.';
    }

    if (text.trim().startsWith('<!DOCTYPE html>') || text.trim().startsWith('<html>')) {
      return `Loi he thong (${res.status}).`;
    }

    try {
      const json = JSON.parse(text) as ApiResponse<unknown> & { error?: string };
      return json.message || json.error || `Request failed (${res.status})`;
    } catch {
      return text.slice(0, 160);
    }
  } catch {
    return `Request failed (${res.status})`;
  }
};

export const apiGet = async <T>(path: string): Promise<T> => {
  const headers = await buildHeaders();
  const res = await requestWithFallback(path, { headers });

  if (!res.ok) {
    throw new Error(await getErrorMessage(res));
  }

  const json = await readJson<ApiResponse<T>>(res);
  return (json?.data ?? (json as unknown as T)) as T;
};

export const apiGetRaw = async <T>(path: string): Promise<T> => {
  const headers = await buildHeaders();
  const res = await requestWithFallback(path, { headers });

  if (!res.ok) {
    throw new Error(await getErrorMessage(res));
  }

  const json = await readJson<T>(res);
  return (json ?? ({} as T)) as T;
};

export const apiPost = async <T, B = unknown>(path: string, body: B): Promise<ApiResponse<T>> => {
  const headers = await buildHeaders();
  const res = await requestWithFallback(path, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(await getErrorMessage(res));
  }

  const json = await readJson<ApiResponse<T>>(res);
  return (json ?? {}) as ApiResponse<T>;
};

export const apiPostRaw = async <T, B = unknown>(path: string, body: B): Promise<T> => {
  const headers = await buildHeaders();
  const res = await requestWithFallback(path, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(await getErrorMessage(res));
  }

  const json = await readJson<T>(res);
  return (json ?? ({} as T)) as T;
};

export const apiPatch = async <T, B = unknown>(path: string, body: B): Promise<ApiResponse<T>> => {
  const headers = await buildHeaders();
  const res = await requestWithFallback(path, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(await getErrorMessage(res));
  }

  const json = await readJson<ApiResponse<T>>(res);
  return (json ?? {}) as ApiResponse<T>;
};

export const apiPatchRaw = async <T, B = unknown>(path: string, body: B): Promise<T> => {
  const headers = await buildHeaders();
  const res = await requestWithFallback(path, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(await getErrorMessage(res));
  }

  const json = await readJson<T>(res);
  return (json ?? ({} as T)) as T;
};

export const apiDelete = async <T>(path: string): Promise<ApiResponse<T>> => {
  const headers = await buildHeaders();
  const res = await requestWithFallback(path, {
    method: 'DELETE',
    headers,
  });

  if (!res.ok) {
    throw new Error(await getErrorMessage(res));
  }

  const json = await readJson<ApiResponse<T>>(res);
  return (json ?? {}) as ApiResponse<T>;
};

export const apiDeleteRaw = async <T>(path: string): Promise<T> => {
  const headers = await buildHeaders();
  const res = await requestWithFallback(path, {
    method: 'DELETE',
    headers,
  });

  if (!res.ok) {
    throw new Error(await getErrorMessage(res));
  }

  const json = await readJson<T>(res);
  return (json ?? ({} as T)) as T;
};

export const apiPut = async <T, B = unknown>(path: string, body: B): Promise<ApiResponse<T>> => {
  const headers = await buildHeaders();
  const res = await requestWithFallback(path, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(await getErrorMessage(res));
  }

  const json = await readJson<ApiResponse<T>>(res);
  return (json ?? {}) as ApiResponse<T>;
};
