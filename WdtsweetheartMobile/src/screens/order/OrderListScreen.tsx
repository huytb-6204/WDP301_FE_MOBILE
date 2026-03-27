import React, { useEffect, useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, Clock, Package, Search } from 'lucide-react-native';
import type { RootStackParamList } from '../../navigation/types';
import { getOrderList, type DashboardOrder } from '../../services/api/dashboard';
import { colors } from '../../theme/colors';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'OrderList'>;

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
    'shipping': 'Đang giao hàng',
    'shipped': 'Đã giao hàng',
    'completed': 'Giao thành công',
    'cancelled': 'Đã hủy',
    'returned': 'Trả hàng',
  };
  return map[status] || status;
};

const OrderListScreen = () => {
  const navigation = useNavigation<Navigation>();
  const [orders, setOrders] = useState<DashboardOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async (useRefreshing = false) => {
    if (useRefreshing) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await getOrderList();
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void fetchOrders();
  }, []);

  const renderOrderItem = ({ item }: { item: DashboardOrder }) => (
    <TouchableOpacity 
      style={styles.orderCard}
      activeOpacity={0.8}
      onPress={() => {}}
    >
      <View style={styles.cardHeader}>
        <View style={styles.codeRow}>
          <Package size={16} color={colors.primary} />
          <Text style={styles.orderCode}>#{item.code}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.orderStatus) + '15' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.orderStatus) }]}>
            {getStatusText(item.orderStatus)}
          </Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Clock size={14} color="#999" />
          <Text style={styles.dateText}>
            {new Date(item.createdAt).toLocaleDateString('vi-VN')} {new Date(item.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.totalLabel}>Tổng thanh toán:</Text>
          <Text style={styles.totalValue}>{(item.total || 0).toLocaleString('vi-VN')} đ</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <TouchableOpacity style={styles.detailBtn}>
          <Text style={styles.detailBtnText}>Xem chi tiết</Text>
        </TouchableOpacity>
        {item.orderStatus === 'completed' && (
           <TouchableOpacity style={[styles.detailBtn, styles.reviewBtn]}>
             <Text style={[styles.detailBtnText, styles.reviewBtnText]}>Đánh giá</Text>
           </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color={colors.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch sử đơn hàng</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Search size={20} color={colors.secondary} />
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={styles.centerWrap}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.helperText}>Đang tải đơn hàng...</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id}
          renderItem={renderOrderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => fetchOrders(true)} colors={[colors.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Package size={60} color="#eee" />
              <Text style={styles.emptyText}>Chưa có đơn hàng nào</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F9FA' },
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
  headerTitle: { fontSize: 17, fontWeight: '800', color: colors.secondary },
  searchButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  centerWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  helperText: { color: colors.text, fontSize: 14, fontWeight: '500' },
  listContent: { padding: 16, paddingBottom: 40 },
  orderCard: {
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
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    paddingBottom: 12,
    marginBottom: 12,
  },
  codeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  orderCode: { fontSize: 15, fontWeight: '800', color: colors.secondary },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: { fontSize: 11, fontWeight: '700' },
  cardBody: { gap: 10 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dateText: { fontSize: 13, color: '#7d7b7b' },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  totalLabel: { fontSize: 13, color: colors.secondary, fontWeight: '500' },
  totalValue: { fontSize: 16, fontWeight: '800', color: colors.primary },
  cardFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    marginTop: 14,
    paddingTop: 14,
    gap: 10,
  },
  detailBtn: {
    flex: 1,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailBtnText: { fontSize: 13, fontWeight: '700', color: '#666' },
  reviewBtn: { backgroundColor: colors.primary, borderColor: colors.primary },
  reviewBtnText: { color: '#fff' },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    gap: 16,
  },
  emptyText: { fontSize: 15, color: '#aaa', fontWeight: '500' },
});

export default OrderListScreen;
