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
import { ArrowLeft, Package, MapPin, Phone, User, CreditCard, ChevronRight } from 'lucide-react-native';
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#05A845';
      case 'pending': return '#007BFF';
      case 'confirmed': return '#007BFF';
      case 'shipping': return '#FFAB00';
      case 'cancelled': return '#ff0000';
      default: return '#7d7b7b';
    }
  };

  const getStatusText = (status: string) => {
    const map: any = {
      'pending': 'Chờ xác nhận',
      'confirmed': 'Đã xác nhận',
      'shipping': 'Đang giao',
      'completed': 'Hoàn thành',
      'cancelled': 'Đã hủy',
      'shipped': 'Đã giao hàng',
    };
    return map[status] || status;
  };

  if (loading) {
    return (
      <View style={styles.centerWrap}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!order) return null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color={colors.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statusBanner}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.orderStatus) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(order.orderStatus) }]}>
                    {getStatusText(order.orderStatus).toUpperCase()}
                </Text>
            </View>
            <Text style={styles.orderCode}>Mã đơn: #{order.code}</Text>
            <Text style={styles.orderDate}>{new Date(order.createdAt).toLocaleString('vi-VN')}</Text>
        </View>

        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin nhận hàng</Text>
            <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                    <User size={18} color={colors.primary} />
                    <Text style={styles.infoVal}>{order.fullName}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Phone size={18} color={colors.primary} />
                    <Text style={styles.infoVal}>{order.phone}</Text>
                </View>
                <View style={[styles.infoRow, { alignItems: 'flex-start' }]}>
                    <MapPin size={18} color={colors.primary} style={{ marginTop: 2 }} />
                    <Text style={styles.infoVal}>{order.address}</Text>
                </View>
            </View>
        </View>

        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sản phẩm</Text>
            <View style={styles.itemCard}>
                {order.items?.map((item: any, idx: number) => (
                    <View key={idx} style={[styles.productItem, idx === order.items.length - 1 && { borderBottomWidth: 0 }]}>
                        <View style={styles.productInfo}>
                            <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                            <Text style={styles.productVariant}>SL x{item.quantity}</Text>
                        </View>
                        <Text style={styles.productPrice}>{(item.price * item.quantity).toLocaleString('vi-VN')} đ</Text>
                    </View>
                ))}
            </View>
        </View>

        <View style={styles.section}>
             <Text style={styles.sectionTitle}>Thanh toán</Text>
             <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                    <CreditCard size={18} color={colors.primary} />
                    <Text style={styles.infoVal}>{order.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : order.paymentMethod}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Tiền hàng</Text>
                    <Text style={styles.summaryVal}>{(order.total - (order.shippingFee || 0)).toLocaleString('vi-VN')} đ</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Phí vận chuyển</Text>
                    <Text style={styles.summaryVal}>{(order.shippingFee || 0).toLocaleString('vi-VN')} đ</Text>
                </View>
                <View style={[styles.summaryRow, { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#f0f0f0' }]}>
                    <Text style={[styles.summaryLabel, { fontSize: 16, fontWeight: '800', color: colors.secondary }]}>Tổng cộng</Text>
                    <Text style={[styles.summaryVal, { fontSize: 18, fontWeight: '800', color: colors.primary }]}>{(order.total || 0).toLocaleString('vi-VN')} đ</Text>
                </View>
             </View>
        </View>
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
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: colors.secondary },
  centerWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 16 },
  statusBanner: {
      backgroundColor: '#fff',
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
  statusText: { fontSize: 13, fontWeight: '900' },
  orderCode: { fontSize: 17, fontWeight: '800', color: colors.secondary, marginBottom: 4 },
  orderDate: { fontSize: 12, color: '#7d7b7b' },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: colors.secondary, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  infoCard: {
      backgroundColor: '#fff',
      borderRadius: 16,
      padding: 16,
      gap: 12,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoVal: { fontSize: 14, color: '#555', flex: 1, lineHeight: 20 },
  itemCard: {
      backgroundColor: '#fff',
      borderRadius: 16,
      overflow: 'hidden',
  },
  productItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#F9F9F9',
  },
  productInfo: { flex: 1, marginRight: 16 },
  productName: { fontSize: 14, fontWeight: '600', color: colors.secondary },
  productVariant: { fontSize: 12, color: '#999', marginTop: 4 },
  productPrice: { fontSize: 14, fontWeight: '700', color: colors.secondary },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: 14, color: '#7d7b7b' },
  summaryVal: { fontSize: 14, color: colors.secondary, fontWeight: '600' },
});

export default OrderDetailScreen;
