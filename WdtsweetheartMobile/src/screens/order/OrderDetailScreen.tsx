import React, { useMemo, useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, Check, ClipboardCheck, Download, Loader2, Package, Truck } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { getOrderDetail } from '../../services/api/dashboard';
import { cancelOrder, confirmReceipt } from '../../services/api/order';
import { env } from '../../config';
import Toast, { ToastType } from '../../components/common/Toast';
import AppAlert from '../../components/common/AppAlert';

type OrderLike = {
  _id: string;
  code?: string;
  fullName?: string;
  phone?: string;
  address?: string;
  orderStatus?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  items?: Array<{
    _id?: string;
    name?: string;
    quantity?: number;
    price?: number;
    image?: string;
  }>;
  total?: number;
  subTotal?: number;
  discount?: number;
  pointDiscount?: number;
  shipping?: { fee?: number };
  createdAt?: string;
  confirmedAt?: string;
  shippingAt?: string;
  shippedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  returnedAt?: string;
  cancelledReason?: string;
  statusHistory?: Array<{ status?: string }>;
};

const stepDefs = [
  { key: 'pending', label: 'CHỜ XÁC NHẬN', icon: Package, dateKey: 'createdAt' as const },
  { key: 'confirmed', label: 'ĐÃ XÁC NHẬN', icon: ClipboardCheck, dateKey: 'confirmedAt' as const },
  { key: 'shipping', label: 'ĐANG GIAO', icon: Truck, dateKey: 'shippingAt' as const },
  { key: 'shipped', label: 'ĐÃ ĐẾN NƠI', icon: Check, dateKey: 'shippedAt' as const },
  { key: 'completed', label: 'HOÀN THÀNH', icon: Check, dateKey: 'completedAt' as const },
];

const statusText: Record<string, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao hàng',
  shipped: 'Đã giao hàng',
  completed: 'Giao thành công',
  cancelled: 'Đã hủy',
  returned: 'Trả hàng',
  request_cancel: 'Chờ duyệt hủy',
  unpaid: 'Chưa thanh toán',
  paid: 'Đã thanh toán',
  refunded: 'Đã hoàn tiền',
};

const statusColor: Record<string, string> = {
  pending: '#f97316',
  confirmed: '#007BFF',
  shipping: '#007BFF',
  shipped: '#05A845',
  completed: '#05A845',
  cancelled: '#ff0000',
  returned: '#ff0000',
  request_cancel: '#f97316',
  unpaid: '#f97316',
  paid: '#05A845',
  refunded: '#ff0000',
};

const paymentMethodLabel = (method?: string) => {
  const m = String(method || '').toLowerCase();
  if (m === 'cod' || m === 'money') return 'Thanh toán khi nhận hàng';
  if (m === 'vnpay') return 'Ví VNPay';
  if (m === 'zalopay') return 'Ví ZaloPay';
  return method || 'Không xác định';
};

const formatCurrency = (n?: number) => `${Number(n || 0).toLocaleString('vi-VN')} đ`;

const formatStepTime = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
};

