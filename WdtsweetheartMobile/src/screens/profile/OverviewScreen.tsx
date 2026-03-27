import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
<<<<<<< HEAD
=======
  FlatList,
>>>>>>> main
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
<<<<<<< HEAD
import { LinearGradient } from 'expo-linear-gradient';
=======
>>>>>>> main
import { useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../context/FavoritesContext';
import type { RootStackParamList } from '../../navigation/types';
import { getMyBoardingBookings } from '../../services/api/boarding';
<<<<<<< HEAD
import { getDashboardOverview, getProfile } from '../../services/api/dashboard';
=======
import { getDashboardOverview, getProfile, type DashboardOrder } from '../../services/api/dashboard';
>>>>>>> main
import { colors } from '../../theme/colors';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'Overview'>;

type StatItem = {
  key: string;
  label: string;
  value: number;
  icon: any;
<<<<<<< HEAD
=======
  tint: string;
  iconBg: string;
>>>>>>> main
};

const getStatusColor = (status: string) => {
  switch (status) {
<<<<<<< HEAD
    case 'completed':
      return colors.success;
    case 'pending':
    case 'confirmed':
      return colors.primaryDeep;
    case 'shipping':
      return colors.warning;
    case 'cancelled':
      return colors.danger;
    default:
      return colors.textLight;
=======
    case 'completed': return '#05A845';
    case 'pending': return '#007BFF';
    case 'confirmed': return '#007BFF';
    case 'shipping': return '#FFAB00';
    case 'cancelled': return '#ff0000';
    default: return '#7d7b7b';
>>>>>>> main
  }
};

const getStatusText = (status: string) => {
<<<<<<< HEAD
  const map: Record<string, string> = {
    pending: 'Đang xử lý',
    confirmed: 'Đã xác nhận',
    shipping: 'Đang giao',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy',
    returned: 'Trả hàng',
=======
  const map: any = {
    'pending': 'Đang xử lý',
    'confirmed': 'Đã xác nhận',
    'shipping': 'Đang giao',
    'completed': 'Hoàn thành',
    'cancelled': 'Đã hủy',
    'returned': 'Trả hàng',
>>>>>>> main
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
<<<<<<< HEAD
        setBoardingBookings(Array.isArray(data) ? data : data?.data || []);
=======
        setBoardingBookings(Array.isArray(data) ? data : (data?.data || []));
>>>>>>> main
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
<<<<<<< HEAD
      { key: 'orders', label: 'Tổng đơn hàng', value: statsData?.totalOrders || 0, icon: ClipboardList },
      { key: 'done', label: 'Đơn hoàn tất', value: statsData?.completedOrders || 0, icon: PackageCheck },
      { key: 'pending', label: 'Đơn chờ xử lý', value: statsData?.pendingOrders || 0, icon: RefreshCw },
      { key: 'cancel', label: 'Đơn đã hủy', value: statsData?.cancelledOrders || 0, icon: PackageX },
      { key: 'favorite', label: 'Yêu thích', value: favorites.length, icon: Heart },
      { key: 'review', label: 'Đánh giá', value: statsData?.reviewCount || 0, icon: MessageSquareText },
=======
      { key: 'orders', label: 'Tổng đơn hàng', value: statsData?.totalOrders || 0, icon: ClipboardList, tint: '#0aa84812', iconBg: '#05A845' },
      { key: 'done', label: 'Đơn hoàn tất', value: statsData?.completedOrders || 0, icon: PackageCheck, tint: '#66aaee1f', iconBg: '#6ae' },
      { key: 'pending', label: 'Đơn chờ xử lý', value: statsData?.pendingOrders || 0, icon: RefreshCw, tint: '#ffa5001c', iconBg: '#ffa500' },
      { key: 'cancel', label: 'Đơn đã hủy', value: statsData?.cancelledOrders || 0, icon: PackageX, tint: '#ff000012', iconBg: '#DB4437' },
      { key: 'favorite', label: 'Yêu thích', value: favorites.length, icon: Heart, tint: '#80008014', iconBg: '#800080' },
      { key: 'review', label: 'Đánh giá', value: statsData?.reviewCount || 0, icon: MessageSquareText, tint: '#ab977424', iconBg: '#AB9774' },
>>>>>>> main
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
<<<<<<< HEAD
          <LinearGradient
            colors={[colors.gradientPrimaryStart, colors.gradientPrimaryEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.profileBanner}
          >
            <View style={styles.profileGlow} />
            <View style={styles.profileAvatarWrap}>
              <Image source={{ uri: profile?.avatar || 'https://i.pravatar.cc/150' }} style={styles.profileAvatar} />
=======
          {/* Profile Banner */}
          <View style={styles.profileBanner}>
            <View style={styles.profileAvatarWrap}>
              <Image 
                source={{ uri: profile?.avatar || 'https://i.pravatar.cc/150' }} 
                style={styles.profileAvatar} 
              />
>>>>>>> main
              <View style={styles.avatarEditIcon}>
                <PawPrint size={14} color="#fff" />
              </View>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{profile?.fullName || user?.fullName || 'Khách hàng'}</Text>
              <Text style={styles.profileEmail}>{profile?.email || user?.email || 'teddy-pet@fpt.edu.vn'}</Text>
            </View>
<<<<<<< HEAD
          </LinearGradient>

=======
          </View>

          {/* Stats Grid */}
>>>>>>> main
          <View style={styles.statsGrid}>
            {stats.map((item) => {
              const Icon = item.icon;
              return (
<<<<<<< HEAD
                <LinearGradient
                  key={item.key}
                  colors={[colors.gradientSoftStart, colors.white]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.statCard}
                >
                  <View style={styles.statIconWrap}>
                    <Icon size={18} color={colors.primaryDeep} />
                  </View>
                  <View style={styles.statContent}>
                    <Text style={styles.statValue}>{item.value}</Text>
                    <Text style={styles.statLabel}>{item.label}</Text>
                  </View>
                </LinearGradient>
=======
                <View key={item.key} style={[styles.statCard, { backgroundColor: item.tint }]}>
                  <View style={[styles.statIconWrap, { backgroundColor: item.iconBg }]}>
                    <Icon size={20} color="#fff" />
                  </View>
                  <View>
                    <Text style={styles.statValue}>{item.value}</Text>
                    <Text style={styles.statLabel}>{item.label}</Text>
                  </View>
                </View>
>>>>>>> main
              );
            })}
          </View>

<<<<<<< HEAD
=======
          {/* Recent Orders */}
>>>>>>> main
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
<<<<<<< HEAD
                <TouchableOpacity
                  key={order._id}
=======
                <TouchableOpacity 
                  key={order._id} 
>>>>>>> main
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

<<<<<<< HEAD
=======
          {/* Recent Reviews */}
>>>>>>> main
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
<<<<<<< HEAD
                    <Text style={styles.reviewProduct} numberOfLines={1}>
                      {review.product?.name || 'Sản phẩm'}
                    </Text>
                    <View style={styles.stars}>
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          fill={i < review.rating ? colors.accent : '#F6D8D2'}
                          color={i < review.rating ? colors.accent : '#F6D8D2'}
=======
                    <Text style={styles.reviewProduct} numberOfLines={1}>{review.product?.name || 'Sản phẩm'}</Text>
                    <View style={styles.stars}>
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={12} 
                          fill={i < review.rating ? "#F9A61C" : "#eee"} 
                          color={i < review.rating ? "#F9A61C" : "#eee"} 
>>>>>>> main
                        />
                      ))}
                    </View>
                  </View>
                  <Text style={styles.reviewDate}>{new Date(review.createdAt).toLocaleDateString('vi-VN')}</Text>
<<<<<<< HEAD
                  <Text style={styles.reviewText} numberOfLines={2}>
                    "{review.comment || 'Không có nội dung'}"
                  </Text>
=======
                  <Text style={styles.reviewText} numberOfLines={2}>"{review.comment || 'Không có nội dung'}"</Text>
>>>>>>> main
                </View>
              ))
            )}
          </View>

