import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../../theme/colors';
import type { RootStackParamList } from '../../navigation/types';
import { cancelBooking, getMyBookings } from '../../services/api/booking';
import { StatusMessage, Toast } from '../../components/common';
import type { Booking } from '../../types';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'MyBookings'>;

const statusOptions = [
  { key: '', label: 'Tất cả' },
  { key: 'pending', label: 'Chờ xác nhận' },
  { key: 'confirmed', label: 'Đã xác nhận' },
  { key: 'completed', label: 'Hoàn thành' },
  { key: 'cancelled', label: 'Đã hủy' },
];

const statusMap: Record<string, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  'in-progress': 'Đang xử lý',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
};

const statusColor: Record<string, string> = {
  pending: '#2D7DFA',
  confirmed: '#23A86D',
  'in-progress': '#FFAA00',
  completed: '#23A86D',
  cancelled: '#FF4D4D',
};

const formatDateTime = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '-';
  return `${date.toLocaleDateString('vi-VN')} ${date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
};

const MyBookingsScreen = () => {
  const navigation = useNavigation<Navigation>();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 1600);
  };

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMyBookings({ status: statusFilter || undefined, page: 1, limit: 50 });
      setBookings(res.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải lịch đặt');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const canCancel = (status: string) => ['pending', 'confirmed', 'in-progress'].includes(status);

  const handleCancel = async (item: Booking) => {
    setCancellingId(item._id);
    try {
      await cancelBooking(item._id, 'Khách hàng hủy lịch trên ứng dụng');
      setBookings((prev) =>
        prev.map((booking) =>
          booking._id === item._id ? { ...booking, status: 'cancelled' } : booking
        )
      );
      showToast('Đã hủy lịch đặt');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Không thể hủy lịch');
    } finally {
      setCancellingId(null);
    }
  };

  const listHeader = useMemo(
    () => (
      <View style={styles.filterRow}>
        {statusOptions.map((option) => {
          const active = option.key === statusFilter;
          return (
            <TouchableOpacity
              key={option.key || 'all'}
              style={[styles.filterChip, active && styles.filterChipActive]}
              onPress={() => setStatusFilter(option.key)}
            >
              <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{option.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    ),
    [statusFilter]
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color={colors.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch đặt của tôi</Text>
        <View style={{ width: 24 }} />
      </View>

      {error ? <StatusMessage message={error} actionText="Thử lại" onAction={fetchBookings} /> : null}

      {loading ? (
        <View style={styles.centerWrap}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item._id}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={<StatusMessage message="Chưa có lịch đặt nào" />}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => {
            const statusText = statusMap[item.status] || item.status;
            const badgeColor = statusColor[item.status] || colors.text;

            return (
              <View style={styles.card}>
                <View style={styles.cardTop}>
                  <Text style={styles.bookingCode}>#{item.bookingCode}</Text>
                  <Text style={[styles.statusBadge, { color: badgeColor }]}>{statusText}</Text>
                </View>
                <Text style={styles.meta}>Khách hàng: {item.customerName}</Text>
                <Text style={styles.meta}>SĐT: {item.customerPhone}</Text>
                <Text style={styles.meta}>Ngày tạo: {formatDateTime(item.createdAt)}</Text>
                <Text style={styles.meta}>Tổng tiền: {(item.totalPrice || 0).toLocaleString()}đ</Text>

                {canCancel(item.status) ? (
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => handleCancel(item)}
                    disabled={cancellingId === item._id}
                  >
                    <Text style={styles.cancelBtnText}>
                      {cancellingId === item._id ? 'Đang hủy...' : 'Hủy lịch'}
                    </Text>
                  </TouchableOpacity>
                ) : null}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: colors.secondary, fontSize: 18, fontWeight: '700' },
  centerWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContainer: { padding: 16, paddingBottom: 40 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  filterChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: '#fff',
  },
  filterChipActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  filterChipText: { color: colors.text, fontSize: 12, fontWeight: '600' },
  filterChipTextActive: { color: '#fff' },
  card: {
    backgroundColor: colors.softPink,
    borderRadius: 14,
    padding: 12,
    gap: 6,
    marginBottom: 10,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bookingCode: { color: colors.secondary, fontSize: 14, fontWeight: '700' },
  statusBadge: { fontSize: 12, fontWeight: '700' },
  meta: { color: colors.text, fontSize: 12 },
  cancelBtn: {
    marginTop: 6,
    borderRadius: 999,
    backgroundColor: '#FF4D4D',
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: { color: '#fff', fontWeight: '700' },
});

export default MyBookingsScreen;
