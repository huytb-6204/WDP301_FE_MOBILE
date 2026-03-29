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
  Calendar as CalendarIcon,
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
import { useTheme } from '../../../context/ThemeContext';
import { getStaffThemeColors } from '../../../theme/staffTheme';
import { apiGet } from '../../../services/api/client';
import { getStaffBoardingBookings } from '../../../services/api/staffBoarding';
import type { StaffStackParamList } from '../../../navigation/StaffNavigator';
import StaffDatePickerModal from '../../../components/common/StaffDatePickerModal';
import { useNotifier } from '../../../context/NotifierContext';

const StaffTaskListScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<StaffStackParamList>>();
  const route = useRoute<any>();
  const { user } = useAuth();
  const { showAlert } = useNotifier();
  const { isDarkMode } = useTheme();
  const staffTheme = getStaffThemeColors(isDarkMode);

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [totalCages, setTotalCages] = useState(20);
  const [filterDate, setFilterDate] = useState(route.params?.date ? dayjs(route.params.date) : dayjs());
  const [showDatePicker, setShowDatePicker] = useState(false);

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
  }, [data, filterDate, (user as any)?._id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bookings, cagesRes] = await Promise.all([
        getStaffBoardingBookings({ limit: 100 }),
        apiGet<any>('/api/v1/admin/boarding-cage?limit=1').catch(() => null)
      ]);
      const arrBookings = bookings || [];
      setData(arrBookings);

      const todayStr = filterDate.format('YYYY-MM-DD');
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
      if (cagesRes?.pagination?.totalRecords) setTotalCages(cagesRes.pagination.totalRecords);
    } catch (error: any) {
      console.error('Failed to fetch data', error);
      showAlert('Lỗi tải dữ liệu', error.message || 'Không thể tải danh sách nhiệm vụ.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterDate]);

  const filteredTasks = useMemo(() => {
    return data.filter((b: any) => {
      const checkInDate = dayjs(b.actualCheckInDate || b.checkInDate).startOf('day');
      const dayIndex = filterDate.diff(checkInDate, 'day');
      const totalDays = b.numberOfDays || 1;
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
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { backgroundColor: staffTheme.surface }]}> 
            <ChevronLeft size={28} color={staffTheme.text} />
          </TouchableOpacity>
          <View>
            <Text style={[styles.topTitle, { color: staffTheme.text }]}>Lịch trình hôm nay</Text>
            <Text style={[styles.topDate, { color: staffTheme.textMuted }]}>
              {filterDate.format('DD/MM/YYYY')} • Chào đón {stats?.totalBookings || filteredTasks.length} bé hôm nay
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
          <TouchableOpacity style={styles.urgentAction} activeOpacity={0.8}>
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
            <View style={[styles.progressFill, { width: `${occupancyPercent}%` }]} />
          </View>
          <Text style={[styles.progressText, { color: staffTheme.textMuted }]}>Công suất đạt {occupancyPercent}%</Text>
        </View>
      </ScrollView>

      <View style={styles.listHeader}>
        <View style={styles.listHeaderLeft}>
          <Image source={require('../../../../assets/app_logo.png')} style={[styles.listIcon, { tintColor: staffTheme.textStrong }]} />
          <Text style={[styles.listTitleText, { color: staffTheme.textStrong }]}>Danh sách phân công</Text>
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
        style={[styles.taskCard, { backgroundColor: staffTheme.surface, borderColor: staffTheme.border, shadowOpacity: isDarkMode ? 0 : 0.05 }]}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('StaffCareDetail', { bookingId: item._id, booking: item })}
      >
        <Image
          source={{ uri: item.petIds?.[0]?.avatar || 'https://api.dicebear.com/7.x/bottts/png?seed=' + item.code }}
          style={[styles.petAvatar, { backgroundColor: staffTheme.iconSurface }]}
        />
        <View style={styles.petInfo}>
          <View style={styles.petHeaderMain}>
            <Text style={[styles.petName, { color: staffTheme.text }]}>{item.petIds?.[0]?.name}</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{item.boardingStatus?.toUpperCase()}</Text>
            </View>
          </View>

          <Text style={[styles.cageInfo, { color: staffTheme.textMuted }]}>{item.cageId?.cageCode || 'Phòng'} • Ngày {dayIndex + 1} trên {totalDays}</Text>

          <View style={styles.tagRow}>
            <View style={styles.tagItem}><Text style={styles.tagText}>Cần cho ăn</Text></View>
            <View style={[styles.tagItem, { backgroundColor: staffTheme.iconSurface }]}> 
              <Text style={[styles.tagText, { color: staffTheme.textStrong }]}>Nhận phòng: {dayjs(item.checkInDate).format('HH:mm A')}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.eyeBtn, { backgroundColor: staffTheme.screen }]}> 
          <Eye size={18} color={staffTheme.textSoft} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: staffTheme.screen }]}> 
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

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
              <CheckCircle2 size={64} color={staffTheme.textSoft} strokeWidth={1} />
              <Text style={[styles.emptyText, { color: staffTheme.text }]}>Mọi thứ đã hoàn thành!</Text>
              <Text style={[styles.emptySub, { color: staffTheme.textMuted }]}>Không tìm thấy nhiệm vụ nào cho ngày này.</Text>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  list: { paddingBottom: 40 },
  topHeader: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 20, gap: 16 },
  headerTitleGroup: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backButton: { width: 44, height: 44, backgroundColor: '#fff', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginLeft: -10 },
  topTitle: { fontSize: 24, fontWeight: '900', color: '#111827' },
  topDate: { fontSize: 13, color: '#637381', marginTop: 4, fontWeight: '600' },
  headerRightActions: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  weatherBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E7F5EF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, gap: 8 },
  weatherText: { fontSize: 13, fontWeight: '700', color: '#007B55' },
  statsRow: { paddingLeft: 20, marginBottom: 32 },
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
  listHeader: { paddingHorizontal: 20, marginBottom: 16 },
  listHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  listIcon: { width: 22, height: 22, tintColor: '#212B36' },
  listTitleText: { fontSize: 16, fontWeight: '800', color: '#212B36' },
  taskCard: { flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 20, borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#F4F6F8', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
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
  emptyText: { fontSize: 18, color: '#111827', fontWeight: '800', marginTop: 16 },
  emptySub: { fontSize: 13, color: '#637381', fontWeight: '500', marginTop: 8, textAlign: 'center' },
});

export default StaffTaskListScreen;
