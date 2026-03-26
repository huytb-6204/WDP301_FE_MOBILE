import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, Calendar, Clock, House, PawPrint, ShieldCheck } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { getBoardingBookingDetail } from '../../services/api/dashboard';

const BoardingBookingDetailScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { bookingId } = route.params;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getBoardingBookingDetail(bookingId);
        setData(res);
      } catch (error) {
        Alert.alert('Lỗi', 'Không thể tải chi tiết chuồng nội trú');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [bookingId]);

  if (loading) {
    return (
      <View style={styles.centerWrap}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!data?.booking) return null;

  const { booking, pets, cage } = data;

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'checked-out': return '#05A845';
      case 'confirmed': return '#007BFF';
      case 'pending': return '#FFAB00';
      case 'cancelled': return '#ff0000';
      case 'checked-in': return '#6366f1';
      default: return '#7d7b7b';
    }
  };

  const getStatusText = (status: string) => {
    const map: any = {
      'pending': 'Chờ xác nhận',
      'confirmed': 'Đã xác nhận',
      'checked-in': 'Đang lưu trú',
      'checked-out': 'Đã trả phòng',
      'completed': 'Hoàn thành',
      'cancelled': 'Đã hủy',
    };
    return map[status?.toLowerCase()] || status;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color={colors.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết khách sạn</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statusBanner}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.boardingStatus || booking.status) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(booking.boardingStatus || booking.status) }]}>
                    {getStatusText(booking.boardingStatus || booking.status).toUpperCase()}
                </Text>
            </View>
            <Text style={styles.bookingCode}>Booking: #{booking.code || booking._id.slice(-8).toUpperCase()}</Text>
            <Text style={styles.bookingDate}>Đặt vào: {new Date(booking.createdAt).toLocaleDateString('vi-VN')}</Text>
        </View>

        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thời gian lưu trú</Text>
            <View style={styles.timeCard}>
                <View style={styles.timeBox}>
                   <Text style={styles.timeLabel}>NHẬN PHÒNG</Text>
                   <Text style={styles.timeVal}>{new Date(booking.checkInDate).toLocaleDateString('vi-VN')}</Text>
                   <Text style={styles.timeSub}>Sau 09:00 AM</Text>
                </View>
                <View style={styles.timeDivider} />
                <View style={styles.timeBox}>
                   <Text style={styles.timeLabel}>TRẢ PHÒNG</Text>
                   <Text style={styles.timeVal}>{new Date(booking.checkOutDate).toLocaleDateString('vi-VN')}</Text>
                   <Text style={styles.timeSub}>Trước 09:00 AM</Text>
                </View>
            </View>
        </View>

        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chuồng & Thú cưng</Text>
            <View style={styles.itemCard}>
                <View style={styles.cageHeader}>
                   <House size={20} color={colors.primary} />
                   <View style={{ flex: 1 }}>
                     <Text style={styles.cageName}>{cage?.cageCode || 'Chuồng nội trú'}</Text>
                     <Text style={styles.cageType}>{cage?.type || 'Standard'}</Text>
                   </View>
                   <Text style={styles.cagePrice}>{booking.total.toLocaleString('vi-VN')} đ</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.petList}>
                   {pets.map((pet: any, idx: number) => (
                       <View key={idx} style={styles.petBadge}>
                           <PawPrint size={14} color={colors.primary} />
                           <Text style={styles.petBadgeText}>{pet.name}</Text>
                       </View>
                   ))}
                </View>
            </View>
        </View>

        <View style={styles.section}>
             <Text style={styles.sectionTitle}>Thông tin khách hàng</Text>
             <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Người đặt:</Text>
                    <Text style={styles.infoVal}>{booking.fullName || 'Khách hàng'}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Số điện thoại:</Text>
                    <Text style={styles.infoVal}>{booking.phone || 'N/A'}</Text>
                </View>
             </View>
        </View>

        {booking.notes && (
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Ghi chú</Text>
                <View style={styles.infoCard}>
                    <Text style={styles.notesText}>{booking.notes}</Text>
                </View>
            </View>
        )}
      </ScrollView>
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
  headerTitle: { fontSize: 17, fontWeight: '800', color: colors.secondary },
  centerWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 16 },
  statusBanner: {
      backgroundColor: '#fff',
      borderRadius: 16,
      padding: 24,
      alignItems: 'center',
      marginBottom: 20,
      borderWidth: 1,
      borderColor: '#F0F0F0',
  },
  statusBadge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, marginBottom: 12 },
  statusText: { fontSize: 12, fontWeight: '900' },
  bookingCode: { fontSize: 17, fontWeight: '800', color: colors.secondary, marginBottom: 4 },
  bookingDate: { fontSize: 12, color: '#7d7b7b' },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: colors.secondary, marginBottom: 12, textTransform: 'uppercase' },
  timeCard: {
      flexDirection: 'row',
      backgroundColor: '#fff',
      borderRadius: 16,
      padding: 20,
      alignItems: 'center',
      justifyContent: 'space-around',
  },
  timeBox: { alignItems: 'center', flex: 1 },
  timeLabel: { fontSize: 10, fontWeight: '900', color: colors.primary, marginBottom: 8 },
  timeVal: { fontSize: 16, fontWeight: '800', color: colors.secondary },
  timeSub: { fontSize: 11, color: '#999', marginTop: 4 },
  timeDivider: { width: 1, height: 40, backgroundColor: '#EEE' },
  itemCard: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden' },
  cageHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  cageName: { fontSize: 16, fontWeight: '800', color: colors.secondary },
  cageType: { fontSize: 12, color: '#999', marginTop: 2 },
  cagePrice: { fontSize: 16, fontWeight: '900', color: colors.primary },
  divider: { height: 1, backgroundColor: '#F9F9F9' },
  petList: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, padding: 16 },
  petBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F3F4F6', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  petBadgeText: { fontSize: 13, fontWeight: '700', color: colors.secondary },
  infoCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, gap: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoLabel: { fontSize: 14, color: '#7d7b7b' },
  infoVal: { fontSize: 14, color: colors.secondary, fontWeight: '700' },
  notesText: { fontSize: 14, color: '#7d7b7b', fontStyle: 'italic', lineHeight: 20 },
});

export default BoardingBookingDetailScreen;
