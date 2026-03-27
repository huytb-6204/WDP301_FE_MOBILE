import React, { useEffect, useState, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, House, Clock, Activity, Utensils, Info } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { getMyBoardingBookings, getMyBoardingBookingDetail } from '../../services/api/boarding';
import type { BoardingBooking, BoardingBookingDetail } from '../../types/boarding';
import { Toast } from '../../components/common';

const BoardingCagesScreen = () => {
  const navigation = useNavigation<any>();
  const [cages, setCages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  };

  const fetchCages = async () => {
    try {
      const bookings = await getMyBoardingBookings();
      const eligible = bookings.filter(b => 
        ['confirmed', 'checked-in', 'checked-out'].includes(b.boardingStatus || '')
      );

      const details = await Promise.all(
        eligible.map(b => getMyBoardingBookingDetail(b._id).catch(() => null))
      );

      const cageItems = details.filter(Boolean).flatMap((detail: any) => {
        const cage = detail.cage;
        const booking = detail.booking;
        const pets = detail.pets || [];
        
        return pets.map((pet: any, index: number) => ({
          id: `${booking._id}-${pet._id || index}`,
          bookingId: booking._id,
          cage: cage,
          booking: booking,
          pet: pet,
          displayCode: cage?.cageCode || 'CHUỒNG'
        }));
      });

      setCages(cageItems);
    } catch (error) {
      showToast('Lỗi khi tải thông tin chuồng');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCages();
  }, []);

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'checked-in': return { text: 'Đang lưu trú', bg: '#F0FDF4', color: '#166534' };
      case 'confirmed': return { text: 'Đã xác nhận', bg: '#EFF6FF', color: '#1E40AF' };
      case 'checked-out': return { text: 'Đã trả phòng', bg: '#F9FAFB', color: '#374151' };
      default: return { text: status || 'Chờ xử lý', bg: '#FFF7ED', color: '#9A3412' };
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const status = getStatusLabel(item.booking.boardingStatus);
    
    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => navigation.navigate('BoardingBookingDetail', { bookingId: item.bookingId })}
      >
        <View style={styles.cardTop}>
          <Image source={{ uri: item.pet.avatar || item.cage?.avatar || 'https://via.placeholder.com/150' }} style={styles.petImg} />
          <View style={styles.topInfo}>
            <View style={styles.titleRow}>
              <Text style={styles.petName}>{item.pet.name || 'Thú cưng'}</Text>
              <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                <Text style={[styles.statusText, { color: status.color }]}>{status.text}</Text>
              </View>
            </View>
            <Text style={styles.cageCode}>{item.displayCode} • {item.cage?.size || 'M'}</Text>
            <View style={styles.dateRow}>
              <Clock size={12} color="#9CA3AF" />
              <Text style={styles.dateText}>
                {new Date(item.booking.checkInDate).toLocaleDateString('vi-VN')} - {new Date(item.booking.checkOutDate).toLocaleDateString('vi-VN')}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.careSummary}>
           <View style={styles.careItem}>
              <Utensils size={14} color={colors.primary} />
              <Text style={styles.careText}>Lịch ăn uống</Text>
           </View>
           <View style={styles.careItem}>
              <Activity size={14} color="#3B82F6" />
              <Text style={styles.careText}>Vận động</Text>
           </View>
           <View style={[styles.careItem, { backgroundColor: '#F3F4F6' }]}>
              <Text style={styles.detailLink}>Chi tiết</Text>
           </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color={colors.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chuồng khách sạn</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.banner}>
         <Info size={16} color="#1E40AF" />
         <Text style={styles.bannerText}>Theo dõi sức khỏe và lịch trình của bé tại đây.</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={cages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchCages(); }} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={styles.emptyIconWrap}>
                 <House size={40} color={colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>Chưa có thông tin chuồng</Text>
              <Text style={styles.emptyText}>Các chuồng bạn đã đặt sẽ xuất hiện tại đây khi được xác nhận.</Text>
              <TouchableOpacity 
                style={styles.bookBtn}
                onPress={() => navigation.navigate('BoardingHotel')}
              >
                <Text style={styles.bookBtnText}>ĐẶT PHÒNG NGAY</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
      <Toast visible={toastVisible} message={toastMessage} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: colors.secondary },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  banner: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8, 
    backgroundColor: '#EFF6FF', 
    padding: 12, 
    marginHorizontal: 16, 
    marginTop: 16, 
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DBEAFE'
  },
  bannerText: { fontSize: 13, color: '#1E40AF', fontWeight: '500' },
  list: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  cardTop: { flexDirection: 'row', marginBottom: 16 },
  petImg: { width: 80, height: 80, borderRadius: 16, backgroundColor: '#f5f5f5' },
  topInfo: { flex: 1, marginLeft: 16, justifyContent: 'center' },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  petName: { fontSize: 17, fontWeight: '800', color: colors.secondary },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '800' },
  cageCode: { fontSize: 14, color: '#4B5563', fontWeight: '600', marginBottom: 6 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dateText: { fontSize: 12, color: '#9CA3AF' },
  careSummary: { 
    flexDirection: 'row', 
    gap: 8, 
    borderTopWidth: 1, 
    borderTopColor: '#F3F4F6', 
    paddingTop: 12 
  },
  careItem: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 6,
    backgroundColor: '#F9FAFB',
    paddingVertical: 8,
    borderRadius: 8
  },
  careText: { fontSize: 12, fontWeight: '700', color: '#4B5563' },
  detailLink: { fontSize: 12, fontWeight: '800', color: colors.primary },
  empty: { alignItems: 'center', justifyContent: 'center', marginTop: 100, paddingHorizontal: 40 },
  emptyIconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFF5F6', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: colors.secondary, marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#7d7b7b', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  bookBtn: { backgroundColor: colors.primary, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 999 },
  bookBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
});

export default BoardingCagesScreen;