const formatDateTime = (iso?: string) => {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const OrderDetailScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { orderId } = route.params;

  const [order, setOrder] = useState<OrderLike | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<ToastType>('info');
  const [confirmCancelVisible, setConfirmCancelVisible] = useState(false);
  const [heroImageIndex, setHeroImageIndex] = useState(0);

  const showToast = (message: string, type: ToastType = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 1800);
  };

  const fetchDetail = async () => {
    try {
      const res = (await getOrderDetail(orderId)) as any;
      if (res?.success && res?.order) setOrder(res.order);
      else if (res?.data) setOrder(res.data);
      else setOrder(null);
    } catch {
      showToast('Không thể tải chi tiết đơn hàng', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchDetail();
  }, [orderId]);

  const currentStatus = String(order?.orderStatus || 'pending');
  const isCancelled = currentStatus === 'cancelled';
  const isReturned = currentStatus === 'returned';
  const heroProducts = useMemo(
    () => (order?.items || []).filter((item) => Boolean(item?.image)),
    [order?.items]
  );
  const successFlow = stepDefs.map((s) => s.key);
  const currentIndex = successFlow.indexOf(currentStatus);
  const reachedSet = useMemo(() => {
    const set = new Set<string>();
    (order?.statusHistory || []).forEach((h) => {
      if (h?.status) set.add(h.status);
    });
    return set;
  }, [order?.statusHistory]);

  useEffect(() => {
    setHeroImageIndex(0);
  }, [heroProducts.length]);

  useEffect(() => {
    if (heroProducts.length <= 1) return;
    const timer = setInterval(() => {
      setHeroImageIndex((prev) => (prev + 1) % heroProducts.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [heroProducts.length]);

  const handleExportInvoice = async () => {
    if (!order?.code || !order?.phone) return;
    try {
      setExporting(true);
      const url = `${env.apiBaseUrl}/api/v1/client/order/export-pdf?orderCode=${encodeURIComponent(order.code)}&phone=${encodeURIComponent(
        order.phone
      )}`;
      await Linking.openURL(url);
    } catch {
      showToast('Không thể mở hóa đơn PDF', 'error');
    } finally {
      setExporting(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order?._id) return;
    try {
      setProcessing(true);
      const res = await cancelOrder(order._id, 'Khách hàng hủy đơn trên ứng dụng');
      if (res?.code === 'success') {
        showToast(res.message || 'Đã hủy đơn hàng', 'success');
        await fetchDetail();
      } else {
        showToast(res?.message || 'Không thể hủy đơn', 'error');
      }
    } catch (error: any) {
      showToast(error?.message || 'Không thể hủy đơn', 'error');
    } finally {
      setProcessing(false);
      setConfirmCancelVisible(false);
    }
  };

  const handleConfirmReceipt = async () => {
    if (!order?._id) return;
    try {
      setProcessing(true);
      const res = await confirmReceipt(order._id);
      if (res?.code === 'success') {
        showToast(res.message || 'Đã xác nhận nhận hàng', 'success');
        await fetchDetail();
      } else {
        showToast(res?.message || 'Không thể xác nhận nhận hàng', 'error');
      }
    } catch (error: any) {
      showToast(error?.message || 'Không thể xác nhận nhận hàng', 'error');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerWrap}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerWrap}>
          <Text style={styles.emptyText}>Không tìm thấy đơn hàng.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const subTotal = Number(order.subTotal || 0);
  const shippingFee = Number(order.shipping?.fee || 0);
  const discount = Number(order.discount || 0) + Number(order.pointDiscount || 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={22} color={colors.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
        <TouchableOpacity style={styles.backListBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backListText}>Trở lại</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.stepperWrap}>
          {stepDefs.map((step, idx) => {
            const Icon = step.icon;
            const isPast = !isCancelled && !isReturned && currentIndex !== -1 && idx < currentIndex;
            const isCurrent = !isCancelled && !isReturned && currentIndex !== -1 && idx === currentIndex;
            const reachedInSpecial = (isCancelled || isReturned) && (idx === 0 || reachedSet.has(step.key));
            const isDone = isPast || isCurrent || reachedInSpecial;
            const next = stepDefs[idx + 1];
            const lineActive =
              !isCancelled && !isReturned
                ? isPast
                : Boolean(next) && reachedInSpecial && reachedSet.has(next.key);

            return (
              <View key={step.key} style={styles.stepItem}>
                <View style={styles.stepTop}>
                  <View style={[styles.stepDot, isDone && styles.stepDotActive, reachedInSpecial && styles.stepDotSpecial]}>
                    <Icon size={14} color={isDone ? '#fff' : '#B5B5B5'} />
                  </View>
                  {idx < stepDefs.length - 1 && (
                    <View style={[styles.stepLine, lineActive && styles.stepLineActive, (isCancelled || isReturned) && lineActive && styles.stepLineSpecial]} />
                  )}
                </View>
                <Text style={[styles.stepLabel, isDone && styles.stepLabelActive]}>{step.label}</Text>
                <Text style={styles.stepTime}>{formatStepTime(order?.[step.dateKey])}</Text>
                {isCurrent && <Text style={styles.stepSub}>Đang thực hiện</Text>}
              </View>
            );
          })}
        </View>

        {(isCancelled || isReturned) && (
          <View style={styles.specialBox}>
            <Text style={styles.specialText}>{isCancelled ? 'Đã hủy đơn' : 'Đã trả hàng'}</Text>
            <Text style={styles.specialTime}>{formatStepTime(order.cancelledAt || order.returnedAt)}</Text>
          </View>
        )}

        <View style={styles.invoiceCard}>
          <View style={styles.invoiceTop}>
            <View style={styles.invoiceLeft}>
              <Text style={styles.brand}>TEDDYPET</Text>
              <View style={styles.productPreviewList}>
                {heroProducts.length > 0 ? (
                  <View style={styles.heroImageWrap}>
                    <Image source={{ uri: String(heroProducts[heroImageIndex]?.image || '') }} style={styles.heroImage} />
                    <View style={styles.heroCaption}>
                      <Text style={styles.heroName} numberOfLines={1}>
                        {heroProducts[heroImageIndex]?.name || 'Sản phẩm'}
                      </Text>
                      <Text style={styles.heroQty}>SL: {Number(heroProducts[heroImageIndex]?.quantity || 0)}</Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.heroFallback}>
                    <Text style={styles.heroFallbackText}>Không có ảnh sản phẩm</Text>
                  </View>
                )}
              </View>
            </View>
            <View style={styles.invoiceRight}>
              <Text style={styles.invoiceTitle}>HÓA ĐƠN</Text>
              <Text style={styles.invoiceMeta}>Mã đơn hàng: #{order.code || '---'}</Text>
              <Text style={styles.invoiceMeta}>Ngày: {formatDateTime(order.createdAt)}</Text>
              <Text style={styles.invoiceMeta}>
                Trạng thái: <Text style={{ color: statusColor[currentStatus] || '#666', fontWeight: '800' }}>{statusText[currentStatus] || currentStatus}</Text>
              </Text>
              <Text style={styles.invoiceMeta}>
                Thanh toán:{' '}
                <Text style={{ color: statusColor[String(order.paymentStatus || '')] || '#666', fontWeight: '800' }}>
                  {statusText[String(order.paymentStatus || '')] || String(order.paymentStatus || '')}
                </Text>
              </Text>

              <TouchableOpacity style={styles.actionBtnPrimary} onPress={handleExportInvoice} disabled={exporting}>
                <Download size={14} color="#fff" />
                <Text style={styles.actionBtnText}>{exporting ? 'Đang mở...' : 'Xuất hóa đơn'}</Text>
              </TouchableOpacity>

              {order.orderStatus === 'shipped' && (
                <TouchableOpacity style={[styles.actionBtnPrimary, styles.receiptBtn]} onPress={handleConfirmReceipt} disabled={processing}>
                  <Text style={styles.actionBtnText}>{processing ? 'Đang xử lý...' : 'Đã nhận hàng'}</Text>
                </TouchableOpacity>
              )}

              {(order.orderStatus === 'pending' || order.orderStatus === 'confirmed') && (
                <TouchableOpacity
                  style={[styles.actionBtnPrimary, styles.cancelBtn]}
                  onPress={() => setConfirmCancelVisible(true)}
                  disabled={processing}
                >
                  <Text style={styles.actionBtnText}>{processing ? 'Đang xử lý...' : 'Hủy đơn hàng'}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.tableHead}>
            <Text style={[styles.th, styles.thName]}>Tên sản phẩm</Text>
            <Text style={[styles.th, styles.thPrice]}>Giá</Text>
            <Text style={[styles.th, styles.thQty]}>Số lượng</Text>
            <Text style={[styles.th, styles.thTotal]}>Tổng cộng</Text>
          </View>

          {(order.items || []).map((item, idx) => (
            <View key={`${item._id || item.name || idx}`} style={styles.tableRow}>
              <Text style={[styles.td, styles.tdName]} numberOfLines={2}>
                {item.name || 'Sản phẩm'}
              </Text>
              <Text style={[styles.td, styles.tdPrice]}>{formatCurrency(item.price)}</Text>
              <Text style={[styles.td, styles.tdQty]}>{Number(item.quantity || 0)}</Text>
              <Text style={[styles.td, styles.tdTotal]}>{formatCurrency(Number(item.price || 0) * Number(item.quantity || 0))}</Text>
            </View>
          ))}

          <View style={styles.paymentInfo}>
            <Text style={styles.paymentInfoTitle}>Thông tin thanh toán</Text>
            <Text style={styles.paymentLine}>Họ tên: {order.fullName || '-'}</Text>
            <Text style={styles.paymentLine}>Địa chỉ: {order.address || '-'}</Text>
            <Text style={styles.paymentLine}>SĐT: {order.phone || '-'}</Text>
            <Text style={styles.paymentLine}>Phương thức: {paymentMethodLabel(order.paymentMethod)}</Text>
            <Text style={styles.paymentLine}>Tổng tiền hàng: {formatCurrency(subTotal)}</Text>
            <Text style={styles.paymentLine}>Phí vận chuyển: {shippingFee > 0 ? formatCurrency(shippingFee) : 'Miễn phí'}</Text>
            {discount > 0 && <Text style={styles.paymentLine}>Giảm giá: -{formatCurrency(discount)}</Text>}
            <Text style={styles.paymentTotal}>Tổng cộng: {formatCurrency(order.total)}</Text>
          </View>
        </View>
      </ScrollView>
      <Toast visible={toastVisible} message={toastMessage} type={toastType} onHide={() => setToastVisible(false)} />
      <AppAlert
        visible={confirmCancelVisible}
        type="confirm"
        title="Xác nhận hủy đơn"
        message="Bạn chắc chắn muốn hủy đơn hàng này?"
        confirmText={processing ? 'Đang xử lý...' : 'Hủy đơn'}
        cancelText="Để sau"
        onClose={() => !processing && setConfirmCancelVisible(false)}
        onConfirm={processing ? undefined : handleCancelOrder}
      />
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
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  stepItem: { flex: 1, alignItems: 'center' },
  stepTop: { width: '100%', flexDirection: 'row', alignItems: 'center' },
  stepDot: { width: 30, height: 30, borderRadius: 15, borderWidth: 1, borderColor: '#E6E6E6', backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  stepDotActive: { backgroundColor: '#E1554E', borderColor: '#E1554E' },
  stepDotSpecial: { backgroundColor: '#9CA3AF', borderColor: '#9CA3AF' },
  stepLine: { flex: 1, height: 2, backgroundColor: '#E6E6E6', marginHorizontal: 6 },
  stepLineActive: { backgroundColor: '#E1554E' },
  stepLineSpecial: { backgroundColor: '#9CA3AF' },
  stepLabel: { marginTop: 8, fontSize: 9, fontWeight: '700', color: '#A3A3A3', textAlign: 'center' },
  stepLabelActive: { color: '#2E2E2E' },
  stepTime: { marginTop: 2, fontSize: 9, color: '#7d7b7b' },
  stepSub: { marginTop: 2, fontSize: 9, color: '#FF6E6E', fontWeight: '600' },
  specialBox: { backgroundColor: '#FFF5F5', borderWidth: 1, borderColor: '#FFDCDC', borderRadius: 10, padding: 10 },
  specialText: { color: '#DC2626', fontWeight: '800', fontSize: 12 },
  specialTime: { marginTop: 3, color: '#EF4444', fontSize: 11 },

  invoiceCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  invoiceTop: { padding: 14, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  invoiceLeft: { flex: 1, minHeight: 110, justifyContent: 'space-between' },
  brand: { fontSize: 22, fontWeight: '900', color: '#FF5F57' },
  productPreviewList: { marginTop: 8, gap: 8, paddingRight: 6 },
  heroImageWrap: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EEF2F7',
    backgroundColor: '#F8FAFC',
  },
  heroImage: { width: '100%', height: 130, backgroundColor: '#F3F4F6' },
  heroCaption: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  heroName: { flex: 1, fontSize: 12, fontWeight: '700', color: '#243245' },
  heroQty: { fontSize: 11, color: '#6B7280', fontWeight: '700' },
  heroFallback: {
    height: 130,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EEF2F7',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroFallbackText: { color: '#9CA3AF', fontSize: 12, fontWeight: '700' },
  invoiceRight: { alignItems: 'flex-end', flexShrink: 1 },
  invoiceTitle: { fontSize: 22, fontWeight: '800', color: '#243245' },
  invoiceMeta: { marginTop: 4, fontSize: 12, color: '#666' },
  actionBtnPrimary: {
    marginTop: 10,
    backgroundColor: '#FF6E6E',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    minWidth: 130,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  receiptBtn: { backgroundColor: '#05A845' },
  cancelBtn: { backgroundColor: '#EF4444' },
  actionBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },

  tableHead: { flexDirection: 'row', backgroundColor: '#FAFAFA', borderBottomWidth: 1, borderBottomColor: '#F0F0F0', paddingVertical: 10, paddingHorizontal: 10 },
  th: { fontSize: 12, fontWeight: '700', color: '#243245' },
  thName: { flex: 2.4 },
  thPrice: { flex: 1.2, textAlign: 'right' },
  thQty: { flex: 1, textAlign: 'center' },
  thTotal: { flex: 1.3, textAlign: 'right' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F3F3F3', paddingVertical: 10, paddingHorizontal: 10 },
  td: { fontSize: 12, color: '#4B4B4B' },
  tdName: { flex: 2.4, paddingRight: 8, textDecorationLine: 'underline' },
  tdPrice: { flex: 1.2, textAlign: 'right' },
  tdQty: { flex: 1, textAlign: 'center' },
  tdTotal: { flex: 1.3, textAlign: 'right' },

  paymentInfo: { padding: 14 },
  paymentInfoTitle: { fontSize: 17, fontWeight: '800', color: colors.secondary, marginBottom: 10 },
  paymentLine: { fontSize: 13, color: '#555', marginBottom: 6 },
  paymentTotal: { marginTop: 6, fontSize: 16, fontWeight: '900', color: colors.primary },
});

export default OrderDetailScreen;
