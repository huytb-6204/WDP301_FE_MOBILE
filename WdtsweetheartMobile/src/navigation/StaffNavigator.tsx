import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import StaffPermissionScreen from '../components/common/StaffPermissionScreen';
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
import { hasPermission, STAFF_SCREEN_PERMISSIONS } from '../utils/staffPermissions';

export type StaffStackParamList = {
  StaffHome: undefined;
  StaffTaskList: { date?: string };
  StaffCareDetail: { bookingId: string; booking: any };
  StaffServiceTaskDetail: { bookingId: string };
  StaffCustomerList: undefined;
  StaffCages: undefined;
  StaffProfile: undefined;
  StaffWorkSchedule: undefined;
  StaffScheduleCalendar: undefined;
  StaffShiftList: undefined;
  StaffBoardingBookingList: undefined;
  StaffBoardingBookingCreate: undefined;
  PetCareTemplate: undefined;
  StaffReviewList: undefined;
  DepartmentList: undefined;
  StaffFeatureInfo: { title: string; description: string };
};

const Stack = createNativeStackNavigator<StaffStackParamList>();

const StaffNavigator = () => {
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
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StaffHome" component={StaffHomeScreen} />
      <Stack.Screen name="StaffTaskList" component={StaffTaskListScreen} />
      <Stack.Screen name="StaffServiceTaskDetail" component={StaffServiceTaskDetailScreen} />
      <Stack.Screen name="StaffCareDetail" component={StaffCareDetailScreen} />
      <Stack.Screen
        name="StaffCustomerList"
        component={withPermission(StaffCustomerListScreen, STAFF_SCREEN_PERMISSIONS.StaffCustomerList, 'Khách hàng của tôi')}
      />
      <Stack.Screen
        name="StaffCages"
        component={withPermission(StaffCagesScreen, STAFF_SCREEN_PERMISSIONS.StaffCages, 'Quản lý chuồng')}
      />
      <Stack.Screen
        name="StaffWorkSchedule"
        component={withPermission(StaffWorkScheduleScreen, STAFF_SCREEN_PERMISSIONS.StaffWorkSchedule, 'Lịch làm việc')}
      />
      <Stack.Screen
        name="StaffScheduleCalendar"
        component={withPermission(StaffScheduleCalendarScreen, STAFF_SCREEN_PERMISSIONS.StaffScheduleCalendar, 'Lịch chung')}
      />
      <Stack.Screen
        name="StaffShiftList"
        component={withPermission(StaffShiftListScreen, STAFF_SCREEN_PERMISSIONS.StaffShiftList, 'Lịch trực')}
      />
      <Stack.Screen
        name="StaffBoardingBookingList"
        component={withPermission(StaffBoardingBookingListScreen, STAFF_SCREEN_PERMISSIONS.StaffBoardingBookingList, 'Danh sách đơn khách sạn')}
      />
      <Stack.Screen
        name="StaffBoardingBookingCreate"
        component={withPermission(StaffBoardingBookingCreateScreen, STAFF_SCREEN_PERMISSIONS.StaffBoardingBookingCreate, 'Tạo đơn khách sạn')}
      />
      <Stack.Screen
        name="PetCareTemplate"
        component={withPermission(PetCareTemplateScreen, STAFF_SCREEN_PERMISSIONS.PetCareTemplate, 'Danh mục Thức ăn & Vận động')}
      />
      <Stack.Screen
        name="StaffReviewList"
        component={withPermission(StaffReviewListScreen, STAFF_SCREEN_PERMISSIONS.StaffReviewList, 'Đánh giá')}
      />
      <Stack.Screen
        name="DepartmentList"
        component={withPermission(DepartmentListScreen, STAFF_SCREEN_PERMISSIONS.DepartmentList, 'Nhân sự')}
      />
      <Stack.Screen name="StaffFeatureInfo" component={StaffFeatureInfoScreen} />
      <Stack.Screen name="StaffProfile" component={StaffProfileScreen} />
    </Stack.Navigator>
  );
};

export default StaffNavigator;
