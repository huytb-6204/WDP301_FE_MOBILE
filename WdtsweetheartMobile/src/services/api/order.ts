import { apiGetRaw, apiPatchRaw, apiPostRaw } from './client';

export type CreateOrderItem = {
  productId: string;
  quantity: number;
  variant?: Array<{ attrId: string; value: string; label?: string }>;
};

export type CreateOrderPayload = {
  fullName: string;
  phone: string;
  address: string;
  latitude: number;
  longitude: number;
  note?: string;
  coupon?: string;
  usedPoint?: number;
  shippingMethod: string;
  paymentMethod: 'money' | 'zalopay' | 'vnpay' | 'COD' | 'ZALOPAY' | 'VNPAY';
  items: CreateOrderItem[];
};

export type CreateOrderResponse = {
  code: 'success' | 'error';
  message: string;
  orderCode?: string;
  phone?: string;
};

export type OrderSuccessItem = {
  productId: string;
  quantity: number;
  price: number;
  name: string;
  variant?: string[];
};

export type OrderSuccessData = {
  code: string;
  createdAt: string;
  total: number;
  subTotal: number;
  discount?: number;
  pointDiscount?: number;
  usedPoint?: number;
  coupon?: string;
  paymentMethod: string;
  paymentStatus?: string;
  orderStatus?: string;
  fullName: string;
  phone: string;
  address: string;
  note?: string;
  items: OrderSuccessItem[];
  shipping?: {
    carrierName?: string;
    fee?: number;
  };
};

export type OrderSuccessResponse = {
  code: 'success' | 'error';
  message: string;
  order?: OrderSuccessData;
};

export const createOrder = async (payload: CreateOrderPayload) => {
  return apiPostRaw<CreateOrderResponse, CreateOrderPayload>('/api/v1/client/order/create', payload);
};

export const getOrderSuccess = async (orderCode: string, phone: string) => {
  const query = new URLSearchParams({ orderCode, phone }).toString();
  return apiGetRaw<OrderSuccessResponse>(`/api/v1/client/order/success?${query}`);
};

export const cancelOrder = async (id: string, reason?: string) => {
  return apiPatchRaw<{ code?: 'success' | 'error'; message?: string }, { reason?: string }>(
    `/api/v1/client/order/${id}/cancel`,
    { reason }
  );
};
