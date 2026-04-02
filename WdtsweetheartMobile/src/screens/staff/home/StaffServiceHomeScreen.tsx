import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, Image, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Bell,
  Calendar,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock3,
  MessageCircle,
  Package,
  Users,
} from 'lucide-react-native';
import dayjs from 'dayjs';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { getStaffThemeColors } from '../../../theme/staffTheme';
import {
  archiveAllNotifications,
  deleteNotification,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type StaffNotification,
} from '../../../services/api/notification';
import { getStaffServiceTasks } from '../../../services/api/staffTask';
import NotificationModal from '../../../components/common/NotificationModal';
import type { StaffStackParamList } from '../../../navigation/StaffNavigator';
import { hasPermission, STAFF_SCREEN_PERMISSIONS } from '../../../utils/staffPermissions';

type MenuItemProps = {
  title: string;
  subtitle: string;
  onPress: () => void;
  icon: any;
  color: string;
  staffTheme: ReturnType<typeof getStaffThemeColors>;
};

const ServiceStaffHomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<StaffStackParamList>>();
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const staffTheme = getStaffThemeColors(isDarkMode);
  const permissions = ((user as any)?.permissions || []) as string[];

  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<StaffNotification[]>([]);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);

  const myId = (user as any)?.id || (user as any)?._id;
  const canViewCustomers = hasPermission(permissions, STAFF_SCREEN_PERMISSIONS.StaffCustomerList);
  const canViewServices = hasPermission(permissions, 'service_view');
  const canViewBookings = hasPermission(permissions, 'booking_view');
  const canViewCalendar = hasPermission(permissions, 'calendar_view');
  const canUseChat = true;
  const hasManagementItems = canViewServices || canViewBookings || canViewCalendar || canUseChat;

  const openFeatureInfo = (title: string, description: string) => {
    navigation.navigate('StaffFeatureInfo', { title, description });
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getStaffServiceTasks({ date: dayjs().format('YYYY-MM-DD'), noLimit: true });
      setTasks(Array.isArray(res) ? res : []);
    } catch (error) {
      console.error('Failed to fetch service tasks', error);
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
    void fetchData();
    void fetchNotifications();
  }, []);

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

  const stats = useMemo(() => {
    let waiting = 0;
    let inProgress = 0;
    let completed = 0;

    tasks.forEach((task) => {
      const mine = (task.petStaffMap || []).filter((item: any) => {
        const staffId = item?.staffId?._id || item?.staffId;
        return staffId === myId;
      });

      mine.forEach((item: any) => {
        if (item.status === 'completed') completed += 1;
        else if (item.status === 'in-progress') inProgress += 1;
        else waiting += 1;
      });
    });

    return { waiting, inProgress, completed };
  }, [myId, tasks]);

  const unreadCount = notifications.filter((item) => item.status === 'unread').length;

  const MenuItem = ({ title, subtitle, onPress, icon, color, staffTheme }: MenuItemProps) => (
    <TouchableOpacity
      style={[styles.menuItem, { backgroundColor: staffTheme.surface, borderColor: staffTheme.border }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.menuIconWrap, { backgroundColor: `${color}18` }]}>
        {React.createElement(icon, { size: 20, color })}
      </View>
      <View style={styles.menuTextWrap}>
        <Text style={[styles.menuTitle, { color: staffTheme.textStrong }]}>{title}</Text>
        <Text style={[styles.menuSubtitle, { color: staffTheme.textMuted }]}>{subtitle}</Text>
      </View>
      <ChevronRight size={18} color={staffTheme.textSoft} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: staffTheme.screen }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      <View style={[styles.header, { backgroundColor: staffTheme.surface, borderBottomColor: staffTheme.border }]}>
        <TouchableOpacity style={styles.userInfo} onPress={() => navigation.navigate('StaffProfile')}>
          <Image
            source={{ uri: user?.avatar || `https://api.dicebear.com/7.x/avataaars/png?seed=${user?.fullName}` }}
            style={[styles.avatar, { backgroundColor: staffTheme.iconSurface }]}
          />
          <View>
            <Text style={[styles.greeting, { color: staffTheme.textSoft }]}>Xin chào,</Text>
            <Text style={[styles.userName, { color: staffTheme.textStrong }]}>{user?.fullName || 'Nhân viên'}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bellBtn, { backgroundColor: staffTheme.iconSurface }]}
          onPress={() => setShowNotifications(true)}
        >
          <Bell size={20} color={staffTheme.textMuted} />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={[styles.heroTitle, { color: staffTheme.textStrong }]}>Công việc hôm nay</Text>
          <Text style={[styles.heroSubtitle, { color: staffTheme.textMuted }]}>
            Bộ phận Dịch vụ • {dayjs().format('DD/MM/YYYY')}
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: '#FFF7CD' }]}>
            <Clock3 size={18} color="#B78103" />
            <Text style={styles.statNumber}>{stats.waiting}</Text>
            <Text style={styles.statLabel}>Chờ thực hiện</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#D0F2FF' }]}>
            <ClipboardList size={18} color="#0C53B7" />
            <Text style={styles.statNumber}>{stats.inProgress}</Text>
            <Text style={styles.statLabel}>Đang làm</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#E7F5EF' }]}>
            <CheckCircle2 size={18} color="#007B55" />
            <Text style={styles.statNumber}>{stats.completed}</Text>
            <Text style={styles.statLabel}>Hoàn thành</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: staffTheme.textSoft }]}>BẢNG NHÂN VIÊN</Text>
          <MenuItem
            title="Công việc của tôi"
            subtitle="Xem danh sách thú cưng và ca dịch vụ được giao"
            onPress={() => navigation.navigate('StaffTaskList', {})}
            icon={ClipboardList}
            color="#00A76F"
            staffTheme={staffTheme}
          />
          <MenuItem
            title="Lịch làm việc"
            subtitle="Theo dõi lịch tuần và ca làm của bạn"
            onPress={() => navigation.navigate('StaffWorkSchedule')}
            icon={Calendar}
            color="#0C53B7"
            staffTheme={staffTheme}
          />
          {canViewCustomers && (
            <MenuItem
              title="Khách hàng của tôi"
              subtitle="Tra cứu khách hàng đang phụ trách"
              onPress={() => navigation.navigate('StaffCustomerList')}
              icon={Users}
              color="#7A4100"
              staffTheme={staffTheme}
            />
          )}
        </View>

        {hasManagementItems && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: staffTheme.textSoft }]}>QUẢN LÝ</Text>
            {canViewServices && (
              <MenuItem
                title="Dịch vụ"
                subtitle="Quản lý danh sách dịch vụ theo role trên web"
                onPress={() =>
                  openFeatureInfo(
                    'Dịch vụ',
                    'Tài khoản này có quyền dịch vụ trên web. Mobile chưa có màn quản lý dịch vụ tương đương nên tôi giữ đúng tên menu của role này.',
                  )
                }
                icon={Package}
                color="#8E33FF"
                staffTheme={staffTheme}
              />
            )}
            {canViewBookings && (
              <MenuItem
                title="Đơn dịch vụ"
                subtitle="Xem và xử lý các đơn dịch vụ được phân quyền"
                onPress={() =>
                  openFeatureInfo(
                    'Đơn dịch vụ',
                    'Tài khoản này có quyền đơn dịch vụ trên web. Mobile chưa có màn admin booking tương đương nên mục này đang được giữ đúng theo role và tên gọi.',
                  )
                }
                icon={ClipboardList}
                color="#FF6B00"
                staffTheme={staffTheme}
              />
            )}
            {canViewCalendar && (
              <MenuItem
                title="Lịch"
                subtitle="Xem lịch tổng hợp theo quyền calendar trên web"
                onPress={() => navigation.navigate('StaffScheduleCalendar')}
                icon={CalendarDays}
                color="#005249"
                staffTheme={staffTheme}
              />
            )}
            {canUseChat && (
              <MenuItem
                title="Chat"
                subtitle="Trao đổi nội bộ theo đúng mục sidebar nhân viên web"
                onPress={() =>
                  openFeatureInfo(
                    'Chat',
                    'Sidebar web của nhân viên có mục Chat. Mobile hiện chưa có màn chat staff tương đương nên tôi giữ đúng tên menu và điều hướng về màn thông tin này.',
                  )
                }
                icon={MessageCircle}
                color="#2065D1"
                staffTheme={staffTheme}
              />
            )}
          </View>
        )}

        {loading && (
          <View style={styles.loadingWrap}>
            <ActivityIndicator />
          </View>
        )}
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
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  greeting: { fontSize: 13, fontWeight: '500' },
  userName: { fontSize: 16, fontWeight: '800' },
  bellBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FF4842',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontSize: 8, fontWeight: '900' },
  content: { padding: 20, paddingBottom: 36 },
  hero: { marginBottom: 18 },
  heroTitle: { fontSize: 28, fontWeight: '900' },
  heroSubtitle: { marginTop: 6, fontSize: 14, fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statCard: { flex: 1, borderRadius: 22, paddingVertical: 16, paddingHorizontal: 14 },
  statNumber: { marginTop: 12, fontSize: 24, fontWeight: '900', color: '#111827' },
  statLabel: { marginTop: 4, fontSize: 12, fontWeight: '700', color: '#475467' },
  section: { gap: 12, marginBottom: 18 },
  sectionTitle: { fontSize: 12, fontWeight: '800', marginBottom: 2, letterSpacing: 1 },
  menuItem: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIconWrap: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  menuTextWrap: { flex: 1 },
  menuTitle: { fontSize: 15, fontWeight: '800' },
  menuSubtitle: { marginTop: 3, fontSize: 12, lineHeight: 18, fontWeight: '500' },
  loadingWrap: { paddingVertical: 20, alignItems: 'center' },
});

export default ServiceStaffHomeScreen;
