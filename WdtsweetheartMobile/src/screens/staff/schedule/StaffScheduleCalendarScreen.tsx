import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ActivityIndicator, Alert, ScrollView, Platform, StatusBar as RNStatusBar } from 'react-native';
import { ArrowLeft, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Building2 } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../../theme/colors';
import { getCalendarData } from '../../../services/api/workSchedule';
import StaffDatePickerModal from '../../../components/common/StaffDatePickerModal';
import dayjs from 'dayjs';

const StaffScheduleCalendarScreen = () => {
  const navigation = useNavigation();
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [loading, setLoading] = useState(false);
  const [calendarData, setCalendarData] = useState<any[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    fetchData();
  }, [currentDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getCalendarData(currentDate.month() + 1, currentDate.year());
      setCalendarData(data || []);
    } catch (error) {
      console.error('Failed to fetch calendar data', error);
      Alert.alert('Lỗi', 'Không thể tải lịch trình chung');
    } finally {
      setLoading(false);
    }
  };

  const daysInMonth = currentDate.daysInMonth();
  const firstDayOfMonth = currentDate.startOf('month').day();
  
  const generateCalendarDays = () => {
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(i);
    }
    return days;
  };

  const daysArray = generateCalendarDays();
  const weekDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch trình chung</Text>
        <TouchableOpacity style={styles.todayBtn} onPress={() => setShowDatePicker(true)}>
          <CalendarIcon size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.monthSelector}>
        <TouchableOpacity onPress={() => setCurrentDate((prev: dayjs.Dayjs) => prev.subtract(1, 'month'))} style={styles.arrowBtn}>
          <ChevronLeft size={24} color="#637381" />
        </TouchableOpacity>
        <Text style={styles.monthLabel}>Tháng {currentDate.format('M/YYYY')}</Text>
        <TouchableOpacity onPress={() => setCurrentDate((prev: dayjs.Dayjs) => prev.add(1, 'month'))} style={styles.arrowBtn}>
          <ChevronRight size={24} color="#637381" />
        </TouchableOpacity>
      </View>

      <View style={styles.weekDays}>
        {weekDays.map((d, i) => (
          <Text key={i} style={styles.weekDayText}>{d}</Text>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView style={styles.calendarContainer}>
            <View style={styles.grid}>
            {daysArray.map((day, idx) => {
                if (day === null) {
                    return <View key={`empty-${idx}`} style={styles.dayCell} />;
                }
                const dateStr = currentDate.date(day).format('YYYY-MM-DD');
                // The API returns an array of FullCalendar events: { start: '2024-03-27...' }
                const dailyEvents = calendarData.filter(d => d.start && d.start.startsWith(dateStr));
                const count = dailyEvents.length;
                const isToday = dayjs().isSame(currentDate.date(day), 'day');

                return (
                    <TouchableOpacity key={`day-${day}`} style={[styles.dayCell, isToday && styles.todayCell]}>
                        <Text style={[styles.dayNum, isToday && styles.todayNum]}>{day}</Text>
                        {count > 0 && (
                            <View style={styles.eventDot}>
                                <Text style={styles.eventText}>{count}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                );
            })}
            </View>

            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View style={[styles.dot, { backgroundColor: colors.primary }]} />
                    <Text style={styles.legendText}>Có ca làm việc</Text>
                </View>
            </View>
        </ScrollView>
      )}

      <StaffDatePickerModal 
        visible={showDatePicker} 
        date={currentDate} 
        onClose={() => setShowDatePicker(false)} 
        onSelect={setCurrentDate} 
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
  todayBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  monthSelector: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F4F6F8' },
  arrowBtn: { padding: 8 },
  monthLabel: { fontSize: 18, fontWeight: '700', color: '#212B36' },
  weekDays: { flexDirection: 'row', backgroundColor: '#fff', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F4F6F8' },
  weekDayText: { flex: 1, textAlign: 'center', fontSize: 13, fontWeight: '700', color: '#637381' },
  calendarContainer: { flex: 1, backgroundColor: '#fff' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8, paddingVertical: 8 },
  dayCell: { width: '14.28%', aspectRatio: 1, padding: 4, alignItems: 'center', justifyContent: 'flex-start', borderBottomWidth: 1, borderBottomColor: '#F4F6F8' },
  todayCell: { backgroundColor: 'rgba(255, 107, 107, 0.05)', borderRadius: 8 },
  dayNum: { fontSize: 14, fontWeight: '600', color: '#212B36', marginTop: 4 },
  todayNum: { color: colors.primary, fontWeight: '800' },
  eventDot: { backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2, marginTop: 4 },
  eventText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  legend: { flexDirection: 'row', padding: 16, borderTopWidth: 1, borderTopColor: '#F4F6F8', justifyContent: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  legendText: { fontSize: 13, color: '#637381' }
});

export default StaffScheduleCalendarScreen;
