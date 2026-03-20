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
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

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
          booking._id === item._id ? { ...booking, bookingStatus: 'cancelled', status: 'cancelled' } : booking
        )
      );
      showToast('Đã hủy lịch đặt');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Không thể hủy lịch');
    } finally {
      setCancellingId(null);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
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
            const statusKey = item.bookingStatus || item.status || 'pending';
            const statusText = statusMap[statusKey] || statusKey;
            const badgeColor = statusColor[statusKey] || colors.text;
            const serviceName = item.serviceId?.name || 'Dịch vụ';
            const petNames = (item.petIds || []).map((pet: any) => pet?.name).filter(Boolean);
            const displayPets = petNames.length ? petNames.join(', ') : 'Chưa chọn thú cưng';
            const timeSource = item.start || item.createdAt;
            const totalAmount = Number(item.total ?? item.subTotal ?? item.totalPrice ?? 0);
            const paymentText =
              item.paymentStatus === 'paid'
                ? 'Đã thanh toán'
                : item.paymentStatus === 'partially_paid'
                  ? 'Đã cọc'
                  : 'Chưa thanh toán';
            const isExpanded = !!expandedIds[item._id];

            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.bookingCode}>#{item.code || item.bookingCode || '---'}</Text>
                    <Text style={styles.serviceName}>{serviceName}</Text>
                  </View>
                  <View style={[styles.statusPill, { backgroundColor: `${badgeColor}20` }]}>
                    <Text style={[styles.statusPillText, { color: badgeColor }]}>{statusText}</Text>
                  </View>
                </View>

                <View style={styles.cardBody}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Ngày</Text>
                    <Text style={styles.infoValue}>{formatDateOnly(timeSource)}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Giờ hẹn</Text>
                    <Text style={styles.infoValue}>{formatTimeOnly(timeSource)}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Bé cưng</Text>
                    <Text style={styles.infoValue}>{displayPets}</Text>
                  </View>
                </View>

                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Tổng tiền</Text>
                  <Text style={styles.totalValue}>{totalAmount.toLocaleString()}đ</Text>
                </View>

                <View style={styles.cardFooter}>
                  <View style={styles.paymentWrap}>
                    <Text style={styles.paymentLabel}>Thanh toán</Text>
                    <Text style={styles.paymentValue}>{paymentText}</Text>
                  </View>
                  <TouchableOpacity style={styles.detailBtn} onPress={() => toggleExpand(item._id)}>
                    <Text style={styles.detailBtnText}>{isExpanded ? 'Thu gọn' : 'Chi tiết'}</Text>
                  </TouchableOpacity>
                </View>

                {isExpanded ? (
                  <View style={styles.expandWrap}>
                    <View style={styles.expandSection}>
                      <Text style={styles.expandTitle}>Thông tin khách hàng</Text>
                      <Text style={styles.expandText}>Khách hàng: {item.customerName}</Text>
                      <Text style={styles.expandText}>SĐT: {item.customerPhone}</Text>
                      <Text style={styles.expandText}>Ghi chú: {item.notes || 'Không có'}</Text>
                    </View>
                    <View style={styles.expandSection}>
                      <Text style={styles.expandTitle}>Thanh toán</Text>
                      <Text style={styles.expandText}>
                        Phương thức: {item.paymentMethod === 'money' ? 'Tiền mặt' : item.paymentMethod || 'Chưa có'}
                      </Text>
                      <Text style={styles.expandText}>Đặt cọc: {(item.depositAmount || 0).toLocaleString()}đ</Text>
                      <Text style={styles.expandText}>
                        Còn lại: {(item.remainingAmount || 0).toLocaleString()}đ
                      </Text>
                    </View>
                    <View style={styles.expandSection}>
                      <Text style={styles.expandTitle}>Bé cưng</Text>
                      {(item.petIds || []).length ? (
                        (item.petIds || []).map((pet: any) => {
                          const mapping = item.petStaffMap?.find((m: any) => {
                            const mappedId = (m.petId?._id || m.petId)?.toString?.() || m.petId;
                            return mappedId === pet?._id;
                          });
                          const petStatus = mapping?.status || 'pending';
                          return (
                            <View key={pet?._id || pet?.name} style={styles.petRow}>
                              <Text style={styles.petName}>{pet?.name || 'Thú cưng'}</Text>
                              <View style={styles.petStatusChip}>
                                <Text style={styles.petStatusText}>
                                  {petStatus === 'completed'
                                    ? 'Hoàn thành'
                                    : petStatus === 'in-progress'
                                      ? 'Đang làm'
                                      : 'Chờ thực hiện'}
                                </Text>
                              </View>
                            </View>
                          );
                        })
                      ) : (
                        <Text style={styles.expandText}>Chưa có thú cưng</Text>
                      )}
                    </View>
                  </View>
                ) : null}

                {canCancel(statusKey) ? (
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
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    gap: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookingCode: { color: colors.secondary, fontSize: 13, fontWeight: '700' },
  serviceName: { color: colors.text, fontSize: 12, marginTop: 2 },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  statusPillText: { fontSize: 11, fontWeight: '700' },
  cardBody: { gap: 6, marginTop: 4 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoLabel: { color: colors.textLight, fontSize: 12 },
  infoValue: { color: colors.secondary, fontSize: 12, fontWeight: '600' },
  totalRow: {
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: { color: colors.secondary, fontSize: 12, fontWeight: '700' },
  totalValue: { color: colors.primary, fontSize: 14, fontWeight: '800' },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentWrap: { gap: 2 },
  paymentLabel: { color: colors.textLight, fontSize: 11 },
  paymentValue: { color: colors.secondary, fontSize: 12, fontWeight: '600' },
  detailBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  detailBtnText: { color: colors.primary, fontWeight: '700', fontSize: 12 },
  expandWrap: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 10,
  },
  expandSection: { gap: 4 },
  expandTitle: { color: colors.secondary, fontWeight: '700', fontSize: 12 },
  expandText: { color: colors.text, fontSize: 12 },
  petRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  petName: { color: colors.secondary, fontSize: 12, fontWeight: '600' },
  petStatusChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: colors.softPink,
  },
  petStatusText: { color: colors.primary, fontSize: 10, fontWeight: '700' },
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
