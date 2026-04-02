import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CartProvider } from '../context/CartContext';
import { FavoritesProvider } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';
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
import CouponListScreen from '../screens/coupon/CouponListScreen';
import BreedListScreen from '../screens/pet/BreedListScreen';
import BoardingCagesScreen from '../screens/boarding/BoardingCagesScreen';
import StaffLoginScreen from '../screens/staff/auth/StaffLoginScreen';
import StaffHomeScreen from '../screens/staff/home/StaffHomeScreen';
import StaffTaskListScreen from '../screens/staff/task/StaffTaskListScreen';
import StaffServiceTaskDetailScreen from '../screens/staff/task/StaffServiceTaskDetailScreen';
import StaffCareDetailScreen from '../screens/staff/boarding/StaffCareDetailScreen';
import StaffCustomerListScreen from '../screens/staff/customer/StaffCustomerListScreen';
import StaffCagesScreen from '../screens/staff/boarding/StaffCagesScreen';
import StaffWorkScheduleScreen from '../screens/staff/schedule/StaffWorkScheduleScreen';
import StaffScheduleCalendarScreen from '../screens/staff/schedule/StaffScheduleCalendarScreen';
import StaffShiftListScreen from '../screens/staff/schedule/StaffShiftListScreen';
import StaffBoardingBookingListScreen from '../screens/staff/boarding/StaffBoardingBookingListScreen';
import StaffBoardingBookingCreateScreen from '../screens/staff/boarding/StaffBoardingBookingCreateScreen';
import PetCareTemplateScreen from '../screens/staff/boarding/PetCareTemplateScreen';
import StaffReviewListScreen from '../screens/staff/review/StaffReviewListScreen';
import DepartmentListScreen from '../screens/staff/department/DepartmentListScreen';
import StaffProfileScreen from '../screens/staff/home/StaffProfileScreen';
import StaffFeatureInfoScreen from '../screens/staff/common/StaffFeatureInfoScreen';
import StaffPermissionScreen from '../components/common/StaffPermissionScreen';
import { colors } from '../theme/colors';
import type { RootStackParamList } from './types';
import { hasPermission, STAFF_SCREEN_PERMISSIONS } from '../utils/staffPermissions';

const Stack = createNativeStackNavigator<RootStackParamList>();

const animatedScreenOptions = {
  animation: 'fade_from_bottom' as const,
  animationDuration: 360,
  contentStyle: { backgroundColor: colors.background },
};

