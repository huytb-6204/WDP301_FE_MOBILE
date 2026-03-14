import type { CartItem } from '../context/CartContext';

export type HomeTabKey = 'home' | 'product' | 'service' | 'blog' | 'profile';

export type RootStackParamList = {
  WelcomeSplash: undefined;
  WelcomeChoice: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  OTPPassword: { email: string } | undefined;
  ResetPassword: undefined;
  Home: { initialTab?: HomeTabKey } | undefined;
  ProductList: undefined;
  ProductDetail: { productSlug: string; product?: any };
  ServiceList: undefined;
  ServiceDetail: { serviceId: string; service?: any };
  BlogList: undefined;
  BlogDetail: { slug: string; blog?: any };
  Cart: undefined;
  Checkout: undefined;
  Payment: undefined;
  Booking: undefined;
  MyBookings: undefined;
};
