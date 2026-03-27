import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import StaffHomeScreen from '../screens/staff/home/StaffHomeScreen';
import StaffTaskListScreen from '../screens/staff/task/StaffTaskListScreen';
import StaffCareDetailScreen from '../screens/staff/boarding/StaffCareDetailScreen';
import StaffCustomerListScreen from '../screens/staff/customer/StaffCustomerListScreen';
import StaffCagesScreen from '../screens/staff/boarding/StaffCagesScreen';
import ChatScreen from '../screens/review/ReviewScreen'; // Assuming chat can reuse or we create new

export type StaffStackParamList = {
  StaffHome: undefined;
  StaffTaskList: { date?: string };
  StaffCareDetail: { bookingId: string; booking: any };
  StaffCustomerList: undefined;
  StaffCages: undefined;
  StaffChat: undefined;
  StaffProfile: undefined;
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
    </Stack.Navigator>
  );
};

export default StaffNavigator;
