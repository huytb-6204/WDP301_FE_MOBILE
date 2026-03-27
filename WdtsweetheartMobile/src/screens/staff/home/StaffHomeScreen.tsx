import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Bell,
  Calendar,
  CheckCircle,
  ClipboardList,
  MessageSquare,
  Settings,
  Users,
  LayoutGrid,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react-native';
import { colors } from '../../../theme/colors';
import { useAuth } from '../../../context/AuthContext';
import { getBoardingStats, getStaffBoardingBookings } from '../../../services/api/staffBoarding';
import type { StaffStackParamList } from '../../../navigation/StaffNavigator';

const StaffHomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<StaffStackParamList>>();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const date = new Date().toISOString().split('T')[0];
        const [statsRes, bookingsRes] = await Promise.all([
          getBoardingStats(date),
          getStaffBoardingBookings({ limit: 5 })
        ]);
        setStats(statsRes);
        setBookings(bookingsRes || []);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const renderStatCard = (title: string, value: string | number, subtitle: string, icon: any, color: string, bgColor: string) => (
    <View style={[styles.statCard, { backgroundColor: bgColor }]}>
      <View style={styles.statIconWrap}>
         {React.createElement(icon, { size: 24, color: color })}
      </View>
      <View>
        <Text style={[styles.statValue, { color: color }]}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
        <Text style={styles.statSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );

  const renderQuickAction = (title: string, icon: any, screen: keyof StaffStackParamList, color: string) => (
    <TouchableOpacity 
       style={styles.actionItem} 
       onPress={() => (navigation as any).navigate(screen)}
       activeOpacity={0.7}
    >
      <View style={[styles.actionIconWrap, { backgroundColor: color + '15' }]}>
        {React.createElement(icon, { size: 24, color: color })}
      </View>
      <Text style={styles.actionText}>{title}</Text>
    </TouchableOpacity>
  );

  const handleLogout = async () => {
    try {
      await logout();
      (navigation as any).reset({
        index: 0,
        routes: [{ name: 'WelcomeChoice' }],
      });
    } catch (error) {
      console.error('Staff logout error', error);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Chào buổi sáng,</Text>
          <Text style={styles.userName}>{(user as any)?.fullName || 'Nhân viên'}</Text>
        </View>
        <TouchableOpacity style={styles.headerIcon}>
           <Bell size={24} color={colors.secondary} />
           <View style={styles.dot} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.performanceRow}>
           {renderStatCard("HIỆU SUẤT", "92%", "Tăng 5%", TrendingUp, "#007B55", "#E7F5EF")}
           {renderStatCard("KHẨN CẤP", stats?.urgentFeeding || 0, "Cần cho ăn", AlertCircle, "#B76E00", "#FEE9D1")}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chức năng công việc</Text>
          <View style={styles.grid}>
            {renderQuickAction("Công việc", ClipboardList, "StaffTaskList", "#0C53B7")}
            {renderQuickAction("Chăm sóc", Calendar, "StaffTaskList", "#007B55")}
            {renderQuickAction("Hồ sơ KH", Users, "StaffCustomerList", "#7A4100")}
            {renderQuickAction("Phòng nội trú", LayoutGrid, "StaffCages", "#111827")}
            {renderQuickAction("Trò chuyện", MessageSquare, "StaffChat", "#542DB1")}
            {renderQuickAction("Cài đặt", Settings, "StaffHome", "#637381")}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Lịch trình hôm nay</Text>
            <TouchableOpacity onPress={() => (navigation as any).navigate('StaffTaskList')}>
              <Text style={styles.seeAll}>Xem hết</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
             <ActivityIndicator color={colors.primary} />
          ) : bookings.length === 0 ? (
             <View style={styles.emptyWrap}><Text style={styles.emptyText}>Chưa có lịch trình nào</Text></View>
          ) : bookings.map((item: any) => (
            <TouchableOpacity 
              key={item._id} 
              style={styles.taskCard} 
              activeOpacity={0.9}
              onPress={() => (navigation as any).navigate('StaffCareDetail', { bookingId: item._id, booking: item })}
            >
              <Image 
                source={{ uri: item.petIds?.[0]?.avatar || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=200&auto=format&fit=crop' }} 
                style={styles.petThumb} 
              />
              <View style={styles.taskInfo}>
                <Text style={styles.petName}>{item.petIds?.[0]?.name || 'Thú cưng'}</Text>
                <Text style={styles.taskMeta}>Phòng: {item.cageId?.cageCode || '...'} • {item.boardingStatus}</Text>
                <View style={styles.tagRow}>
                   <View style={styles.taskTag}><Text style={styles.tagText}>{item.feedingSchedule?.length || 0} bữa ăn</Text></View>
                   <View style={[styles.taskTag, { backgroundColor: '#E0F2FE' }]}><Text style={[styles.tagText, { color: '#0C53B7' }]}>{item.exerciseSchedule?.length || 0} bài tập</Text></View>
                </View>
              </View>
              <ChevronRight size={20} color="#919EAB" />
            </TouchableOpacity>
          )) }
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Đăng xuất tài khoản</Text>
        </TouchableOpacity>
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
    paddingHorizontal: 24, 
    paddingVertical: 20 
  },
  welcomeText: { fontSize: 16, color: '#637381', fontWeight: '500' },
  userName: { fontSize: 24, color: '#111827', fontWeight: '800', marginTop: 4 },
  headerIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  dot: { position: 'absolute', top: 12, right: 12, width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF4842', borderWidth: 2, borderColor: '#fff' },
  scroll: { paddingBottom: 40 },
  performanceRow: { flexDirection: 'row', paddingHorizontal: 24, gap: 12, marginBottom: 24 },
  statCard: { flex: 1, padding: 16, borderRadius: 24, minHeight: 140 },
  statIconWrap: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.4)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  statValue: { fontSize: 24, fontWeight: '800' },
  statTitle: { fontSize: 13, color: '#111827', fontWeight: '700', marginTop: 2 },
  statSubtitle: { fontSize: 11, color: '#637381', fontWeight: '500', opacity: 0.7 },
  section: { paddingHorizontal: 24, marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 16 },
  seeAll: { color: colors.primary, fontWeight: '700', fontSize: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionItem: { 
    width: '31%', 
    aspectRatio: 1, 
    backgroundColor: '#fff', 
    borderRadius: 20, 
    alignItems: 'center', 
    justifyContent: 'center', 
    elevation: 3, 
    shadowColor: '#000', 
    shadowOpacity: 0.05, 
    shadowRadius: 10,
    marginBottom: 4
  },
  actionIconWrap: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  actionText: { fontSize: 13, fontWeight: '700', color: '#111827' },
  taskCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    padding: 12, 
    borderRadius: 24, 
    marginBottom: 12,
    elevation: 4,
    shadowColor: '#919EAB',
    shadowOpacity: 0.1,
    shadowRadius: 10
  },
  petThumb: { width: 64, height: 64, borderRadius: 16 },
  taskInfo: { flex: 1, marginLeft: 16 },
  petName: { fontSize: 16, fontWeight: '800', color: '#111827' },
  taskMeta: { fontSize: 13, color: '#637381', marginBottom: 8, marginTop: 2 },
  tagRow: { flexDirection: 'row', gap: 6 },
  taskTag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, backgroundColor: '#F4F6F8' },
  tagText: { fontSize: 10, fontWeight: '800', color: '#637381' },
  logoutBtn: { margin: 24, marginTop: 12, padding: 18, borderRadius: 18, backgroundColor: '#FFF2F2', alignItems: 'center' },
  logoutText: { color: '#FF4842', fontWeight: '700', fontSize: 15 },
  emptyWrap: { padding: 40, alignItems: 'center', backgroundColor: '#fff', borderRadius: 24 },
  emptyText: { color: '#919EAB', fontWeight: '600' },
});

export default StaffHomeScreen;
