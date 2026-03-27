import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, House, PawPrint } from 'lucide-react-native';
import { StatusMessage } from '../../components/common';
import { getMyBoardingBookingDetail } from '../../services/api/boarding';
import { colors } from '../../theme/colors';

const formatDate = (value?: string) => {
  if (!value) return 'Chưa cập nhật';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('vi-VN');
};

const formatCurrency = (value?: number) => `${Number(value || 0).toLocaleString('vi-VN')} đ`;

const getCageTypeText = (type?: string) => {
  const map: Record<string, string> = {
    standard: 'Tiêu chuẩn',
    vip: 'Cao cấp',
    deluxe: 'Deluxe',
  };

  return map[(type || '').toLowerCase()] || type || 'Chưa cập nhật';
};

const getPaymentStatusText = (status?: string) => {
  const map: Record<string, string> = {
    unpaid: 'Chưa thanh toán',
    paid: 'Đã thanh toán',
    partial: 'Đã đặt cọc',
    pending: 'Đang chờ xử lý',
    failed: 'Thanh toán thất bại',
    refunded: 'Đã hoàn tiền',
  };

  return map[(status || '').toLowerCase()] || status || 'Chưa cập nhật';
};

const getPaymentMethodText = (method?: string) => {
  const map: Record<string, string> = {
    pay_at_site: 'Thanh toán tại quầy',
    prepaid: 'Thanh toán online',
    money: 'Tiền mặt',
    cod: 'Thanh toán khi nhận hàng',
    vnpay: 'Cổng thanh toán VNPAY',
    zalopay: 'Ví điện tử ZaloPay',
  };

  return map[(method || '').toLowerCase()] || method || 'Chưa cập nhật';
};

const getPaymentGatewayText = (gateway?: string) => {
  const map: Record<string, string> = {
    vnpay: 'VNPAY',
    zalopay: 'ZaloPay',
  };

  return map[(gateway || '').toLowerCase()] || gateway || 'Chưa cập nhật';
};

const getStatusColor = (status?: string) => {
  switch ((status || '').toLowerCase()) {
    case 'completed':
    case 'checked-out':
      return '#05A845';
    case 'confirmed':
      return '#007BFF';
    case 'pending':
      return '#FFAB00';
    case 'cancelled':
      return '#FF4D4F';
    case 'checked-in':
      return '#6366F1';
    default:
      return '#7D7B7B';
  }
};

const getStatusText = (status?: string) => {
  const map: Record<string, string> = {
    pending: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    'checked-in': 'Đang lưu trú',
    'checked-out': 'Đã trả phòng',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy',
  };

  return map[(status || '').toLowerCase()] || status || 'Không rõ';
};

const BoardingBookingDetailScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { bookingId } = route.params;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setErrorMessage(null);
        const res = await getMyBoardingBookingDetail(bookingId);
        setData(res);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Không thể tải chi tiết booking khách sạn';
        setErrorMessage(message);
        Alert.alert('Lỗi', message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [bookingId]);

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <ArrowLeft size={24} color={colors.secondary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Chi tiết khách sạn</Text>
      <View style={styles.headerSpacer} />
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.centerWrap}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!data?.booking) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.centerWrap}>
          <StatusMessage
            message={
              errorMessage || 'Không có dữ liệu chi tiết cho booking này. Vui lòng thử lại sau.'
            }
          />
        </View>
      </SafeAreaView>
    );
  }

  const { booking, pets = [], cage } = data;
  const bookingStatus = booking.boardingStatus || booking.status;
  const statusColor = getStatusColor(bookingStatus);

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statusBanner}>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {getStatusText(bookingStatus).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.bookingCode}>
            Mã booking: #{booking.code || booking._id?.slice(-8)?.toUpperCase() || bookingId}
          </Text>
          <Text style={styles.bookingDate}>Đặt vào: {formatDate(booking.createdAt)}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thời gian lưu trú</Text>
          <View style={styles.timeCard}>
            <View style={styles.timeBox}>
              <Text style={styles.timeLabel}>NHẬN PHÒNG</Text>
              <Text style={styles.timeVal}>{formatDate(booking.checkInDate)}</Text>
              <Text style={styles.timeSub}>Sau 09:00 AM</Text>
            </View>
            <View style={styles.timeDivider} />
            <View style={styles.timeBox}>
              <Text style={styles.timeLabel}>TRẢ PHÒNG</Text>
              <Text style={styles.timeVal}>{formatDate(booking.checkOutDate)}</Text>
              <Text style={styles.timeSub}>Trước 09:00 AM</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chuồng và thú cưng</Text>
          <View style={styles.itemCard}>
            <View style={styles.cageHeader}>
              <House size={20} color={colors.primary} />
              <View style={styles.cageInfo}>
                <Text style={styles.cageName}>{cage?.cageCode || 'Chuồng nội trú'}</Text>
                <Text style={styles.cageType}>{getCageTypeText(cage?.type)}</Text>
              </View>
              <Text style={styles.cagePrice}>{formatCurrency(booking.total)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.petList}>
              {pets.length ? (
                pets.map((pet: any, idx: number) => (
                  <View key={pet._id || `${pet.name}-${idx}`} style={styles.petItem}>
                    <View style={styles.petBadge}>
                      <PawPrint size={14} color={colors.primary} />
                      <Text style={styles.petBadgeText}>{pet.name || 'Thú cưng'}</Text>
                    </View>
                    {pet.avatar ? (
                      <Image source={{ uri: pet.avatar }} style={styles.petAvatar} />
                    ) : (
                      <View style={styles.petAvatarFallback}>
                        <PawPrint size={18} color={colors.primary} />
                      </View>
                    )}
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>Chưa có thông tin thú cưng.</Text>
              )}
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
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Thanh toán:</Text>
              <Text style={styles.infoVal}>{getPaymentStatusText(booking.paymentStatus)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phương thức:</Text>
              <Text style={styles.infoVal}>{getPaymentMethodText(booking.paymentMethod)}</Text>
            </View>
            {booking.paymentMethod === 'prepaid' || booking.paymentGateway ? (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Cổng thanh toán:</Text>
                <Text style={styles.infoVal}>{getPaymentGatewayText(booking.paymentGateway)}</Text>
              </View>
            ) : null}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Đặt cọc:</Text>
              <Text style={styles.infoVal}>{formatCurrency(booking.depositAmount)}</Text>
            </View>
          </View>
        </View>

        {booking.notes ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ghi chú</Text>
            <View style={styles.infoCard}>
              <Text style={styles.notesText}>{booking.notes}</Text>
            </View>
          </View>
        ) : null}
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
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.secondary,
  },
  headerSpacer: { width: 40 },
  centerWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  content: { padding: 16 },
  statusBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '900',
  },
  bookingCode: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.secondary,
    marginBottom: 4,
  },
  bookingDate: {
    fontSize: 12,
    color: '#7D7B7B',
  },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.secondary,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  timeCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  timeBox: { alignItems: 'center', flex: 1 },
  timeLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.primary,
    marginBottom: 8,
  },
  timeVal: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.secondary,
  },
  timeSub: {
    fontSize: 11,
    color: '#999999',
    marginTop: 4,
  },
  timeDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#EEEEEE',
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
  },
  cageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
  },
  cageInfo: { flex: 1 },
  cageName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.secondary,
  },
  cageType: {
    fontSize: 12,
    color: '#999999',
    marginTop: 2,
  },
  cagePrice: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: '#F9F9F9',
  },
  petList: {
    gap: 12,
    padding: 16,
  },
  petItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  petBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    flexShrink: 1,
  },
  petBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.secondary,
  },
  petAvatar: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#F7D9DE',
  },
  petAvatarFallback: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#FFF1F4',
    borderWidth: 1,
    borderColor: '#FFD5DE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: '#7D7B7B',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#7D7B7B',
  },
  infoVal: {
    fontSize: 14,
    color: colors.secondary,
    fontWeight: '700',
    maxWidth: '58%',
    textAlign: 'right',
  },
  notesText: {
    fontSize: 14,
    color: '#7D7B7B',
    fontStyle: 'italic',
    lineHeight: 20,
  },
});

export default BoardingBookingDetailScreen;
