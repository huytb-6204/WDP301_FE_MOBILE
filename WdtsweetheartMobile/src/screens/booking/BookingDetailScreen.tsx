import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, Check, CircleDot, ClipboardCheck, Download, Loader2, Phone, User } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { getMyBooking } from '../../services/api/booking';
import { env } from '../../config';
import type { Booking } from '../../types';

const statusMap: Record<string, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  'in-progress': 'Đang làm',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
  delayed: 'Trễ hẹn',
  request_cancel: 'Chờ duyệt hủy',
  refunded: 'Đã hoàn tiền',
};

const paymentStatusMap: Record<string, string> = {
  paid: 'ĐÃ HOÀN THÀNH',
  partially_paid: 'ĐÃ ĐẶT CỌC',
  partial: 'ĐÃ ĐẶT CỌC',
  unpaid: 'CHƯA THANH TOÁN',
  refunded: 'ĐÃ HOÀN TIỀN',
};

const paymentStatusColor: Record<string, string> = {
  paid: '#05A845',
  partially_paid: '#2D7DFA',
  partial: '#2D7DFA',
  unpaid: '#EF4444',
  refunded: '#E11D48',
};

const paymentMethodLabel = (method?: string) => {
  if (method === 'money') return 'Tiền mặt tại quầy';
  if (method === 'vnpay') return 'Ví VNPay';
  if (method === 'zalopay') return 'Ví ZaloPay';
  return method || 'Không xác định';
};

const formatCurrency = (value?: number) => `${Number(value || 0).toLocaleString('vi-VN')} đ`;
const formatDate = (iso?: string) => (iso ? new Date(iso).toLocaleDateString('vi-VN') : '-');
const formatTime = (iso?: string) => (iso ? new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '-');
const formatDateTime = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '-';

