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
import { ArrowLeft, CreditCard, RefreshCw, XCircle } from 'lucide-react-native';
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

const statusOptions = ['', 'held', 'confirmed', 'checked-in', 'checked-out', 'cancelled'];

const statusText: Record<string, string> = {
  held: 'Giữ phòng',
  confirmed: 'Đã xác nhận',
  'checked-in': 'Đã nhận phòng',
  'checked-out': 'Đã trả phòng',
  cancelled: 'Đã hủy',
  pending: 'Chờ xử lý',
};

const paymentText: Record<string, string> = {
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

const formatCurrency = (value: number) => `${Math.max(0, value || 0).toLocaleString('vi-VN')}đ`;

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
  const [paymentGateway, setPaymentGateway] = useState<BoardingGateway>('vnpay');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 1800);
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
      fetchBookings();
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
      showToast(res.message);
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
      const res = await initiateBoardingPayment(booking._id, paymentGateway);
      if (res.paymentUrl) {
        await Linking.openURL(res.paymentUrl);
      }
      showToast('Đã mở cổng thanh toán');
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
          ? 'Trạng thái thanh toán đã được cập nhật'
          : 'Thanh toán vẫn đang chờ xử lý'
      );
      await fetchBookings('refresh');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Không thể kiểm tra thanh toán');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color={colors.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking khách sạn</Text>
        <View style={styles.gatewaySwitch}>
          {(['vnpay', 'zalopay'] as BoardingGateway[]).map((item) => (
            <TouchableOpacity
              key={item}
              style={[styles.gatewayChip, paymentGateway === item && styles.gatewayChipActive]}
              onPress={() => setPaymentGateway(item)}
            >
              <Text style={[styles.gatewayChipText, paymentGateway === item && styles.gatewayChipTextActive]}>
                {item.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {error ? <StatusMessage message={error} actionText="Thử lại" onAction={() => fetchBookings()} /> : null}

      {loading ? (
        <View style={styles.centerWrap}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={visibleBookings}
          keyExtractor={(item) => item._id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchBookings('refresh')} />}
          contentContainerStyle={styles.listContainer}
          ListHeaderComponent={
            <View style={styles.filterRow}>
              {statusOptions.map((item) => {
                const active = item === filter;
                return (
                  <TouchableOpacity
                    key={item || 'all'}
                    style={[styles.filterChip, active && styles.filterChipActive]}
                    onPress={() => setFilter(item)}
                  >
                    <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                      {item ? statusText[item] || item : 'Tất cả'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          }
          ListEmptyComponent={<StatusMessage message="Chưa có booking khách sạn nào" />}
          renderItem={({ item }) => {
            const status = String(item.boardingStatus || 'pending');
            const paymentStatus = String(item.paymentStatus || 'unpaid');
            const busy = processingId === item._id;

            return (
              <View style={styles.card}>
                <View style={styles.cardTop}>
                  <Text style={styles.code}>#{item.code}</Text>
                  <Text style={[styles.badge, { color: statusColor[status] || colors.text }]}>
                    {statusText[status] || status}
                  </Text>
                </View>

                <Text style={styles.meta}>Ở từ {formatDate(item.checkInDate)} đến {formatDate(item.checkOutDate)}</Text>
                <Text style={styles.meta}>Số thú cưng: {item.quantity || item.petIds?.length || 1}</Text>
                <Text style={styles.meta}>Tổng tiền: {formatCurrency(Number(item.total || 0))}</Text>
                <Text style={styles.meta}>Đặt cọc: {formatCurrency(Number(item.depositAmount || 0))}</Text>
                <Text style={styles.meta}>Thanh toán: {paymentText[paymentStatus] || paymentStatus}</Text>
                {item.holdExpiresAt ? <Text style={styles.meta}>Giữ phòng đến: {formatDate(item.holdExpiresAt)}</Text> : null}

                <View style={styles.actionRow}>
                  {status === 'held' ? (
                    <TouchableOpacity style={styles.primaryAction} onPress={() => handlePay(item)} disabled={busy}>
                      {busy ? <ActivityIndicator color="#fff" /> : <CreditCard size={16} color="#fff" />}
                      <Text style={styles.primaryActionText}>Thanh toán</Text>
                    </TouchableOpacity>
                  ) : null}

                  {status === 'held' || paymentStatus === 'unpaid' ? (
                    <TouchableOpacity style={styles.secondaryAction} onPress={() => handleCheckPayment(item)} disabled={busy}>
                      <RefreshCw size={16} color={colors.primary} />
                      <Text style={styles.secondaryActionText}>Kiểm tra tiền</Text>
                    </TouchableOpacity>
                  ) : null}

                  {canCancel(status) ? (
                    <TouchableOpacity style={styles.dangerAction} onPress={() => handleCancel(item)} disabled={busy}>
                      <XCircle size={16} color="#fff" />
                      <Text style={styles.dangerActionText}>{busy ? 'Đang xử lý' : 'Hủy đơn'}</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
            );
          }}
        />
      )}

      <Toast visible={toastVisible} message={toastMessage} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 10,
  },
  backButton: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: colors.secondary, fontSize: 18, fontWeight: '700' },
  gatewaySwitch: { flexDirection: 'row', gap: 8 },
  gatewayChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#fff',
  },
  gatewayChipActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  gatewayChipText: { color: colors.text, fontSize: 12, fontWeight: '700' },
  gatewayChipTextActive: { color: '#fff' },
  centerWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContainer: { padding: 16, paddingBottom: 34 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#fff',
  },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterChipText: { color: colors.text, fontSize: 12, fontWeight: '700' },
  filterChipTextActive: { color: '#fff' },
  card: {
    backgroundColor: colors.softPink,
    borderRadius: 16,
    padding: 12,
    gap: 6,
    marginBottom: 10,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  code: { color: colors.secondary, fontSize: 14, fontWeight: '700', flex: 1 },
  badge: { fontSize: 12, fontWeight: '700' },
  meta: { color: colors.text, fontSize: 12, lineHeight: 18 },
  actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  primaryAction: {
    minHeight: 40,
    borderRadius: 999,
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryActionText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  secondaryAction: {
    minHeight: 40,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryActionText: { color: colors.primary, fontSize: 12, fontWeight: '700' },
  dangerAction: {
    minHeight: 40,
    borderRadius: 999,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dangerActionText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});

export default MyBoardingBookingsScreen;
