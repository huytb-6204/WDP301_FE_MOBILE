import {
  API_BASE_URL,
  OPENMAP_KEY,
  VNPAY_TMN_CODE,
  VNPAY_URL,
  ZALOPAY_APPID,
  ZALOPAY_DOMAIN,
} from '@env';

const fallbackApiBaseUrl = 'http://10.0.2.2:3000';
const rawApiBaseUrl = API_BASE_URL || fallbackApiBaseUrl;
const apiBaseUrl = rawApiBaseUrl.replace(/\/+$/, '');

export const env = {
  apiBaseUrl,
  openMapKey: OPENMAP_KEY,
  zalopayAppId: ZALOPAY_APPID,
  zalopayDomain: ZALOPAY_DOMAIN,
  vnpayTmnCode: VNPAY_TMN_CODE,
  vnpayUrl: VNPAY_URL,
};
