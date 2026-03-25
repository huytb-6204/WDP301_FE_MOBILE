import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Package, XCircle } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusMessage, Toast } from '../../components/common';
import { colors } from '../../theme/colors';
import type { RootStackParamList } from '../../navigation/types';
import { getOrderList, type ClientOrder } from '../../services/api/dashboard';
import { cancelOrder } from '../../services/api/order';
import { formatPrice } from '../../utils';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'OrderList'>;

const statusMap: Record<string, string> = {
  pending: 'Cho xac nhan',
  confirmed: 'Da xac nhan',
  shipping: 'Dang giao',
  completed: 'Hoan thanh',
  cancelled: 'Da huy',
  request_cancel: 'Yeu cau huy',
  returned: 'Tra hang',
};

const OrderListScreen = () => {
  const navigation = useNavigation<Navigation>();
  const [orders, setOrders] = useState<ClientOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 1600);
  };

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      setOrders(await getOrderList());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const canCancel = (status?: string) => status === 'pending' || status === 'confirmed';

  const handleCancel = async (item: ClientOrder) => {
    try {
      setProcessingId(item._id);
      const res = await cancelOrder(item._id, 'Khach hang huy tren mobile');
      showToast(res.message || 'Đã gửi yêu cầu hủy');
      await fetchOrders();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Không thể hủy đơn');
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
        <Text style={styles.headerTitle}>Đơn hàng của tôi</Text>
        <View style={styles.backButton} />
      </View>

      {error ? <StatusMessage message={error} actionText="Thử lại" onAction={fetchOrders} /> : null}

      {loading ? (
        <View style={styles.centerWrap}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<StatusMessage message="Chưa có đơn hàng nào" />}
          renderItem={({ item }) => {
            const busy = processingId === item._id;
            return (
              <View style={styles.card}>
                <View style={styles.topRow}>
                  <View style={styles.iconWrap}>
                    <Package size={16} color={colors.primary} />
                  </View>
                  <View style={styles.flex}>
                    <Text style={styles.codeText}>#{item.code || '---'}</Text>
                    <Text style={styles.metaText}>
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : '-'}
                    </Text>
                  </View>
                  <Text style={styles.statusBadge}>{statusMap[item.orderStatus || ''] || (item.orderStatus || '-')}</Text>
                </View>

                <Text style={styles.lineText}>Người nhận: {item.fullName || '-'}</Text>
                <Text style={styles.lineText}>Thanh toán: {item.paymentStatus || 'unpaid'}</Text>
                <Text style={styles.lineText}>Số sản phẩm: {item.items?.length || 0}</Text>
                <Text style={styles.totalText}>Tổng cộng: {formatPrice(item.total || 0)}</Text>

                {canCancel(item.orderStatus) ? (
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => handleCancel(item)} disabled={busy}>
                    {busy ? <ActivityIndicator color="#fff" /> : <XCircle size={15} color="#fff" />}
                    <Text style={styles.cancelBtnText}>{busy ? 'Đang xử lý' : 'Hủy đơn hàng'}</Text>
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
  backButton: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: colors.secondary, fontSize: 18, fontWeight: '700' },
  centerWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { padding: 16, paddingBottom: 34 },
  card: { borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: 14, gap: 8, marginBottom: 12 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.softPink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: { flex: 1 },
  codeText: { color: colors.secondary, fontSize: 14, fontWeight: '700' },
  metaText: { color: colors.textLight, fontSize: 12, marginTop: 2 },
  statusBadge: {
    color: colors.primary,
    backgroundColor: '#FFF4F4',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '700',
  },
  lineText: { color: colors.text, fontSize: 13 },
  totalText: { color: colors.primary, fontSize: 15, fontWeight: '800', marginTop: 4 },
  cancelBtn: {
    marginTop: 4,
    minHeight: 40,
    borderRadius: 999,
    backgroundColor: '#FF6B6B',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  cancelBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },
});

export default OrderListScreen;
