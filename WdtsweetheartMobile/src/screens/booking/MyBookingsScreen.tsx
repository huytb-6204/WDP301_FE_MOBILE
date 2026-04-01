import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Calendar, Clock, PawPrint, Plus } from 'lucide-react-native';
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
  { key: 'pending', label: 'Đang chờ' },
  { key: 'confirmed', label: 'Đã xác nhận' },
  { key: 'completed', label: 'Hoàn thành' },
  { key: 'cancelled', label: 'Đã hủy' },
];

const statusMap: Record<string, string> = {
  pending: 'Đang chờ',
  confirmed: 'Đã xác nhận',
  'in-progress': 'Đang thực hiện',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
  delayed: 'Trễ hẹn',
};

const statusColor: Record<string, string> = {
  pending: '#F97316',
  confirmed: '#2D7DFA',
  'in-progress': '#FFAA00',
  completed: '#23A86D',
  cancelled: '#FF4D4D',
  delayed: '#A855F7',
};

const formatDateOnly = (iso?: string) => {
  if (!iso) return '-';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('vi-VN');
};

const formatTimeOnly = (iso?: string) => {
  if (!iso) return '-';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

const MyBookingsScreen = () => {
  const navigation = useNavigation<Navigation>();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  };

  const fetchBookings = async (useRefreshing = false) => {
    if (useRefreshing) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const res = await getMyBookings({ status: statusFilter || undefined, page: 1, limit: 50 });
      setBookings(res.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải lịch đặt');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void fetchBookings();
  }, [statusFilter]);

  const canCancel = (status: string) => ['pending', 'confirmed'].includes(status);

  const handleCancel = async (item: Booking) => {
    setCancellingId(item._id);
    try {
      await cancelBooking(item._id, 'Khách hàng hủy lịch trên ứng dụng');
      setBookings((prev) =>
        prev.map((booking) =>
          booking._id === item._id ? { ...booking, bookingStatus: 'cancelled', status: 'cancelled' } : booking
        )
      );
      showToast('Đã hủy lịch đặt thành công');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Không thể hủy lịch');
    } finally {
      setCancellingId(null);
    }
  };

  const renderBookingItem = ({ item }: { item: Booking }) => {
    const statusKey = item.bookingStatus || item.status || 'pending';
    const statusText = statusMap[statusKey] || statusKey;
    const badgeColor = statusColor[statusKey] || colors.text;
    const serviceName = item.serviceId?.name || 'Dịch vụ';
    const petNames = (item.petIds || []).map((pet: any) => pet?.name).filter(Boolean);
    const displayPets = petNames.length ? petNames.join(', ') : 'Chưa chọn thú cưng';
    const timeSource = item.start || item.createdAt;
    const totalAmount = Number(item.total ?? item.subTotal ?? item.totalPrice ?? 0);
    const depositAmount = Number(item.depositAmount || 0);
    const paymentStatus = String(item.paymentStatus || '').toLowerCase();
    const remainingAmount =
      Number(item.remainingAmount ?? (paymentStatus === 'partially_paid' ? Math.max(totalAmount - depositAmount, 0) : 0));
    
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.codeWrap}>
            <Calendar size={16} color={colors.primary} />
            <Text style={styles.bookingCode}>#{item.code || '---'}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${badgeColor}15` }]}>
            <Text style={[styles.statusText, { color: badgeColor }]}>{statusText}</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.serviceTitle}>{serviceName}</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Clock size={14} color="#999" />
              <Text style={styles.infoText}>{formatDateOnly(timeSource)} - {formatTimeOnly(timeSource)}</Text>
            </View>
            <View style={styles.infoItem}>
              <PawPrint size={14} color="#999" />
              <Text style={styles.infoText} numberOfLines={1}>{displayPets}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.priceSection}>
            <View>
              <Text style={styles.priceLabel}>Tổng cộng</Text>
              <Text style={styles.priceValue}>{totalAmount.toLocaleString()} đ</Text>
              {paymentStatus === 'paid' && <Text style={styles.paidText}>Đã thanh toán</Text>}
              {paymentStatus === 'partially_paid' && depositAmount > 0 && (
                <Text style={styles.remainingText}>Còn lại {remainingAmount.toLocaleString()} đ</Text>
              )}
            </View>
            {depositAmount > 0 && (
              <View style={styles.depositBadge}>
                <Text style={styles.depositText}>Đã cọc {depositAmount.toLocaleString()}đ</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.cardFooter}>
          <TouchableOpacity 
            style={styles.actionBtn}
            onPress={() => navigation.navigate('Booking', { serviceId: item.serviceId?._id })}
          >
            <Text style={styles.actionBtnText}>Đặt lại</Text>
          </TouchableOpacity>
          {canCancel(statusKey) && (
            <TouchableOpacity 
              style={[styles.actionBtn, styles.cancelBtn]}
              onPress={() => handleCancel(item)}
              disabled={cancellingId === item._id}
            >
              <Text style={[styles.actionBtnText, styles.cancelBtnText]}>
                {cancellingId === item._id ? 'Đang hủy...' : 'Hủy lịch'}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            style={[styles.actionBtn, styles.detailBtn]}
            onPress={() => navigation.navigate('BookingDetail', { bookingId: item._id })}
          >
            <Text style={[styles.actionBtnText, styles.detailBtnText]}>Chi tiết</Text>
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
        <Text style={styles.headerTitle}>Lịch sử dịch vụ</Text>
        <TouchableOpacity 
          style={styles.plusButton}
          onPress={() => navigation.navigate('Home', { initialTab: 'service' })}
        >
          <Plus size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={statusOptions}
          keyExtractor={(item) => item.key || 'all'}
          contentContainerStyle={styles.filterContent}
          renderItem={({ item }) => {
            const active = item.key === statusFilter;
            return (
              <TouchableOpacity
                style={[styles.filterChip, active && styles.filterChipActive]}
                onPress={() => setStatusFilter(item.key)}
              >
                <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{item.label}</Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {loading && !refreshing ? (
        <View style={styles.centerWrap}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.loadingText}>Đang tải lịch đặt...</Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          renderItem={renderBookingItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => fetchBookings(true)} colors={[colors.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Calendar size={60} color="#eee" />
              <Text style={styles.emptyText}>Chưa có lịch đặt nào</Text>
              <TouchableOpacity 
                style={styles.emptyBtn}
                onPress={() => navigation.navigate('Home', { initialTab: 'service' })}
              >
                <Text style={styles.emptyBtnText}>ĐẶT LỊCH NGAY</Text>
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
  filterContainer: { backgroundColor: '#fff', paddingVertical: 10 },
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
  centerWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: '#666', fontSize: 14, fontWeight: '500' },
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
  statusText: { fontSize: 11, fontWeight: '700' },
  cardBody: { gap: 10 },
  serviceTitle: { fontSize: 16, fontWeight: '800', color: colors.secondary },
  infoRow: { flexDirection: 'column', gap: 6 },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoText: { fontSize: 13, color: '#7d7b7b', flex: 1 },
  divider: { height: 1, backgroundColor: '#F5F5F5', marginVertical: 4 },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: { fontSize: 12, color: '#999', marginBottom: 2 },
  priceValue: { fontSize: 18, fontWeight: '800', color: colors.primary },
  depositBadge: { backgroundColor: '#E7F7EE', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  depositText: { fontSize: 11, fontWeight: '700', color: '#05A845' },
  paidText: { marginTop: 4, fontSize: 12, fontWeight: '700', color: '#05A845' },
  remainingText: { marginTop: 4, fontSize: 12, fontWeight: '700', color: '#FF5630' },
  cardFooter: {
    flexDirection: 'row',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: { fontSize: 12, fontWeight: '700', color: '#666' },
  cancelBtn: { borderColor: '#FFEBEA' },
  cancelBtnText: { color: '#FF4D4D' },
  detailBtn: { backgroundColor: colors.secondary, borderColor: colors.secondary },
  detailBtnText: { color: '#fff' },
  emptyWrap: { alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 16 },
  emptyText: { fontSize: 15, color: '#aaa', fontWeight: '500' },
  emptyBtn: { backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24, marginTop: 10 },
  emptyBtnText: { color: '#fff', fontSize: 13, fontWeight: '800' },
});

export default MyBookingsScreen;

