import {
  VITE_BACKEND_URL,
  VITE_CLOUDINARY_URL,
  VITE_UPLOAD_PRESET,
  API_BASE_URL,
  API_LAN_HOST,
  FACEBOOK_APP_ID,
  GOOGLE_CLIENT_ID,
  OPENMAP_KEY,
  VNPAY_TMN_CODE,
  VNPAY_URL,
  ZALOPAY_APPID,
  ZALOPAY_DOMAIN,
  CLOUDINARY_URL,
  UPLOAD_PRESET,
} from '@env';
import { NativeModules, Platform } from 'react-native';

const API_PORT = '3000';

const normalizeUrl = (url: string) => url.replace(/\/+$/, '');

const readMetroHost = () => {
  const scriptURL = (NativeModules as any)?.SourceCode?.scriptURL as string | undefined;
  if (!scriptURL) return null;

  const match = scriptURL.match(/^https?:\/\/([^/:]+)/i);
  return match?.[1] || null;
};

const buildAutoApiBaseUrl = () => {
  const metroHost = readMetroHost();

  if (metroHost && metroHost !== 'localhost' && metroHost !== '127.0.0.1') {
    return `http://${metroHost}:${API_PORT}`;
  }

  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${API_PORT}`;
  }

  const lanHost = API_LAN_HOST?.trim();
  if (lanHost) {
    return `http://${lanHost}:${API_PORT}`;
  }

  if (metroHost) {
    return `http://${metroHost}:${API_PORT}`;
  }

  return `http://localhost:${API_PORT}`;
};

const buildApiCandidateBaseUrls = () => {
  const candidates: string[] = [];
  const add = (value?: string | null) => {
    const raw = value?.trim();
    if (!raw) return;
    const normalized = normalizeUrl(raw);
    if (!candidates.includes(normalized)) {
      candidates.push(normalized);
    }
  };

  const envApi = (VITE_BACKEND_URL?.trim() || API_BASE_URL?.trim());
  const shouldAuto = !envApi || envApi.toLowerCase() === 'auto';
  const metroHost = readMetroHost();
  const lanHost = API_LAN_HOST?.trim();

  if (!shouldAuto) {
    add(envApi);
  }

  if (Platform.OS === 'android') {
    add(`http://10.0.2.2:${API_PORT}`);
    add(`http://10.0.3.2:${API_PORT}`);
  }

  if (lanHost) {
    add(`http://${lanHost}:${API_PORT}`);
  }

  if (metroHost) {
    add(`http://${metroHost}:${API_PORT}`);
  }

  add(`http://localhost:${API_PORT}`);
  add(`http://127.0.0.1:${API_PORT}`);

  if (candidates.length === 0) {
    add(buildAutoApiBaseUrl());
  }

  return candidates;
};

const envApiBaseUrl = (VITE_BACKEND_URL?.trim() || API_BASE_URL?.trim());
const shouldAutoResolve = !envApiBaseUrl || envApiBaseUrl.toLowerCase() === 'auto';
const apiCandidateBaseUrls = buildApiCandidateBaseUrls();
const rawApiBaseUrl = shouldAutoResolve ? buildAutoApiBaseUrl() : envApiBaseUrl;
const apiBaseUrl = normalizeUrl(rawApiBaseUrl || apiCandidateBaseUrls[0]);
const localApiBaseUrl = apiCandidateBaseUrls.find((url) => url !== apiBaseUrl) ?? apiBaseUrl;

export const env = {
  apiBaseUrl,
  localApiBaseUrl,
  apiCandidateBaseUrls,
  googleClientId: GOOGLE_CLIENT_ID,
  facebookAppId: FACEBOOK_APP_ID,
  openMapKey: OPENMAP_KEY,
  goongApiKey: (OPENMAP_KEY || '').trim(),
  zalopayAppId: ZALOPAY_APPID,
  zalopayDomain: ZALOPAY_DOMAIN,
  vnpayTmnCode: VNPAY_TMN_CODE,
  vnpayUrl: VNPAY_URL,
  cloudinaryUrl: VITE_CLOUDINARY_URL || CLOUDINARY_URL || 'https://api.cloudinary.com/v1_1/dxyuuul0q/image/upload',
  uploadPreset: VITE_UPLOAD_PRESET || UPLOAD_PRESET || 'teddypet',
};
