import React, { useEffect, useState, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ActivityIndicator, Image, ScrollView,
  StatusBar, StyleSheet, Text, TouchableOpacity, View
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Calendar,
  CalendarDays,
  Bell,
  Settings,
  Users,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Building2,
  Clock,
  Eye,
  CloudSun,
  LayoutGrid,
  ClipboardList,
  PlusCircle,
  Star
} from 'lucide-react-native';
import { colors } from '../../../theme/colors';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { getStaffThemeColors } from '../../../theme/staffTheme';
import { apiGet } from '../../../services/api/client';
import { getStaffBoardingBookings } from '../../../services/api/staffBoarding';
import {
  archiveAllNotifications,
  deleteNotification,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type StaffNotification,
} from '../../../services/api/notification';
import NotificationModal from '../../../components/common/NotificationModal';
import type { StaffStackParamList } from '../../../navigation/StaffNavigator';
import dayjs from 'dayjs';
import { hasPermission, STAFF_SCREEN_PERMISSIONS } from '../../../utils/staffPermissions';
import { isServiceDepartment } from '../../../utils/staffDepartment';
import ServiceStaffHomeScreen from './StaffServiceHomeScreen';

type MenuItemProps = {
  title: string;
  icon: any;
  screen: keyof StaffStackParamList;
  color: string;
  staffTheme: ReturnType<typeof getStaffThemeColors>;
  isDarkMode: boolean;
};

type ShortcutItemProps = {
  title: string;
  subtitle: string;
  icon: any;
  screen: keyof StaffStackParamList;
  color: string;
  staffTheme: ReturnType<typeof getStaffThemeColors>;
};

const StaffHomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<StaffStackParamList>>();
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const staffTheme = getStaffThemeColors(isDarkMode);
  const permissions = ((user as any)?.permissions || []) as string[];
  const roles = ((user as any)?.roles || []) as any[];
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const [totalCages, setTotalCages] = useState(20);
  const [notifications, setNotifications] = useState<StaffNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);

  const efficiency = useMemo(() => {
    if (!bookings || bookings.length === 0 || !(user as any)?._id) return 0;

    let totalAssigned = 0;
    let completedAssigned = 0;
    const todayStr = dayjs().format('YYYY-MM-DD');

    bookings.forEach((b: any) => {
      const checkInDate = dayjs(b.actualCheckInDate || b.checkInDate).startOf('day');
      const dayIndex = dayjs(todayStr).diff(checkInDate, 'day');
      const totalDays = b.numberOfDays || 1;

      if (dayIndex >= 0 && dayIndex < totalDays) {
        const fItemsPerDay = Math.ceil((b.feedingSchedule?.length || 0) / totalDays);
        const fDaily = (b.feedingSchedule || []).slice(dayIndex * fItemsPerDay, (dayIndex + 1) * fItemsPerDay);
        fDaily.forEach((f: any) => {
          if ((f.staffId?._id || f.staffId) === (user as any)?._id) {
            totalAssigned++;
            if (f.status === 'done') completedAssigned++;
          }
        });

        const eItemsPerDay = Math.ceil((b.exerciseSchedule?.length || 0) / totalDays);
        const eDaily = (b.exerciseSchedule || []).slice(dayIndex * eItemsPerDay, (dayIndex + 1) * eItemsPerDay);
        eDaily.forEach((e: any) => {
          if ((e.staffId?._id || e.staffId) === (user as any)?._id) {
            totalAssigned++;
            if (e.status === 'done') completedAssigned++;
          }
        });
      }
    });

    return totalAssigned > 0 ? Math.round((completedAssigned / totalAssigned) * 100) : 0;
  }, [bookings, (user as any)?._id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bookingsRes, cagesRes] = await Promise.all([
        getStaffBoardingBookings({ limit: 100 }).catch(() => []),
        apiGet<any>('/api/v1/admin/boarding-cage?limit=1').catch(() => null)
      ]);

      const arrBookings = bookingsRes || [];
      setBookings(arrBookings.slice(0, 10));
      if (cagesRes?.data?.pagination?.totalRecords) setTotalCages(cagesRes.data.pagination.totalRecords);
      if (cagesRes?.pagination?.totalRecords) setTotalCages(cagesRes.pagination.totalRecords);

      const todayStr = dayjs().format('YYYY-MM-DD');
      const now = dayjs();
      let urgent = 0;
      let activeCounts = 0;
      let totalToday = 0;

      arrBookings.forEach((b: any) => {
        if (['active', 'checked_in'].includes(b.boardingStatus)) activeCounts++;
        if (dayjs(b.checkInDate).format('YYYY-MM-DD') === todayStr) totalToday++;

        if (['active', 'checked_in'].includes(b.boardingStatus)) {
          (b.feedingSchedule || []).forEach((f: any) => {
            if (f.status === 'pending' || !f.status) {
              const time = f.time || '12:00';
              const [hours, mins] = time.split(':').map(Number);
              const scheduleTime = dayjs().hour(hours).minute(mins).second(0);
              if (now.isAfter(scheduleTime)) urgent++;
            }
          });
        }
      });

      setStats({ urgentFeeding: urgent, activeBookings: activeCounts, totalBookings: totalToday });
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    setNotificationLoading(true);
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      setNotificationLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter((item) => item.status === 'unread').length;
  const canViewCustomers = hasPermission(permissions, STAFF_SCREEN_PERMISSIONS.StaffCustomerList);
  const canViewDepartments = hasPermission(permissions, STAFF_SCREEN_PERMISSIONS.DepartmentList);
  const canViewShifts = hasPermission(permissions, STAFF_SCREEN_PERMISSIONS.StaffShiftList);
  const canViewBoardingList = hasPermission(permissions, STAFF_SCREEN_PERMISSIONS.StaffBoardingBookingList);
  const canCreateBoarding = hasPermission(permissions, STAFF_SCREEN_PERMISSIONS.StaffBoardingBookingCreate);
  const canViewCages = hasPermission(permissions, STAFF_SCREEN_PERMISSIONS.StaffCages);
  const canViewTemplates = hasPermission(permissions, STAFF_SCREEN_PERMISSIONS.PetCareTemplate);
  const canViewScheduleCalendar = hasPermission(permissions, STAFF_SCREEN_PERMISSIONS.StaffScheduleCalendar);
  const canViewReviews = hasPermission(permissions, STAFF_SCREEN_PERMISSIONS.StaffReviewList);

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      await fetchNotifications();
    } catch (error) {
      console.error('Failed to mark all notifications read', error);
    }
  };

  const handleMarkOneRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      await fetchNotifications();
    } catch (error) {
      console.error('Failed to mark notification read', error);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      await deleteNotification(id);
      await fetchNotifications();
    } catch (error) {
      console.error('Failed to delete notification', error);
    }
  };

  const handleArchiveAll = async () => {
    try {
      await archiveAllNotifications();
      await fetchNotifications();
    } catch (error) {
      console.error('Failed to archive notifications', error);
    }
  };

  const MenuItem = ({ title, icon, screen, color, staffTheme, isDarkMode }: MenuItemProps) => (
    <TouchableOpacity
      style={[styles.menuItem, { backgroundColor: staffTheme.surface }]}
      onPress={() => (navigation as any).navigate(screen)}
      activeOpacity={0.6}
    >
      <View style={[styles.menuIconWrap, { backgroundColor: color + '15' }]}>
        {React.createElement(icon, { size: 22, color })}
      </View>
      <Text style={[styles.menuText, { color: staffTheme.textStrong }]}>{title}</Text>
      <ChevronRight size={18} color={staffTheme.textSoft} />
    </TouchableOpacity>
  );

  const ShortcutItem = ({ title, subtitle, icon, screen, color, staffTheme }: ShortcutItemProps) => (
    <TouchableOpacity
      style={[styles.shortcutCard, { backgroundColor: staffTheme.surface, borderColor: staffTheme.border }]}
      onPress={() => (navigation as any).navigate(screen)}
      activeOpacity={0.75}
    >
      <View style={[styles.shortcutIconWrap, { backgroundColor: color + '15' }]}>
        {React.createElement(icon, { size: 20, color })}
      </View>
      <Text style={[styles.shortcutTitle, { color: staffTheme.textStrong }]} numberOfLines={2}>{title}</Text>
      <Text style={[styles.shortcutSubtitle, { color: staffTheme.textMuted }]} numberOfLines={2}>{subtitle}</Text>
    </TouchableOpacity>
  );

  if (isServiceDepartment(roles)) {
    return <ServiceStaffHomeScreen />;
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: staffTheme.screen }]}> 
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      <View style={[styles.header, { backgroundColor: staffTheme.surface, borderBottomColor: staffTheme.border }]}> 
        <TouchableOpacity
          style={styles.userInfo}
          onPress={() => navigation.navigate('StaffProfile')}
        >
          <Image
            source={{ uri: user?.avatar || 'https://api.dicebear.com/7.x/avataaars/png?seed=' + user?.fullName }}
            style={[styles.avatar, { backgroundColor: staffTheme.iconSurface }]}
          />
          <View style={styles.welcomeInfo}>
            <Text style={[styles.welcomeText, { color: staffTheme.textSoft }]}>Xin chào,</Text>
            <Text style={[styles.userName, { color: staffTheme.text }]}>{user?.fullName || 'Nhân viên'}</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.headerBtns}>
          <TouchableOpacity
            style={[styles.headerIconBtn, { backgroundColor: staffTheme.iconSurface }]}
            onPress={() => setShowNotifications(true)}
          >
            <Bell size={20} color={staffTheme.textMuted} />
            {unreadCount > 0 && (
              <View style={[styles.badgeCount, { borderColor: staffTheme.badgeBorder }]}>
                <Text style={styles.badgeCountText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.topDashboardHeader}>
          <View>
            <Text style={[styles.topDashboardTitle, { color: staffTheme.text }]}>Lịch trình hôm nay</Text>
            <Text style={[styles.topDashboardDate, { color: staffTheme.textMuted }]}>
              {dayjs().format('DD/MM/YYYY')} • Chào đón {stats?.totalBookings || 0} bé hôm nay
            </Text>
          </View>
          <View style={styles.weatherBox}>
            <CloudSun size={18} color="#007B55" />
            <Text style={styles.weatherText}>28°C Nắng</Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: '#007B55' }]}>
            <View style={styles.statIconWrap}><TrendingUp size={16} color="#fff" /></View>
            <Text style={styles.statLabel}>HIỆU SUẤT CÔNG VIỆC</Text>
            <Text style={styles.statValue}>{efficiency}% <Text style={styles.statSmall}>Hoàn thành</Text></Text>
            <Text style={styles.statDesc}>Nhiệm vụ được giao hôm nay</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#FFF7CD' }]}>
            <View style={styles.urgentHeader}>
              <Text style={[styles.statLabel, { color: '#B78103' }]}>KHẨN CẤP</Text>
              <AlertCircle size={14} color="#B78103" />
            </View>
            <Text style={[styles.statValue, { color: '#212B36' }]}>{stats?.urgentFeeding || 0} bé cần cho ăn</Text>
            <TouchableOpacity style={styles.urgentAction} onPress={() => navigation.navigate('StaffTaskList', {})} activeOpacity={0.8}>
              <Text style={styles.urgentActionText}>Xử lý ngay</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.statCard, { backgroundColor: staffTheme.surface, borderWidth: 1, borderColor: staffTheme.border }]}>
            <View style={styles.occupancyHeader}>
              <View style={styles.occIcon}><Users size={16} color="#007B55" /></View>
              <View>
                <Text style={[styles.statLabelGrey, { color: staffTheme.textSoft }]}>ĐANG LƯU TRÚ</Text>
                <Text style={[styles.statValueCompact, { color: staffTheme.textStrong }]}>{stats?.activeBookings || 0}</Text>
              </View>
            </View>
            <View style={[styles.progressBg, { backgroundColor: staffTheme.iconSurface }]}>
              <View style={[styles.progressFill, { width: `${Math.min(100, ((stats?.activeBookings || 0) / (totalCages || 1)) * 100)}%` }]} />
            </View>
            <Text style={[styles.progressText, { color: staffTheme.textMuted }]}>Công suất đạt {Math.round(((stats?.activeBookings || 0) / (totalCages || 1)) * 100)}%</Text>
          </View>
        </ScrollView>

        <View style={styles.section}>
          <View style={styles.flexRow}>
            <Text style={[styles.sectionHeader, { color: staffTheme.textSoft }]}>DANH SÁCH PHÂN CÔNG</Text>
            <TouchableOpacity onPress={() => navigation.navigate('StaffTaskList', {})}>
              <Text style={styles.seeAll}>Tất cả</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
          ) : bookings.length === 0 ? (
            <View style={[styles.emptyWrap, { backgroundColor: staffTheme.surface }]}><Text style={[styles.emptyText, { color: staffTheme.textSoft }]}>Hôm nay bạn không có lịch trình nào</Text></View>
          ) : (
            bookings.map((item: any) => {
              const checkInDate = dayjs(item.actualCheckInDate || item.checkInDate).startOf('day');
              const dayIndex = dayjs().diff(checkInDate, 'day');
              const totalDays = item.numberOfDays || 1;

              return (
                <TouchableOpacity
                  key={item._id}
                  style={[styles.taskCard, { backgroundColor: staffTheme.surface, borderColor: staffTheme.border, shadowOpacity: isDarkMode ? 0 : 0.02 }]}
                  onPress={() => navigation.navigate('StaffCareDetail', { bookingId: item._id, booking: item })}
                >
                  <Image
                    source={{ uri: item.petIds?.[0]?.avatar || 'https://api.dicebear.com/7.x/bottts/png?seed=' + item.code }}
                    style={[styles.petAvatar, { backgroundColor: staffTheme.iconSurface }]}
                  />
                  <View style={styles.petInfo}>
                    <View style={styles.petHeaderMain}>
                      <Text style={[styles.petName, { color: staffTheme.text }]}>{item.petIds?.[0]?.name || 'Thú cưng'}</Text>
                      <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>{item.boardingStatus?.toUpperCase()}</Text>
                      </View>
                    </View>

                    <Text style={[styles.cageInfo, { color: staffTheme.textMuted }]}>{item.cageId?.cageCode || 'Chưa xếp phòng'} • Ngày {dayIndex + 1} trên {totalDays}</Text>

                    <View style={styles.tagRow}>
                      <View style={styles.tagItem}><Text style={styles.tagText}>Cần cho ăn</Text></View>
                      <View style={[styles.tagItem, { backgroundColor: staffTheme.iconSurface }]}>
                        <Text style={[styles.tagText, { color: staffTheme.textStrong }]}>Nhận phòng: {dayjs(item.checkInDate).format('HH:mm A')}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={[styles.eyeBtn, { backgroundColor: staffTheme.screen }]}>
                    <Eye size={16} color={staffTheme.textSoft} />
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: staffTheme.textSoft }]}>TIỆN ÍCH PHỤ TRỢ</Text>
          <View style={[styles.cardWrapper, { backgroundColor: staffTheme.surface, shadowOpacity: isDarkMode ? 0 : 0.05 }]}>
            <MenuItem title="Công việc của tôi" icon={ClipboardList} screen="StaffTaskList" color="#00A76F" staffTheme={staffTheme} isDarkMode={isDarkMode} />
            <View style={[styles.divider, { backgroundColor: staffTheme.border }]} />
            <MenuItem title="Lịch làm việc" icon={Calendar} screen="StaffWorkSchedule" color="#1890FF" staffTheme={staffTheme} isDarkMode={isDarkMode} />
            {canViewCustomers && <View style={[styles.divider, { backgroundColor: staffTheme.border }]} />}
            {canViewCustomers && (
              <MenuItem title="Khách hàng của tôi" icon={Users} screen="StaffCustomerList" color="#7A4100" staffTheme={staffTheme} isDarkMode={isDarkMode} />
            )}
            {canViewDepartments && <View style={[styles.divider, { backgroundColor: staffTheme.border }]} />}
            {canViewDepartments && (
              <MenuItem title="Nhân sự" icon={Building2} screen="DepartmentList" color="#542DB1" staffTheme={staffTheme} isDarkMode={isDarkMode} />
            )}
            {canViewShifts && <View style={[styles.divider, { backgroundColor: staffTheme.border }]} />}
            {canViewShifts && (
              <MenuItem title="Lịch trực" icon={Clock} screen="StaffShiftList" color="#FFAB00" staffTheme={staffTheme} isDarkMode={isDarkMode} />
            )}
            <View style={[styles.divider, { backgroundColor: staffTheme.border }]} />
            <MenuItem title="Ho so nhan vien" icon={Settings} screen="StaffProfile" color="#637381" staffTheme={staffTheme} isDarkMode={isDarkMode} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: staffTheme.textSoft }]}>KHÁCH SẠN</Text>
          <View style={styles.shortcutGrid}>
            {canViewBoardingList && (
              <ShortcutItem title="Danh sách đơn khách sạn" subtitle="Xem toàn bộ đơn khách sạn" icon={ClipboardList} screen="StaffBoardingBookingList" color="#0C53B7" staffTheme={staffTheme} />
            )}
            {canCreateBoarding && (
              <ShortcutItem title="Tạo đơn khách sạn" subtitle="Lập đơn khách sạn tại quầy" icon={PlusCircle} screen="StaffBoardingBookingCreate" color={colors.primary} staffTheme={staffTheme} />
            )}
            {canViewCages && (
              <ShortcutItem title="Quản lý chuồng" subtitle="Theo dõi trạng thái chuồng khách sạn" icon={LayoutGrid} screen="StaffCages" color="#007B55" staffTheme={staffTheme} />
            )}
            {canViewTemplates && (
              <ShortcutItem title="Danh mục Thức ăn & Vận động" subtitle="Tra cứu khẩu phần ăn và lịch vận động" icon={Settings} screen="PetCareTemplate" color="#7A4100" staffTheme={staffTheme} />
            )}
            {canViewScheduleCalendar && (
              <ShortcutItem title="Lịch chung" subtitle="Xem lịch theo tháng" icon={CalendarDays} screen="StaffScheduleCalendar" color="#FFAB00" staffTheme={staffTheme} />
            )}
            {canViewReviews && (
              <ShortcutItem title="Đánh giá" subtitle="Kiểm duyệt phản hồi khách" icon={Star} screen="StaffReviewList" color="#B78103" staffTheme={staffTheme} />
            )}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <NotificationModal
        visible={showNotifications}
        isDarkMode={isDarkMode}
        notifications={notifications}
        loading={notificationLoading}
        onClose={() => setShowNotifications(false)}
        onRefresh={() => void fetchNotifications()}
        onMarkAllRead={() => void handleMarkAllRead()}
        onArchiveAll={() => void handleArchiveAll()}
        onDeleteOne={(id) => void handleDeleteNotification(id)}
        onMarkOneRead={(id) => void handleMarkOneRead(id)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
  },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F4F6F8' },
  welcomeInfo: { marginLeft: 12 },
  welcomeText: { fontSize: 13, color: '#919EAB', fontWeight: '500' },
  userName: { fontSize: 16, color: '#111827', fontWeight: '800' },
  headerBtns: { flexDirection: 'row', gap: 12 },
  headerIconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F4F6F8', alignItems: 'center', justifyContent: 'center' },
  badgeCount: {
    position: 'absolute', top: 8, right: 8, backgroundColor: '#FF4842',
    minWidth: 16, height: 16, borderRadius: 8, justifyContent: 'center',
    alignItems: 'center', borderWidth: 1.5,
  },
  badgeCountText: { fontSize: 8, color: '#fff', fontWeight: '900' },
  scroll: { paddingVertical: 16 },
  topDashboardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 20, paddingBottom: 20, paddingTop: 8 },
  topDashboardTitle: { fontSize: 24, fontWeight: '900', color: '#111827' },
  topDashboardDate: { fontSize: 13, color: '#637381', marginTop: 4, fontWeight: '600' },
  weatherBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E7F5EF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, gap: 8 },
  weatherText: { fontSize: 13, fontWeight: '700', color: '#007B55' },
  statsRow: { paddingLeft: 20, marginBottom: 24 },
  statCard: { width: 240, padding: 16, borderRadius: 24, marginRight: 16, minHeight: 140, justifyContent: 'center' },
  statIconWrap: { width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  statLabel: { fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.8)', letterSpacing: 1 },
  statValue: { fontSize: 24, fontWeight: '900', color: '#fff', marginTop: 8 },
  statSmall: { fontSize: 14, fontWeight: '700' },
  statDesc: { fontSize: 12, fontWeight: '500', color: 'rgba(255,255,255,0.6)', marginTop: 4 },
  urgentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  urgentAction: {
    marginTop: 14,
    alignSelf: 'flex-start',
    backgroundColor: '#FFE08A',
    paddingHorizontal: 14,
    height: 34,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(183,129,3,0.18)',
  },
  urgentActionText: { color: '#8A5A00', fontSize: 13, fontWeight: '800' },
  occupancyHeader: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  occIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#E7F5EF', alignItems: 'center', justifyContent: 'center' },
  statLabelGrey: { fontSize: 10, fontWeight: '800', color: '#919EAB', letterSpacing: 1 },
  statValueCompact: { fontSize: 20, fontWeight: '900' },
  progressBg: { height: 8, backgroundColor: '#F4F6F8', borderRadius: 4, marginTop: 16 },
  progressFill: { height: '100%', backgroundColor: '#00A76F', borderRadius: 4 },
  progressText: { fontSize: 11, fontWeight: '700', color: '#637381', marginTop: 8 },
  section: { paddingHorizontal: 20, marginBottom: 32 },
  sectionHeader: { fontSize: 13, fontWeight: '800', color: '#919EAB', marginBottom: 16, letterSpacing: 1 },
  flexRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  seeAll: { color: colors.primary, fontSize: 13, fontWeight: '700', marginBottom: 16 },
  cardWrapper: { backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowRadius: 10 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff' },
  menuIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  menuText: { flex: 1, fontSize: 15, fontWeight: '600', color: '#212B36' },
  divider: { height: 1, backgroundColor: '#F4F6F8', marginHorizontal: 16 },
  taskCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#F4F6F8', elevation: 2, shadowColor: '#000', shadowRadius: 10 },
  petAvatar: { width: 64, height: 64, borderRadius: 16, backgroundColor: '#F4F6F8' },
  petInfo: { flex: 1, marginLeft: 16 },
  petHeaderMain: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  petName: { fontSize: 17, fontWeight: '800', color: '#111827' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, backgroundColor: '#E7F5EF', borderRadius: 6 },
  statusText: { fontSize: 9, fontWeight: '800', color: '#007B55' },
  cageInfo: { fontSize: 13, color: '#637381', marginTop: 4, fontWeight: '500' },
  tagRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  tagItem: { paddingHorizontal: 10, paddingVertical: 4, backgroundColor: '#E7F5EF', borderRadius: 8 },
  tagText: { fontSize: 11, fontWeight: '700', color: '#007B55' },
  eyeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F9FAFB', alignItems: 'center', justifyContent: 'center' },
  emptyWrap: { padding: 40, alignItems: 'center', backgroundColor: '#fff', borderRadius: 20 },
  emptyText: { color: '#919EAB', fontSize: 14, fontWeight: '500' },
  shortcutGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  shortcutCard: {
    width: '48%',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    minHeight: 132,
  },
  shortcutIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  shortcutTitle: {
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
  },
  shortcutSubtitle: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 18,
  },
});

export default StaffHomeScreen;
