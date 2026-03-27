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
import { useNavigation, useIsFocused, useRoute, RouteProp } from '@react-navigation/native';
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
  Heart,
  ClipboardList,
  MessageSquare,
  Key,
} from 'lucide-react-native';
import ProfileScreen from '../profile/ProfileScreen';
import { colors } from '../../theme/colors';
import type { RootStackParamList, HomeTabKey } from '../../navigation/types';
import { useCart } from '../../context/CartContext';
import { useFavorites } from '../../context/FavoritesContext';
import { useProducts } from '../../hooks/useProducts';
import { useBlogs } from '../../hooks/useBlogs';
import { formatPrice } from '../../utils';
import { tokenStorage } from '../../services/auth/token';
import { getProfile, type ProfileUser } from '../../services/api/dashboard';
import { logout as logoutApi } from '../../services/api/auth';
import { StatusMessage } from '../../components/common';
import { env } from '../../config';

type Navigation = NativeStackNavigationProp<RootStackParamList>;
type HomeMainTab = HomeTabKey;

type HomeRouteProp = RouteProp<RootStackParamList, 'Home'>;

type TabItem = {
  key: HomeMainTab;
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

const homeVisuals = {
  heroPets: 'https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/06/h1-slider-imgs.png',
  promo1: 'https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/05/h1-filler-img-1.jpg',
  promo2: 'https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/05/h1-filler-img-2.jpg',
  badge: 'https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/06/rate-group-img.png',
  serviceCover: require('../../../assets/pet_spa_premium.png'),
  hotelCover: require('../../../assets/pet_hotel_premium.png'),
};

const showcaseCategory = ['THỨC ĂN', 'ĐỒ CHƠI', 'PHỤ KIỆN', 'VỆ SINH'];

const toAbsoluteUrl = (url?: string) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  const trimmed = url.replace(/^\/+/, '');
  return `${env.apiBaseUrl}/${trimmed}`;
};

