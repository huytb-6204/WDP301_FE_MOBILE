import React, { useMemo, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  BookOpen,
  House,
  PawPrint,
  ShoppingBag,
  UserRound,
  LogOut,
  CalendarCheck,
  ShoppingCart,
  ArrowRight,
} from 'lucide-react-native';
import { colors } from '../../theme/colors';
import type { RootStackParamList } from '../../navigation/types';
import { useCart } from '../../context/CartContext';
import { useProducts } from '../../hooks/useProducts';
import { formatPrice } from '../../utils';
import { tokenStorage } from '../../services/auth/token';
import { getProfile, type ProfileUser } from '../../services/api/dashboard';
import { logout as logoutApi } from '../../services/api/auth';

type Navigation = NativeStackNavigationProp<RootStackParamList>;
type HomeMainTab = 'home' | 'product' | 'service' | 'blog' | 'profile';

type TabItem = {
  key: HomeMainTab;
  label: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
};

const tabs: TabItem[] = [
  { key: 'home', label: 'Home', icon: House },
  { key: 'product', label: 'Product', icon: ShoppingBag },
  { key: 'service', label: 'Service', icon: PawPrint },
  { key: 'blog', label: 'Blog', icon: BookOpen },
  { key: 'profile', label: 'Profile', icon: UserRound },
];

const blogMock = [
  {
    id: 'b1',
    title: 'Cách chăm sóc thú cưng vào mùa nóng',
    date: '03/2026',
  },
  {
    id: 'b2',
    title: '5 dấu hiệu thú cưng cần đi khám',
    date: '03/2026',
  },
  {
    id: 'b3',
    title: 'Routine vệ sinh cho chó mèo tại nhà',
    date: '02/2026',
  },
];

const homeVisuals = {
  heroPets: 'https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/06/h1-slider-imgs.png',
  promo1: 'https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/05/h1-filler-img-1.jpg',
  promo2: 'https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/05/h1-filler-img-2.jpg',
  badge: 'https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/06/rate-group-img.png',
};

