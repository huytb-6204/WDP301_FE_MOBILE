<<<<<<< HEAD
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ArrowLeft,
  Bone,
  Calendar as CalendarIcon,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Flame,
  Search,
} from 'lucide-react-native';
import { colors } from '../../../theme/colors';
import { getStaffBoardingBookings } from '../../../services/api/staffBoarding';
import type { StaffStackParamList } from '../../../navigation/StaffNavigator';

const startOfDay = (value: string | Date) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const addDays = (date: Date, amount: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
};

const diffDays = (left: Date, right: Date) => {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((left.getTime() - right.getTime()) / msPerDay);
};

const formatWeekday = (date: Date) =>
  date.toLocaleDateString('vi-VN', { weekday: 'long' }).replace(/^./, (char) => char.toUpperCase());

const formatDate = (date: Date) => date.toLocaleDateString('vi-VN');

const StaffTaskListScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<StaffStackParamList>>();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [filterDate, setFilterDate] = useState(startOfDay(new Date()));
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const bookings = await getStaffBoardingBookings();
      setData(bookings || []);
    } catch (error) {
      console.error('Failed to fetch bookings', error);
=======
import React, { useEffect, useState, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ActivityIndicator, FlatList, StatusBar, StyleSheet, 
  Text, TouchableOpacity, View, Image, 
  Platform, StatusBar as RNStatusBar, ScrollView
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Search,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Eye,
  CloudSun,
  Users,
  ChevronLeft
} from 'lucide-react-native';
import dayjs from 'dayjs';
import { colors } from '../../../theme/colors';
import { useAuth } from '../../../context/AuthContext';
import { apiGet } from '../../../services/api/client';
import { getStaffBoardingBookings, getBoardingStats } from '../../../services/api/staffBoarding';
import type { StaffStackParamList } from '../../../navigation/StaffNavigator';
import StaffDatePickerModal from '../../../components/common/StaffDatePickerModal';
import { useNotifier } from '../../../context/NotifierContext';

const StaffTaskListScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<StaffStackParamList>>();
  const route = useRoute<any>();
  const { user } = useAuth();
  const { showAlert } = useNotifier();
  
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [totalCages, setTotalCages] = useState(20);
  const [filterDate, setFilterDate] = useState(route.params?.date ? dayjs(route.params.date) : dayjs());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Calculate Real-time Efficiency based on user assigned tasks for selected date
  const efficiency = useMemo(() => {
    if (!data || data.length === 0 || !(user as any)?._id) return 0;
    
    let totalAssigned = 0;
    let completedAssigned = 0;
    const dateStr = filterDate.format('YYYY-MM-DD');

    data.forEach((b: any) => {
        const checkInDate = dayjs(b.actualCheckInDate || b.checkInDate).startOf('day');
        const dayIndex = dayjs(dateStr).diff(checkInDate, 'day');
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
  }, [data, filterDate, (user as any)?._id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const dateStr = filterDate.format('YYYY-MM-DD');
      const [bookings, statsData, cagesRes] = await Promise.all([
         getStaffBoardingBookings(),
         getBoardingStats(dateStr),
         apiGet<any>('/api/v1/admin/boarding-cage?limit=1')
      ]);
      setData(bookings || []);
      setStats(statsData);
      if (cagesRes?.pagination?.totalRecords) {
        setTotalCages(cagesRes.pagination.totalRecords);
      }
    } catch (error: any) {
      console.error('Failed to fetch data', error);
      showAlert('Lỗi tải dữ liệu', error.message || 'Không thể tải danh sách nhiệm vụ.', 'error');
>>>>>>> main
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
<<<<<<< HEAD
    fetchTasks();
  }, []);

  const filteredTasks = useMemo(() => {
    return data.filter((booking: any) => {
      const checkInDate = startOfDay(booking.actualCheckInDate || booking.checkInDate);
      const dayIndex = diffDays(filterDate, checkInDate);
      const totalDays = booking.numberOfDays || 1;
      const petName = booking.petIds?.[0]?.name?.toLowerCase?.() || '';
      const bookingCode = booking.code?.toLowerCase?.() || '';
      const query = searchQuery.trim().toLowerCase();

      const isDateMatch = dayIndex >= 0 && dayIndex < totalDays;
      const isSearchMatch = !query || petName.includes(query) || bookingCode.includes(query);
      return isDateMatch && isSearchMatch;
    });
  }, [data, filterDate, searchQuery]);

  const renderTaskItem = ({ item }: { item: any }) => {
    const checkInDate = startOfDay(item.actualCheckInDate || item.checkInDate);
    const dayIndex = diffDays(filterDate, checkInDate);
    const totalDays = item.numberOfDays || 1;

    return (
      <TouchableOpacity
        style={styles.taskCard}
        activeOpacity={0.82}
        onPress={() => navigation.navigate('StaffCareDetail', { bookingId: item._id, booking: item })}
      >
        <View style={styles.cardHeader}>
          <Image
            source={{ uri: item.petIds?.[0]?.avatar || 'https://via.placeholder.com/100' }}
            style={styles.petAvatar}
          />
          <View style={styles.petInfo}>
            <Text style={styles.petName}>{item.petIds?.[0]?.name || 'Thú cưng'}</Text>
            <Text style={styles.cageInfo}>
              Chuồng: {item.cageId?.cageCode || 'N/A'} • Ngày {dayIndex + 1}/{totalDays}
            </Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>ĐANG Ở</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.schedulePreview}>
          <View style={styles.scheduleRow}>
            <Bone size={16} color="#007B55" />
            <Text style={styles.scheduleValue}>{item.scheduleSummary?.feedingCount || 0} bữa ăn</Text>
          </View>
          <View style={styles.scheduleRow}>
            <Flame size={16} color="#B78103" />
            <Text style={styles.scheduleValue}>{item.scheduleSummary?.exerciseCount || 0} vận động</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.actionPrompt}>Chi tiết chăm sóc</Text>
          <ChevronRight size={16} color={colors.primary} />
=======
    fetchData();
  }, [filterDate]);

  const filteredTasks = useMemo(() => {
    return data.filter((b: any) => {
      const checkInDate = dayjs(b.actualCheckInDate || b.checkInDate).startOf('day');
      const dayIndex = filterDate.diff(checkInDate, 'day');
      const totalDays = b.numberOfDays || 1;
      
      // Keep only tasks relevant to CURRENT filterDate
      return dayIndex >= 0 && dayIndex < totalDays;
    });
  }, [data, filterDate]);

  const occupancyPercent = useMemo(() => {
      if (!totalCages) return 0;
      const count = stats?.activeBookings || filteredTasks.length;
      return Math.round((count / totalCages) * 100);
  }, [stats, filteredTasks, totalCages]);

  const renderHeader = () => (
    <View>
      <View style={styles.topHeader}>
        <View style={styles.headerTitleGroup}>
           <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <ChevronLeft size={28} color="#111827" />
           </TouchableOpacity>
           <View>
              <Text style={styles.topTitle}>Lịch trình hôm nay</Text>
              <Text style={styles.topDate}>
                {filterDate.format('DD/MM/YYYY')} — Chào đón {stats?.totalBookings || filteredTasks.length} bé hôm nay
              </Text>
           </View>
        </View>

        <View style={styles.headerRightActions}>
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.weatherBox}>
                <CalendarIcon size={18} color="#007B55" />
                <Text style={styles.weatherText}>Lịch</Text>
            </TouchableOpacity>
            <View style={[styles.weatherBox, { marginLeft: 8 }]}>
                <CloudSun size={18} color="#007B55" />
                <Text style={styles.weatherText}>28°C Nắng</Text>
            </View>
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
             <TouchableOpacity style={styles.urgentAction} activeOpacity={0.7}>
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
                <View style={[styles.progressFill, { width: `${occupancyPercent}%` }]} />
             </View>
             <Text style={styles.progressText}>Công suất đạt {occupancyPercent}%</Text>
          </View>
      </ScrollView>

      <View style={styles.listHeader}>
         <View style={styles.listHeaderLeft}>
            <Image source={require('../../../../assets/app_logo.png')} style={styles.listIcon} />
            <Text style={styles.listTitleText}>Danh sách phân công</Text>
         </View>
      </View>
    </View>
  );

  const renderTaskItem = ({ item }: { item: any }) => {
    const checkInDate = dayjs(item.actualCheckInDate || item.checkInDate).startOf('day');
    const dayIndex = filterDate.diff(checkInDate, 'day');
    const totalDays = item.numberOfDays || 1;

    return (
      <TouchableOpacity 
        style={styles.taskCard} 
        activeOpacity={0.8}
        onPress={() => navigation.navigate('StaffCareDetail', { bookingId: item._id, booking: item })}
      >
        <Image 
          source={{ uri: item.petIds?.[0]?.avatar || 'https://api.dicebear.com/7.x/bottts/png?seed=' + item.code }} 
          style={styles.petAvatar} 
        />
        <View style={styles.petInfo}>
          <View style={styles.petHeaderMain}>
            <Text style={styles.petName}>{item.petIds?.[0]?.name}</Text>
            <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{item.boardingStatus?.toUpperCase()}</Text>
            </View>
          </View>
          
          <Text style={styles.cageInfo}>{item.cageId?.cageCode || 'Phòng'} • Ngày {dayIndex + 1} trên {totalDays}</Text>
          
          <View style={styles.tagRow}>
             <View style={styles.tagItem}><Text style={styles.tagText}>Cần cho ăn</Text></View>
             <View style={[styles.tagItem, { backgroundColor: '#F4F6F8' }]}>
                <Text style={[styles.tagText, { color: '#212B36' }]}>Nhận phòng: {dayjs(item.checkInDate).format('HH:mm A')}</Text>
             </View>
          </View>
        </View>
        
        <View style={styles.eyeBtn}>
            <Eye size={18} color="#919EAB" />
>>>>>>> main
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
<<<<<<< HEAD
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nhiệm vụ hôm nay</Text>
        <TouchableOpacity style={styles.calendarBtn}>
          <CalendarIcon size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.dateSelector}>
        <TouchableOpacity onPress={() => setFilterDate((prev: Date) => addDays(prev, -1))} style={styles.dateArrow}>
          <ChevronLeft size={24} color="#637381" />
        </TouchableOpacity>
        <View style={styles.dateInfo}>
          <Text style={styles.dateLabel}>{formatWeekday(filterDate)}</Text>
          <Text style={styles.dateValue}>{formatDate(filterDate)}</Text>
        </View>
        <TouchableOpacity onPress={() => setFilterDate((prev: Date) => addDays(prev, 1))} style={styles.dateArrow}>
          <ChevronRight size={24} color="#637381" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchBar}>
        <Search size={20} color="#919EAB" />
        <TextInput
          placeholder="Tìm tên thú cưng hoặc mã đơn..."
          placeholderTextColor="#919EAB"
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.loadingText}>Đang tải nhiệm vụ...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item._id}
          renderItem={renderTaskItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <CheckCircle2 size={64} color="#919EAB" strokeWidth={1} />
              <Text style={styles.emptyText}>Mọi thứ đã hoàn thành!</Text>
              <Text style={styles.emptySub}>Không tìm thấy nhiệm vụ nào trong ngày này.</Text>
            </View>
          }
        />
      )}
