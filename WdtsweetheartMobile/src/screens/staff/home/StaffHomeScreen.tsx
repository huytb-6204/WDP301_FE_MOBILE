import React, { useEffect, useState, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ActivityIndicator, FlatList, Image, ScrollView, 
  StatusBar, StyleSheet, Text, TouchableOpacity, View 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Bell,
  Calendar,
  ClipboardList,
  MessageSquare,
  Settings,
  Users,
  LayoutGrid,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Building2,
  Clock,
  Eye,
  CloudSun
} from 'lucide-react-native';
import { colors } from '../../../theme/colors';
import { useAuth } from '../../../context/AuthContext';
import { apiGet } from '../../../services/api/client';
import { getBoardingStats, getStaffBoardingBookings } from '../../../services/api/staffBoarding';
import type { StaffStackParamList } from '../../../navigation/StaffNavigator';
import NotificationModal from '../../../components/common/NotificationModal';
import dayjs from 'dayjs';

type MenuItemProps = {
  title: string;
  icon: any;
  screen: keyof StaffStackParamList;
  color: string;
};

const StaffHomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<StaffStackParamList>>();
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [totalCages, setTotalCages] = useState(20); // Default to 20 if fetch fails

  // Calculate Real-time Efficiency based on user assigned tasks
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
            // Feeding Schedule
            const fItemsPerDay = Math.ceil((b.feedingSchedule?.length || 0) / totalDays);
            const fDaily = (b.feedingSchedule || []).slice(dayIndex * fItemsPerDay, (dayIndex + 1) * fItemsPerDay);

            fDaily.forEach((f: any) => {
                if ((f.staffId?._id || f.staffId) === (user as any)?._id) {
                    totalAssigned++;
                    if (f.status === 'done') completedAssigned++;
                }
            });

            // Exercise Schedule
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
      const date = new Date().toISOString().split('T')[0];
      const [statsRes, bookingsRes, notiRes, cagesRes] = await Promise.all([
        getBoardingStats(date),
        getStaffBoardingBookings({ limit: 10 }),
        apiGet<any>('/api/v1/admin/notifications?status=unread'),
        apiGet<any>('/api/v1/admin/boarding-cage?limit=1')
      ]);
      setStats(statsRes);
      setBookings(bookingsRes || []);
      setNotificationCount(Array.isArray(notiRes) ? notiRes.length : notiRes?.data?.length || 0);
      if (cagesRes?.pagination?.totalRecords) {
        setTotalCages(cagesRes.pagination.totalRecords);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const MenuItem = ({ title, icon, screen, color }: MenuItemProps) => (
    <TouchableOpacity 
      style={styles.menuItem} 
      onPress={() => (navigation as any).navigate(screen)}
      activeOpacity={0.6}
    >
      <View style={[styles.menuIconWrap, { backgroundColor: color + '15' }]}>
        {React.createElement(icon, { size: 22, color: color })}
      </View>
      <Text style={styles.menuText}>{title}</Text>
      <ChevronRight size={18} color="#919EAB" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.userInfo} 
          onPress={() => navigation.navigate('StaffProfile')}
        >
          <Image 
            source={{ uri: user?.avatar || 'https://api.dicebear.com/7.x/avataaars/png?seed=' + user?.fullName }} 
            style={styles.avatar} 
          />
          <View style={styles.welcomeInfo}>
            <Text style={styles.welcomeText}>Xin chào,</Text>
            <Text style={styles.userName}>{user?.fullName || 'Nhân viên'}</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.headerBtns}>
            <TouchableOpacity 
              style={styles.headerIconBtn}
              onPress={() => setShowNotifications(true)}
            >
              <Bell size={22} color="#111827" />
              {notificationCount > 0 && (
                <View style={styles.badgeCount}>
                  <Text style={styles.badgeCountText}>
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
        </View>
      </View>

      <NotificationModal 
        visible={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* New Home Header Dashboard Styled */}
        <View style={styles.topDashboardHeader}>
          <View>
            <Text style={styles.topDashboardTitle}>Lịch trình hôm nay</Text>
            <Text style={styles.topDashboardDate}>
              {dayjs().format('DD/MM/YYYY')} — Chào đón {stats?.totalBookings || 0} bé hôm nay
            </Text>
          </View>
          <View style={styles.weatherBox}>
              <CloudSun size={18} color="#007B55" />
              <Text style={styles.weatherText}>28°C Nắng</Text>
          </View>
        </View>

        {/* Statistics Scroll */}
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
             <TouchableOpacity 
                style={styles.urgentAction} 
                onPress={() => navigation.navigate('StaffTaskList', {})}
             >
                 <Text style={styles.urgentActionText}>Xử lý ngay →</Text>
             </TouchableOpacity>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#fff', borderWidth: 1, borderColor: '#F4F6F8' }]}>
             <View style={styles.occupancyHeader}>
                <View style={styles.occIcon}><Users size={16} color="#007B55" /></View>
                <View>
                    <Text style={styles.statLabelGrey}>ĐANG LƯU TRÚ</Text>
                    <Text style={[styles.statValueCompact, { color: '#212B36' }]}>{stats?.activeBookings || 0}</Text>
                </View>
             </View>
             <View style={styles.progressBg}>
                <View style={[styles.progressFill, { width: `${Math.min(100, ((stats?.activeBookings || 0) / (totalCages || 1)) * 100)}%` }]} />
             </View>
             <Text style={styles.progressText}>Công suất đạt {Math.round(((stats?.activeBookings || 0) / (totalCages || 1)) * 100)}%</Text>
          </View>
        </ScrollView>

        {/* Section 1: Tasks Today (Most Important) */}
        <View style={styles.section}>
          <View style={styles.flexRow}>
            <Text style={styles.sectionHeader}>DANH SÁCH PHÂN CÔNG</Text>
            <TouchableOpacity onPress={() => navigation.navigate('StaffTaskList', {})}>
               <Text style={styles.seeAll}>Tất cả</Text>
            </TouchableOpacity>
          </View>
          
          {loading ? (
             <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
          ) : bookings.length === 0 ? (
             <View style={styles.emptyWrap}><Text style={styles.emptyText}>Hôm nay bạn không có lịch trình nào</Text></View>
          ) : (
            bookings.map((item: any) => {
              const checkInDate = dayjs(item.actualCheckInDate || item.checkInDate).startOf('day');
              const dayIndex = dayjs().diff(checkInDate, 'day');
              const totalDays = item.numberOfDays || 1;

              return (
                <TouchableOpacity 
                  key={item._id} 
                  style={styles.taskCard} 
                  onPress={() => navigation.navigate('StaffCareDetail', { bookingId: item._id, booking: item })}
                >
                  <Image 
                    source={{ uri: item.petIds?.[0]?.avatar || 'https://api.dicebear.com/7.x/bottts/png?seed=' + item.code }} 
                    style={styles.petAvatar} 
                  />
                  <View style={styles.petInfo}>
                    <View style={styles.petHeaderMain}>
                      <Text style={styles.petName}>{item.petIds?.[0]?.name || 'Thú cưng'}</Text>
                      <View style={styles.statusBadge}>
                          <Text style={styles.statusText}>{item.boardingStatus?.toUpperCase()}</Text>
                      </View>
                    </View>
                    
                    <Text style={styles.cageInfo}>{item.cageId?.cageCode || 'Chưa xếp phòng'} • Ngày {dayIndex + 1} trên {totalDays}</Text>
                    
                    <View style={styles.tagRow}>
                       <View style={styles.tagItem}><Text style={styles.tagText}>Cần cho ăn</Text></View>
                       <View style={[styles.tagItem, { backgroundColor: '#F4F6F8' }]}>
                          <Text style={[styles.tagText, { color: '#212B36' }]}>Nhận phòng: {dayjs(item.checkInDate).format('HH:mm A')}</Text>
                       </View>
                    </View>
                  </View>
                  
                  <View style={styles.eyeBtn}>
                      <Eye size={16} color="#919EAB" />
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Section 2: Dashboard Menu */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>TIỆN ÍCH PHỤ TRỢ</Text>
          <View style={styles.cardWrapper}>
            <MenuItem title="Lịch làm việc" icon={Calendar} screen="StaffWorkSchedule" color="#1890FF" />
            <View style={styles.divider} />
            <MenuItem title="Khách hàng của tôi" icon={Users} screen="StaffCustomerList" color="#7A4100" />
            <View style={styles.divider} />
            <MenuItem title="Đội ngũ nhân sự" icon={Building2} screen="DepartmentList" color="#542DB1" />
            <View style={styles.divider} />
            <MenuItem title="Lịch trực" icon={Clock} screen="StaffShiftList" color="#FFAB00" />
            <View style={styles.divider} />
            <MenuItem title="Cài đặt hệ thống" icon={Settings} screen="StaffProfile" color="#637381" />
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
    backgroundColor: '#fff'
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
    alignItems: 'center', borderWidth: 1.5, borderColor: '#fff' 
  },
  badgeCountText: { fontSize: 8, color: '#fff', fontWeight: '900' },
  scroll: { paddingVertical: 16 },
  
  topDashboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 8,
  },
  topDashboardTitle: { fontSize: 24, fontWeight: '900', color: '#111827' },
  topDashboardDate: { fontSize: 13, color: '#637381', marginTop: 4, fontWeight: '600' },
  weatherBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E7F5EF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 8
  },
  weatherText: { fontSize: 13, fontWeight: '700', color: '#007B55' },

  statsRow: { paddingLeft: 20, marginBottom: 24 },
  statCard: { 
    width: 240, padding: 16, borderRadius: 24, marginRight: 16,
    minHeight: 140, justifyContent: 'center'
  },
  statIconWrap: { 
    width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.2)', 
    alignItems: 'center', justifyContent: 'center', marginBottom: 12
  },
  statLabel: { fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.8)', letterSpacing: 1 },
  statValue: { fontSize: 24, fontWeight: '900', color: '#fff', marginTop: 8 },
  statSmall: { fontSize: 14, fontWeight: '700' },
  statDesc: { fontSize: 12, fontWeight: '500', color: 'rgba(255,255,255,0.6)', marginTop: 4 },
  urgentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  urgentAction: { marginTop: 12 },
  urgentActionText: { color: '#B78103', fontSize: 13, fontWeight: '800' },
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
  
  cardWrapper: { backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff' },
  menuIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  menuText: { flex: 1, fontSize: 15, fontWeight: '600', color: '#212B36' },
  divider: { height: 1, backgroundColor: '#F4F6F8', marginHorizontal: 16 },
  
  taskCard: { 
    flexDirection: 'row', backgroundColor: '#fff', 
    borderRadius: 20, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: '#F4F6F8',
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 10
  },
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
  emptyText: { color: '#919EAB', fontSize: 14, fontWeight: '500' }
});

export default StaffHomeScreen;