<<<<<<< HEAD
          <LinearGradient
            colors={[colors.gradientSoftStart, colors.softCream]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.boardingSection}
          >
=======
          {/* Boarding Section */}
          <View style={[styles.sectionCard, styles.boardingSection]}>
>>>>>>> main
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Khách sạn của bạn</Text>
              <TouchableOpacity onPress={() => navigation.navigate('MyBoardingBookings')}>
                <Text style={styles.viewMoreLink}>Tất cả</Text>
              </TouchableOpacity>
            </View>
            {boardingBookings.length === 0 ? (
              <View style={styles.boardingEmpty}>
                <Text style={styles.boardingEmptyText}>Bạn chưa có booking khách sạn nào.</Text>
<<<<<<< HEAD
                <TouchableOpacity style={styles.boardingAddBtn} onPress={() => navigation.navigate('Home', { initialTab: 'service' })}>
                  <LinearGradient
                    colors={[colors.gradientPrimaryStart, colors.gradientPrimaryEnd]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.boardingAddBtnInner}
                  >
                    <Text style={styles.boardingAddBtnText}>Đặt thêm</Text>
                  </LinearGradient>
=======
                <TouchableOpacity 
                   style={styles.boardingAddBtn}
                   onPress={() => navigation.navigate('Home', { initialTab: 'service' })}
                >
                  <Text style={styles.boardingAddBtnText}>ĐẶT THÊM</Text>
>>>>>>> main
                </TouchableOpacity>
              </View>
            ) : (
              boardingBookings.slice(0, 2).map((booking: any) => (
<<<<<<< HEAD
                <TouchableOpacity
                  key={booking._id}
=======
                <TouchableOpacity 
                  key={booking._id} 
>>>>>>> main
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
<<<<<<< HEAD
          </LinearGradient>
=======
          </View>
>>>>>>> main
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
<<<<<<< HEAD
  safe: { flex: 1, backgroundColor: colors.background },
=======
  safe: { flex: 1, backgroundColor: '#fff' },
>>>>>>> main
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
<<<<<<< HEAD
    backgroundColor: colors.background,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  headerTitle: { flex: 1, textAlign: 'center', color: colors.secondary, fontSize: 18, fontWeight: '800' },
  headerSpacer: { width: 42 },
=======
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
>>>>>>> main
  centerWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  helperText: { color: colors.text, fontSize: 13, fontWeight: '500' },
  content: { padding: 16, paddingBottom: 40 },
  profileBanner: {
    flexDirection: 'row',
    alignItems: 'center',
<<<<<<< HEAD
    marginBottom: 20,
    borderRadius: 30,
    padding: 20,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 6,
  },
  profileGlow: {
    position: 'absolute',
    top: -20,
    right: -8,
    width: 120,
    height: 120,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  profileAvatarWrap: {
    padding: 3,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
    borderRadius: 44,
    position: 'relative',
  },
  profileAvatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
=======
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
>>>>>>> main
    backgroundColor: '#f9f9f9',
  },
  avatarEditIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
<<<<<<< HEAD
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.secondary,
=======
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
>>>>>>> main
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
<<<<<<< HEAD
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
=======
    fontSize: 20,
    fontWeight: '800',
    color: colors.secondary,
>>>>>>> main
    letterSpacing: -0.5,
  },
  profileEmail: {
    fontSize: 13,
<<<<<<< HEAD
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
=======
    color: '#7d7b7b',
    marginTop: 2,
>>>>>>> main
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
<<<<<<< HEAD
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    borderRadius: 22,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  statIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    marginRight: 10,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '900',
=======
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
>>>>>>> main
    color: colors.secondary,
  },
  statLabel: {
    fontSize: 10,
<<<<<<< HEAD
    color: colors.text,
    marginTop: 3,
  },
  sectionCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
=======
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
>>>>>>> main
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
<<<<<<< HEAD
    fontWeight: '900',
=======
    fontWeight: '800',
>>>>>>> main
    color: colors.secondary,
  },
  viewMoreLink: {
    fontSize: 12,
<<<<<<< HEAD
    fontWeight: '800',
    color: colors.primaryDeep,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textLight,
    fontSize: 13,
=======
    fontWeight: '700',
    color: colors.primary,
  },
  emptyText: {
    textAlign: 'center',
    color: '#aaa',
    fontSize: 13,
    fontStyle: 'italic',
>>>>>>> main
    paddingVertical: 10,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
<<<<<<< HEAD
    borderBottomColor: colors.backgroundSoft,
=======
    borderBottomColor: '#f9f9f9',
>>>>>>> main
  },
  orderLeft: {
    gap: 4,
  },
  orderCode: {
    fontSize: 14,
<<<<<<< HEAD
    fontWeight: '800',
=======
    fontWeight: '700',
>>>>>>> main
    color: colors.secondary,
  },
  orderDate: {
    fontSize: 12,
<<<<<<< HEAD
    color: colors.text,
=======
    color: '#7d7b7b',
>>>>>>> main
  },
  orderRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  orderStatus: {
    fontSize: 12,
<<<<<<< HEAD
    fontWeight: '800',
  },
  orderTotal: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.primaryDeep,
=======
    fontWeight: '700',
  },
  orderTotal: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
>>>>>>> main
  },
  reviewItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
