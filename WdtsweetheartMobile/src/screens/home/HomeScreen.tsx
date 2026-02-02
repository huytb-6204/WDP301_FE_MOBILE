import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { useProducts } from '../../hooks/useProducts';
import { formatPrice } from '../../utils';
import { ProductCard } from '../../components/ui';
import { SectionTitle, StatusMessage } from '../../components/common';
import { login, logout, AuthUser } from '../../services/api/auth';
import type { ProductItem } from '../../types';

const heroImage = {
  uri: 'https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/06/h1-slider-imgs.png',
};

const ratingImage = {
  uri: 'https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/06/rate-group-img.png',
};

const services = [
  {
    image: 'https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/06/service-png-img-alt-04.png',
    title: 'Đồ dùng thú cưng',
    description: 'Cung cấp đầy đủ các sản phẩm chăm sóc và phụ kiện chất lượng cao cho thú cưng.',
  },
  {
    image: 'https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/06/service-png-img-alt-08.png',
    title: 'Vui chơi',
    description: 'Các hoạt động thể chất và vui chơi giúp thú cưng khỏe mạnh và năng động.',
  },
  {
    image: 'https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/06/service-png-img-alt-07.png',
    title: 'Nhà thú cưng',
    description: 'Cung cấp không gian sống an toàn và thoải mái nhất cho thú cưng yêu quý.',
  },
  {
    image: 'https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/06/service-png-img-alt-05.png',
    title: 'Yêu thương',
    description: 'Đồng hành cùng bạn trong hành trình tìm kiếm và nhận nuôi thú cưng phù hợp nhất.',
  },
];

const storyImages = [
  'https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/05/h1-filler-counter-img-1.jpg',
  'https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/05/h1-filler-counter-img-2.jpg',
];

const storyFeatures = [
  'Dịch vụ chăm sóc thú cưng cao cấp và chuyên nghiệp',
  'Chăm sóc tận tâm với tình yêu thương dành cho thú cưng',
  'Mang lại hạnh phúc qua việc chăm sóc đúng cách',
];

const stats = [
  { value: '240+', label: 'Đã bán' },
  { value: '35+', label: 'Thành viên' },
  { value: '10K+', label: 'Hài lòng' },
  { value: '99+', label: 'Sản phẩm' },
];

