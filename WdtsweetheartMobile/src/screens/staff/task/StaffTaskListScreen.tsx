import React, { useEffect, useState, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Search,
  CheckCircle2,
  Circle,
  Clock,
  Bone,
  Flame
} from 'lucide-react-native';
import dayjs from 'dayjs';
import { colors } from '../../../theme/colors';
import { useAuth } from '../../../context/AuthContext';
import { getStaffBoardingBookings } from '../../../services/api/staffBoarding';
import type { StaffStackParamList } from '../../../navigation/StaffNavigator';

const StaffTaskListScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<StaffStackParamList>>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [filterDate, setFilterDate] = useState(dayjs());
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const bookings = await getStaffBoardingBookings();
      setData(bookings || []);
    } catch (error) {
      console.error('Failed to fetch bookings', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const filteredTasks = useMemo(() => {
    return data.filter((b: any) => {
      const checkInDate = dayjs(b.actualCheckInDate || b.checkInDate).startOf('day');
      const dayIndex = filterDate.diff(checkInDate, 'day');
      const totalDays = b.numberOfDays || 1;
      
      const isDateMatch = dayIndex >= 0 && dayIndex < totalDays;
      const isSearchMatch = b.petIds?.[0]?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           b.code?.toLowerCase().includes(searchQuery.toLowerCase());
      
      return isDateMatch && isSearchMatch;
    });
  }, [data, filterDate, searchQuery]);

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
        <View style={styles.cardHeader}>
          <Image 
            source={{ uri: item.petIds?.[0]?.avatar || 'https://via.placeholder.com/100' }} 
            style={styles.petAvatar} 
          />
          <View style={styles.petInfo}>
            <Text style={styles.petName}>{item.petIds?.[0]?.name}</Text>
            <Text style={styles.cageInfo}>Chuồng: {item.cageId?.cageCode || 'N/A'} • Ngày {dayIndex + 1}/{totalDays}</Text>
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
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
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
        <TouchableOpacity onPress={() => setFilterDate(prev => prev.subtract(1, 'day'))} style={styles.dateArrow}>
           <ChevronLeft size={24} color="#637381" />
        </TouchableOpacity>
        <View style={styles.dateInfo}>
           <Text style={styles.dateLabel}>{filterDate.format('dddd')}</Text>
           <Text style={styles.dateValue}>{filterDate.format('DD/MM/YYYY')}</Text>
        </View>
        <TouchableOpacity onPress={() => setFilterDate(prev => prev.add(1, 'day'))} style={styles.dateArrow}>
           <ChevronRight size={24} color="#637381" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchBar}>
         <Search size={20} color="#919EAB" />
         <TextInput 
           placeholder="Tìm tên thú cưng hoặc mã đơn..." 
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
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
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  calendarBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  dateSelector: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 24, 
    paddingVertical: 16,
    backgroundColor: '#fff'
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
    borderColor: '#F4F6F8'
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
    shadowRadius: 10
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
    borderRadius: 8 
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
    borderTopColor: '#F4F6F8'
  },
  actionPrompt: { fontSize: 14, color: colors.primary, fontWeight: '800' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  loadingText: { marginTop: 12, color: '#637381', fontWeight: '600' },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 18, color: '#111827', fontWeight: '800', marginTop: 16 },
  emptySub: { fontSize: 13, color: '#637381', fontWeight: '500', marginTop: 8, textAlign: 'center' },
});

export default StaffTaskListScreen;