<<<<<<< HEAD
    borderBottomColor: colors.backgroundSoft,
=======
    borderBottomColor: '#f9f9f9',
>>>>>>> main
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewProduct: {
    fontSize: 14,
<<<<<<< HEAD
    fontWeight: '800',
=======
    fontWeight: '700',
>>>>>>> main
    color: colors.secondary,
    flex: 1,
  },
  stars: {
    flexDirection: 'row',
    gap: 1,
  },
  reviewDate: {
    fontSize: 11,
<<<<<<< HEAD
    color: colors.text,
=======
    color: '#7d7b7b',
>>>>>>> main
    marginVertical: 4,
  },
  reviewText: {
    fontSize: 13,
<<<<<<< HEAD
    color: colors.text,
=======
    color: '#505050',
>>>>>>> main
    fontStyle: 'italic',
    lineHeight: 18,
  },
  boardingSection: {
<<<<<<< HEAD
    borderRadius: 28,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
=======
    backgroundColor: '#fffcf9',
    borderColor: '#f1e4d6',
>>>>>>> main
  },
  boardingEmpty: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  boardingEmptyText: {
    fontSize: 13,
<<<<<<< HEAD
    color: colors.text,
    marginBottom: 12,
  },
  boardingAddBtn: {
    borderRadius: 999,
    overflow: 'hidden',
  },
  boardingAddBtnInner: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
