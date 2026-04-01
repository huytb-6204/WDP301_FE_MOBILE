import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Linking,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, CreditCard, RefreshCw, XCircle, Home, Calendar, ShieldCheck, Plus } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import type { RootStackParamList } from '../../navigation/types';
import { StatusMessage, Toast } from '../../components/common';
import {
  cancelBoardingBooking,
  checkBoardingPaymentStatus,
  getMyBoardingBookings,
  initiateBoardingPayment,
} from '../../services/api/boarding';
import type { BoardingBooking, BoardingGateway } from '../../types';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'MyBoardingBookings'>;

const statusOptions = [
  { key: '', label: 'Tất cả' },
  { key: 'held', label: 'Giữ phòng' },
  { key: 'confirmed', label: 'Đã xác nhận' },
  { key: 'checked-in', label: 'Đã nhận' },
  { key: 'checked-out', label: 'Đã trả' },
  { key: 'cancelled', label: 'Đã hủy' },
];

const statusText: Record<string, string> = {
  held: 'Giữ phòng',
  confirmed: 'Đã xác nhận',
  'checked-in': 'Đã nhận phòng',
  'checked-out': 'Đã trả phòng',
  cancelled: 'Đã hủy',
  pending: 'Chờ xử lý',
};

const paymentStatusLabel: Record<string, string> = {
  unpaid: 'Chưa thanh toán',
  partial: 'Đã đặt cọc',
  paid: 'Đã thanh toán',
  refunded: 'Đã hoàn tiền',
};

const statusColor: Record<string, string> = {
  held: '#FFAA00',
  confirmed: '#23A86D',
  'checked-in': '#2D7DFA',
  'checked-out': '#23A86D',
  cancelled: '#FF4D4D',
  pending: '#6B7280',
};

const formatCurrency = (value: number) => `${Math.max(0, value || 0).toLocaleString('vi-VN')} đ`;

const formatDate = (value?: string | null) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('vi-VN');
};