const RootNavigator = () => {
  const { user } = useAuth();
  const permissions = ((user as any)?.permissions || []) as string[];

  const withPermission = (Component: React.ComponentType<any>, permission?: string, label?: string) => {
    if (hasPermission(permissions, permission)) return Component;

    return () => (
      <StaffPermissionScreen
        message={`Tài khoản của bạn chưa được cấp quyền để mở màn ${label || 'này'}.`}
      />
    );
  };

  return (
    <CartProvider>
      <FavoritesProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="WelcomeSplash"
            screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}
          >
            <Stack.Screen name="WelcomeSplash" component={WelcomeSplashScreen} />
            <Stack.Screen name="WelcomeChoice" component={WelcomeChoiceScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="OTPPassword" component={OTPPasswordScreen} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="ProductList" component={ProductListScreen} options={animatedScreenOptions} />
            <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={animatedScreenOptions} />
            <Stack.Screen name="ServiceList" component={ServiceListScreen} options={animatedScreenOptions} />
            <Stack.Screen name="ServiceDetail" component={ServiceDetailScreen} options={animatedScreenOptions} />
            <Stack.Screen name="BlogList" component={BlogListScreen} options={animatedScreenOptions} />
            <Stack.Screen name="BlogDetail" component={BlogDetailScreen} options={animatedScreenOptions} />
            <Stack.Screen name="Cart" component={CartScreen} options={animatedScreenOptions} />
            <Stack.Screen name="Checkout" component={CheckoutScreen} options={animatedScreenOptions} />
            <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} options={animatedScreenOptions} />
            <Stack.Screen name="Payment" component={PaymentScreen} options={animatedScreenOptions} />
            <Stack.Screen name="Booking" component={BookingScreen} options={animatedScreenOptions} />
            <Stack.Screen name="MyBookings" component={MyBookingsScreen} options={animatedScreenOptions} />
            <Stack.Screen name="BoardingHotel" component={BoardingHotelScreen} options={animatedScreenOptions} />
            <Stack.Screen name="OrderList" component={OrderListScreen} options={animatedScreenOptions} />
            <Stack.Screen name="MyBoardingBookings" component={MyBoardingBookingsScreen} options={animatedScreenOptions} />
            <Stack.Screen name="Overview" component={OverviewScreen} options={animatedScreenOptions} />
            <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} options={animatedScreenOptions} />
            <Stack.Screen name="FavoriteList" component={FavoriteListScreen} options={animatedScreenOptions} />
            <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={animatedScreenOptions} />
            <Stack.Screen name="AccountFeature" component={AccountFeatureScreen} options={animatedScreenOptions} />
            <Stack.Screen name="PetList" component={PetListScreen} options={animatedScreenOptions} />
            <Stack.Screen name="PetForm" component={PetFormScreen} options={animatedScreenOptions} />
            <Stack.Screen name="AddressList" component={AddressListScreen} options={animatedScreenOptions} />
            <Stack.Screen name="AddressForm" component={AddressFormScreen} options={animatedScreenOptions} />
            <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} options={animatedScreenOptions} />
            <Stack.Screen name="ReviewList" component={ReviewScreen} options={animatedScreenOptions} />
            <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={animatedScreenOptions} />
            <Stack.Screen name="BookingDetail" component={BookingDetailScreen} options={animatedScreenOptions} />
            <Stack.Screen
              name="BoardingBookingDetail"
              component={BoardingBookingDetailScreen}
              options={animatedScreenOptions}
            />
            <Stack.Screen name="CouponList" component={CouponListScreen} options={animatedScreenOptions} />
            <Stack.Screen name="BreedList" component={BreedListScreen} options={animatedScreenOptions} />
            <Stack.Screen name="BoardingCages" component={BoardingCagesScreen} options={animatedScreenOptions} />
            <Stack.Screen name="BoardingBookings" component={MyBoardingBookingsScreen} options={animatedScreenOptions} />
            <Stack.Screen name="StaffLogin" component={StaffLoginScreen} options={animatedScreenOptions} />
            <Stack.Screen name="StaffHome" component={StaffHomeScreen} options={animatedScreenOptions} />
            <Stack.Screen name="StaffTaskList" component={StaffTaskListScreen} options={animatedScreenOptions} />
            <Stack.Screen name="StaffServiceTaskDetail" component={StaffServiceTaskDetailScreen} options={animatedScreenOptions} />
            <Stack.Screen name="StaffCareDetail" component={StaffCareDetailScreen} options={animatedScreenOptions} />
            <Stack.Screen
              name="StaffCustomerList"
              component={withPermission(StaffCustomerListScreen, STAFF_SCREEN_PERMISSIONS.StaffCustomerList, 'Khách hàng của tôi')}
              options={animatedScreenOptions}
            />
            <Stack.Screen
              name="StaffCages"
              component={withPermission(StaffCagesScreen, STAFF_SCREEN_PERMISSIONS.StaffCages, 'Quản lý chuồng')}
              options={animatedScreenOptions}
            />
            <Stack.Screen
              name="StaffWorkSchedule"
              component={withPermission(StaffWorkScheduleScreen, STAFF_SCREEN_PERMISSIONS.StaffWorkSchedule, 'Lịch làm việc')}
              options={animatedScreenOptions}
            />
            <Stack.Screen
              name="StaffScheduleCalendar"
              component={withPermission(StaffScheduleCalendarScreen, STAFF_SCREEN_PERMISSIONS.StaffScheduleCalendar, 'Lịch chung')}
              options={animatedScreenOptions}
            />
            <Stack.Screen
              name="StaffShiftList"
              component={withPermission(StaffShiftListScreen, STAFF_SCREEN_PERMISSIONS.StaffShiftList, 'Lịch trực')}
              options={animatedScreenOptions}
            />
            <Stack.Screen
              name="StaffBoardingBookingList"
              component={withPermission(StaffBoardingBookingListScreen, STAFF_SCREEN_PERMISSIONS.StaffBoardingBookingList, 'Danh sách đơn khách sạn')}
              options={animatedScreenOptions}
            />
            <Stack.Screen
              name="StaffBoardingBookingCreate"
              component={withPermission(StaffBoardingBookingCreateScreen, STAFF_SCREEN_PERMISSIONS.StaffBoardingBookingCreate, 'Tạo đơn khách sạn')}
              options={animatedScreenOptions}
            />
            <Stack.Screen
              name="PetCareTemplate"
              component={withPermission(PetCareTemplateScreen, STAFF_SCREEN_PERMISSIONS.PetCareTemplate, 'Danh mục Thức ăn & Vận động')}
              options={animatedScreenOptions}
            />
            <Stack.Screen
              name="StaffReviewList"
              component={withPermission(StaffReviewListScreen, STAFF_SCREEN_PERMISSIONS.StaffReviewList, 'Đánh giá')}
              options={animatedScreenOptions}
            />
            <Stack.Screen
              name="DepartmentList"
              component={withPermission(DepartmentListScreen, STAFF_SCREEN_PERMISSIONS.DepartmentList, 'Nhân sự')}
              options={animatedScreenOptions}
            />
            <Stack.Screen name="StaffFeatureInfo" component={StaffFeatureInfoScreen} options={animatedScreenOptions} />
            <Stack.Screen name="StaffProfile" component={StaffProfileScreen} options={animatedScreenOptions} />
          </Stack.Navigator>
        </NavigationContainer>
      </FavoritesProvider>
    </CartProvider>
  );
};

export default RootNavigator;