=======
      
      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item._id}
        renderItem={renderTaskItem}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={fetchData}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyWrap}>
              <CheckCircle2 size={64} color="#919EAB" strokeWidth={1} />
              <Text style={styles.emptyText}>Mọi thứ đã hoàn thành!</Text>
              <Text style={styles.emptySub}>Không tìm thấy nhiệm vụ nào cho ngày này.</Text>
            </View>
          ) : null
        }
      />

      <StaffDatePickerModal 
        visible={showDatePicker} 
        date={filterDate} 
        onClose={() => setShowDatePicker(false)} 
        onSelect={setFilterDate} 
      />
>>>>>>> main
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
<<<<<<< HEAD
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F4F6F8',
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  calendarBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  dateArrow: { padding: 8 },
  dateInfo: { alignItems: 'center' },
  dateLabel: { fontSize: 13, color: '#637381', fontWeight: '600', textTransform: 'uppercase', marginBottom: 2 },
  dateValue: { fontSize: 18, color: '#111827', fontWeight: '800' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    height: 48,
    borderWidth: 1,
    borderColor: '#F4F6F8',
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: '#111827', fontWeight: '500' },
  list: { padding: 16, paddingBottom: 40 },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#919EAB',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  petAvatar: { width: 56, height: 56, borderRadius: 16, backgroundColor: '#F4F6F8' },
  petInfo: { flex: 1, marginLeft: 16 },
  petName: { fontSize: 17, fontWeight: '800', color: '#111827' },
  cageInfo: { fontSize: 13, color: '#637381', marginTop: 2, fontWeight: '500' },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#E7F5EF',
    borderRadius: 8,
  },
  statusText: { fontSize: 10, fontWeight: '800', color: '#007B55' },
  divider: { height: 1, backgroundColor: '#F4F6F8', marginVertical: 16 },
  schedulePreview: { flexDirection: 'row', gap: 20 },
  scheduleRow: { flexDirection: 'row', alignItems: 'center' },
  scheduleValue: { fontSize: 14, color: '#212B36', fontWeight: '700', marginLeft: 8 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F4F6F8',
  },
  actionPrompt: { fontSize: 14, color: colors.primary, fontWeight: '800' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  loadingText: { marginTop: 12, color: '#637381', fontWeight: '600' },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
=======
  safe: { 
    flex: 1, 
    backgroundColor: '#F9FAFB',
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0, 
  },
  list: { paddingBottom: 40 },
  topHeader: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    gap: 16
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  backButton: {
    width: 44,
    height: 44,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -10, // Adjust to align with menu items
  },
  topTitle: { fontSize: 24, fontWeight: '900', color: '#111827' },
  topDate: { fontSize: 13, color: '#637381', marginTop: 4, fontWeight: '600' },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8
  },
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
  statsRow: { paddingLeft: 20, marginBottom: 32 },
  statCard: { 
    width: 240, 
    padding: 16, 
    borderRadius: 24, 
    marginRight: 16,
    minHeight: 140,
    justifyContent: 'center'
  },
  statIconWrap: { 
    width: 32, 
    height: 32, 
    borderRadius: 10, 
    backgroundColor: 'rgba(255,255,255,0.2)', 
    alignItems: 'center', 
    justifyContent: 'center',
    marginBottom: 12
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
  listHeader: { paddingHorizontal: 20, marginBottom: 16 },
  listHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  listIcon: { width: 22, height: 22, tintColor: '#212B36' },
  listTitleText: { fontSize: 16, fontWeight: '800', color: '#212B36' },
  taskCard: { 
    flexDirection: 'row',
    backgroundColor: '#fff', 
    marginHorizontal: 20,
    borderRadius: 20, 
    padding: 16, 
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F4F6F8',
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10
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
  eyeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F9FAFB', alignItems: 'center', justifyContent: 'center' },
  emptyWrap: { padding: 40, alignItems: 'center', justifyContent: 'center' },
>>>>>>> main
  emptyText: { fontSize: 18, color: '#111827', fontWeight: '800', marginTop: 16 },
  emptySub: { fontSize: 13, color: '#637381', fontWeight: '500', marginTop: 8, textAlign: 'center' },
});

export default StaffTaskListScreen;
