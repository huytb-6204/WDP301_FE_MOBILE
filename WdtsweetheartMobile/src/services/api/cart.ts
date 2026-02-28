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
};