const MyBoardingBookingsScreen = () => {
  const navigation = useNavigation<Navigation>();
  const [bookings, setBookings] = useState<BoardingBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [paymentGateway] = useState<BoardingGateway>('vnpay');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  };

  const fetchBookings = async (mode: 'loading' | 'refresh' = 'loading') => {
    if (mode === 'loading') setLoading(true);
    if (mode === 'refresh') setRefreshing(true);
    setError(null);

    try {
      const data = await getMyBoardingBookings();
      setBookings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải booking khách sạn');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      void fetchBookings();
    }, [])
  );

  const visibleBookings = useMemo(() => {
    if (!filter) return bookings;
    return bookings.filter((item) => item.boardingStatus === filter);
  }, [bookings, filter]);

  const canCancel = (status?: string) => !['checked-in', 'checked-out', 'cancelled'].includes(String(status || ''));

  const handleCancel = async (booking: BoardingBooking) => {
    setProcessingId(booking._id);
    try {
      const res = await cancelBoardingBooking(booking._id, 'Khách hàng hủy trên app');
      showToast(res.message || 'Đã hủy booking cáp thành công');
      await fetchBookings('refresh');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Không thể hủy booking');
    } finally {
      setProcessingId(null);
    }
  };

  const handlePay = async (booking: BoardingBooking) => {
    setProcessingId(booking._id);
    try {
      const res = await initiateBoardingPayment(booking._id, paymentGateway, 'mobile');
      if (res.paymentUrl) {
        await Linking.openURL(res.paymentUrl);
      }
      showToast('Đang chuyển đến trang thanh toán...');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Không thể tạo liên kết thanh toán');
    } finally {
      setProcessingId(null);
    }
  };

  const handleCheckPayment = async (booking: BoardingBooking) => {
    setProcessingId(booking._id);
    try {
      const res = await checkBoardingPaymentStatus(booking._id);
      showToast(
        res.paymentStatus === 'paid' || res.paymentStatus === 'partial'
          ? 'Thanh toán thành công!'
          : 'Giao dịch vẫn đang chờ xử lý'
      );
      await fetchBookings('refresh');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Lỗi khi kiểm tra thanh toán');
    } finally {
      setProcessingId(null);
    }
  };

  const renderItem = ({ item }: { item: BoardingBooking }) => {
    const status = String(item.boardingStatus || 'pending');
    const paymentStatus = String(item.paymentStatus || 'unpaid');
    const busy = processingId === item._id;
    const badgeColor = statusColor[status] || colors.text;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.codeWrap}>
            <Home size={16} color={colors.primary} />
            <Text style={styles.bookingCode}>#{item.code}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${badgeColor}15` }]}>
            <Text style={[styles.statusTextBadge, { color: badgeColor }]}>
              {statusText[status] || status}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Calendar size={14} color="#999" />
              <Text style={styles.infoValue}>{formatDate(item.checkInDate)} - {formatDate(item.checkOutDate)}</Text>
            </View>
            <View style={styles.infoItem}>
              <ShieldCheck size={14} color="#999" />
              <Text style={styles.infoValue}>Thanh toán: <Text style={styles.paymentStatusText}>{paymentStatusLabel[paymentStatus] || paymentStatus}</Text></Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.priceSection}>
            <View>
              <Text style={styles.priceLabel}>Tổng chi phí</Text>
              <Text style={styles.priceValue}>{formatCurrency(Number(item.total || 0))}</Text>
            </View>
            <View style={styles.depositSection}>
               <Text style={styles.priceLabel}>Đặt cọc</Text>
               <Text style={styles.depositValue}>{formatCurrency(Number(item.depositAmount || 0))}</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionRow}>
          {status === 'held' && (
            <TouchableOpacity 
              style={[styles.actionBtn, styles.payBtn]} 
              onPress={() => handlePay(item)} 
              disabled={busy}
            >
              <CreditCard size={14} color="#fff" />
              <Text style={styles.payBtnText}>Thanh toán</Text>
            </TouchableOpacity>
          )}

          {(status === 'held' || paymentStatus === 'unpaid') && (
            <TouchableOpacity 
              style={[styles.actionBtn, styles.checkBtn]} 
              onPress={() => handleCheckPayment(item)} 
              disabled={busy}
            >
              <RefreshCw size={14} color={colors.primary} />
              <Text style={styles.checkBtnText}>Kiểm tra</Text>
            </TouchableOpacity>
          )}

          {canCancel(status) && (
            <TouchableOpacity 
              style={[styles.actionBtn, styles.cancelBtn]} 
              onPress={() => handleCancel(item)} 
              disabled={busy}
            >
              <XCircle size={14} color="#FF4D4D" />
              <Text style={styles.cancelBtnText}>Hủy</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={[styles.actionBtn, styles.detailBtn]} onPress={() => navigation.navigate('BoardingBookingDetail', { bookingId: item._id })}>
            <Text style={styles.detailBtnText}>Chi tiết</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color={colors.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Khách sạn của thú cưng</Text>
        <TouchableOpacity 
          style={styles.plusButton}
          onPress={() => navigation.navigate('BoardingHotel')}
        >
          <Plus size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.filterBar}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={statusOptions}
          keyExtractor={(item) => item.key || 'all'}
          contentContainerStyle={styles.filterContent}
          renderItem={({ item }) => {
            const active = item.key === filter;
            return (
              <TouchableOpacity
                style={[styles.filterChip, active && styles.filterChipActive]}
                onPress={() => setFilter(item.key)}
              >
                <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{item.label}</Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <View style={styles.gatewayBar}>
          <Text style={styles.gatewayLabel}>Cổng thanh toán:</Text>
          <View style={styles.gatewayRow}>
            <View style={[styles.gwBtn, styles.gwBtnActive]}>
              <Text style={[styles.gwText, styles.gwTextActive]}>VNPAY</Text>
            </View>
          </View>
      </View>

      {loading && !refreshing ? (
        <View style={styles.centerWrap}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.loadingText}>Đang tải booking...</Text>
        </View>
      ) : (
        <FlatList
          data={visibleBookings}
          keyExtractor={(item) => item._id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchBookings('refresh')} colors={[colors.primary]} />}
          contentContainerStyle={styles.listContainer}
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Home size={60} color="#eee" />
              <Text style={styles.emptyText}>Chưa có booking khách sạn nào</Text>
              <TouchableOpacity 
                style={styles.emptyBtn}
                onPress={() => navigation.navigate('BoardingHotel')}
              >
                <Text style={styles.emptyBtnText}>ĐẶT PHÒNG NGAY</Text>
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
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff1f1',
  },
  headerTitle: { color: colors.secondary, fontSize: 17, fontWeight: '800' },
  plusButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  filterBar: { backgroundColor: '#fff', paddingVertical: 10 },
  filterContent: { paddingHorizontal: 16, gap: 10 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterChipText: { fontSize: 13, fontWeight: '600', color: '#666' },
  filterChipTextActive: { color: '#fff' },
  gatewayBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    backgroundColor: '#fff', 
    paddingHorizontal: 16, 
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  gatewayLabel: { fontSize: 12, color: '#999', fontWeight: '600' },
  gatewayRow: { flexDirection: 'row', gap: 6 },
  gwBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4, borderWidth: 1, borderColor: '#eee' },
  gwBtnActive: { borderColor: colors.primary, backgroundColor: colors.softPink },
  gwText: { fontSize: 10, fontWeight: '800', color: '#999' },
  gwTextActive: { color: colors.primary },
  centerWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: '#666', fontWeight: '500' },
  listContainer: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  codeWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  bookingCode: { fontSize: 14, fontWeight: '800', color: colors.secondary },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusTextBadge: { fontSize: 11, fontWeight: '700' },
  cardBody: { gap: 12 },
  infoGrid: { gap: 8 },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoValue: { fontSize: 13, color: '#7d7b7b' },
  paymentStatusText: { fontWeight: '700', color: colors.secondary },
  divider: { height: 1, backgroundColor: '#F5F5F5' },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: { fontSize: 11, color: '#999', marginBottom: 2 },
  priceValue: { fontSize: 18, fontWeight: '800', color: colors.primary },
  depositSection: { alignItems: 'flex-end' },
  depositValue: { fontSize: 14, fontWeight: '700', color: '#05A845' },
  actionRow: {
    flexDirection: 'row',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    gap: 8,
    flexWrap: 'wrap',
  },
  actionBtn: {
    minWidth: 80,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 12,
  },
  payBtn: { backgroundColor: colors.primary, borderColor: colors.primary },
  payBtnText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  checkBtn: { borderColor: colors.primary },
  checkBtnText: { color: colors.primary, fontSize: 11, fontWeight: '700' },
  cancelBtn: { borderColor: '#FFEBEA' },
  cancelBtnText: { color: '#FF4D4D', fontSize: 11, fontWeight: '700' },
  detailBtn: { backgroundColor: colors.secondary, borderColor: colors.secondary, flex: 1 },
  detailBtnText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  emptyWrap: { alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 16 },
  emptyText: { fontSize: 15, color: '#aaa', fontWeight: '500', textAlign: 'center' },
  emptyBtn: { backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24, marginTop: 10 },
  emptyBtnText: { color: '#fff', fontSize: 13, fontWeight: '800' },
});

export default MyBoardingBookingsScreen;

