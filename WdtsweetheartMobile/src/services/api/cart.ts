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
};
