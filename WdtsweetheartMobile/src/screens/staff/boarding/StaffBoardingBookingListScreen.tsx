import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, FlatList, ActivityIndicator, TextInput, Alert } from 'react-native';
import { ArrowLeft, Search, Plus, Calendar, Clock, User as UserIcon } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../../../theme/colors';
import { getStaffBoardingBookings, BoardingBooking } from '../../../services/api/staffBoarding';
import { StaffStackParamList } from '../../../navigation/StaffNavigator';
import dayjs from 'dayjs';

type NavigationProp = NativeStackNavigationProp<StaffStackParamList, 'StaffBoardingBookingList'>;

const StaffBoardingBookingListScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [bookings, setBookings] = useState<BoardingBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await getStaffBoardingBookings({ limit: 100 });
      setBookings(data || []);
    } catch (error) {
      console.error('Failed to fetch boarding bookings', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách đặt chỗ');
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter(b => 
    b.code.toLowerCase().includes(searchQuery.toLowerCase()) || 
    b.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.phone.includes(searchQuery)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return { bg: '#FFF7CD', color: '#B78103', label: 'Chờ xác nhận' };
      case 'confirmed': return { bg: '#D0F2FF', color: '#0C53B7', label: 'Đã xác nhận' };
      case 'checked_in': return { bg: '#C8FACD', color: '#007B55', label: 'Check-in' };
      case 'checked_out': return { bg: '#F4F6F8', color: '#637381', label: 'Check-out' };
      case 'cancelled': return { bg: '#FFE7E6', color: '#FF4842', label: 'Đã hủy' };
      default: return { bg: '#F4F6F8', color: '#637381', label: status };
    }
  };

  const renderBookingItem = ({ item }: { item: BoardingBooking }) => {
    const status = getStatusColor(item.boardingStatus);
    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => navigation.navigate('StaffCareDetail', { bookingId: item._id, booking: item })}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.bookingCode}>Mã: {item.code}</Text>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <UserIcon size={16} color="#637381" />
            <Text style={styles.infoText}>{item.fullName} - {item.phone}</Text>
          </View>
          <View style={styles.infoRow}>
            <Calendar size={16} color="#637381" />
            <Text style={styles.infoText}>{dayjs(item.checkInDate).format('DD/MM/YYYY')} - {dayjs(item.checkOutDate).format('DD/MM/YYYY')}</Text>
          </View>
          
          <View style={styles.petContainer}>
            {item.petIds?.map((pet: any, idx) => (
              <View key={idx} style={styles.petBadge}>
                <Text style={styles.petBadgeText}>{pet.name} ({pet.species === 'dog' ? 'Chó' : pet.species === 'cat' ? 'Mèo' : 'Thú cưng'})</Text>
              </View>
            ))}
          </View>
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
        <Text style={styles.headerTitle}>Đặt chỗ khách sạn</Text>
        <TouchableOpacity 
          style={styles.addBtn}
          onPress={() => navigation.navigate('StaffBoardingBookingCreate')}
        >
          <Plus size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color="#919EAB" />
        <TextInput 
          placeholder="Tìm theo mã, tên, SĐT..." 
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredBookings}
          keyExtractor={(item) => item._id}
          renderItem={renderBookingItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>Chưa có booking nào</Text>
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
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  addBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', margin: 16, paddingHorizontal: 16, height: 48, borderRadius: 12, borderWidth: 1, borderColor: '#F4F6F8' },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: '#111827' },
  list: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  bookingCode: { fontSize: 15, fontWeight: '700', color: '#212B36' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  cardBody: { paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F4F6F8' },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  infoText: { fontSize: 14, color: '#637381', marginLeft: 8, fontWeight: '500' },
  petContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  petBadge: { backgroundColor: '#F4F6F8', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  petBadgeText: { fontSize: 12, color: '#212B36', fontWeight: '600' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyWrap: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#919EAB', fontSize: 15, fontWeight: '600' }
});

export default StaffBoardingBookingListScreen;
