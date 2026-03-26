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
import { ArrowLeft, Calendar, Clock, CreditCard, User, ClipboardList } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { getMyBooking } from '../../services/api/booking';

const BookingDetailScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { bookingId } = route.params;

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await getMyBooking(bookingId);
        if (res.code === 200 || res.code === 201) {
          setBooking(res.data);
        }
      } catch (error) {
        Alert.alert('Lỗi', 'Không thể tải chi tiết đặt lịch');
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [bookingId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#05A845';
      case 'pending': return '#007BFF';
      case 'confirmed': return '#007BFF';
      case 'in-progress': return '#FFAB00';
      case 'cancelled': return '#ff0000';
      default: return '#7d7b7b';
    }
  };

  const getStatusText = (status: string) => {
    const map: any = {
      'pending': 'Chờ xác nhận',
      'confirmed': 'Đã xác nhận',
      'in-progress': 'Đang làm',
      'completed': 'Hoàn thành',
      'cancelled': 'Đã hủy',
    };
    return map[status] || status;
  };

  if (loading) {
    return (
      <View style={styles.centerWrap}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!booking) return null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color={colors.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết phiếu dịch vụ</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statusBanner}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.bookingStatus) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(booking.bookingStatus) }]}>
                    {getStatusText(booking.bookingStatus).toUpperCase()}
                </Text>
            </View>
            <Text style={styles.bookingCode}>Phiếu: #{booking.code}</Text>
            <Text style={styles.bookingDate}>Đặt ngày: {new Date(booking.createdAt).toLocaleDateString('vi-VN')}</Text>
        </View>

        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin đặt lịch</Text>
            <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                    <Calendar size={18} color={colors.primary} />
                    <Text style={styles.infoVal}>Ngày: {new Date(booking.start).toLocaleDateString('vi-VN')}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Clock size={18} color={colors.primary} />
                    <Text style={styles.infoVal}>Giờ: {new Date(booking.start).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</Text>
                </View>
                <View style={styles.infoRow}>
                    <User size={18} color={colors.primary} />
                    <Text style={styles.infoVal}>{booking.customerName} - {booking.customerPhone}</Text>
                </View>
            </View>
        </View>

        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dịch vụ & Thú cưng</Text>
            <View style={styles.itemCard}>
                <View style={styles.serviceHeader}>
                   <ClipboardList size={20} color={colors.primary} />
                   <Text style={styles.serviceName}>{booking.serviceId?.name}</Text>
                </View>
                <View style={styles.divider} />
                {booking.petIds?.map((pet: any, idx: number) => (
                    <View key={idx} style={styles.petItem}>
                        <View style={styles.petInfo}>
                            <Text style={styles.petName}>{pet.name}</Text>
                            <Text style={styles.petBreed}>{pet.breed || (pet.type === 'dog' ? 'Chó' : 'Mèo')}</Text>
                        </View>
                    </View>
                ))}
            </View>
        </View>

        <View style={styles.section}>
             <Text style={styles.sectionTitle}>Thanh toán</Text>
             <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                    <CreditCard size={18} color={colors.primary} />
                    <Text style={styles.infoVal}>
                        {booking.paymentMethod === 'money' ? 'Tiền mặt tại quầy' : 
                         booking.paymentMethod === 'vnpay' ? 'Ví VNPAY' : 
                         booking.paymentMethod === 'zalopay' ? 'Ví ZaloPay' : booking.paymentMethod}
                    </Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Tiền cọc</Text>
                    <Text style={[styles.summaryVal, { color: '#05A845' }]}>{(booking.depositAmount || 0).toLocaleString('vi-VN')} đ</Text>
                </View>
                <View style={[styles.summaryRow, { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#f0f0f0' }]}>
                    <Text style={[styles.summaryLabel, { fontSize: 16, fontWeight: '800', color: colors.secondary }]}>Tổng phí</Text>
                    <Text style={[styles.summaryVal, { fontSize: 18, fontWeight: '800', color: colors.primary }]}>{(booking.total || 0).toLocaleString('vi-VN')} đ</Text>
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
  infoCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, gap: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoVal: { fontSize: 14, color: '#555', flex: 1 },
  itemCard: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden' },
  serviceHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  serviceName: { fontSize: 15, fontWeight: '700', color: colors.secondary, flex: 1 },
  divider: { height: 1, backgroundColor: '#F9F9F9' },
  petItem: { padding: 12, paddingHorizontal: 16, backgroundColor: '#FDFDFD', borderBottomWidth: 1, borderBottomColor: '#F9F9F9' },
  petInfo: { flex: 1 },
  petName: { fontSize: 14, fontWeight: '700', color: colors.secondary },
  petBreed: { fontSize: 12, color: '#7d7b7b', marginTop: 2 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: 14, color: '#7d7b7b' },
  summaryVal: { fontSize: 14, color: colors.secondary, fontWeight: '600' },
  notesText: { fontSize: 14, color: '#7d7b7b', fontStyle: 'italic', lineHeight: 20 },
});

export default BookingDetailScreen;