const stripHtml = (raw?: string) => String(raw || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

const processSteps = [
  { key: 'pending', label: 'CHỜ XÁC NHẬN', icon: CircleDot },
  { key: 'confirmed', label: 'ĐÃ XÁC NHẬN', icon: ClipboardCheck },
  { key: 'in-progress', label: 'ĐANG LÀM', icon: Loader2 },
  { key: 'completed', label: 'HOÀN THÀNH', icon: Check },
];

const BookingDetailScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { bookingId } = route.params;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await getMyBooking(bookingId);
        setBooking(res.data);
      } catch (error) {
        Alert.alert('Lỗi', 'Không thể tải chi tiết đặt lịch');
      } finally {
        setLoading(false);
      }
    };
    void fetchBooking();
  }, [bookingId]);

  const statusKey = String(booking?.bookingStatus || booking?.status || 'pending');
  const paymentStatusKey = String(booking?.paymentStatus || 'unpaid').toLowerCase();
  const total = Number(booking?.total ?? booking?.subTotal ?? booking?.totalPrice ?? 0);
  const deposit = Number(booking?.depositAmount || 0);
  const remaining = Number(booking?.remainingAmount ?? Math.max(total - deposit, 0));

  const isCancelled = statusKey === 'cancelled';
  const successFlow = useMemo(() => processSteps.map((step) => step.key), []);
  const currentStepIndex = useMemo(() => successFlow.indexOf(statusKey), [statusKey, successFlow]);
  const reachedStatusSet = useMemo(() => {
    const reached = new Set<string>();
    const statusHistory = Array.isArray(booking?.statusHistory) ? booking?.statusHistory : [];
    statusHistory.forEach((item: any) => {
      const s = String(item?.status || '');
      if (s) reached.add(s);
    });
    return reached;
  }, [booking?.statusHistory]);

  const petStatusMapById = useMemo(() => {
    const map: Record<string, string> = {};
    (booking?.petStaffMap || []).forEach((m) => {
      const petId = String((m as any)?.petId?._id || (m as any)?.petId || '');
      if (petId) map[petId] = String(m?.status || 'pending');
    });
    return map;
  }, [booking?.petStaffMap]);

  const handleExportPdf = async () => {
    if (!booking?.code) return;
    try {
      setExporting(true);
      const url = `${env.apiBaseUrl}/api/v1/client/booking/export-pdf?bookingCode=${encodeURIComponent(
        String(booking.code || '')
      )}&phone=${encodeURIComponent(String(booking.customerPhone || ''))}`;
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể mở file PDF');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerWrap}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!booking) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerWrap}>
          <Text style={styles.emptyText}>Không tìm thấy lịch đặt.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={22} color={colors.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết dịch vụ</Text>
        <TouchableOpacity style={styles.backListBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backListText}>Trở lại</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.stepperWrap}>
          {processSteps.map((step, idx) => {
            const Icon = step.icon;
            const isPast = !isCancelled && currentStepIndex !== -1 && idx < currentStepIndex;
            const isCurrent = !isCancelled && currentStepIndex !== -1 && idx === currentStepIndex;
            const isReachedInCancelled = isCancelled && (idx === 0 || reachedStatusSet.has(step.key));
            const isDone = isPast || isCurrent || isReachedInCancelled;
            const nextStep = processSteps[idx + 1];
            const isLineActive =
              !isCancelled
                ? isPast
                : Boolean(nextStep) && isReachedInCancelled && reachedStatusSet.has(nextStep.key);

            return (
              <View key={step.key} style={styles.stepItem}>
                <View style={styles.stepTop}>
                  <View
                    style={[
                      styles.stepDot,
                      isDone && styles.stepDotActive,
                      isReachedInCancelled && styles.stepDotCancelled,
                    ]}
                  >
                    <Icon size={14} color={isDone ? '#fff' : '#B5B5B5'} />
                  </View>
                  {idx < processSteps.length - 1 && (
                    <View
                      style={[
                        styles.stepLine,
                        isLineActive && styles.stepLineActive,
                        isCancelled && isLineActive && styles.stepLineCancelled,
                      ]}
                    />
                  )}
                </View>
                <Text style={[styles.stepLabel, isDone && styles.stepLabelActive]}>{step.label}</Text>
                {isCurrent && <Text style={styles.stepSub}>Đang thực hiện</Text>}
              </View>
            );
          })}
        </View>

        <View style={styles.voucherCard}>
          <View style={styles.voucherTop}>
            <View>
              <Text style={styles.brand}>TEDDYPET</Text>
            </View>
            <View style={styles.voucherRight}>
              <Text style={styles.voucherTitle}>PHIẾU DỊCH VỤ</Text>
              <Text style={styles.voucherMeta}>Mã: #{booking.code || '---'}</Text>
              <Text style={styles.voucherMeta}>Ngày đặt: {formatDateTime(booking.createdAt)}</Text>
              <TouchableOpacity style={styles.pdfBtn} onPress={handleExportPdf} disabled={exporting}>
                <Download size={14} color="#fff" />
                <Text style={styles.pdfBtnText}>{exporting ? 'Đang mở...' : 'Xuất PDF'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoCol}>
              <Text style={styles.colTitle}>THÔNG TIN KHÁCH HÀNG</Text>
              <View style={styles.infoRow}>
                <User size={15} color={colors.primary} />
                <Text style={styles.infoText}>Khách hàng: {booking.customerName || '-'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Phone size={15} color={colors.primary} />
                <Text style={styles.infoText}>Điện thoại: {booking.customerPhone || '-'}</Text>
              </View>
              <Text style={styles.infoText}>Ghi chú: {booking.notes || 'Không có'}</Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.colTitle}>TRẠNG THÁI & THANH TOÁN</Text>
              <Text style={styles.infoText}>
                Trạng thái: <Text style={styles.statusValue}>{statusMap[statusKey] || statusKey}</Text>
              </Text>
              <Text style={styles.infoText}>
                Thanh toán:{' '}
                <Text style={{ color: paymentStatusColor[paymentStatusKey] || '#666', fontWeight: '800' }}>
                  {paymentStatusMap[paymentStatusKey] || paymentStatusKey}
                </Text>
              </Text>
              <Text style={styles.infoText}>Phương thức: {paymentMethodLabel(booking.paymentMethod)}</Text>
              {deposit > 0 && <Text style={styles.infoText}>Đã cọc: {formatCurrency(deposit)}</Text>}
              {(paymentStatusKey === 'partially_paid' || paymentStatusKey === 'partial') && remaining > 0 && (
                <Text style={styles.infoText}>Còn lại: {formatCurrency(remaining)}</Text>
              )}
            </View>
          </View>

          <View style={styles.tableHead}>
            <Text style={[styles.th, styles.thService]}>Nội dung dịch vụ</Text>
            <Text style={[styles.th, styles.thDate]}>Ngày thực hiện</Text>
            <Text style={[styles.th, styles.thTime]}>Giờ hẹn</Text>
            <Text style={[styles.th, styles.thTotal]}>Tổng cộng</Text>
          </View>

          <View style={styles.tableBody}>
            <View style={styles.serviceCell}>
              <Text style={styles.serviceName}>{booking.serviceId?.name || 'Dịch vụ'}</Text>
              {(booking.petIds || []).map((pet: any) => {
                const petId = String(pet?._id || pet?.id || '');
                const petStatus = String(petStatusMapById[petId] || 'pending');
                const petStatusLabel =
                  statusKey === 'cancelled' ? 'Đã hủy' : petStatus === 'completed' ? 'Đã xong' : petStatus === 'in-progress' ? 'Đang làm' : 'Chờ làm';

                return (
                  <View key={petId || pet?.name} style={styles.petRow}>
                    <View style={styles.petAvatar}>
                      <Text style={styles.petAvatarText}>{String(pet?.name || '?').charAt(0).toUpperCase()}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.petName}>{pet?.name || 'Thú cưng'}</Text>
                      <Text style={styles.petBreed}>{pet?.breed || (pet?.type === 'dog' ? 'Chó' : 'Mèo')}</Text>
                    </View>
                    <View style={styles.petStatusBadge}>
                      <Text style={styles.petStatusText}>{petStatusLabel}</Text>
                    </View>
                  </View>
                );
              })}
            </View>

            <View style={styles.dateCell}>
              <Text style={styles.tdText}>{formatDate(booking.start)}</Text>
            </View>
            <View style={styles.timeCell}>
              {booking.originalStart && formatTime(booking.originalStart) !== formatTime(booking.start) && (
                <Text style={styles.oldTime}>{formatTime(booking.originalStart)}</Text>
              )}
              <Text style={styles.timeValue}>{formatTime(booking.start)}</Text>
            </View>
            <View style={styles.totalCell}>
              <Text style={styles.totalColValue}>{formatCurrency(total)}</Text>
            </View>
          </View>

          <View style={styles.tableFooter}>
            <Text style={styles.footerLabel}>Thành tiền:</Text>
            <Text style={styles.footerValue}>{formatCurrency(total)}</Text>
          </View>

          {!!booking.serviceId?.procedure && (
            <View style={styles.procedureBox}>
              <Text style={styles.procedureTitle}>Quy trình dịch vụ</Text>
              <Text style={styles.procedureText}>{stripHtml(booking.serviceId.procedure)}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F8' },
  centerWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 14, color: '#7d7b7b' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: colors.secondary },
  backListBtn: { backgroundColor: '#FF6E6E', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  backListText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  content: { padding: 14, paddingBottom: 30, gap: 12 },

  stepperWrap: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#EFEFEF',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 10,
    flexDirection: 'row',
  },
  stepItem: { flex: 1, alignItems: 'center' },
  stepTop: { width: '100%', flexDirection: 'row', alignItems: 'center' },
  stepDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: { backgroundColor: '#F5675D', borderColor: '#F5675D' },
  stepDotCancelled: { backgroundColor: '#9CA3AF', borderColor: '#9CA3AF' },
  stepLine: { flex: 1, height: 2, backgroundColor: '#E6E6E6', marginHorizontal: 6 },
  stepLineActive: { backgroundColor: '#F5675D' },
  stepLineCancelled: { backgroundColor: '#9CA3AF' },
  stepLabel: { marginTop: 8, fontSize: 10, fontWeight: '700', color: '#A3A3A3', textAlign: 'center' },
  stepLabelActive: { color: '#2E2E2E' },
  stepSub: { marginTop: 2, fontSize: 9, color: '#FF6E6E', fontWeight: '600' },

  voucherCard: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#EFEFEF', overflow: 'hidden' },
  voucherTop: {
    paddingHorizontal: 14,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  brand: { fontSize: 22, fontWeight: '900', color: '#FF5F57' },
  voucherRight: { alignItems: 'flex-end', flexShrink: 1 },
  voucherTitle: { fontSize: 18, fontWeight: '800', color: '#243245' },
  voucherMeta: { marginTop: 4, fontSize: 12, color: '#666' },
  pdfBtn: {
    marginTop: 10,
    backgroundColor: '#FF6E6E',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pdfBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },

  infoGrid: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    flexDirection: 'row',
    gap: 10,
  },
  infoCol: { flex: 1, gap: 6 },
  colTitle: { fontSize: 11, fontWeight: '800', color: '#243245', marginBottom: 2 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoText: { fontSize: 12, color: '#505050', lineHeight: 18 },
  statusValue: { color: '#05A845', fontWeight: '800' },

  tableHead: {
    flexDirection: 'row',
    backgroundColor: '#FAFAFA',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  th: { fontSize: 11, fontWeight: '700', color: '#243245' },
  thService: { flex: 2.5 },
  thDate: { flex: 1.2, textAlign: 'center' },
  thTime: { flex: 1, textAlign: 'center' },
  thTotal: { flex: 1.2, textAlign: 'right' },

  tableBody: { flexDirection: 'row', paddingHorizontal: 10, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  serviceCell: { flex: 2.5, paddingRight: 8 },
  serviceName: { fontSize: 14, fontWeight: '800', color: colors.secondary, marginBottom: 8 },
  petRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#EEF2F7',
    borderRadius: 10,
    padding: 8,
    marginBottom: 8,
    gap: 8,
  },
  petAvatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#FFE2E0', alignItems: 'center', justifyContent: 'center' },
  petAvatarText: { color: '#FF6E6E', fontWeight: '800' },
  petName: { fontSize: 12, fontWeight: '700', color: '#243245' },
  petBreed: { fontSize: 11, color: '#7d7b7b', marginTop: 1 },
  petStatusBadge: { backgroundColor: '#E8F7EE', borderRadius: 20, paddingHorizontal: 9, paddingVertical: 4 },
  petStatusText: { fontSize: 10, color: '#05A845', fontWeight: '700' },
  dateCell: { flex: 1.2, alignItems: 'center', justifyContent: 'center' },
  timeCell: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  totalCell: { flex: 1.2, alignItems: 'flex-end', justifyContent: 'center' },
  tdText: { fontSize: 12, color: '#243245', fontWeight: '600', textAlign: 'center' },
  oldTime: { fontSize: 10, color: '#EF4444', textDecorationLine: 'line-through' },
  timeValue: { fontSize: 12, color: '#FF5F57', fontWeight: '800' },
  totalColValue: { fontSize: 14, color: '#FF5F57', fontWeight: '800' },

  tableFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  footerLabel: { fontSize: 14, color: '#666', fontWeight: '700' },
  footerValue: { fontSize: 20, color: '#FF5F57', fontWeight: '900' },

  procedureBox: { padding: 12, gap: 8 },
  procedureTitle: { fontSize: 14, fontWeight: '800', color: '#243245' },
  procedureText: { fontSize: 13, color: '#505050', lineHeight: 20 },
});

export default BookingDetailScreen;
