<<<<<<< HEAD
import { apiPostRaw } from './client';

export type CartItemRequest = {
  productId: string;
  quantity: number;
  variant?: Array<{ attrId: string; value: string; label?: string }>;
};

export type CartListResponse = {
  success: boolean;
  code: string;
  message: string;
  cart: Array<{
    productId: string;
    quantity: number;
    variant?: Array<{ attrId: string; value: string; label?: string }>;
    detail?: {
      images?: string[];
      slug?: string;
      name?: string;
      priceNew?: number;
      priceOld?: number;
      stock?: number;
    };
  }>;
  shippingOptions: Array<{
    id?: string;
    rate?: string;
    carrier?: string;
    carrier_short_name?: string;
    fee?: number;
  }> | null;
};

export const getCartDetail = async (payload: {
  cart: CartItemRequest[];
  userAddress?: { latitude: number; longitude: number };
}) => {
  return apiPostRaw<CartListResponse, typeof payload>('/api/v1/client/cart/list', payload);
=======
import { apiPost } from './client';

export type CartVariant = {
  attrId: string;
  value: string;
};

export type CartPayloadItem = {
  productId: string;
  quantity: number;
  variant?: CartVariant[];
};

export type UserAddress = {
  latitude: number;
  longitude: number;
};

export type CartDetail = {
  // server response fields; adapt as needed
  productId: string;
  quantity: number;
  detail: {
    images?: string[];
    slug?: string;
    name: string;
    priceNew?: number;
    priceOld?: number;
    stock?: number;
    attributeList?: unknown[];
    variants?: unknown[];
  };
};

export type CartListResponse = {
  cart: CartDetail[];
  shippingOptions?: any;
};

export const fetchCartList = async (
  items: CartPayloadItem[],
  userAddress?: UserAddress
): Promise<CartListResponse> => {
  const res = await apiPost<CartListResponse>('/api/v1/client/cart/list', {
    cart: items,
    userAddress,
  });
  // apiPost wraps result in ApiResponse; ensure data exists
  if (!res.data) {
    throw new Error('Empty response from cart list');
  }
  return res.data;
>>>>>>> Quan
};
