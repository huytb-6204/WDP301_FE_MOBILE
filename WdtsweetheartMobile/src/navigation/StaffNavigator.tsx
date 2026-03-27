import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import StaffHomeScreen from '../screens/staff/home/StaffHomeScreen';
import StaffTaskListScreen from '../screens/staff/task/StaffTaskListScreen';
import StaffCareDetailScreen from '../screens/staff/boarding/StaffCareDetailScreen';
import StaffCustomerListScreen from '../screens/staff/customer/StaffCustomerListScreen';
import StaffCagesScreen from '../screens/staff/boarding/StaffCagesScreen';
import StaffWorkScheduleScreen from '../screens/staff/schedule/StaffWorkScheduleScreen';
import StaffScheduleCalendarScreen from '../screens/staff/schedule/StaffScheduleCalendarScreen';
import StaffShiftListScreen from '../screens/staff/schedule/StaffShiftListScreen';
import PetCareTemplateScreen from '../screens/staff/boarding/PetCareTemplateScreen';
import StaffBoardingBookingListScreen from '../screens/staff/boarding/StaffBoardingBookingListScreen';
import StaffBoardingBookingCreateScreen from '../screens/staff/boarding/StaffBoardingBookingCreateScreen';
import StaffReviewListScreen from '../screens/staff/review/StaffReviewListScreen';
import DepartmentListScreen from '../screens/staff/department/DepartmentListScreen';
import StaffProfileScreen from '../screens/staff/home/StaffProfileScreen';
// import ChatScreen from '../screens/review/ReviewScreen'; // Assuming chat can reuse or we create new

export type StaffStackParamList = {
  StaffHome: undefined;
  StaffTaskList: { date?: string };
  StaffCareDetail: { bookingId: string; booking: any };
  StaffCustomerList: undefined;
  StaffCages: undefined;
  StaffChat: undefined;
  StaffProfile: undefined;
  StaffWorkSchedule: undefined;
  StaffScheduleCalendar: undefined;
  StaffShiftList: undefined;
  PetCareTemplate: undefined;
  StaffBoardingBookingList: undefined;
  StaffBoardingBookingCreate: undefined;
  StaffReviewList: undefined;
  DepartmentList: undefined;
};

const Stack = createNativeStackNavigator<StaffStackParamList>();

const StaffNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StaffHome" component={StaffHomeScreen} />
      <Stack.Screen name="StaffTaskList" component={StaffTaskListScreen} />
      <Stack.Screen name="StaffCareDetail" component={StaffCareDetailScreen} />
      <Stack.Screen name="StaffCustomerList" component={StaffCustomerListScreen} />
      <Stack.Screen name="StaffCages" component={StaffCagesScreen} />
      <Stack.Screen name="StaffWorkSchedule" component={StaffWorkScheduleScreen} />
      <Stack.Screen name="StaffScheduleCalendar" component={StaffScheduleCalendarScreen} />
      <Stack.Screen name="StaffShiftList" component={StaffShiftListScreen} />
      <Stack.Screen name="PetCareTemplate" component={PetCareTemplateScreen} />
      <Stack.Screen name="StaffBoardingBookingList" component={StaffBoardingBookingListScreen} />
      <Stack.Screen name="StaffBoardingBookingCreate" component={StaffBoardingBookingCreateScreen} />
      <Stack.Screen name="StaffReviewList" component={StaffReviewListScreen} />
      <Stack.Screen name="DepartmentList" component={DepartmentListScreen} />
      <Stack.Screen name="StaffProfile" component={StaffProfileScreen} />
    </Stack.Navigator>
  );
};

export default StaffNavigator;
