import { apiGetRaw, apiPatchRaw, apiPostRaw } from './client';
import type {
  BoardingBooking,
  BoardingBookingDetail,
  BoardingCage,
  BoardingGateway,
  CreateBoardingBookingPayload,
} from '../../types/boarding';

const CLIENT_CAGE_BASE = '/api/v1/client/cage';
const CLIENT_BOARDING_BASE = '/api/v1/client/boarding';

type MessageResponse = {
  message?: string;
};

type PaymentResponse = {
  code?: string;
  paymentUrl?: string;
  paymentStatus?: string;
};

const readMessage = (payload: unknown, fallback: string) => {
  if (typeof payload === 'object' && payload && 'message' in payload) {
    const message = (payload as MessageResponse).message;
    if (typeof message === 'string' && message.trim()) return message;
  }
  return fallback;
};

const readArray = <T>(payload: unknown): T[] => {
  if (Array.isArray(payload)) return payload as T[];
  if (typeof payload === 'object' && payload && 'data' in payload && Array.isArray((payload as any).data)) {
    return (payload as any).data as T[];
  }
  return [];
};

const readObject = <T>(payload: unknown): T | null => {
  if (typeof payload !== 'object' || !payload) return null;
  if ('data' in payload && typeof (payload as any).data === 'object') {
    return (payload as any).data as T;
  }
  return payload as T;
};

export const getAvailableBoardingCages = async (params: {
  checkInDate: string;
  checkOutDate: string;
  type?: string;
  size?: string;
}) => {
  const queryItems = [
    `checkInDate=${encodeURIComponent(params.checkInDate)}`,
    `checkOutDate=${encodeURIComponent(params.checkOutDate)}`,
    params.type ? `type=${encodeURIComponent(params.type)}` : '',
    params.size ? `size=${encodeURIComponent(params.size)}` : '',
  ].filter(Boolean);

  const res = await apiGetRaw<unknown>(
    `${CLIENT_CAGE_BASE}/boarding-cages/available?${queryItems.join('&')}`
  );
  return readArray<BoardingCage>(res);
};

export const getBoardingCageDetail = async (id: string) => {
  const res = await apiGetRaw<unknown>(`${CLIENT_CAGE_BASE}/boarding-cages/${id}`);
  const cage = readObject<BoardingCage>(res);
  if (!cage) {
    throw new Error(readMessage(res, 'Không thể tải chi tiết chuồng'));
  }
  return cage;
};

export const createBoardingBooking = async (payload: CreateBoardingBookingPayload) => {
  const res = await apiPostRaw<unknown, CreateBoardingBookingPayload>(
    `${CLIENT_BOARDING_BASE}/boarding-bookings`,
    payload
  );
  const booking = readObject<BoardingBooking>(
    res && typeof res === 'object' ? ((res as any).data ? res : { data: res }) : null
  );
  if (!booking) {
    throw new Error(readMessage(res, 'Không thể tạo booking khách sạn'));
  }

  return {
    message: readMessage(res, 'Tạo booking thành công'),
    data: booking,
  };
};

export const getMyBoardingBookings = async () => {
  const res = await apiGetRaw<unknown>(`${CLIENT_BOARDING_BASE}/boarding-bookings`);
  return readArray<BoardingBooking>(res);
};

export const getMyBoardingBookingDetail = async (id: string) => {
  const res = await apiGetRaw<unknown>(`${CLIENT_BOARDING_BASE}/boarding-bookings/${id}`);
  const detail = readObject<BoardingBookingDetail>(res);
  if (!detail) {
    throw new Error(readMessage(res, 'Không thể tải chi tiết booking'));
  }
  return detail;
};

export const cancelBoardingBooking = async (id: string, reason?: string) => {
  const res = await apiPatchRaw<unknown, { reason?: string }>(
    `${CLIENT_BOARDING_BASE}/boarding-bookings/${id}/cancel`,
    { reason }
  );
  return {
    message: readMessage(res, 'Đã hủy booking'),
  };
};

export const initiateBoardingPayment = async (id: string, gateway: BoardingGateway) => {
  const res = await apiPostRaw<PaymentResponse, { gateway: BoardingGateway }>(
    `${CLIENT_BOARDING_BASE}/boarding-bookings/${id}/pay`,
    { gateway }
  );

  if (!res?.paymentUrl) {
    throw new Error(readMessage(res, 'Không tạo được liên kết thanh toán'));
  }

  return res;
};

export const checkBoardingPaymentStatus = async (id: string) => {
  const res = await getMyBoardingBookingDetail(id);
  return {
    code:
      res.booking?.paymentStatus === 'paid' || res.booking?.paymentStatus === 'partial'
        ? 'success'
        : 'pending',
    paymentStatus: res.booking?.paymentStatus || 'unpaid',
  };
};