=======
    color: '#7d7b7b',
    marginBottom: 12,
  },
  boardingAddBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
>>>>>>> main
  },
  boardingAddBtnText: {
    color: '#fff',
    fontSize: 12,
<<<<<<< HEAD
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  boardingBookingCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 10,
=======
    fontWeight: '800',
  },
  boardingBookingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#f1e4d6',
    marginBottom: 8,
>>>>>>> main
  },
  boardingCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  boardingCode: {
    fontSize: 14,
<<<<<<< HEAD
    fontWeight: '900',
    color: colors.secondary,
  },
  boardingBadge: {
    backgroundColor: colors.softPink,
=======
    fontWeight: '800',
    color: colors.secondary,
  },
  boardingBadge: {
    backgroundColor: '#E7F7EE',
>>>>>>> main
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  boardingBadgeText: {
    fontSize: 10,
<<<<<<< HEAD
    fontWeight: '800',
    color: colors.primaryDeep,
=======
    fontWeight: '700',
    color: '#05A845',
>>>>>>> main
  },
  boardingDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  boardingPrice: {
    fontSize: 14,
<<<<<<< HEAD
    fontWeight: '900',
    color: colors.primaryDeep,
=======
    fontWeight: '800',
    color: colors.primary,
>>>>>>> main
  },
});

export default OverviewScreen;
<<<<<<< HEAD
=======

>>>>>>> main
