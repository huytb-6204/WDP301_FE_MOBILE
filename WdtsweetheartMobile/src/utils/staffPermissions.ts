export const hasPermission = (permissions: string[] | undefined | null, permission?: string) => {
  if (!permission) return true;
  return Array.isArray(permissions) && permissions.includes(permission);
};

export const STAFF_SCREEN_PERMISSIONS = {
  StaffCustomerList: 'account_user_view',
  StaffCages: 'boarding_cage_view',
  StaffWorkSchedule: 'schedule_view',
  StaffScheduleCalendar: 'schedule_view',
  StaffShiftList: 'shift_view',
  StaffBoardingBookingList: 'boarding_booking_view',
  StaffBoardingBookingCreate: 'boarding_booking_create',
  PetCareTemplate: 'boarding_cage_edit',
  StaffReviewList: 'product_view',
  DepartmentList: 'department_view',
} as const;
