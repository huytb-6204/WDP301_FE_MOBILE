import React, { useMemo, useState } from 'react';
import {
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowRight,
  CheckCircle,
  Facebook,
  GraduationCap,
  Heart,
  Instagram,
  Mail,
  Menu,
  PawPrint,
  Scissors,
  Search,
  ShoppingCart,
  Star,
  Stethoscope,
  Twitter,
} from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { ProductCard } from '../../components/ui';
import type { ProductItem } from '../../types';

const heroImage = {
  uri: 'https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/06/h1-slider-imgs.png',
};

const services = [
  {
    icon: Scissors,
    title: 'Spa & Grooming',
    description: 'Tắm gội, cắt tỉa lông chuyên nghiệp',
  },
  {
    icon: Stethoscope,
    title: 'Khám sức khỏe',
    description: 'Bác sĩ thú y giàu kinh nghiệm',
  },
  {
    icon: GraduationCap,
    title: 'Huấn luyện',
    description: 'Đào tạo kỹ năng cơ bản đến nâng cao',
  },
  {
    icon: Heart,
    title: 'Khách sạn',
    description: 'Lưu trú an toàn, thoải mái',
  },
];

const storyFeatures = [
  {
    title: 'Đội ngũ chuyên nghiệp',
    desc: 'Bác sĩ thú y, groomer được đào tạo bài bản',
  },
  {
    title: 'Cơ sở hiện đại',
    desc: 'Trang thiết bị y tế và grooming cao cấp',
  },
  {
    title: 'Yêu thương thật sự',
    desc: 'Chúng tôi đối xử với thú cưng như gia đình',
  },
];

const stats = [
  { value: '240+', label: 'Đã bán', gradient: ['#FF6262', '#FF9466'], textColor: '#fff' },
  { value: '35+', label: 'Thành viên', gradient: ['#102937', '#102937'], textColor: '#fff' },
  { value: '10K+', label: 'Hài lòng', gradient: ['#FFF0F0', '#FFF0F0'], textColor: '#FF6262' },
  { value: '99+', label: 'Sản phẩm', gradient: ['#FFF3E2', '#FFF3E2'], textColor: '#FF6262' },
];

const blogItems = [
  {
    image:
      'https://images.unsplash.com/photo-1707595114464-f7e953d5f3bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXQlMjB0cmFpbmluZyUyMGRvZ3xlbnwxfHx8fDE3NzAxODgzNzJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    title: '5 mẹo huấn luyện chó con hiệu quả',
    excerpt:
      'Khám phá những phương pháp đơn giản giúp chó con của bạn học nhanh hơn và vui vẻ hơn trong quá trình huấn luyện.',
    date: '28 Tháng 1, 2026',
  },
  {
    image:
      'https://images.unsplash.com/photo-1759164955427-14ca448a839d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2ZXRlcmluYXJ5JTIwY2FyZSUyMHBldHxlbnwxfHx8fDE3NzAxODgzNzF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Lịch tiêm phòng cho thú cưng đầy đủ',
    excerpt:
      'Hướng dẫn chi tiết về các loại vaccine cần thiết và thời điểm tiêm phòng phù hợp cho chó mèo.',
    date: '15 Tháng 1, 2026',
  },
  {
    image:
      'https://images.unsplash.com/photo-1761203430273-0055d7b6ba7e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXRlJTIwcHVwcHklMjBncm9vbWluZ3xlbnwxfHx8fDE3NzAxODgzNzB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Chăm sóc lông cho chó mèo mùa hè',
    excerpt:
      'Những lưu ý quan trọng để giữ cho bộ lông thú cưng luôn khỏe mạnh và đẹp trong thời tiết nóng.',
    date: '2 Tháng 1, 2026',
  },
];

