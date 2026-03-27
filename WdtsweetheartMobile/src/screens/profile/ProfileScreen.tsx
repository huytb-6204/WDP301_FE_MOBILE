import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  BookOpen,
  ChevronRight,
  ClipboardList,
  Heart,
  House,
  Key,
  LogOut,
  MapPin,
  MessageSquare,
  Package,
  PawPrint,
  Settings,
  ShoppingBag,
  ShoppingCart,
  User,
  UserRound,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import type { HomeTabKey, RootStackParamList } from '../../navigation/types';
import { getProfile, type ProfileUser } from '../../services/api/dashboard';
import { tokenStorage } from '../../services/auth/token';
import { colors } from '../../theme/colors';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

type ProfileActionRoute =
  | 'Overview'
  | 'OrderList'
  | 'MyBookings'
  | 'MyBoardingBookings'
  | 'PetList'
  | 'PersonalInfo'
  | 'FavoriteList'
  | 'ChangePassword'
  | 'AccountFeature';

type ProfileAction = {
  key: string;
  label: string;
  route: ProfileActionRoute;
  icon: any;
  params?: RootStackParamList[ProfileActionRoute];
};

type ProfileSection = {
  key: string;
  title: string;
  items: ProfileAction[];
};

type TabItem = {
  key: HomeTabKey;
  label: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
};

const tabs: TabItem[] = [
  { key: 'home', label: 'Trang chủ', icon: House },
  { key: 'product', label: 'Sản phẩm', icon: ShoppingBag },
  { key: 'service', label: 'Dịch vụ', icon: PawPrint },
  { key: 'blog', label: 'Bài viết', icon: BookOpen },
  { key: 'profile', label: 'Tài khoản', icon: UserRound },
];

const PROFILE_SECTIONS: ProfileSection[] = [
  {
    key: 'overview',
    title: 'Tổng quan & lịch sử',
    items: [
      { key: 'ov', label: 'Bảng điều khiển', icon: ClipboardList, route: 'Overview' },
      { key: 'orders', label: 'Đơn hàng của tôi', icon: Package, route: 'OrderList' },
      { key: 'services', label: 'Lịch sử dịch vụ', icon: PawPrint, route: 'MyBookings' },
      { key: 'boarding', label: 'Booking khách sạn', icon: House, route: 'MyBoardingBookings' },
      { key: 'transactions', label: 'Lịch sử giao dịch', icon: ShoppingBag, route: 'TransactionHistory' as any },
    ],
  },
  {
    key: 'account',
    title: 'Tài khoản & cá nhân hóa',
    items: [
      { key: 'p-info', label: 'Thông tin cá nhân', icon: User, route: 'PersonalInfo' },
      { key: 'address', label: 'Sổ địa chỉ', icon: MapPin, route: 'AddressList' as any },
      { key: 'pets', label: 'Thú cưng của tôi', icon: Heart, route: 'PetList' },
      { key: 'favorites', label: 'Sản phẩm yêu thích', icon: ShoppingCart, route: 'FavoriteList' },
      { key: 'reviews', label: 'Đánh giá của tôi', icon: MessageSquare, route: 'ReviewList' as any },
      { key: 'pwd', label: 'Đổi mật khẩu', icon: Key, route: 'ChangePassword' },
    ],
  },
];

