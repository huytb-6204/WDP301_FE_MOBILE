import React, { useState, useEffect, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView, ActivityIndicator, Alert, Platform, StatusBar as RNStatusBar } from 'react-native';
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  CalendarDays,
  XCircle,
  LogIn,
  LogOut
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import { colors } from '../../../theme/colors';
import { getMySchedules, checkInSchedule, checkOutSchedule, WorkSchedule } from '../../../services/api/workSchedule';
import StaffDatePickerModal from '../../../components/common/StaffDatePickerModal';

dayjs.locale('vi');

const StaffWorkScheduleScreen = () => {
  const navigation = useNavigation();
  const [viewDate, setViewDate] = useState(dayjs());
  const [loading, setLoading] = useState(false);
  const [schedules, setSchedules] = useState<WorkSchedule[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const startDate = viewDate.startOf('week').format("YYYY-MM-DD");
  const endDate = viewDate.endOf('week').format("YYYY-MM-DD");

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const data = await getMySchedules({ startDate, endDate });
      setSchedules(data || []);
    } catch (error) {
      console.error('Failed to fetch schedules', error);
      Alert.alert('Lỗi', 'Không thể tải lịch làm việc');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [startDate, endDate]);

  const weekDays = useMemo(() => {
    const days = [];
    let current = viewDate.startOf('week');
    for (let i = 0; i < 7; i++) {
      days.push(current);
      current = current.add(1, 'day');
    }
    return days;
  }, [viewDate]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'scheduled': return { bg: '#FFF7CD', color: '#B78103', label: 'Chưa tới', icon: Clock };
      case 'checked-in': return { bg: '#D0F2FF', color: '#0C53B7', label: 'Đang làm', icon: LogIn };
      case 'checked-out': return { bg: '#E7F5EF', color: '#007B55', label: 'Hoàn tất', icon: CheckCircle2 };
      case 'absent': return { bg: '#FFE7E6', color: '#FF4842', label: 'Vắng mặt', icon: XCircle };
      default: return { bg: '#F4F6F8', color: '#637381', label: 'N/A', icon: Clock };
    }
  };

  const handleCheckIn = async (id: string) => {
    setActionLoading(id);
    try {
      await checkInSchedule(id);
      Alert.alert('Thành công', 'Đã check-in thành công!');
      fetchSchedules();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể check-in');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCheckOut = async (id: string) => {
    setActionLoading(id);
    try {
      await checkOutSchedule(id);
      Alert.alert('Thành công', 'Đã check-out thành công!');
      fetchSchedules();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể check-out');
    } finally {
      setActionLoading(null);
    }
  };

  const renderDayItem = (day: dayjs.Dayjs) => {
    const shift = schedules.find(s => dayjs(s.date).isSame(day, 'day'));
    const isToday = day.isSame(dayjs(), 'day');
    const statusStyle = shift ? getStatusStyle(shift.status) : null;

    return (
      <View key={day.toISOString()} style={[styles.dayCard, isToday && styles.todayCard]}>
        <View style={styles.dayHeader}>
          <Text style={[styles.dayName, isToday && styles.todayText]}>{day.format('ddd')}</Text>
          <Text style={[styles.dayNumber, isToday && styles.todayText]}>{day.format('DD')}</Text>
        </View>

        <View style={styles.dayContent}>
          {shift ? (
            <View>
              <Text style={styles.shiftName}>{shift.shiftId?.name}</Text>
              <Text style={styles.shiftTime}>{shift.shiftId?.startTime} - {shift.shiftId?.endTime}</Text>
              
              <View style={[styles.statusBadge, { backgroundColor: statusStyle?.bg }]}>
                {statusStyle && <statusStyle.icon size={12} color={statusStyle.color} />}
                <Text style={[styles.statusText, { color: statusStyle?.color }]}>{statusStyle?.label}</Text>
              </View>

              {isToday && (
                <View style={styles.actionRow}>
                  {shift.status === 'scheduled' && (
                    <TouchableOpacity 
                      style={styles.checkBtn} 
                      onPress={() => handleCheckIn(shift._id)}
                      disabled={actionLoading === shift._id}
                    >
                      {actionLoading === shift._id ? <ActivityIndicator size="small" color="#fff" /> : (
                        <>
                          <LogIn size={16} color="#fff" />
                          <Text style={styles.checkBtnText}>Check-in</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  )}
                  {shift.status === 'checked-in' && (
                    <TouchableOpacity 
                      style={[styles.checkBtn, { backgroundColor: '#FFAB00' }]} 
                      onPress={() => handleCheckOut(shift._id)}
                      disabled={actionLoading === shift._id}
                    >
                      {actionLoading === shift._id ? <ActivityIndicator size="small" color="#fff" /> : (
                        <>
                          <LogOut size={16} color="#fff" />
                          <Text style={styles.checkBtnText}>Check-out</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          ) : (
            <Text style={styles.offText}>Nghỉ</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch làm việc</Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.todayBtn}>
          <CalendarIcon size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.weekSelector}>
        <TouchableOpacity onPress={() => setViewDate(prev => prev.subtract(1, 'week'))} style={styles.arrowBtn}>
          <ChevronLeft size={24} color="#637381" />
        </TouchableOpacity>
        <View style={styles.weekInfo}>
          <Text style={styles.weekLabel}>Tuần này</Text>
          <Text style={styles.weekValue}>{viewDate.startOf('week').format("DD/MM")} - {viewDate.endOf('week').format("DD/MM")}</Text>
        </View>
        <TouchableOpacity onPress={() => setViewDate(prev => prev.add(1, 'week'))} style={styles.arrowBtn}>
          <ChevronRight size={24} color="#637381" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Đang tải lịch làm việc...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          {weekDays.map(day => renderDayItem(day))}
        </ScrollView>
      )}

      <StaffDatePickerModal 
        visible={showDatePicker} 
        date={viewDate} 
        onClose={() => setShowDatePicker(false)} 
        onSelect={setViewDate} 
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
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 16, 
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F4F6F8'
  },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  todayBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  weekSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 8
  },
  arrowBtn: { padding: 8 },
  weekInfo: { alignItems: 'center' },
  weekLabel: { fontSize: 12, color: '#637381', fontWeight: '600', textTransform: 'uppercase' },
  weekValue: { fontSize: 16, color: '#111827', fontWeight: '800', marginTop: 2 },
  scroll: { padding: 16 },
  dayCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5
  },
  todayCard: { borderColor: colors.primary, borderWidth: 1.5 },
  dayHeader: { width: 50, alignItems: 'center', justifyContent: 'center', borderRightWidth: 1, borderRightColor: '#F4F6F8', paddingRight: 12 },
  dayName: { fontSize: 12, color: '#637381', fontWeight: '700', textTransform: 'uppercase' },
  dayNumber: { fontSize: 20, color: '#212B36', fontWeight: '900', marginTop: 4 },
  todayText: { color: colors.primary },
  dayContent: { flex: 1, paddingLeft: 16, justifyContent: 'center' },
  shiftName: { fontSize: 16, fontWeight: '800', color: '#212B36' },
  shiftTime: { fontSize: 13, color: '#637381', marginTop: 2, fontWeight: '500' },
  statusBadge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginTop: 8 },
  statusText: { fontSize: 10, fontWeight: '800', marginLeft: 4 },
  offText: { fontSize: 14, color: '#919EAB', fontStyle: 'italic', fontWeight: '500' },
  actionRow: { flexDirection: 'row', marginTop: 12, gap: 8 },
  checkBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  checkBtnText: { color: '#fff', fontSize: 13, fontWeight: '700', marginLeft: 6 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 12, color: '#637381', fontWeight: '600' },
});

export default StaffWorkScheduleScreen;
