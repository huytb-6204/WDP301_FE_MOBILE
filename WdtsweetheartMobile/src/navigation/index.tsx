import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CartProvider } from '../context/CartContext';
import { FavoritesProvider } from '../context/FavoritesContext';
import HomeScreen from '../screens/home/HomeScreen';
import ProductListScreen from '../screens/product/ProductListScreen';
import ProductDetailScreen from '../screens/product/ProductDetailScreen';
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
import WelcomeSplashScreen from '../screens/auth/WelcomeSplashScreen';
import WelcomeChoiceScreen from '../screens/cart/WelcomeChoiceScreen';
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
              name="MyBoardingBookings"
              component={MyBoardingBookingsScreen}
              options={{ animation: 'slide_from_right', animationDuration: 300 }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </FavoritesProvider>
    </CartProvider>
  );
};

export default RootNavigator;