const HomeScreen = () => {
  const navigation = useNavigation<Navigation>();
  const isFocused = useIsFocused();
  const { cartCount } = useCart();
  const { data: products } = useProducts();

  const [activeTab, setActiveTab] = useState<HomeMainTab>('home');
  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const productPreview = useMemo(() => (products || []).slice(0, 4), [products]);

  const loadProfile = useCallback(async () => {
    setProfileError(null);
    const token = await tokenStorage.get();

    if (!token) {
      setProfile(null);
      return;
    }

    setProfileLoading(true);
    try {
      const user = await getProfile();
      setProfile(user);
    } catch (err) {
      setProfile(null);
      setProfileError(err instanceof Error ? err.message : 'Không thể tải hồ sơ');
    } finally {
      setProfileLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (isFocused && activeTab === 'profile') {
      loadProfile();
    }
  }, [activeTab, isFocused, loadProfile]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutApi();
      setProfile(null);
      setProfileError(null);
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Đăng xuất thất bại');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const renderHomeTab = () => (
    <View style={styles.sectionStack}>
      <View style={styles.heroCard}>
        <View style={styles.heroRow}>
          <View>
            <Text style={styles.heroTitle}>Teddy Pet Mobile</Text>
            <Text style={styles.heroDesc}>Chăm sóc thú cưng trọn vẹn trong một chạm.</Text>
            <Image source={{ uri: homeVisuals.badge }} style={styles.heroRating} resizeMode="contain" />
          </View>
          <View style={styles.heroMediaWrap}>
            <Image source={{ uri: homeVisuals.heroPets }} style={styles.heroPetImage} resizeMode="contain" />
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>{cartCount}</Text>
              <ShoppingCart size={16} color="#fff" />
            </View>
          </View>
        </View>
        <View style={styles.heroActionRow}>
          <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('Booking')}>
            <CalendarCheck size={16} color="#fff" />
            <Text style={styles.primaryButtonText}>Đặt lịch</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('Cart')}>
            <Text style={styles.secondaryButtonText}>Giỏ hàng</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.promoRow}>
        <TouchableOpacity style={styles.promoItem} onPress={() => setActiveTab('service')}>
          <ImageBackground source={{ uri: homeVisuals.promo1 }} style={styles.promoImage} imageStyle={styles.promoImageInner}>
            <View style={styles.promoOverlay}>
              <Text style={styles.promoTitle}>Spa & Grooming</Text>
              <Text style={styles.promoSub}>Đặt lịch nhanh trong 1 chạm</Text>
            </View>
          </ImageBackground>
        </TouchableOpacity>
        <TouchableOpacity style={styles.promoItem} onPress={() => setActiveTab('product')}>
          <ImageBackground source={{ uri: homeVisuals.promo2 }} style={styles.promoImage} imageStyle={styles.promoImageInner}>
            <View style={styles.promoOverlay}>
              <Text style={styles.promoTitle}>Pet Shop</Text>
              <Text style={styles.promoSub}>Khám phá sản phẩm nổi bật</Text>
            </View>
          </ImageBackground>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Tác vụ nhanh</Text>
        <View style={styles.quickGrid}>
          <TouchableOpacity style={styles.quickItem} onPress={() => setActiveTab('product')}>
            <ShoppingBag size={18} color={colors.primary} />
            <Text style={styles.quickText}>Sản phẩm</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickItem} onPress={() => setActiveTab('service')}>
            <PawPrint size={18} color={colors.primary} />
            <Text style={styles.quickText}>Dịch vụ</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickItem} onPress={() => setActiveTab('blog')}>
            <BookOpen size={18} color={colors.primary} />
            <Text style={styles.quickText}>Bài viết</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickItem} onPress={() => setActiveTab('profile')}>
            <UserRound size={18} color={colors.primary} />
            <Text style={styles.quickText}>Tài khoản</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderProductTab = () => (
    <View style={styles.sectionStack}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Sản phẩm nổi bật</Text>
        <TouchableOpacity style={styles.inlineAction} onPress={() => navigation.navigate('ProductList')}>
          <Text style={styles.inlineActionText}>Xem tất cả</Text>
          <ArrowRight size={14} color={colors.primary} />
        </TouchableOpacity>
      </View>
      {productPreview.map((item) => (
        <TouchableOpacity
          key={item._id}
          style={styles.productRow}
          onPress={() => navigation.navigate('ProductDetail', { productSlug: item.slug })}
        >
          <Image source={{ uri: item.images?.[0] || 'https://via.placeholder.com/96' }} style={styles.productImage} />
          <View style={styles.productMeta}>
            <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.productPrice}>{formatPrice(item.priceNew ?? item.priceOld)}</Text>
          </View>
        </TouchableOpacity>
      ))}
      <TouchableOpacity style={styles.primaryButtonFull} onPress={() => navigation.navigate('ProductList')}>
        <Text style={styles.primaryButtonText}>Mở danh sách sản phẩm</Text>
      </TouchableOpacity>
    </View>
  );

  const renderServiceTab = () => (
    <View style={styles.sectionStack}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Dịch vụ chính</Text>
        <Text style={styles.cardText}>Spa, grooming, khám sức khỏe, huấn luyện và chăm sóc định kỳ.</Text>
        <TouchableOpacity style={styles.primaryButtonFull} onPress={() => navigation.navigate('Booking')}>
          <Text style={styles.primaryButtonText}>Đặt lịch dịch vụ</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Lịch hẹn của bạn</Text>
        <Text style={styles.cardText}>Theo dõi toàn bộ lịch đã đặt và trạng thái xử lý.</Text>
        <TouchableOpacity style={styles.secondaryButtonFull} onPress={() => navigation.navigate('MyBookings')}>
          <Text style={styles.secondaryButtonText}>Xem lịch của tôi</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderBlogTab = () => (
    <View style={styles.sectionStack}>
      {blogMock.map((item) => (
        <View key={item.id} style={styles.blogCard}>
          <Text style={styles.blogDate}>{item.date}</Text>
          <Text style={styles.blogTitle}>{item.title}</Text>
          <Text style={styles.blogDesc}>Nội dung blog chi tiết sẽ được kết nối API ở phase tiếp theo.</Text>
        </View>
      ))}
    </View>
  );

  const renderProfileTab = () => {
    if (profileLoading) {
      return (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.loadingText}>Đang tải hồ sơ...</Text>
        </View>
      );
    }

    if (!profile) {
      return (
        <View style={styles.sectionStack}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Bạn chưa đăng nhập</Text>
            <Text style={styles.cardText}>Đăng nhập để xem hồ sơ và quản lý lịch hẹn.</Text>
            {profileError ? <Text style={styles.errorText}>{profileError}</Text> : null}
            <View style={styles.rowButtons}>
              <TouchableOpacity style={styles.primaryButtonHalf} onPress={() => navigation.navigate('Login')}>
                <Text style={styles.primaryButtonText}>Đăng nhập</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButtonHalf} onPress={() => navigation.navigate('Register')}>
                <Text style={styles.secondaryButtonText}>Đăng ký</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.sectionStack}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{profile.fullName}</Text>
          <Text style={styles.cardText}>Email: {profile.email}</Text>
          <Text style={styles.cardText}>SĐT: {profile.phone || 'Chưa cập nhật'}</Text>
        </View>
        <TouchableOpacity style={styles.secondaryButtonFull} onPress={() => navigation.navigate('MyBookings')}>
          <Text style={styles.secondaryButtonText}>Lịch hẹn của tôi</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} disabled={isLoggingOut}>
          {isLoggingOut ? <ActivityIndicator color="#fff" /> : <LogOut size={16} color="#fff" />}
          <Text style={styles.logoutText}>{isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}</Text>
        </TouchableOpacity>
        {profileError ? <Text style={styles.errorText}>{profileError}</Text> : null}
      </View>
    );
  };

  const renderActiveTab = () => {
    if (activeTab === 'product') return renderProductTab();
    if (activeTab === 'service') return renderServiceTab();
    if (activeTab === 'blog') return renderBlogTab();
    if (activeTab === 'profile') return renderProfileTab();
    return renderHomeTab();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.brand}>Teddy Pet</Text>
        <TouchableOpacity style={styles.cartIcon} onPress={() => navigation.navigate('Cart')}>
          <ShoppingCart size={18} color={colors.secondary} />
          {cartCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{cartCount}</Text>
            </View>
          ) : null}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>{renderActiveTab()}</ScrollView>

      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.key;
          return (
            <TouchableOpacity key={tab.key} style={styles.tabItem} onPress={() => setActiveTab(tab.key)}>
              <View style={[styles.tabIconWrap, active && styles.tabIconWrapActive]}>
                <Icon size={18} color={active ? '#fff' : colors.secondary} />
              </View>
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  brand: { color: colors.secondary, fontSize: 20, fontWeight: '700' },
  cartIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 3,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  content: { padding: 16, paddingBottom: 110 },
  sectionStack: { gap: 12 },
  heroCard: {
    borderRadius: 16,
    padding: 14,
    backgroundColor: colors.softPink,
    borderWidth: 1,
    borderColor: '#ffdede',
  },
  heroRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  heroTitle: { color: colors.secondary, fontSize: 18, fontWeight: '700' },
  heroDesc: { color: colors.text, marginTop: 4, maxWidth: 220 },
  heroRating: { width: 100, height: 22, marginTop: 8 },
  heroMediaWrap: { alignItems: 'center', justifyContent: 'center' },
  heroPetImage: { width: 116, height: 88, marginTop: -2 },
  heroBadge: {
    position: 'absolute',
    right: -4,
    bottom: -2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  heroBadgeText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  heroActionRow: { flexDirection: 'row', gap: 8, marginTop: 14 },
  promoRow: { flexDirection: 'row', gap: 10 },
  promoItem: { flex: 1, borderRadius: 14, overflow: 'hidden' },
  promoImage: { height: 120, justifyContent: 'flex-end' },
  promoImageInner: { borderRadius: 14 },
  promoOverlay: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: 'rgba(16, 41, 55, 0.55)',
    gap: 3,
  },
  promoTitle: { color: '#fff', fontSize: 13, fontWeight: '700' },
  promoSub: { color: '#fff', fontSize: 11, opacity: 0.92 },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 999,
    backgroundColor: colors.primary,
    minHeight: 40,
    paddingHorizontal: 14,
  },
  primaryButtonText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  secondaryButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.primary,
    minHeight: 40,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  secondaryButtonText: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  cardTitle: { color: colors.secondary, fontSize: 16, fontWeight: '700' },
  cardText: { color: colors.text, fontSize: 13, lineHeight: 20 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
  quickItem: {
    width: '48%',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.softPink,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 4,
  },
  quickText: { color: colors.secondary, fontWeight: '600', fontSize: 12 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitle: { color: colors.secondary, fontSize: 17, fontWeight: '700' },
  inlineAction: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  inlineActionText: { color: colors.primary, fontWeight: '600', fontSize: 12 },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: '#fff',
    padding: 8,
  },
  productImage: { width: 64, height: 64, borderRadius: 10, backgroundColor: colors.softPink },
  productMeta: { flex: 1, gap: 4 },
  productName: { color: colors.secondary, fontWeight: '600', fontSize: 14 },
  productPrice: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  primaryButtonFull: {
    borderRadius: 999,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    marginTop: 6,
  },
  secondaryButtonFull: {
    borderRadius: 999,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: '#fff',
  },
  blogCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#fff',
    padding: 12,
    gap: 6,
  },
  blogDate: { color: colors.primary, fontSize: 11, fontWeight: '700' },
  blogTitle: { color: colors.secondary, fontSize: 15, fontWeight: '700' },
  blogDesc: { color: colors.text, fontSize: 12, lineHeight: 18 },
  loadingWrap: { alignItems: 'center', justifyContent: 'center', marginTop: 40, gap: 8 },
  loadingText: { color: colors.text, fontSize: 13 },
  rowButtons: { flexDirection: 'row', gap: 8, marginTop: 6 },
  primaryButtonHalf: {
    flex: 1,
    borderRadius: 999,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  secondaryButtonHalf: {
    flex: 1,
    borderRadius: 999,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: '#fff',
  },
  logoutButton: {
    marginTop: 4,
    borderRadius: 999,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#102937',
    flexDirection: 'row',
    gap: 6,
  },
  logoutText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  errorText: { color: colors.primary, fontSize: 12, marginTop: 4 },
  tabBar: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  tabItem: { flex: 1, alignItems: 'center', gap: 5 },
  tabIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  tabIconWrapActive: { backgroundColor: colors.primary },
  tabLabel: { color: colors.text, fontSize: 11, fontWeight: '600' },
  tabLabelActive: { color: colors.primary },
});

export default HomeScreen;