const ProfileScreen = () => {
  const navigation = useNavigation<Navigation>();
  const isFocused = useIsFocused();
  const { cartCount } = useCart();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const loadProfileData = async () => {
      setLoading(true);
      try {
        const token = await tokenStorage.get();
        if (token) {
          const profileData = await getProfile();
          setProfile(profileData);
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isFocused) {
      void loadProfileData();
    }
  }, [isFocused]);

  const displayUser = useMemo(
    () => ({
      fullName: profile?.fullName || user?.fullName || 'Khách hàng',
      email: profile?.email || user?.email || 'teddy-pet@fpt.edu.vn',
      avatar: profile?.avatar || user?.avatar || 'https://i.pravatar.cc/150',
    }),
    [profile, user]
  );

  const handleLogout = async () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn thoát khỏi phiên làm việc này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            setIsLoggingOut(true);
            try {
              await logout();
              navigation.reset({ index: 0, routes: [{ name: 'WelcomeChoice' }] });
            } finally {
              setIsLoggingOut(false);
            }
          })();
        },
      },
    ]);
  };

  const handleTabPress = (tab: HomeTabKey) => {
    if (tab === 'profile') return;
    navigation.navigate('Home', { initialTab: tab });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.brand}>Teddy Pet</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerIconBtn} onPress={() => {}}>
            <Settings size={20} color={colors.secondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconBtn} onPress={() => navigation.navigate('Cart')}>
            <ShoppingCart size={20} color={colors.secondary} />
            {cartCount > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cartCount}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[colors.gradientPrimaryStart, colors.gradientPrimaryEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroGlow} />
          <Image source={{ uri: displayUser.avatar }} style={styles.avatar} />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{displayUser.fullName}</Text>
            <Text style={styles.userEmail}>{displayUser.email}</Text>
            <TouchableOpacity style={styles.editProfileBtn} onPress={() => navigation.navigate('PersonalInfo')}>
              <Text style={styles.editProfileText}>Chỉnh sửa hồ sơ</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {loading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.loadingText}>Đang tải thông tin tài khoản...</Text>
          </View>
        ) : null}

        {PROFILE_SECTIONS.map((section) => (
          <View key={section.key} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.menuGroup}>
              {section.items.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <TouchableOpacity
                    key={item.key}
                    style={[styles.menuItem, idx === section.items.length - 1 && styles.noBorder]}
                    activeOpacity={0.82}
                    onPress={() => navigation.navigate(item.route as any, item.params)}
                  >
                    <View style={styles.menuLeft}>
                      <LinearGradient
                        colors={[colors.gradientSoftStart, colors.gradientSoftEnd]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.menuIconWrap}
                      >
                        <Icon size={18} color={colors.primaryDeep} />
                      </LinearGradient>
                      <Text style={styles.menuLabel}>{item.label}</Text>
                    </View>
                    <ChevronRight size={18} color={colors.textLight} />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} disabled={isLoggingOut}>
          <LinearGradient
            colors={['#FFE7E8', '#FFF3F1']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.logoutBtnInner, isLoggingOut && styles.logoutBtnDisabled]}
          >
            {isLoggingOut ? <ActivityIndicator color={colors.danger} /> : <LogOut size={18} color={colors.danger} />}
            <Text style={styles.logoutBtnText}>Đăng xuất tài khoản</Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.versionText}>Phiên bản 1.0.4</Text>
      </ScrollView>

      <View style={styles.tabBarShell}>
        <LinearGradient
          colors={['rgba(255,255,255,0.96)', 'rgba(255,247,245,0.98)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.tabBar}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = tab.key === 'profile';
            return (
              <TouchableOpacity key={tab.key} style={styles.tabItem} onPress={() => handleTabPress(tab.key)}>
                <View style={[styles.tabIconWrap, active && styles.tabIconWrapActive]}>
                  <Icon size={18} color={active ? '#fff' : colors.tabInactive} />
                </View>
                <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab.label}</Text>
              </TouchableOpacity>
            );
          })}
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.background,
  },
  brand: { fontSize: 21, fontWeight: '900', color: colors.primaryDeep, letterSpacing: -0.6 },
  headerActions: { flexDirection: 'row', gap: 12 },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.primary,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  content: { padding: 16, paddingBottom: 120 },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 30,
    padding: 22,
    marginBottom: 24,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 6,
  },
  heroGlow: {
    position: 'absolute',
    top: -18,
    right: -4,
    width: 120,
    height: 120,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.42)',
  },
  userInfo: { marginLeft: 16, flex: 1 },
  userName: { fontSize: 22, fontWeight: '900', color: '#fff' },
  userEmail: { fontSize: 13, color: 'rgba(255,255,255,0.9)', marginTop: 4, marginBottom: 10 },
  editProfileBtn: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
  },
  editProfileText: { fontSize: 12, fontWeight: '800', color: '#fff' },
  loadingCard: {
    paddingVertical: 18,
    borderRadius: 22,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  loadingText: { color: colors.text, fontSize: 13 },
  section: { marginBottom: 22 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.primaryDeep,
    marginBottom: 12,
    marginLeft: 4,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  menuGroup: {
    backgroundColor: colors.white,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundSoft,
  },
  noBorder: { borderBottomWidth: 0 },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  menuIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: { fontSize: 14, fontWeight: '700', color: colors.secondary, flex: 1 },
  logoutBtn: { marginTop: 4 },
  logoutBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 22,
    gap: 10,
    borderWidth: 1,
    borderColor: '#FFE0DF',
  },
  logoutBtnDisabled: { opacity: 0.7 },
  logoutBtnText: { fontSize: 15, fontWeight: '800', color: colors.danger },
  versionText: { textAlign: 'center', color: colors.textLight, fontSize: 12, marginTop: 18 },
  tabBarShell: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(245,216,212,0.95)',
    paddingVertical: 10,
    paddingHorizontal: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 10,
  },
  tabItem: { flex: 1, alignItems: 'center', gap: 5 },
  tabIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  tabIconWrapActive: {
    backgroundColor: colors.primary,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 4,
  },
  tabLabel: { fontSize: 10, fontWeight: '700', color: colors.tabInactive },
  tabLabelActive: { color: colors.primaryDeep },
});

export default ProfileScreen;
