import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CartProvider } from '../context/CartContext';
import { FavoritesProvider } from '../context/FavoritesContext';
import HomeScreen from '../screens/home/HomeScreen';
import ProductListScreen from '../screens/product/ProductListScreen';
import ProductDetailScreen from '../screens/product/ProductDetailScreen';
import ServiceListScreen from '../screens/service/ServiceListScreen';
import ServiceDetailScreen from '../screens/service/ServiceDetailScreen';
import BlogListScreen from '../screens/blog/BlogListScreen';
import BlogDetailScreen from '../screens/blog/BlogDetailScreen';
import CartScreen from '../screens/cart/CartScreen';
import CheckoutScreen from '../screens/checkout/CheckoutScreen';
import PaymentScreen from '../screens/checkout/PaymentScreen';
import OrderSuccessScreen from '../screens/checkout/OrderSuccessScreen';
import BookingScreen from '../screens/booking/BookingScreen';
import MyBookingsScreen from '../screens/booking/MyBookingsScreen';
import BoardingHotelScreen from '../screens/boarding/BoardingHotelScreen';
import MyBoardingBookingsScreen from '../screens/boarding/MyBoardingBookingsScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import OTPPasswordScreen from '../screens/auth/OTPPasswordScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';
import OrderListScreen from '../screens/order/OrderListScreen';
import WelcomeSplashScreen from '../screens/auth/WelcomeSplashScreen';
import WelcomeChoiceScreen from '../screens/cart/WelcomeChoiceScreen';
import OverviewScreen from '../screens/profile/OverviewScreen';
import PersonalInfoScreen from '../screens/profile/PersonalInfoScreen';
import FavoriteListScreen from '../screens/favorite/FavoriteListScreen';
import ChangePasswordScreen from '../screens/profile/ChangePasswordScreen';
import AccountFeatureScreen from '../screens/profile/AccountFeatureScreen';
import PetListScreen from '../screens/pet/PetListScreen';
import PetFormScreen from '../screens/pet/PetFormScreen';
import AddressListScreen from '../screens/address/AddressListScreen';
import AddressFormScreen from '../screens/address/AddressFormScreen';
import TransactionHistoryScreen from '../screens/transaction/TransactionHistoryScreen';
import ReviewScreen from '../screens/review/ReviewScreen';
import OrderDetailScreen from '../screens/order/OrderDetailScreen';
import BookingDetailScreen from '../screens/booking/BookingDetailScreen';
import BoardingBookingDetailScreen from '../screens/boarding/BoardingBookingDetailScreen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  return (
    <CartProvider>
      <FavoritesProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="WelcomeSplash" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="WelcomeSplash" component={WelcomeSplashScreen} />
            <Stack.Screen name="WelcomeChoice" component={WelcomeChoiceScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="OTPPassword" component={OTPPasswordScreen} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen
              name="ProductList"
              component={ProductListScreen}
              options={{ animation: 'slide_from_right', animationDuration: 300 }}
            />
            <Stack.Screen
              name="ProductDetail"
              component={ProductDetailScreen}
              options={{ animation: 'slide_from_right', animationDuration: 300 }}
            />
            <Stack.Screen
              name="BlogList"
              component={BlogListScreen}
              options={{ animation: 'slide_from_right', animationDuration: 300 }}
            />
            <Stack.Screen
              name="BlogDetail"
              component={BlogDetailScreen}
              options={{ animation: 'slide_from_right', animationDuration: 300 }}
            />
            <Stack.Screen
              name="Cart"
              component={CartScreen}
              options={{ animation: 'slide_from_right', animationDuration: 300 }}
            />
            <Stack.Screen
              name="Checkout"
              component={CheckoutScreen}
              options={{ animation: 'slide_from_right', animationDuration: 300 }}
            />
            <Stack.Screen
              name="OrderSuccess"
              component={OrderSuccessScreen}
              options={{ animation: 'slide_from_right', animationDuration: 300 }}
            />
            <Stack.Screen
              name="Payment"
              component={PaymentScreen}
              options={{ animation: 'slide_from_right', animationDuration: 300 }}
            />
            <Stack.Screen
              name="Booking"
              component={BookingScreen}
              options={{ animation: 'slide_from_right', animationDuration: 300 }}
            />
          <Stack.Screen
            name="MyBookings"
            component={MyBookingsScreen}
            options={{ animation: 'slide_from_right', animationDuration: 300 }}
          />
          <Stack.Screen
            name="BoardingHotel"
            component={BoardingHotelScreen}
            options={{ animation: 'slide_from_right', animationDuration: 300 }}
          />
          <Stack.Screen
            name="OrderList"
            component={OrderListScreen}
            options={{ animation: 'slide_from_right', animationDuration: 300 }}
          />
          <Stack.Screen
            name="MyBoardingBookings"
            component={MyBoardingBookingsScreen}
            options={{ animation: 'slide_from_right', animationDuration: 300 }}
          />
          <Stack.Screen
            name="Overview"
            component={OverviewScreen}
            options={{ animation: 'slide_from_right', animationDuration: 300 }}
          />
          <Stack.Screen
            name="PersonalInfo"
            component={PersonalInfoScreen}
            options={{ animation: 'slide_from_right', animationDuration: 300 }}
          />
          <Stack.Screen
            name="FavoriteList"
            component={FavoriteListScreen}
            options={{ animation: 'slide_from_right', animationDuration: 300 }}
          />
          <Stack.Screen
            name="ChangePassword"
            component={ChangePasswordScreen}
            options={{ animation: 'slide_from_right', animationDuration: 300 }}
          />
          <Stack.Screen
            name="AccountFeature"
            component={AccountFeatureScreen}
            options={{ animation: 'slide_from_right', animationDuration: 300 }}
          />
          <Stack.Screen
            name="PetList"
            component={PetListScreen}
            options={{ animation: 'slide_from_right', animationDuration: 300 }}
          />
          <Stack.Screen
            name="PetForm"
            component={PetFormScreen}
            options={{ animation: 'slide_from_right', animationDuration: 300 }}
          />
          <Stack.Screen
            name="AddressList"
            component={AddressListScreen}
            options={{ animation: 'slide_from_right', animationDuration: 300 }}
          />
          <Stack.Screen
            name="AddressForm"
            component={AddressFormScreen}
            options={{ animation: 'slide_from_right', animationDuration: 300 }}
          />
          <Stack.Screen
            name="TransactionHistory"
            component={TransactionHistoryScreen}
            options={{ animation: 'slide_from_right', animationDuration: 300 }}
          />
          <Stack.Screen
            name="ReviewList"
            component={ReviewScreen}
            options={{ animation: 'slide_from_right', animationDuration: 300 }}
          />
          <Stack.Screen
            name="OrderDetail"
            component={OrderDetailScreen}
            options={{ animation: 'slide_from_right', animationDuration: 300 }}
          />
          <Stack.Screen
            name="BookingDetail"
            component={BookingDetailScreen}
            options={{ animation: 'slide_from_right', animationDuration: 300 }}
          />
          <Stack.Screen
            name="BoardingBookingDetail"
            component={BoardingBookingDetailScreen}
            options={{ animation: 'slide_from_right', animationDuration: 300 }}
          />
        </Stack.Navigator>
      </NavigationContainer>
      </FavoritesProvider>
    </CartProvider>
  );
};

export default RootNavigator;
