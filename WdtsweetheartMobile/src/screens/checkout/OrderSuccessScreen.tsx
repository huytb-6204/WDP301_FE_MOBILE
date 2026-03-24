import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, CheckCircle2, House, Package, ReceiptText, UserRound } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import type { RootStackParamList } from '../../navigation/types';
import { getOrderSuccess, type OrderSuccessData } from '../../services/api/order';
import { formatPrice } from '../../utils';

type OrderSuccessRoute = RouteProp<RootStackParamList, 'OrderSuccess'>;

const OrderSuccessScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<OrderSuccessRoute>();
  const { orderCode, phone } = route.params;

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<OrderSuccessData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getOrderSuccess(orderCode, phone);
        if (res.code === 'success' && res.order) {
          setOrder(res.order);
        } else {
          setError(res.message || 'Không tìm thấy đơn hàng.');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể tải thông tin đơn hàng.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderCode, phone]);

  const paymentLabel = useMemo(() => {
    if (!order?.paymentMethod) return '-';
    if (order.paymentMethod === 'money') return 'Thanh toán khi nhận hàng';
    return order.paymentMethod.toUpperCase();
  }, [order?.paymentMethod]);

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={['#F5FFF7', '#FFFFFF']} style={styles.hero}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <ArrowLeft size={20} color={colors.secondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Đặt hàng thành công</Text>
          <View style={styles.iconSpacer} />
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.muted}>Đang tải...</Text>
        </View>
      ) : error || !order ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error || 'Không có dữ liệu đơn hàng.'}</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('Home')}>
            <House size={16} color="#fff" />
            <Text style={styles.primaryBtnText}>Về trang chủ</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.successCard}>
            <CheckCircle2 size={32} color="#22C55E" />
            <Text style={styles.successTitle}>Đặt hàng thành công</Text>
            <Text style={styles.successText}>Cảm ơn bạn. Đơn hàng của bạn đã được tiếp nhận và đang chờ xử lý.</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.sectionTitleRow}>
              <ReceiptText size={16} color={colors.primary} />
              <Text style={styles.sectionTitle}>Thông tin đơn hàng</Text>
            </View>
            <Text style={styles.rowText}>Mã đơn: {order.code}</Text>
            <Text style={styles.rowText}>Ngày tạo: {new Date(order.createdAt).toLocaleDateString('vi-VN')}</Text>
            <Text style={styles.rowText}>Phương thức thanh toán: {paymentLabel}</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.sectionTitleRow}>
              <Package size={16} color={colors.primary} />
              <Text style={styles.sectionTitle}>Chi tiết sản phẩm</Text>
            </View>
            {order.items.map((item, index) => (
              <View key={`${item.productId}-${index}`} style={styles.summaryRow}>
                <Text style={styles.summaryName}>
                  {item.name} x{item.quantity}
                  {item.variant && item.variant.length > 0 ? ` - ${item.variant.join(', ')}` : ''}
                </Text>
                <Text style={styles.summaryValue}>{formatPrice(item.price * item.quantity)}</Text>
              </View>
            ))}
          </View>

          <View style={styles.card}>
            <View style={styles.sectionTitleRow}>
              <CheckCircle2 size={16} color={colors.primary} />
              <Text style={styles.sectionTitle}>Thanh toán</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.muted}>Tạm tính</Text>
              <Text style={styles.summaryValue}>{formatPrice(order.subTotal || 0)}</Text>
            </View>
            {order.discount ? (
              <View style={styles.summaryRow}>
                <Text style={styles.muted}>Giảm giá</Text>
                <Text style={styles.discountValue}>-{formatPrice(order.discount)}</Text>
              </View>
            ) : null}
            {order.pointDiscount ? (
              <View style={styles.summaryRow}>
                <Text style={styles.muted}>Giảm từ điểm</Text>
                <Text style={styles.discountValue}>-{formatPrice(order.pointDiscount)}</Text>
              </View>
            ) : null}
            <View style={styles.summaryRow}>
              <Text style={styles.muted}>
                Phí vận chuyển{order.shipping?.carrierName ? ` (${order.shipping.carrierName})` : ''}
              </Text>
              <Text style={styles.summaryValue}>{formatPrice(order.shipping?.fee || 0)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Tổng cộng</Text>
              <Text style={styles.totalValue}>{formatPrice(order.total || 0)}</Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.sectionTitleRow}>
              <UserRound size={16} color={colors.primary} />
              <Text style={styles.sectionTitle}>Thông tin nhận hàng</Text>
            </View>
            <Text style={styles.rowText}>Họ tên: {order.fullName}</Text>
            <Text style={styles.rowText}>Số điện thoại: {order.phone}</Text>
            <Text style={styles.rowText}>Địa chỉ: {order.address}</Text>
            {order.note ? <Text style={styles.noteText}>Ghi chú: "{order.note}"</Text> : null}
          </View>

          <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('Home')}>
            <House size={16} color="#fff" />
            <Text style={styles.primaryBtnText}>Về trang chủ</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7FBF8' },
  hero: { paddingBottom: 8 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  iconSpacer: { width: 36 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.secondary },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 24 },
  content: { padding: 16, gap: 14, paddingBottom: 30 },
  successCard: { backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: '#BBF7D0', borderRadius: 22, padding: 18, alignItems: 'center', gap: 4 },
  successTitle: { color: '#15803D', fontSize: 18, fontWeight: '700' },
  successText: { color: '#166534', fontSize: 13, textAlign: 'center', lineHeight: 19 },
  card: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: 20, padding: 16, gap: 10 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { color: colors.secondary, fontSize: 15, fontWeight: '700' },
  rowText: { color: colors.text, fontSize: 13 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  summaryName: { flex: 1, color: colors.text, fontSize: 13 },
  summaryValue: { color: colors.secondary, fontSize: 13, fontWeight: '700' },
  discountValue: { color: '#16A34A', fontSize: 13, fontWeight: '700' },
  totalLabel: { color: colors.secondary, fontSize: 15, fontWeight: '700' },
  totalValue: { color: colors.primary, fontSize: 16, fontWeight: '700' },
  noteText: { color: '#6B7280', fontStyle: 'italic', marginTop: 4 },
  muted: { color: colors.text, fontSize: 13 },
  errorText: { color: '#EF4444', textAlign: 'center' },
  primaryBtn: { backgroundColor: colors.primary, borderRadius: 16, alignItems: 'center', justifyContent: 'center', minHeight: 48, flexDirection: 'row', gap: 8 },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});

export default OrderSuccessScreen;