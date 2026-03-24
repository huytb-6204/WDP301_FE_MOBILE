import { apiGetRaw, apiPostRaw } from './client';

export type PublicCoupon = {
  _id: string;
  code: string;
  name: string;
  typeDiscount: 'percentage' | 'fixed';
  value: number;
  maxDiscountValue?: number;
  minOrderValue?: number;
  endDate?: string;
  endDateFormat?: string;
  typeDisplay?: string;
};

export type CouponListResponse = {
  success: boolean;
  message: string;
  data?: PublicCoupon[];
};

export type CouponCheckResponse = {
  success: boolean;
  message: string;
  data?: {
    code: string;
    typeDiscount: 'percentage' | 'fixed';
    value: number;
    maxDiscountValue?: number;
    discountAmount: number;
  };
};

export const getClientCoupons = async () => {
  return apiGetRaw<CouponListResponse>('/api/v1/client/coupon/list');
};

export const checkCoupon = async (payload: { code: string; orderValue: number }) => {
  return apiPostRaw<CouponCheckResponse, { code: string; orderValue: number }>(
    '/api/v1/client/coupon/check',
    payload
  );
};
