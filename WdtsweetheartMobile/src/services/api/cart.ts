import { apiPostRaw } from './client';

export type CartVariant = {
  attrId: string;
  value: string;
  label?: string;
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
  productId: string;
  quantity: number;
  variant?: CartVariant[];
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
  canUsePoint?: number;
  totalPoint?: number;
  usedPoint?: number;
  POINT_TO_MONEY?: number;
  MONEY_PER_POINT?: number;
};

export const fetchCartList = async (
  items: CartPayloadItem[],
  userAddress?: UserAddress
): Promise<CartListResponse> => {
  const res = await apiPostRaw<any>('/api/v1/client/cart/list', {
    cart: items,
    userAddress,
  });

  const normalized = Array.isArray(res?.cart)
    ? res
    : Array.isArray(res?.data?.cart)
      ? res.data
      : null;

  if (!normalized || !Array.isArray(normalized.cart)) {
    throw new Error('Empty response from cart list');
  }

  return normalized as CartListResponse;
};

export const getCartDetail = async (payload: {
  cart: CartPayloadItem[];
  userAddress?: UserAddress;
}): Promise<CartListResponse> => {
  return fetchCartList(payload.cart, payload.userAddress);
};