const HomeScreen = () => {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<HomeRouteProp>();
  const isFocused = useIsFocused();
  const { cartCount, addToCart } = useCart();
  const { isFavorite, favorites, toggleFavorite } = useFavorites();
  const { data: products } = useProducts({ page: 1, limit: 8 });
  const { data: blogs, loading: blogsLoading, error: blogsError, refetch: refetchBlogs } = useBlogs();

  const [activeTab, setActiveTab] = useState<HomeMainTab>(() => route.params?.initialTab ?? 'home');
  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const productPreview = useMemo(() => {
    const safeProducts = Array.isArray(products) ? products.slice() : [];
    const prioritized = safeProducts.sort((a, b) => {
      const aPriority = isFavorite(a._id) ? 1 : 0;
      const bPriority = isFavorite(b._id) ? 1 : 0;
      return bPriority - aPriority;
    });
    return prioritized.slice(0, 4);
  }, [products, isFavorite]);
  const blogPreview = useMemo(() => (blogs || []).slice(0, 3), [blogs]);

  const formatBlogDate = (value?: string) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('vi-VN');
  };

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

  React.useEffect(() => {
    if (route.params?.initialTab) {
      setActiveTab(route.params.initialTab);
      navigation.setParams({ initialTab: undefined });
    }
  }, [route.params?.initialTab, navigation]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutApi();
      setProfile(null);
      setProfileError(null);
      navigation.reset({
        index: 0,
        routes: [{ name: 'WelcomeChoice' as any }],
      });
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Đăng xuất thất bại');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleTabPress = (tab: HomeMainTab) => {
    setActiveTab(tab);
  };

  const renderShowcaseProduct = (item: (typeof productPreview)[number], index: number) => {
    const priceValue = item.priceNew ?? item.priceOld ?? 0;
    const hasSale = !!(item.priceOld && item.priceNew && item.priceOld > item.priceNew);
    const favoriteProduct = {
      id: item._id,
      slug: item.slug,
      title: item.name,
      price: formatPrice(priceValue),
      primaryImage: toAbsoluteUrl(item.images?.[0]),
      secondaryImage: toAbsoluteUrl(item.images?.[1] || item.images?.[0]),
      rating: 5,
      isSale: hasSale,
      priceValue,
      originalPrice: item.priceOld ? formatPrice(item.priceOld) : undefined,
    };
    const badgeText =
      index === 0
        ? 'Bán chạy'
        : hasSale && item.priceOld
          ? `-${Math.round(((item.priceOld - (item.priceNew || 0)) / item.priceOld) * 100)}%`
          : null;

    return (
      <TouchableOpacity
        key={item._id}
        style={styles.showcaseCard}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('ProductDetail', { productSlug: item.slug, product: favoriteProduct })}
      >
        <View style={styles.showcaseImageWrap}>
          <Image source={{ uri: item.images?.[0] || 'https://via.placeholder.com/300' }} style={styles.showcaseImage} />
          {badgeText ? (
            <View style={[styles.showcaseBadge, index === 0 ? styles.showcaseBadgePink : styles.showcaseBadgeOrange]}>
              <Text style={styles.showcaseBadgeText}>{badgeText}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.showcaseBody}>
          <Text style={styles.showcaseCategory}>{showcaseCategory[index] || 'SẢN PHẨM'}</Text>
          <Text style={styles.showcaseTitle} numberOfLines={3}>
            {item.name}
          </Text>
          <View style={styles.showcasePriceRow}>
            <Text style={styles.showcasePrice}>{formatPrice(priceValue)}</Text>
            {hasSale && item.priceOld ? (
              <Text style={styles.showcaseOldPrice}>{formatPrice(item.priceOld)}</Text>
            ) : null}
          </View>
          <TouchableOpacity style={styles.showcaseAddBtn} onPress={() => addToCart(favoriteProduct, 1)}>
            <ShoppingCart size={14} color={colors.primary} />
            <Text style={styles.showcaseAddText}>Thêm</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHomeTab = () => (
    <View style={styles.sectionStack}>
      {favorites.length > 0 ? (
        <TouchableOpacity style={styles.favoriteHintModern} onPress={() => navigation.navigate('FavoriteList')}>
          <Heart size={14} color={colors.primary} fill={colors.primary} />
          <Text style={styles.favoriteHintTextModern}>
            Đang hiển thị {favorites.length} sản phẩm bạn yêu thích
          </Text>
          <ArrowRight size={12} color={colors.primary} />
        </TouchableOpacity>
      ) : null}

      <TouchableOpacity
        style={styles.heroCardModern}
        activeOpacity={0.95}
        onPress={() => navigation.navigate('ProductList')}
      >
        <ImageBackground
          source={{ uri: homeVisuals.promo1 }}
          style={styles.heroBackground}
          imageStyle={styles.heroBackgroundImage}
        >
          <View style={styles.heroGlassOverlay}>
            <View style={styles.heroContent}>
              <View style={styles.heroTag}>
                <Text style={styles.heroTagText}>SẢN PHẨM MỚI</Text>
              </View>
              <Text style={styles.heroTitleModern}>Teddy Pet Mobile</Text>
              <Text style={styles.heroDescModern}>Chăm sóc thú cưng trọn vẹn trong một chạm.</Text>
            </View>
            <View style={styles.heroActionModern}>
              <View style={styles.heroBtn}>
                <Text style={styles.heroBtnText}>Khám phá ngay</Text>
              </View>
              <View style={styles.heroFloatingBadge}>
                  <Image source={{ uri: homeVisuals.badge }} style={styles.heroRatingModern} resizeMode="contain" />
              </View>
            </View>
          </View>
        </ImageBackground>
      </TouchableOpacity>

      <View style={styles.quickActionCard}>
        <Text style={styles.quickActionTitle}>Truy cập nhanh</Text>
        <View style={styles.quickGridModern}>
          {[
            { label: 'Sản phẩm', icon: ShoppingBag, color: '#FFF1F1', iconColor: colors.primary, tab: 'product' },
            { label: 'Dịch vụ', icon: PawPrint, color: '#F1F5FF', iconColor: '#4F46E5', tab: 'service' },
            { label: 'Bài viết', icon: BookOpen, color: '#F0FFF4', iconColor: '#22C55E', tab: 'blog' },
            { label: 'Tài khoản', icon: UserRound, color: '#FFFBEB', iconColor: '#F59E0B', tab: 'profile' },
          ].map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.quickItemModern, { backgroundColor: item.color }]}
              onPress={() => setActiveTab(item.tab as HomeMainTab)}
            >
              <View style={styles.quickIconBox}>
                <item.icon size={20} color={item.iconColor} />
              </View>
              <Text style={styles.quickLabelModern}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.promoModernRow}>
        <TouchableOpacity style={styles.promoModernItem} onPress={() => setActiveTab('service')}>
          <ImageBackground source={{ uri: homeVisuals.promo2 }} style={styles.promoModernImage} imageStyle={styles.promoModernImageInner}>
            <View style={styles.promoModernOverlay}>
              <Text style={styles.promoModernTitle}>Spa & Grooming</Text>
              <View style={styles.promoModernBtn}>
                <ArrowRight size={10} color="#fff" />
              </View>
            </View>
          </ImageBackground>
        </TouchableOpacity>
        <TouchableOpacity style={styles.promoModernItem} onPress={() => navigation.navigate('Booking')}>
          <ImageBackground source={{ uri: homeVisuals.promo1 }} style={styles.promoModernImage} imageStyle={styles.promoModernImageInner}>
            <View style={styles.promoModernOverlay}>
              <Text style={styles.promoModernTitle}>Đặt lịch ngay</Text>
              <View style={[styles.promoModernBtn, { backgroundColor: '#4F46E5' }]}>
                <ArrowRight size={10} color="#fff" />
              </View>
            </View>
          </ImageBackground>
        </TouchableOpacity>
      </View>

      <View style={styles.homeSectionHeader}>
        <View style={styles.homeSectionTitleRow}>
            <View style={styles.titleIndicator} />
            <Text style={styles.homeSectionTitle}>Sản phẩm nổi bật</Text>
        </View>
        <TouchableOpacity style={styles.homeSeeAll} onPress={() => navigation.navigate('ProductList')}>
          <Text style={styles.homeSeeAllText}>Xem tất cả</Text>
          <ArrowRight size={10} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.showcaseGrid}>{productPreview.map(renderShowcaseProduct)}</View>
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

      <View style={styles.showcaseGrid}>{productPreview.map(renderShowcaseProduct)}</View>

      <TouchableOpacity style={styles.primaryButtonFull} onPress={() => navigation.navigate('ProductList')}>
        <Text style={styles.primaryButtonText}>Mở danh sách sản phẩm</Text>
      </TouchableOpacity>
    </View>
  );

  const renderServiceTab = () => (
    <View style={styles.sectionStack}>
      <View style={styles.serviceHeroHeader}>
        <View style={styles.premiumBadge}>
          <Text style={styles.premiumBadgeText}>PREMIUM SERVICES</Text>
        </View>
        <Text style={styles.sectionTitleLarge}>Dịch vụ & Hotel</Text>
        <Text style={styles.sectionSubtitle}>
          Trải nghiệm đẳng cấp 5 sao dành riêng cho thú cưng của bạn.
        </Text>
      </View>

      <View style={styles.sectionBlock}>
        <ImageBackground
          source={homeVisuals.serviceCover}
          style={styles.serviceHeroCardLarge}
          imageStyle={styles.serviceHeroCardImage}
        >
          <View style={styles.serviceGlassOverlay}>
            <View style={styles.serviceContentTop}>
               <View style={styles.serviceTag}>
                  <PawPrint size={12} color="#fff" />
                  <Text style={styles.serviceTagText}>SPA & GROOMING</Text>
               </View>
               <Text style={styles.serviceMainTitle}>Chăm sóc toàn diện</Text>
               <Text style={styles.serviceMainDesc}>
                  Liệu trình Spa chuẩn quốc tế giúp bé cưng thư giãn và rạng rỡ.
               </Text>
            </View>
            <View style={styles.serviceActionRow}>
              <TouchableOpacity style={styles.servicePrimaryBtn} onPress={() => navigation.navigate('Booking')}>
                <Text style={styles.servicePrimaryBtnText}>Đặt lịch ngay</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.serviceSecondaryBtn} onPress={() => navigation.navigate('ServiceList')}>
                <Text style={styles.serviceSecondaryBtnText}>Khám phá</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>
      </View>

      <View style={styles.sectionBlock}>
        <ImageBackground
          source={homeVisuals.hotelCover}
          style={styles.serviceHeroCardLarge}
          imageStyle={styles.serviceHeroCardImage}
        >
          <View style={styles.serviceGlassOverlay}>
            <View style={styles.serviceContentTop}>
               <View style={[styles.serviceTag, { backgroundColor: '#4F46E5' }]}>
                  <House size={12} color="#fff" />
                  <Text style={styles.serviceTagText}>PET HOTEL</Text>
               </View>
               <Text style={styles.serviceMainTitle}>Nơi trú ẩn ấm cúng</Text>
               <Text style={styles.serviceMainDesc}>
                  Phòng nghỉ hạng sang với chế độ chăm sóc và theo dõi 24/7.
               </Text>
            </View>
            <View style={styles.serviceActionRow}>
              <TouchableOpacity style={[styles.servicePrimaryBtn, { backgroundColor: '#4F46E5' }]} onPress={() => navigation.navigate('BoardingHotel')}>
                <Text style={styles.servicePrimaryBtnText}>Đặt phòng</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.serviceSecondaryBtn} onPress={() => navigation.navigate('MyBoardingBookings')}>
                <Text style={styles.serviceSecondaryBtnText}>Lịch sử</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>
      </View>

      <View style={styles.appointmentShortcut}>
         <View style={styles.appointmentInfo}>
            <Text style={styles.appointmentTitle}>Quản lý lịch hẹn</Text>
            <Text style={styles.appointmentSub}>Theo dõi trạng thái và lịch trình của bé</Text>
         </View>
         <TouchableOpacity style={styles.appointmentBtn} onPress={() => navigation.navigate('MyBookings')}>
            <ClipboardList size={20} color={colors.primary} />
         </TouchableOpacity>
      </View>
    </View>
  );

  const renderBlogTab = () => (
    <View style={styles.sectionStack}>
      <View style={styles.homeSectionHeader}>
        <View style={styles.homeSectionTitleRow}>
          <View style={styles.titleIndicator} />
          <Text style={styles.homeSectionTitle}>Bài viết mới nhất</Text>
        </View>
        <TouchableOpacity style={styles.homeSeeAll} onPress={() => navigation.navigate('BlogList')}>
          <Text style={styles.homeSeeAllText}>Xem tất cả</Text>
          <ArrowRight size={10} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {blogsLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.loadingText}>Đang tải bài viết...</Text>
        </View>
      ) : blogsError ? (
        <View style={styles.statusWrap}>
          <StatusMessage message={blogsError} actionText="Thử lại" onAction={refetchBlogs} />
        </View>
      ) : blogPreview.length === 0 ? (
        <View style={styles.emptyBlog}>
          <Text style={styles.emptyBlogText}>Chưa có bài viết nào.</Text>
          <TouchableOpacity style={styles.browseButtonModern} onPress={() => navigation.navigate('BlogList')}>
            <Text style={styles.browseButtonTextModern}>Khám phá blog</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.blogGridModern}>
          {blogPreview.map((item, idx) => (
            <TouchableOpacity
              key={item._id}
              activeOpacity={0.9}
              style={[styles.blogCardModern, idx === 0 && styles.blogCardFeatured]}
              onPress={() => navigation.navigate('BlogDetail', { slug: item.slug || item._id, blog: item })}
            >
              <Image
                source={{ uri: item.featuredImage || item.avatar || 'https://via.placeholder.com/400x200' }}
                style={idx === 0 ? styles.blogImageFeatured : styles.blogImageNormal}
                resizeMode="cover"
              />
              <View style={styles.blogContentModern}>
                <View style={styles.blogMetaRow}>
                  <Text style={styles.blogTagModern}>TIN TỨC</Text>
                  <Text style={styles.blogDateModern}>{formatBlogDate(item.publishAt || item.createdAt)}</Text>
                </View>
                <Text style={styles.blogTitleModern} numberOfLines={2}>
                  {item.name}
                </Text>
                {idx === 0 && (
                  <Text style={styles.blogDescModern} numberOfLines={2}>
                    {item.excerpt || item.expert || item.description || 'Xem chi tiết bài viết...'}
                  </Text>
                )}
                <View style={styles.blogFooterModern}>
                   <Text style={styles.blogReadMore}>Đọc ngay</Text>
                   <ArrowRight size={12} color={colors.primary} />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
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

    const sections = [
      {
        title: 'TỔNG QUAN',
        items: [
          { label: 'Tổng quan bảng điều khiển', icon: ClipboardList, route: 'Overview' },
          { label: 'Lịch sử đơn hàng', icon: ShoppingBag, route: 'OrderList' },
          { label: 'Lịch sử dịch vụ (Spa)', icon: CalendarCheck, route: 'MyBookings' },
          { label: 'Booking khách sạn', icon: House, route: 'MyBoardingBookings' },
          { label: 'Lịch sử giao dịch', icon: ShoppingCart, route: 'TransactionHistory' },
        ],
      },
      {
        title: 'DỊCH VỤ KHÁC',
        items: [
          { label: 'Mã giảm giá', icon: ShoppingBag, route: 'CouponList' },
          { label: 'Giống thú cưng', icon: PawPrint, route: 'BreedList' },
          { label: 'Chuồng khách sạn', icon: House, route: 'BoardingCages' },
          { label: 'Lịch sử đặt phòng (Boarding)', icon: ClipboardList, route: 'BoardingBookings' },
        ],
      },
      {
        title: 'TÀI KHOẢN & CÀI ĐẶT',
        items: [
          { label: 'Thông tin cá nhân', icon: UserRound, route: 'PersonalInfo' },
          { label: 'Sổ địa chỉ', icon: ShoppingBag, route: 'AddressList' },
          { label: 'Thú cưng của tôi', icon: Heart, route: 'PetList' },
          { label: 'Sản phẩm yêu thích', icon: Heart, route: 'FavoriteList' },
          { label: 'Đánh giá của tôi', icon: MessageSquare, route: 'ReviewList' },
          { label: 'Đổi mật khẩu', icon: Key, route: 'ChangePassword' },
        ],
      },
    ];

    return (
      <View style={styles.sectionStack}>
        <View style={styles.profileHeader}>
          <Image source={{ uri: profile.avatar || 'https://i.pravatar.cc/150' }} style={styles.profileAvatar} />
          <View style={styles.profileInfoText}>
            <Text style={styles.profileName}>{profile.fullName}</Text>
            <Text style={styles.profileEmail}>{profile.email}</Text>
          </View>
        </View>

        {sections.map((section, idx) => (
          <View key={idx} style={styles.menuSection}>
            <View style={styles.menuSectionHeader}>
               <Text style={styles.menuSectionTitle}>{section.title}</Text>
            </View>
            <View style={styles.menuGroup}>
              {section.items.map((item, iidx) => {
                const Icon = item.icon;
                return (
                  <TouchableOpacity
                    key={iidx}
                    style={[styles.menuItem, iidx === section.items.length - 1 && { borderBottomWidth: 0 }]}
                    onPress={() => navigation.navigate(item.route as any)}
                  >
                    <View style={styles.menuItemLeft}>
                      <View style={styles.menuIconWrap}>
                         <Icon size={16} color={colors.primary} />
                      </View>
                      <Text style={styles.menuItemLabel}>{item.label}</Text>
                    </View>
                    <ArrowRight size={14} color="#CCC" />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.logoutBtnModern} onPress={handleLogout} disabled={isLoggingOut}>
          {isLoggingOut ? <ActivityIndicator color="#fff" /> : <LogOut size={16} color="#FF4D4D" />}
          <Text style={styles.logoutBtnTextModern}>Thoát tài khoản</Text>
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
        <Image
          source={require('../../../assets/app_logo.png')}
          style={styles.headerLogo}
          resizeMode="contain"
        />
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
            <TouchableOpacity key={tab.key} style={styles.tabItem} onPress={() => handleTabPress(tab.key)}>
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
  headerLogo: {
    width: 140,
    height: 48,
  },
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
  primaryButtonText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  secondaryButtonText: { color: colors.primary, fontWeight: '700', fontSize: 13 },
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
  favoriteHintModern: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  favoriteHintTextModern: {
    flex: 1,
    color: colors.secondary,
    fontSize: 12,
    fontWeight: '600',
  },
  heroCardModern: {
    height: 190,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 6,
  },
  heroBackground: {
    flex: 1,
  },
  heroBackgroundImage: {
    borderRadius: 24,
  },
  heroGlassOverlay: {
    flex: 1,
    backgroundColor: 'rgba(16, 41, 55, 0.45)',
    padding: 20,
    justifyContent: 'space-between',
  },
  heroContent: {
    gap: 6,
  },
  heroTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  heroTagText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  heroTitleModern: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
  },
  heroDescModern: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 13,
    lineHeight: 18,
    maxWidth: '80%',
  },
  heroActionModern: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  heroBtnText: {
    color: colors.secondary,
    fontSize: 12,
    fontWeight: '700',
  },
  heroFloatingBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 8,
    borderRadius: 12,
  },
  heroRatingModern: {
    width: 60,
    height: 16,
  },
  quickActionCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  quickActionTitle: {
    color: colors.secondary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 16,
  },
  quickGridModern: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickItemModern: {
    width: '23%',
    aspectRatio: 1,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  quickIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabelModern: {
    color: colors.secondary,
    fontSize: 11,
    fontWeight: '600',
  },
  promoModernRow: {
    flexDirection: 'row',
    gap: 12,
  },
  promoModernItem: {
    flex: 1,
    height: 100,
    borderRadius: 20,
    overflow: 'hidden',
  },
  promoModernImage: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  promoModernImageInner: {
    borderRadius: 20,
  },
  promoModernOverlay: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  promoModernTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  promoModernBtn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  homeSectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleIndicator: {
    width: 6,
    height: 18,
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  homeSectionTitle: {
    color: colors.secondary,
    fontSize: 18,
    fontWeight: '800',
  },
  homeSeeAll: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  homeSeeAllText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
  },
  blogGridModern: {
    gap: 16,
  },
  blogCardModern: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F8FAFC',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    flexDirection: 'row',
  },
  blogCardFeatured: {
    flexDirection: 'column',
  },
  blogImageFeatured: {
    width: '100%',
    height: 180,
  },
  blogImageNormal: {
    width: 100,
    height: '100%',
    minHeight: 100,
  },
  blogContentModern: {
    padding: 16,
    flex: 1,
    justifyContent: 'center',
  },
  blogMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  blogTagModern: {
    fontSize: 9,
    fontWeight: '900',
    color: colors.primary,
    backgroundColor: '#FFF1F2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  blogDateModern: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  blogTitleModern: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.secondary,
    lineHeight: 22,
    marginBottom: 6,
  },
  blogDescModern: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 12,
  },
  blogFooterModern: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  blogReadMore: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  browseButtonModern: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
  },
  browseButtonTextModern: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  serviceHeroHeader: {
    paddingVertical: 8,
    gap: 6,
  },
  sectionEyebrow: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionTitleLarge: {
    color: colors.secondary,
    fontSize: 22,
    fontWeight: '800',
  },
  sectionSubtitle: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 20,
  },
  sectionBlock: {
    gap: 10,
  },
  sectionBlockHeader: {
    gap: 4,
  },
  sectionBlockTitle: {
    color: colors.secondary,
    fontSize: 16,
    fontWeight: '700',
  },
  sectionBlockTag: {
    color: colors.textLight,
    fontSize: 12,
    fontWeight: '600',
  },
  serviceHeroCardLarge: {
    borderRadius: 24,
    overflow: 'hidden',
    minHeight: 280,
    justifyContent: 'flex-end',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  serviceHeroCardImage: {
    borderRadius: 24,
  },
  serviceGlassOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    padding: 24,
    gap: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  serviceContentTop: {
    gap: 8,
  },
  serviceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  serviceTagText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  serviceMainTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
  },
  serviceMainDesc: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 4,
  },
  serviceActionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  servicePrimaryBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    flex: 1,
    alignItems: 'center',
  },
  servicePrimaryBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  serviceSecondaryBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    flex: 1,
    alignItems: 'center',
  },
  serviceSecondaryBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  premiumBadge: {
    backgroundColor: '#F7EDDF',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  premiumBadgeText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  appointmentShortcut: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  appointmentInfo: {
    flex: 1,
    gap: 4,
  },
  appointmentTitle: {
    color: colors.secondary,
    fontSize: 16,
    fontWeight: '700',
  },
  appointmentSub: {
    color: colors.text,
    fontSize: 12,
  },
  appointmentBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.softPink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
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
  showcaseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  showcaseCard: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f1f1f1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  showcaseImageWrap: {
    height: 160,
    backgroundColor: '#f5f5f5',
    position: 'relative',
  },
  showcaseImage: {
    width: '100%',
    height: '100%',
  },
  showcaseBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  showcaseBadgePink: {
    backgroundColor: '#fb7185',
  },
  showcaseBadgeOrange: {
    backgroundColor: colors.primary,
  },
  showcaseBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  showcaseHeart: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  showcaseHeartActive: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#fb7185',
  },
  showcaseBody: {
    padding: 12,
  },
  showcaseCategory: {
    color: '#7f8aa3',
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 6,
  },
  showcaseTitle: {
    color: colors.secondary,
    fontWeight: '600',
    fontSize: 13,
    lineHeight: 20,
    minHeight: 58,
  },
  showcasePriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  showcasePrice: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  showcaseOldPrice: {
    color: '#98a4ba',
    fontSize: 11,
    textDecorationLine: 'line-through',
  },
  showcaseAddBtn: {
    marginTop: 12,
    backgroundColor: '#f7ecdf',
    borderRadius: 999,
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  showcaseAddText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 13,
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
  statusWrap: { paddingHorizontal: 12 },
  emptyBlog: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#fff',
    padding: 12,
    gap: 8,
  },
  emptyBlogText: { color: colors.text, fontSize: 12 },
  loadingWrap: { alignItems: 'center', justifyContent: 'center', marginTop: 40, gap: 8 },
  loadingText: { color: colors.text, fontSize: 13 },
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
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  profileAvatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#f5f5f5' },
  profileInfoText: { flex: 1, gap: 4 },
  profileName: { fontSize: 18, fontWeight: '800', color: colors.secondary },
  profileEmail: { fontSize: 13, color: '#7d7b7b' },
  menuSection: { marginBottom: 20 },
  menuSectionHeader: { paddingLeft: 8, marginBottom: 10 },
  menuSectionTitle: { fontSize: 13, fontWeight: '800', color: '#BBB', letterSpacing: 0.5 },
  menuGroup: { backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#F0F0F0' },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F9F9F9',
  },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#fff4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemLabel: { fontSize: 14, fontWeight: '600', color: colors.secondary },
  logoutBtnModern: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFEBEA',
    marginTop: 10,
  },
  logoutBtnTextModern: { fontSize: 14, fontWeight: '700', color: '#FF4D4D' },
});

export default HomeScreen;
