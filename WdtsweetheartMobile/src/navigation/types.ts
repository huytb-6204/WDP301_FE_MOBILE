import type { CartItem } from '../context/CartContext';

export type RootStackParamList = {
  WelcomeSplash: undefined;
  WelcomeChoice: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  OTPPassword: { email: string } | undefined;
  ResetPassword: undefined;
  Home: undefined;
  ProductList: undefined;
  ProductDetail: { productSlug: string; product?: any };
  Cart: undefined;
  Checkout: undefined;
  Booking: undefined;
  MyBookings: undefined;
};
