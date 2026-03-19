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
  _id: string;
  serviceId: string;
  date: string;
  startTime: string;
  endTime: string;
  maxCapacity?: number;
  currentBookings?: number;
  status: 'available' | 'full' | 'unavailable';
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
  bookingCode: string;
  serviceId: string;
  slotId: string;
  petIds: string[];
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  notes?: string;
  totalPrice?: number;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  paymentStatus?: 'unpaid' | 'partial' | 'paid';
  createdAt: string;
};

export type CreateBookingPayload = {
  serviceId: string;
  slotId: string;
  petIds: string[];
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  notes?: string;
};