const HomeScreen = () => {
  const navigation = useNavigation();
  const { data, loading, error, refetch } = useProducts();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  const featured = useMemo<ProductItem[]>(() => {
    return (data || []).slice(0, 4).map((item) => ({
      id: item._id,
      title: item.name,
      price: formatPrice(item.priceNew || item.priceOld || 0),
      primaryImage: item.images?.[0] || '',
      secondaryImage: item.images?.[1] || item.images?.[0] || '',
      rating: 5,
      isSale: (item.priceOld || 0) > (item.priceNew || 0),
    }));
  }, [data]);

  const handleLogin = async () => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      const res = await login(email.trim(), password, true);
      if (!res) {
        setAuthError('Đăng nhập thất bại');
      } else {
        setUser(res);
        setEmail('');
        setPassword('');
      }
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Đăng nhập thất bại');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    setAuthLoading(true);
    try {
      await logout();
      setUser(null);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Đăng xuất thất bại');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <LinearGradient colors={['#FF6262', '#FF9466']} style={styles.hero}>
          <Text style={styles.heroSubtitle}>Kết Nối Yêu Thương Cùng Thú Cưng</Text>
          <Text style={styles.heroTitle}>Khởi đầu hành trình của mỗi thú cưng với tình yêu thương.</Text>
          <Text style={styles.heroDesc}>
            Trải nghiệm những khoảnh khắc đáng nhớ cùng thú cưng của bạn. Chúng tôi mang đến sự chăm sóc,
            niềm vui và kết nối tuyệt vời cho mọi hành trình.
          </Text>
          <View style={styles.heroActions}>
            <TouchableOpacity onPress={() => navigation.navigate('ProductList' as never)} style={styles.heroButton}>
              <Text style={styles.heroButtonText}>Xem thêm</Text>
            </TouchableOpacity>
            <View style={styles.heroRating}>
              <Image source={ratingImage} style={styles.heroRatingImage} />
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>2k+</Text>
              </View>
              <Text style={styles.heroRatingText}>Khách hàng hài lòng</Text>
            </View>
          </View>
          <Image source={heroImage} style={styles.heroImage} />
        </LinearGradient>

        <View style={styles.authCard}>
          <View style={styles.authHeader}>
            <Text style={styles.authTitle}>Tài khoản</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
              <Text style={styles.authLink}>Đi tới đăng nhập</Text>
            </TouchableOpacity>
          </View>
          {user ? (
            <>
              <Text style={styles.authWelcome}>Xin chào, {user.fullName}</Text>
              <Text style={styles.authSub}>{user.email}</Text>
              <TouchableOpacity onPress={handleLogout} style={styles.authButton} disabled={authLoading}>
                <Text style={styles.authButtonText}>{authLoading ? 'Đang xử lý...' : 'Đăng xuất'}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.inputGroup}>
                <TextInput
                  placeholder="Email"
                  placeholderTextColor="#999"
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <TextInput
                  placeholder="Mật khẩu"
                  placeholderTextColor="#999"
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
              {authError ? <Text style={styles.authError}>{authError}</Text> : null}
              <TouchableOpacity onPress={handleLogin} style={styles.authButton} disabled={authLoading}>
                <Text style={styles.authButtonText}>{authLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.section}>
          <SectionTitle
            subtitle="Phục vụ nhu cầu thú cưng"
            title="Khám phá dịch vụ cho thú cưng"
            description="Mang đến các dịch vụ chăm sóc, huấn luyện và vui chơi cho thú cưng một cách toàn diện."
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.serviceRow}>
            {services.map((service) => (
              <View key={service.title} style={styles.serviceCard}>
                <Image source={{ uri: service.image }} style={styles.serviceImage} />
                <Text style={styles.serviceTitle}>{service.title}</Text>
                <Text style={styles.serviceDesc}>{service.description}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={[styles.section, styles.storySection]}>
          <View style={styles.storyImages}>
            <Image source={{ uri: storyImages[0] }} style={styles.storyImageLarge} />
            <Image source={{ uri: storyImages[1] }} style={styles.storyImageSmall} />
          </View>
          <SectionTitle
            align="left"
            subtitle="Câu chuyện của chúng tôi"
            title="Chăm sóc thú cưng với tất cả tình yêu thương"
            description="Với nhiều năm kinh nghiệm và tình yêu dành cho động vật, chúng tôi cam kết mang đến dịch vụ chăm sóc thú cưng tốt nhất."
          />
          <View style={styles.storyList}>
            {storyFeatures.map((item) => (
              <View key={item} style={styles.storyItem}>
                <View style={styles.storyDot} />
                <Text style={styles.storyText}>{item}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity style={styles.storyButton}>
            <Text style={styles.storyButtonText}>Đặt lịch ngay</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsGrid}>
          {stats.map((item) => (
            <View key={item.label} style={styles.statCard}>
              <Text style={styles.statValue}>{item.value}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.runningBanner}>
          <Text style={styles.runningText}>LOVE YOUR PETS • </Text>
          <Text style={styles.runningText}>SWEETHEART • </Text>
          <Text style={styles.runningText}>PET CARE • </Text>
          <Text style={styles.runningText}>LOVE YOUR PETS • </Text>
          <Text style={styles.runningText}>SWEETHEART • </Text>
        </ScrollView>

        <View style={styles.section}>
          <SectionTitle title="Sản phẩm nổi bật" subtitle="Cửa hàng" />
          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
            </View>
          ) : error ? (
            <StatusMessage message={error} actionText="Thử lại" onAction={refetch} />
          ) : (
            <View style={styles.grid}>
              {featured.map((item) => (
                <View key={item.id} style={styles.gridItem}>
                  <ProductCard product={item} />
                </View>
              ))}
            </View>
          )}
          <TouchableOpacity
            onPress={() => navigation.navigate('ProductList' as never)}
            style={styles.secondaryCta}
          >
            <Text style={styles.secondaryCtaText}>Xem tất cả sản phẩm</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    paddingBottom: 40,
  },
  hero: {
    padding: 20,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  heroSubtitle: {
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 12,
    marginBottom: 8,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 32,
  },
  heroDesc: {
    color: '#fff',
    marginTop: 10,
    marginBottom: 16,
  },
  heroActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  heroButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
  },
  heroButtonText: {
    color: colors.secondary,
    fontWeight: '700',
  },
  heroRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroRatingImage: {
    width: 80,
    height: 40,
    resizeMode: 'contain',
  },
  heroBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e67e20',
  },
  heroBadgeText: {
    color: '#fff',
    fontWeight: '700',
  },
  heroRatingText: {
    color: '#fff',
    fontSize: 12,
    width: 90,
  },
  heroImage: {
    width: '100%',
    height: 240,
    resizeMode: 'contain',
    marginTop: 20,
  },
  authCard: {
    marginHorizontal: 20,
    marginTop: -30,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  authHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  authTitle: {
    color: colors.secondary,
    fontSize: 16,
    fontWeight: '700',
  },
  authLink: {
    color: colors.primary,
    fontWeight: '700',
  },
  authWelcome: {
    color: colors.secondary,
    fontSize: 16,
    fontWeight: '700',
  },
  authSub: {
    color: colors.text,
    marginTop: 4,
    marginBottom: 12,
  },
  inputGroup: {
    gap: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: colors.secondary,
    backgroundColor: '#fff',
  },
  authError: {
    color: colors.primary,
    marginTop: 8,
    fontSize: 12,
  },
  authButton: {
    marginTop: 12,
    backgroundColor: colors.secondary,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
  },
  authButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  serviceRow: {
    paddingVertical: 10,
    gap: 16,
  },
  serviceCard: {
    width: 220,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  serviceImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  serviceTitle: {
    color: colors.secondary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  serviceDesc: {
    color: colors.text,
    fontSize: 13,
  },
  storySection: {
    backgroundColor: colors.softOrange,
    marginTop: 30,
    paddingBottom: 24,
    borderRadius: 24,
  },
  storyImages: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  storyImageLarge: {
    width: '55%',
    height: 180,
    borderRadius: 20,
  },
  storyImageSmall: {
    width: '45%',
    height: 180,
    borderRadius: 20,
    marginTop: 20,
  },
  storyList: {
    marginTop: 8,
    gap: 10,
  },
  storyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  storyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginTop: 6,
  },
  storyText: {
    color: colors.secondary,
    flex: 1,
  },
  storyButton: {
    marginTop: 16,
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
  },
  storyButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  statsGrid: {
    marginTop: 24,
    paddingHorizontal: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statCard: {
    width: '47%',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    color: colors.secondary,
    fontSize: 20,
    fontWeight: '800',
  },
  statLabel: {
    marginTop: 6,
    color: colors.text,
  },
  runningBanner: {
    marginTop: 24,
    marginHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.secondary,
    borderRadius: 999,
  },
  runningText: {
    color: '#fff',
    fontWeight: '600',
    marginHorizontal: 12,
    letterSpacing: 1,
  },
  loadingBox: {
    alignItems: 'center',
    marginTop: 12,
  },
  loadingText: {
    color: colors.text,
    marginTop: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 12,
  },
  gridItem: {
    width: '48%',
  },
  secondaryCta: {
    marginTop: 20,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
  },
  secondaryCtaText: {
    color: colors.primary,
    fontWeight: '700',
  },
});

export default HomeScreen;