const HomeScreen = () => {
  const [cartCount] = useState(3);

  const featured = useMemo<ProductItem[]>(
    () => [
      {
        id: 'p1',
        title: 'Thức ăn cao cấp cho chó',
        price: '450.000đ',
        primaryImage:
          'https://images.unsplash.com/photo-1628009905847-f88cf8f697b0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXQlMjBmb29kJTIwZG9nfGVufDF8fHx8MTc3MDE4ODM3Mnww&ixlib=rb-4.1.0&q=80&w=1080',
        secondaryImage:
          'https://images.unsplash.com/photo-1628009905847-f88cf8f697b0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXQlMjBmb29kJTIwZG9nfGVufDF8fHx8MTc3MDE4ODM3Mnww&ixlib=rb-4.1.0&q=80&w=1080',
        rating: 5,
        isSale: true,
      },
      {
        id: 'p2',
        title: 'Đồ chơi nhai cho thú cưng',
        price: '120.000đ',
        primaryImage:
          'https://images.unsplash.com/photo-1766674331619-cbb423943039?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXQlMjB0b3klMjBjdXRlfGVufDF8fHx8MTc3MDE4ODM3Mnww&ixlib=rb-4.1.0&q=80&w=1080',
        secondaryImage:
          'https://images.unsplash.com/photo-1766674331619-cbb423943039?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXQlMjB0b3klMjBjdXRlfGVufDF8fHx8MTc3MDE4ODM3Mnww&ixlib=rb-4.1.0&q=80&w=1080',
        rating: 5,
        isSale: false,
      },
      {
        id: 'p3',
        title: 'Nhà mèo cao cấp',
        price: '890.000đ',
        primaryImage:
          'https://images.unsplash.com/photo-1759699068450-f02a82c0c6cc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMGNhdCUyMHBldHxlbnwxfHx8fDE3NzAxODgzNzJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
        secondaryImage:
          'https://images.unsplash.com/photo-1759699068450-f02a82c0c6cc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMGNhdCUyMHBldHxlbnwxfHx8fDE3NzAxODgzNzJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
        rating: 5,
        isSale: true,
      },
    ],
    []
  );

  const marqueeItems = useMemo(
    () => [
      { icon: Star, text: 'Ưu đãi mùa hè – Miễn phí ship đơn trên 300k' },
      { icon: PawPrint, text: 'Giảm 20% dịch vụ spa tháng này' },
      { icon: Heart, text: 'Tích điểm đổi quà hấp dẫn' },
    ],
    []
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.logoWrap}>
            <View style={styles.logoIcon}>
              <PawPrint size={18} color="#fff" />
            </View>
            <Text style={styles.logoText}>Teddy Pet</Text>
          </View>
          <TouchableOpacity style={styles.menuButton}>
            <Menu size={22} color={colors.secondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Search size={16} color={colors.text} style={styles.searchIcon} />
            <TextInput
              placeholder="Tìm kiếm sản phẩm"
              placeholderTextColor="#7a7a7a"
              style={styles.searchInput}
            />
          </View>
          <TouchableOpacity style={styles.cartButton}>
            <ShoppingCart size={18} color={colors.primary} />
            {cartCount > 0 ? (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        </View>

        <LinearGradient colors={['#FF6262', '#FF9466']} style={styles.hero}>
          <View style={styles.heroBadge}>
            <Star size={14} color="#fff" />
            <Text style={styles.heroBadgeText}>2k+ khách hàng hài lòng</Text>
          </View>
          <Text style={styles.heroTitle}>Chăm sóc thú cưng chuyên nghiệp</Text>
          <Text style={styles.heroDesc}>
            Dịch vụ spa, khám sức khỏe, huấn luyện và cửa hàng thú cưng uy tín hàng đầu Việt Nam
          </Text>
          <View style={styles.heroActions}>
            <TouchableOpacity style={styles.heroPrimary}>
              <Text style={styles.heroPrimaryText}>Xem thêm</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.heroSecondary}>
              <Text style={styles.heroSecondaryText}>Đặt lịch</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.heroImageWrap}>
            <Image source={heroImage} style={styles.heroImage} />
            <View style={styles.heroHeart}>
              <Heart size={18} color="#fff" />
            </View>
          </View>
        </LinearGradient>

        <View style={styles.section}>
          <Text style={styles.sectionSubtitle}>Dịch vụ của chúng tôi</Text>
          <Text style={styles.sectionTitle}>Chăm sóc toàn diện</Text>
          <Text style={styles.sectionDesc}>
            Từ spa, khám bệnh đến huấn luyện, chúng tôi có tất cả những gì thú cưng của bạn cần
          </Text>
          <View style={styles.servicesGrid}>
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <View key={service.title} style={styles.serviceCard}>
                  <View style={styles.serviceIcon}>
                    <Icon size={20} color={colors.primary} />
                  </View>
                  <Text style={styles.serviceTitle}>{service.title}</Text>
                  <Text style={styles.serviceDesc}>{service.description}</Text>
                  <View style={styles.serviceArrow}>
                    <ArrowRight size={14} color="#fff" />
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.storySection}>
          <View style={styles.storyImages}>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1705175975965-c25516b7fcd8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMHBldCUyMGRvZyUyMG93bmVyfGVufDF8fHx8MTc3MDE4ODM3MHww&ixlib=rb-4.1.0&q=80&w=1080',
              }}
              style={styles.storyImageMain}
            />
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1761203430273-0055d7b6ba7e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXRlJTIwcHVwcHklMjBncm9vbWluZ3xlbnwxfHx8fDE3NzAxODgzNzB8MA&ixlib=rb-4.1.0&q=80&w=1080',
              }}
              style={styles.storyImageSecond}
            />
          </View>
          <Text style={styles.sectionTitle}>Tại sao chọn Teddy Pet?</Text>
          <View style={styles.storyList}>
            {storyFeatures.map((feature) => (
              <View key={feature.title} style={styles.storyItem}>
                <View style={styles.storyDot}>
                  <CheckCircle size={16} color={colors.primary} />
                </View>
                <View style={styles.storyContent}>
                  <Text style={styles.storyTitle}>{feature.title}</Text>
                  <Text style={styles.storyDesc}>{feature.desc}</Text>
                </View>
              </View>
            ))}
          </View>
          <TouchableOpacity style={styles.storyButton}>
            <Text style={styles.storyButtonText}>Đặt lịch ngay</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsGrid}>
          {stats.map((stat) => (
            <LinearGradient
              key={stat.label}
              colors={stat.gradient}
              style={styles.statCard}
            >
              <Text style={[styles.statValue, { color: stat.textColor }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: stat.textColor }]}>{stat.label}</Text>
            </LinearGradient>
          ))}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.marquee}>
          {marqueeItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <View key={`${item.text}-${index}`} style={styles.marqueeItem}>
                <Icon size={14} color="#fff" />
                <Text style={styles.marqueeText}>{item.text}</Text>
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Sản phẩm nổi bật</Text>
            <TouchableOpacity style={styles.seeAll}>
              <Text style={styles.seeAllText}>Xem tất cả</Text>
              <ArrowRight size={14} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionDesc}>Những sản phẩm được yêu thích nhất</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productRow}>
            {featured.map((item) => (
              <View key={item.id} style={styles.productCardWrap}>
                <ProductCard product={item} />
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.blogSection}>
          <Text style={styles.sectionTitle}>Tin tức & Mẹo hay</Text>
          <Text style={styles.sectionDesc}>Cập nhật kiến thức chăm sóc thú cưng</Text>
          {blogItems.map((blog) => (
            <View key={blog.title} style={styles.blogCard}>
              <Image source={{ uri: blog.image }} style={styles.blogImage} />
              <View style={styles.blogContent}>
                <Text style={styles.blogDate}>{blog.date}</Text>
                <Text style={styles.blogTitle} numberOfLines={2}>
                  {blog.title}
                </Text>
                <Text style={styles.blogExcerpt} numberOfLines={2}>
                  {blog.excerpt}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerTitle}>Nhận tin tức mới nhất</Text>
          <View style={styles.footerInputRow}>
            <View style={styles.footerInputWrap}>
              <Mail size={14} color="#fff" />
              <TextInput
                placeholder="Email của bạn"
                placeholderTextColor="rgba(255,255,255,0.6)"
                style={styles.footerInput}
              />
            </View>
            <TouchableOpacity style={styles.footerButton}>
              <Text style={styles.footerButtonText}>Gửi</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.footerSocials}>
            <View style={styles.footerSocialButton}>
              <Facebook size={16} color="#fff" />
            </View>
            <View style={styles.footerSocialButton}>
              <Instagram size={16} color="#fff" />
            </View>
            <View style={styles.footerSocialButton}>
              <Twitter size={16} color="#fff" />
            </View>
          </View>
          <View style={styles.footerLinks}>
            {['Về chúng tôi', 'Dịch vụ', 'Sản phẩm', 'Liên hệ'].map((item) => (
              <Text key={item} style={styles.footerLinkText}>
                {item}
              </Text>
            ))}
          </View>
          <Text style={styles.footerCopy}>© 2026 Teddy Pet. All rights reserved.</Text>
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
    paddingBottom: 32,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    marginTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0,
  },
  logoWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: colors.secondary,
    fontSize: 18,
    fontWeight: '700',
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.softPink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: {
    fontSize: 20,
    color: colors.secondary,
  },
  searchRow: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 6,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    backgroundColor: '#f3f3f5',
    borderRadius: 999,
    height: 46,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.secondary,
  },
  cartButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.softPink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartIcon: {
    fontSize: 18,
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  hero: {
    marginTop: 12,
    marginHorizontal: 20,
    borderRadius: 28,
    padding: 20,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  heroTitle: {
    color: '#fff',
    fontSize: 21,
    fontWeight: '800',
    lineHeight: 26,
  },
  heroDesc: {
    color: 'rgba(255,255,255,0.9)',
    marginTop: 10,
    marginBottom: 16,
  },
  heroActions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  heroPrimary: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 999,
    alignItems: 'center',
    paddingVertical: 12,
  },
  heroPrimaryText: {
    color: colors.primary,
    fontWeight: '700',
  },
  heroSecondary: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 999,
    alignItems: 'center',
    paddingVertical: 12,
  },
  heroSecondaryText: {
    color: '#fff',
    fontWeight: '700',
  },
  heroImageWrap: {
    alignItems: 'center',
    marginTop: 10,
  },
  heroImage: {
    width: '100%',
    height: 170,
    borderRadius: 24,
  },
  heroHeart: {
    position: 'absolute',
    right: 14,
    bottom: -12,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroHeartText: {
    fontSize: 18,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionSubtitle: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
  },
  sectionTitle: {
    color: colors.secondary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  sectionDesc: {
    color: colors.text,
    fontSize: 12,
  },
  servicesGrid: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  serviceCard: {
    width: '47%',
    backgroundColor: colors.softPink,
    borderRadius: 20,
    padding: 14,
    paddingBottom: 46,
    minHeight: 168,
  },
  serviceIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  serviceTitle: {
    color: colors.secondary,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  serviceDesc: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 16,
  },
  serviceArrow: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceArrowText: {
    color: '#fff',
    fontWeight: '700',
  },
  storySection: {
    marginTop: 20,
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 22,
    backgroundColor: colors.softOrange,
  },
  storyImages: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  storyImageMain: {
    width: '55%',
    height: 150,
    borderRadius: 20,
  },
  storyImageSecond: {
    width: '45%',
    height: 150,
    borderRadius: 20,
    marginTop: 16,
  },
  storyList: {
    marginTop: 12,
    gap: 12,
  },
  storyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  storyDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  storyDotText: {
    color: colors.primary,
    fontWeight: '700',
  },
  storyContent: {
    flex: 1,
  },
  storyTitle: {
    color: colors.secondary,
    fontWeight: '700',
    marginBottom: 2,
  },
  storyDesc: {
    color: colors.text,
    fontSize: 12,
  },
  storyButton: {
    marginTop: 14,
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
    marginTop: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  statCard: {
    width: '47%',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    marginTop: 6,
    fontSize: 12,
  },
  marquee: {
    marginTop: 14,
    marginHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: colors.secondary,
    borderRadius: 999,
  },
  marqueeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 12,
  },
  marqueeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  seeAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  seeAllText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  seeAllIcon: {
    color: colors.primary,
    fontSize: 14,
  },
  productRow: {
    marginTop: 10,
  },
  productCardWrap: {
    width: 220,
    marginRight: 14,
  },
  blogSection: {
    marginTop: 20,
    backgroundColor: colors.softPink,
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  blogCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 12,
  },
  blogImage: {
    width: '100%',
    height: 140,
  },
  blogContent: {
    padding: 14,
  },
  blogDate: {
    fontSize: 11,
    color: colors.text,
    marginBottom: 4,
  },
  blogTitle: {
    fontSize: 14,
    color: colors.secondary,
    fontWeight: '700',
    marginBottom: 4,
  },
  blogExcerpt: {
    fontSize: 12,
    color: colors.text,
  },
  footer: {
    backgroundColor: colors.secondary,
    marginTop: 18,
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  footerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  footerInputRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  footerInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 999,
    paddingHorizontal: 12,
    height: 40,
  },
  footerIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  footerInput: {
    flex: 1,
    color: '#fff',
    fontSize: 12,
  },
  footerButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
  },
  footerButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  footerSocials: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 14,
  },
  footerSocialButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerSocialText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  footerLinks: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  footerLinkText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  footerCopy: {
    marginTop: 14,
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    textAlign: 'center',
  },
});

export default HomeScreen;
