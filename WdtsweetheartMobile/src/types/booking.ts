export type ServiceItem = {
  _id: string;
  categoryId?: string;
  name: string;
  description?: string;
  duration?: number;
  petType?: string[];
  pricingType?: string;
  basePrice?: number;
};

export type TimeSlot = {
  time: string;
  status: 'available' | 'full' | 'unavailable' | 'pet_busy';
  freeStaff?: number;
  totalStaff?: number;
  mode?: string;
  staffNames?: string[];
};

export type ShiftSlotGroup = {
  _id: string;
  name: string;
  startTime: string;
  endTime: string;
  slots: TimeSlot[];
};

export type Pet = {
  _id: string;
  name: string;
  type: 'dog' | 'cat';
  breed?: string;
  weight: number;
  age?: number;
  color?: string;
  gender?: 'male' | 'female' | 'unknown';
  notes?: string;
  avatar?: string;
  healthStatus?: 'accepted' | 'rejected' | string;
  status?: 'active' | 'inactive' | string;
  createdAt?: string;
};

export type Booking = {
  _id: string;
  code?: string;
  bookingCode?: string;
  serviceId?: any;
  slotId?: string;
  petIds?: any[];
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  notes?: string;
  totalPrice?: number;
  subTotal?: number;
  total?: number;
  originalStart?: string;
  bookingStatus?: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'delayed';
  status?: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'request_cancel' | 'delayed';
  paymentStatus?: 'unpaid' | 'partial' | 'paid' | 'partially_paid' | 'refunded';
  paymentMethod?: 'money' | 'vnpay' | 'zalopay' | string;
  depositMethod?: string;
  depositAmount?: number;
  remainingAmount?: number;
  cancelledReason?: string;
  statusHistory?: Array<{
    status?: string;
    at?: string;
    by?: string;
  }>;
  petStaffMap?: Array<{
    petId: any;
    staffId?: any;
    price?: number;
    status?: 'pending' | 'in-progress' | 'completed' | string;
    startedAt?: string;
    completedAt?: string;
    surchargeAmount?: number;
    surchargeNotes?: string;
  }>;
  start?: string;
  end?: string;
  createdAt: string;
};

export type CreateBookingPayload = {
  serviceId: string;
  petIds: string[];
  startTime: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  notes?: string;
  paymentMethod?: 'money' | 'vnpay' | 'zalopay';
};
