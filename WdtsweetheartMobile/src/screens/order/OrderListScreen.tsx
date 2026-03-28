import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, Clock, Package, Search, ChevronRight, XCircle, CheckCircle2, Truck, ClipboardList } from 'lucide-react-native';
import type { RootStackParamList } from '../../navigation/types';
import { getOrderList, type DashboardOrder } from '../../services/api/dashboard';
import { colors } from '../../theme/colors';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'OrderList'>;

const TABS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'pending', label: 'Chờ duyệt' },
  { key: 'shipping', label: 'Đang giao' },
  { key: 'completed', label: 'Đã xong' },
  { key: 'cancelled', label: 'Đã hủy' },
];

const OrderListScreen = () => {
  const navigation = useNavigation<Navigation>();
  const [orders, setOrders] = useState<DashboardOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<DashboardOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

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

  useEffect(() => {
    let result = orders;
    
    // Filter by Tab
    if (activeTab !== 'all') {
      result = result.filter(o => o.orderStatus === activeTab);
    }

    // Filter by Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(o => 
        o.code?.toLowerCase().includes(q) || 
        o.fullName?.toLowerCase().includes(q)
      );
    }

    setFilteredOrders(result);
  }, [orders, activeTab, searchQuery]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed': return { color: '#05A845', bg: '#EBFBF0', label: 'Hoàn thành', icon: CheckCircle2 };
      case 'pending': return { color: '#F59E0B', bg: '#FFFBEB', label: 'Chờ xác nhận', icon: Clock };
      case 'confirmed': return { color: '#6366F1', bg: '#EEF2FF', label: 'Đã xác nhận', icon: ClipboardList };
      case 'shipping': return { color: '#3B82F6', bg: '#EFF6FF', label: 'Đang giao', icon: Truck };
      case 'cancelled': return { color: '#EF4444', bg: '#FEF2F2', label: 'Đã hủy', icon: XCircle };
      default: return { color: '#71717A', bg: '#F4F4F5', label: status, icon: Package };
    }
  };

  const renderOrderItem = ({ item }: { item: DashboardOrder }) => {
    const status = getStatusConfig(item.orderStatus);
    const StatusIcon = status.icon;

    return (
      <TouchableOpacity 
        style={styles.orderCard}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('OrderDetail', { orderId: item._id })}
      >
        <View style={styles.cardHeader}>
          <View style={styles.codeWrap}>
            <Package size={16} color={colors.secondary} />
            <Text style={styles.orderCode}>#{item.code}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <StatusIcon size={12} color={status.color} />
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
           <Text style={styles.itemsOverview} numberOfLines={1}>
              {item.items?.length || 0} sản phẩm • {item.fullName}
           </Text>
           <View style={styles.priceRow}>
              <View style={styles.dateRow}>
                 <Clock size={12} color="#999" />
                 <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</Text>
              </View>
              <Text style={styles.totalValue}>{(item.total || 0).toLocaleString('vi-VN')} đ</Text>
           </View>
        </View>

        <View style={styles.cardFooter}>
            <View style={styles.viewDetailBtn}>
                 <Text style={styles.viewDetailText}>Xem chi tiết</Text>
                 <ChevronRight size={16} color="#999" />
            </View>
            {item.orderStatus === 'completed' && (
               <TouchableOpacity 
                  style={styles.reviewBtn}
                  onPress={() => navigation.navigate('ReviewList', { orderId: item._id } as any)}
               >
                 <Text style={styles.reviewBtnText}>Viết đánh giá</Text>
               </TouchableOpacity>
            )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={22} color={colors.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch sử đơn hàng</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.topContainer}>
        <View style={styles.searchBox}>
          <Search size={18} color="#999" />
          <TextInput 
            placeholder="Tìm theo mã đơn hoặc tên..."
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <XCircle size={18} color="#ccc" />
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          data={TABS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.tabList}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[styles.tabItem, activeTab === item.key && styles.activeTabItem]}
              onPress={() => setActiveTab(item.key)}
            >
              <Text style={[styles.tabText, activeTab === item.key && styles.activeTabText]}>
                {item.label}
              </Text>
              {activeTab === item.key && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          )}
        />
      </View>

      {loading && !refreshing ? (
        <View style={styles.centerWrap}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.helperText}>Đang tải đơn hàng...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item._id}
          renderItem={renderOrderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => fetchOrders(true)} colors={[colors.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <View style={styles.emptyIconCircle}>
                 <Package size={40} color={colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>Chưa có đơn hàng nào</Text>
              <Text style={styles.emptyDesc}>Các đơn hàng của bạn sẽ được hiển thị tại đây.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FBFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
  },
  backBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F7FA' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: colors.secondary },
  topContainer: { backgroundColor: '#fff', paddingBottom: 0 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F6F9',
    marginHorizontal: 16,
    paddingHorizontal: 16,
    borderRadius: 14,
    height: 48,
    marginBottom: 16,
    gap: 12,
  },
  searchInput: { flex: 1, fontSize: 14, color: colors.secondary, fontWeight: '500' },
  tabList: { paddingHorizontal: 16, gap: 24, paddingBottom: 10 },
  tabItem: { paddingVertical: 8, position: 'relative' },
  activeTabItem: {},
  tabText: { fontSize: 14, fontWeight: '600', color: '#999' },
  activeTabText: { color: colors.primary, fontWeight: '800' },
  activeIndicator: { 
    position: 'absolute', 
    bottom: -2, 
    left: '20%', 
    right: '20%', 
    height: 3, 
    backgroundColor: colors.primary, 
    borderRadius: 2 
  },
  listContent: { padding: 16, paddingBottom: 60 },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#3a7bd5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f0f3f8',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  codeWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  orderCode: { fontSize: 16, fontWeight: '800', color: colors.secondary },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: { fontSize: 11, fontWeight: '800' },
  cardBody: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f4f9',
    paddingBottom: 16,
    marginBottom: 16,
  },
  itemsOverview: { fontSize: 15, color: colors.secondary, fontWeight: '700', marginBottom: 12 },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dateText: { fontSize: 13, color: '#aaa', fontWeight: '500' },
  totalValue: { fontSize: 18, fontWeight: '900', color: colors.primary },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewDetailBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  viewDetailText: { fontSize: 13, fontWeight: '700', color: '#666' },
  reviewBtn: { 
    backgroundColor: colors.primary, 
    paddingHorizontal: 18, 
    paddingVertical: 10, 
    borderRadius: 14,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  reviewBtnText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  centerWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  helperText: { color: '#999', fontSize: 14, fontWeight: '500' },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    gap: 20,
  },
  emptyIconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#EBF5FF', alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: colors.secondary },
  emptyDesc: { fontSize: 14, color: '#aaa', textAlign: 'center', paddingHorizontal: 40, lineHeight: 22 },
});

export default OrderListScreen;
