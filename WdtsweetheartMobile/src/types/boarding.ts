export type BoardingGateway = 'zalopay' | 'vnpay';

export type BoardingPaymentMethod = 'pay_at_site' | 'prepaid';

export type BoardingPet = {
  _id: string;
  name: string;
  type?: 'dog' | 'cat' | string;
  weight?: number;
  avatar?: string;
  breed?: string;
};

export type BoardingCage = {
  _id: string;
  cageCode?: string;
  type?: string;
  size?: string;
  maxWeightCapacity?: number;
  dailyPrice?: number;
  avatar?: string;
  gallery?: string[];
  description?: string;
  amenities?: string[];
  status?: string;
  totalRooms?: number;
  bookedRooms?: number;
  remainingRooms?: number;
  soldOut?: boolean;
};

export type BoardingBooking = {
  _id: string;
  code: string;
  userId?: string;
  petIds: string[];
  quantity?: number;
  cageId?: string | BoardingCage;
  fullName?: string;
  phone?: string;
  email?: string;
  notes?: string;
  specialCare?: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfDays?: number;
  pricePerDay?: number;
  subTotal?: number;
  discount?: number;
  total?: number;
  depositPercent?: number;
  depositAmount?: number;
  paidAmount?: number;
  paymentMethod?: BoardingPaymentMethod | string;
  paymentGateway?: BoardingGateway | string;
  paymentStatus?: 'unpaid' | 'partial' | 'paid' | 'refunded' | string;
  boardingStatus?: 'held' | 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled' | 'pending' | string;
  holdExpiresAt?: string | null;
  actualCheckInDate?: string | null;
  actualCheckOutDate?: string | null;
  cancelledAt?: string | null;
  cancelledReason?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type BoardingBookingDetail = {
  booking: BoardingBooking;
  pets: BoardingPet[];
  cage: BoardingCage | null;
  timeline: Array<{
    key: string;
    label: string;
    at: string | null;
  }>;
};

export type CreateBoardingBookingPayload = {
  cageId: string;
  checkInDate: string;
  checkOutDate: string;
  petIds: string[];
  quantity: number;
  fullName: string;
  phone: string;
  email?: string;
  notes?: string;
  specialCare?: string;
  paymentMethod: BoardingPaymentMethod;
  paymentGateway?: BoardingGateway;
};
