import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, Package, MapPin, Phone, User, CreditCard } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { getOrderDetail } from '../../services/api/dashboard';

const OrderDetailScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { orderId } = route.params;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = (await getOrderDetail(orderId)) as any;
        if (res?.success) {
          setOrder(res.order);
        } else if (res?.data) {
          setOrder(res.data);
        }
      } catch (error) {
        Alert.alert('Lỗi', 'Không thể tải chi tiết đơn hàng');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const getPaymentMethodInfo = (method: string) => {
    switch (method?.toLowerCase()) {
      case 'money': case 'cod': return { label: 'Thanh toán tiền mặt', icon: 'money-bill' };
      case 'vnpay': return { label: 'Ví điện tử VNPay', icon: 'credit-card' };
      case 'zalopay': return { label: 'Ví điện tử ZaloPay', icon: 'credit-card' };
      default: return { label: method || 'Không xác định', icon: 'credit-card' };
    }
  };

  const getStatusInfo = (status: string) => {
    const map: any = {
      'pending': { text: 'Chờ xác nhận', color: '#F59E0B', bg: '#FFFBEB' },
      'confirmed': { text: 'Đã xác nhận', color: '#6366F1', bg: '#EEF2FF' },
      'shipping': { text: 'Đang vận chuyển', color: '#3B82F6', bg: '#EFF6FF' },
      'shipped': { text: 'Đã giao hàng', color: '#05A845', bg: '#EBFBF0' },
      'completed': { text: 'Hoàn thành', color: '#05A845', bg: '#EBFBF0' },
      'cancelled': { text: 'Đã hủy', color: '#EF4444', bg: '#FEF2F2' },
      'request_cancel': { text: 'Yêu cầu hủy', color: '#EF4444', bg: '#FEF2F2' },
    };
    return map[status] || { text: status, color: '#71717A', bg: '#F4F4F5' };
  };

  if (loading) {
    return (
      <View style={styles.centerWrap}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={{ marginTop: 12, color: '#999' }}>Đang tải chi tiết...</Text>
      </View>
    );
  }

  if (!order) return null;

  const statusInfo = getStatusInfo(order.orderStatus);
  const paymentInfo = getPaymentMethodInfo(order.paymentMethod);
  const shippingFee = order.shipping?.fee || 0;
  const subTotal = order.subTotal || 0;
  const discountTotal = (order.discount || 0) + (order.pointDiscount || 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color={colors.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statusBanner}>
            <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
                <Text style={[styles.statusText, { color: statusInfo.color }]}>
                    {statusInfo.text.toUpperCase()}
                </Text>
            </View>
            <Text style={styles.orderCode}>Mã đơn: {order.code}</Text>
            <Text style={styles.orderDate}>
                {new Date(order.createdAt).toLocaleDateString('vi-VN')} {new Date(order.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
            </Text>
        </View>

        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <MapPin size={18} color={colors.secondary} />
                <Text style={styles.sectionTitle}>Địa chỉ nhận hàng</Text>
            </View>
            <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                    <User size={16} color="#7d7b7b" />
                    <Text style={[styles.infoVal, { fontWeight: '700', color: colors.secondary }]}>{order.fullName}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Phone size={16} color="#7d7b7b" />
                    <Text style={styles.infoVal}>{order.phone}</Text>
                </View>
                <View style={[styles.infoRow, { alignItems: 'flex-start' }]}>
                    <MapPin size={16} color="#7d7b7b" style={{ marginTop: 2 }} />
                    <Text style={styles.infoVal}>{order.address}</Text>
                </View>
            </View>
        </View>

        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Package size={18} color={colors.secondary} />
                <Text style={styles.sectionTitle}>Sản phẩm đã chọn</Text>
            </View>
            <View style={styles.itemCard}>
                {order.items?.map((item: any, idx: number) => (
                    <View key={idx} style={[styles.productItem, idx === order.items.length - 1 && { borderBottomWidth: 0 }]}>
                        {item.image ? (
                             <Image source={{ uri: item.image }} style={styles.productImg} />
                        ) : (
                             <View style={styles.productImgPlaceholder}>
                                 <Package size={20} color="#ccc" />
                             </View>
                        )}
                        <View style={styles.productInfo}>
                            <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                            {item.variant && item.variant.length > 0 && (
                                <Text style={styles.productVariant}>{item.variant.join(' | ')}</Text>
                            )}
                            <View style={styles.priceQtyRow}>
                                <Text style={styles.productQty}>SL: {item.quantity}</Text>
                                <Text style={styles.productPrice}>{(item.price || 0).toLocaleString('vi-VN')} đ</Text>
                            </View>
                        </View>
                    </View>
                ))}
            </View>
        </View>

        <View style={styles.section}>
             <View style={styles.sectionHeader}>
                 <CreditCard size={18} color={colors.secondary} />
                 <Text style={styles.sectionTitle}>Chi tiết thanh toán</Text>
             </View>
             <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                    <CreditCard size={16} color="#7d7b7b" />
                    <Text style={styles.infoVal}>{paymentInfo.label}</Text>
                    <View style={styles.paymentBadge}>
                         <Text style={styles.paymentBadgeText}>{order.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}</Text>
                    </View>
                </View>
                
                <View style={[styles.divider, { marginVertical: 8 }]} />

                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Tổng tiền hàng</Text>
                    <Text style={styles.summaryVal}>{subTotal.toLocaleString('vi-VN')} đ</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Phí vận chuyển</Text>
                    <Text style={styles.summaryVal}>{shippingFee > 0 ? `+${shippingFee.toLocaleString('vi-VN')} đ` : 'Miễn phí'}</Text>
                </View>
                {discountTotal > 0 && (
                     <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Giảm giá</Text>
                        <Text style={[styles.summaryVal, { color: '#FF4D4F' }]}>-{discountTotal.toLocaleString('vi-VN')} đ</Text>
                    </View>
                )}
                
                <View style={[styles.divider, { backgroundColor: '#eee', height: 1.5, marginVertical: 12 }]} />

                <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { fontSize: 16, fontWeight: '800', color: colors.secondary }]}>Tổng phí</Text>
                    <Text style={[styles.summaryVal, { fontSize: 18, fontWeight: '800', color: colors.primary }]}>{(order.total || 0).toLocaleString('vi-VN')} đ</Text>
                </View>
             </View>
        </View>
        
        <View style={{ height: 40 }} />
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
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF5F6', borderRadius: 20 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: colors.secondary },
  centerWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 16 },
  statusBanner: {
      backgroundColor: '#fff',
      borderRadius: 20,
      padding: 24,
      alignItems: 'center',
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 2,
  },
  statusBadge: {
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 20,
      marginBottom: 12,
  },
  statusText: { fontSize: 13, fontWeight: '900' },
  orderCode: { fontSize: 18, fontWeight: '800', color: colors.secondary, marginBottom: 4 },
  orderDate: { fontSize: 12, color: '#7d7b7b' },
  section: { marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: colors.secondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoCard: {
      backgroundColor: '#fff',
      borderRadius: 20,
      padding: 16,
      gap: 12,
      borderWidth: 1,
      borderColor: '#F0F0F0',
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoVal: { fontSize: 14, color: '#555', flex: 1, lineHeight: 20 },
  itemCard: {
      backgroundColor: '#fff',
      borderRadius: 20,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: '#F0F0F0',
  },
  productItem: {
      flexDirection: 'row',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#F9F9F9',
  },
  productImg: { width: 60, height: 60, borderRadius: 12, backgroundColor: '#f9f9f9' },
  productImgPlaceholder: { width: 60, height: 60, borderRadius: 12, backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center' },
  productInfo: { flex: 1, marginLeft: 16, justifyContent: 'center' },
  productName: { fontSize: 14, fontWeight: '700', color: colors.secondary, marginBottom: 4 },
  productVariant: { fontSize: 12, color: '#999', marginBottom: 6 },
  priceQtyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  productQty: { fontSize: 13, color: '#666' },
  productPrice: { fontSize: 14, fontWeight: '800', color: colors.secondary },
  divider: { height: 1, backgroundColor: '#f5f5f5' },
  paymentBadge: { backgroundColor: '#F0F0F0', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  paymentBadgeText: { fontSize: 11, fontWeight: '600', color: '#666' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 2 },
  summaryLabel: { fontSize: 14, color: '#7d7b7b' },
  summaryVal: { fontSize: 14, color: colors.secondary, fontWeight: '700' },
});

export default OrderDetailScreen;
