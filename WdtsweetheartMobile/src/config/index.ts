import {
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
  const lanHost = API_LAN_HOST?.trim();
  if (lanHost) {
    return `http://${lanHost}:${API_PORT}`;
  }

  const metroHost = readMetroHost();

  // On Android emulator, always use the special host IP to reach the dev machine.
  // This avoids cases where metroHost is a LAN IP that the emulator can't resolve.
  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${API_PORT}`;
  }

  if (metroHost) {
    return `http://${metroHost}:${API_PORT}`;
  }

  return `http://localhost:${API_PORT}`;
};

const envApiBaseUrl = API_BASE_URL?.trim();
const shouldAutoResolve = !envApiBaseUrl || envApiBaseUrl.toLowerCase() === 'auto';
const rawApiBaseUrl = shouldAutoResolve ? buildAutoApiBaseUrl() : envApiBaseUrl;
const apiBaseUrl = normalizeUrl(rawApiBaseUrl);
const localApiBaseUrl = normalizeUrl(buildAutoApiBaseUrl());

export const env = {
  apiBaseUrl,
  localApiBaseUrl,
  googleClientId: GOOGLE_CLIENT_ID,
  facebookAppId: FACEBOOK_APP_ID,
  openMapKey: OPENMAP_KEY,
  zalopayAppId: ZALOPAY_APPID,
  zalopayDomain: ZALOPAY_DOMAIN,
  vnpayTmnCode: VNPAY_TMN_CODE,
  vnpayUrl: VNPAY_URL,
  cloudinaryUrl: CLOUDINARY_URL || 'https://api.cloudinary.com/v1_1/dxyuuul0q/image/upload',
  uploadPreset: UPLOAD_PRESET || 'teddypet',
};
