import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ArrowLeft,
  ClipboardList,
  Heart,
  MessageSquareText,
  PackageCheck,
  PackageX,
  RefreshCw,
  Star,
  ChevronRight,
  PawPrint,
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../context/FavoritesContext';
import type { RootStackParamList } from '../../navigation/types';
import { getMyBoardingBookings } from '../../services/api/boarding';
import { getDashboardOverview, getProfile, type DashboardOrder } from '../../services/api/dashboard';
import { colors } from '../../theme/colors';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'Overview'>;

type StatItem = {
  key: string;
  label: string;
  value: number;
  icon: any;
  tint: string;
  iconBg: string;
};

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
    'pending': 'Đang xử lý',
    'confirmed': 'Đã xác nhận',
    'shipping': 'Đang giao',
    'completed': 'Hoàn thành',
    'cancelled': 'Đã hủy',
    'returned': 'Trả hàng',
  };
  return map[status] || status;
};

const OverviewScreen = () => {
  const navigation = useNavigation<Navigation>();
  const { user } = useAuth();
  const { favorites } = useFavorites();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [overviewData, setOverviewData] = useState<any>(null);
  const [boardingBookings, setBoardingBookings] = useState<any[]>([]);

  const loadData = async (useRefreshing = false) => {
    if (useRefreshing) setRefreshing(true);
    else setLoading(true);

    try {
      const [profileRes, overviewRes, boardingRes] = await Promise.allSettled([
        getProfile(),
        getDashboardOverview(),
        getMyBoardingBookings(),
      ]);

      if (profileRes.status === 'fulfilled') setProfile(profileRes.value);
      if (overviewRes.status === 'fulfilled') setOverviewData((overviewRes.value as any)?.data);
      if (boardingRes.status === 'fulfilled') {
        const data = (boardingRes.value as any)?.data;
        setBoardingBookings(Array.isArray(data) ? data : (data?.data || []));
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const stats: StatItem[] = useMemo(() => {
    const statsData = overviewData?.stats;
    return [
      { key: 'orders', label: 'Tổng đơn hàng', value: statsData?.totalOrders || 0, icon: ClipboardList, tint: '#0aa84812', iconBg: '#05A845' },
      { key: 'done', label: 'Đơn hoàn tất', value: statsData?.completedOrders || 0, icon: PackageCheck, tint: '#66aaee1f', iconBg: '#6ae' },
      { key: 'pending', label: 'Đơn chờ xử lý', value: statsData?.pendingOrders || 0, icon: RefreshCw, tint: '#ffa5001c', iconBg: '#ffa500' },
      { key: 'cancel', label: 'Đơn đã hủy', value: statsData?.cancelledOrders || 0, icon: PackageX, tint: '#ff000012', iconBg: '#DB4437' },
      { key: 'favorite', label: 'Yêu thích', value: favorites.length, icon: Heart, tint: '#80008014', iconBg: '#800080' },
      { key: 'review', label: 'Đánh giá', value: statsData?.reviewCount || 0, icon: MessageSquareText, tint: '#ab977424', iconBg: '#AB9774' },
    ];
  }, [overviewData, favorites.length]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color={colors.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tổng quan</Text>
        <View style={styles.headerSpacer} />
      </View>

      {loading ? (
        <View style={styles.centerWrap}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.helperText}>Đang tải tổng quan...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void loadData(true)} />}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Banner */}
          <View style={styles.profileBanner}>
            <View style={styles.profileAvatarWrap}>
              <Image 
                source={{ uri: profile?.avatar || 'https://i.pravatar.cc/150' }} 
                style={styles.profileAvatar} 
              />
              <View style={styles.avatarEditIcon}>
                <PawPrint size={14} color="#fff" />
              </View>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{profile?.fullName || user?.fullName || 'Khách hàng'}</Text>
              <Text style={styles.profileEmail}>{profile?.email || user?.email || 'teddy-pet@fpt.edu.vn'}</Text>
            </View>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            {stats.map((item) => {
              const Icon = item.icon;
              return (
                <View key={item.key} style={[styles.statCard, { backgroundColor: item.tint }]}>
                  <View style={[styles.statIconWrap, { backgroundColor: item.iconBg }]}>
                    <Icon size={20} color="#fff" />
                  </View>
                  <View>
                    <Text style={styles.statValue}>{item.value}</Text>
                    <Text style={styles.statLabel}>{item.label}</Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Recent Orders */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Đơn hàng gần đây</Text>
              <TouchableOpacity onPress={() => navigation.navigate('OrderList')}>
                <Text style={styles.viewMoreLink}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>
            {overviewData?.recentOrders?.length === 0 ? (
              <Text style={styles.emptyText}>Chưa có đơn hàng nào.</Text>
            ) : (
              overviewData?.recentOrders?.slice(0, 3).map((order: any) => (
                <TouchableOpacity 
                  key={order._id} 
                  style={styles.orderItem}
                  onPress={() => navigation.navigate('OrderDetail', { orderId: order._id })}
                >
                  <View style={styles.orderLeft}>
                    <Text style={styles.orderCode}>#{order.code}</Text>
                    <Text style={styles.orderDate}>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</Text>
                  </View>
                  <View style={styles.orderRight}>
                    <Text style={[styles.orderStatus, { color: getStatusColor(order.orderStatus) }]}>
                      {getStatusText(order.orderStatus)}
                    </Text>
                    <Text style={styles.orderTotal}>{(order.total || 0).toLocaleString('vi-VN')} đ</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>

          {/* Recent Reviews */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Đánh giá gần đây</Text>
            </View>
            {overviewData?.recentReviews?.length === 0 ? (
              <Text style={styles.emptyText}>Chưa có đánh giá nào.</Text>
            ) : (
              overviewData?.recentReviews?.slice(0, 3).map((review: any, idx: number) => (
                <View key={idx} style={styles.reviewItem}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewProduct} numberOfLines={1}>{review.product?.name || 'Sản phẩm'}</Text>
                    <View style={styles.stars}>
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={12} 
                          fill={i < review.rating ? "#F9A61C" : "#eee"} 
                          color={i < review.rating ? "#F9A61C" : "#eee"} 
                        />
                      ))}
                    </View>
                  </View>
                  <Text style={styles.reviewDate}>{new Date(review.createdAt).toLocaleDateString('vi-VN')}</Text>
                  <Text style={styles.reviewText} numberOfLines={2}>"{review.comment || 'Không có nội dung'}"</Text>
                </View>
              ))
            )}
          </View>

          {/* Boarding Section */}
          <View style={[styles.sectionCard, styles.boardingSection]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Khách sạn của bạn</Text>
              <TouchableOpacity onPress={() => navigation.navigate('MyBoardingBookings')}>
                <Text style={styles.viewMoreLink}>Tất cả</Text>
              </TouchableOpacity>
            </View>
            {boardingBookings.length === 0 ? (
              <View style={styles.boardingEmpty}>
                <Text style={styles.boardingEmptyText}>Bạn chưa có booking khách sạn nào.</Text>
                <TouchableOpacity 
                   style={styles.boardingAddBtn}
                   onPress={() => navigation.navigate('Home', { initialTab: 'service' })}
                >
                  <Text style={styles.boardingAddBtnText}>ĐẶT THÊM</Text>
                </TouchableOpacity>
              </View>
            ) : (
              boardingBookings.slice(0, 2).map((booking: any) => (
                <TouchableOpacity 
                  key={booking._id} 
                  style={styles.boardingBookingCard}
                  onPress={() => navigation.navigate('BoardingBookingDetail', { bookingId: booking._id })}
                >
                  <View style={styles.boardingCardHeader}>
                    <Text style={styles.boardingCode}>#{booking.code || booking._id.slice(-6).toUpperCase()}</Text>
                    <View style={styles.boardingBadge}>
                      <Text style={styles.boardingBadgeText}>{getStatusText(booking.status || booking.boardingStatus)}</Text>
                    </View>
                  </View>
                  <View style={styles.boardingDetails}>
                    <Text style={styles.boardingPrice}>{(booking.totalPrice || booking.total || 0).toLocaleString('vi-VN')} đ</Text>
                    <ChevronRight size={16} color={colors.textLight} />
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff1f1',
  },
  headerTitle: { flex: 1, textAlign: 'center', color: colors.secondary, fontSize: 17, fontWeight: '800' },
  headerSpacer: { width: 36 },
  centerWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  helperText: { color: colors.text, fontSize: 13, fontWeight: '500' },
  content: { padding: 16, paddingBottom: 40 },
  profileBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  profileAvatarWrap: {
    padding: 3,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 40,
    position: 'relative',
  },
  profileAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#f9f9f9',
  },
  avatarEditIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.secondary,
    letterSpacing: -0.5,
  },
  profileEmail: {
    fontSize: 13,
    color: '#7d7b7b',
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginBottom: 20,
  },
  statCard: {
    width: '47%',
    margin: '1.5%',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.secondary,
  },
  statLabel: {
    fontSize: 10,
    color: '#7d7b7b',
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.secondary,
  },
  viewMoreLink: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  emptyText: {
    textAlign: 'center',
    color: '#aaa',
    fontSize: 13,
    fontStyle: 'italic',
    paddingVertical: 10,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f9f9f9',
  },
  orderLeft: {
    gap: 4,
  },
  orderCode: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.secondary,
  },
  orderDate: {
    fontSize: 12,
    color: '#7d7b7b',
  },
  orderRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  orderStatus: {
    fontSize: 12,
    fontWeight: '700',
  },
  orderTotal: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
  },
  reviewItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f9f9f9',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewProduct: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.secondary,
    flex: 1,
  },
  stars: {
    flexDirection: 'row',
    gap: 1,
  },
  reviewDate: {
    fontSize: 11,
    color: '#7d7b7b',
    marginVertical: 4,
  },
  reviewText: {
    fontSize: 13,
    color: '#505050',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  boardingSection: {
    backgroundColor: '#fffcf9',
    borderColor: '#f1e4d6',
  },
  boardingEmpty: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  boardingEmptyText: {
    fontSize: 13,
    color: '#7d7b7b',
    marginBottom: 12,
  },
  boardingAddBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  boardingAddBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  boardingBookingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#f1e4d6',
    marginBottom: 8,
  },
  boardingCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  boardingCode: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.secondary,
  },
  boardingBadge: {
    backgroundColor: '#E7F7EE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  boardingBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#05A845',
  },
  boardingDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  boardingPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
  },
});

export default OverviewScreen;

