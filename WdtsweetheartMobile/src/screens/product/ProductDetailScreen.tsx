import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useCart } from '../../context/CartContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { ArrowLeft, Heart, ShoppingCart, Star } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import type { RootStackParamList } from '../../navigation/types';
import { env } from '../../config';
import { getProductDetail, type Product } from '../../services/api/product';
import { Toast } from '../../components/common';

// Import thêm hàm formatPrice của bạn
import { formatPrice } from '../../utils'; 

type ProductDetailScreenRouteProp = RouteProp<RootStackParamList, 'ProductDetail'>;
type ProductDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

type UIProduct = {
  id: string;
  title: string;
  price: string;
  primaryImage: string;
  secondaryImage?: string;
  rating: number;
  isSale: boolean;
  priceValue: number;
  originalPrice?: string;
};

const toAbsoluteUrl = (url?: string) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  const trimmed = url.replace(/^\/+/, '');
  return `${env.apiBaseUrl}/${trimmed}`;
};

const mapToUIProduct = (item: Product): UIProduct => {
  const priceValue = item.priceNew ?? item.priceOld ?? 0;
  const originalPrice =
    item.priceOld && item.priceNew && item.priceOld > item.priceNew
      ? formatPrice(item.priceOld)
      : undefined;

  return {
    id: item._id,
    title: item.name,
    price: formatPrice(priceValue),
    primaryImage: toAbsoluteUrl(item.images?.[0]),
    secondaryImage: toAbsoluteUrl(item.images?.[1] || item.images?.[0]),
    rating: 5,
    isSale: !!originalPrice,
    priceValue,
    originalPrice,
  };
};

const ProductDetailScreen = () => {
  const { addToCart } = useCart();
  const navigation = useNavigation<ProductDetailScreenNavigationProp>();
  const route = useRoute<ProductDetailScreenRouteProp>();
  const { productSlug, product: initialProduct } = route.params;

  const [product, setProduct] = useState<UIProduct | null>(() => {
    if (!initialProduct) return null;
    return {
      ...initialProduct,
      primaryImage: toAbsoluteUrl(initialProduct.primaryImage),
      secondaryImage: toAbsoluteUrl(initialProduct.secondaryImage),
    } as UIProduct;
  });
  const [loading, setLoading] = useState(!initialProduct);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastVisible(false), 1400);
  };

  useEffect(() => {
    let active = true;
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const detail = await getProductDetail(productSlug);
        if (active) {
          setProduct(mapToUIProduct(detail.productDetail));
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Không thể tải sản phẩm');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchDetail();
    return () => {
      active = false;
    };
  }, [productSlug]);

  const totalPrice = useMemo(() => {
    if (!product) return formatPrice(0);
    return formatPrice(product.priceValue * quantity);
  }, [product, quantity]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    showToast(`Đã thêm ${quantity} sản phẩm vào giỏ`);
  };

  const handleBuyNow = () => {
    if (!product) return;
    alert(`Tiến hành thanh toán ${totalPrice}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết sản phẩm</Text>
        <TouchableOpacity onPress={() => setIsFavorite(!isFavorite)}>
            
          <Heart
            size={24}
            color={isFavorite ? colors.primary : colors.text}
            fill={isFavorite ? colors.primary : 'none'}
          />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>Đang tải sản phẩm...</Text>
        </View>
      ) : error || !product ? (
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>
            {error || 'Không tìm thấy thông tin sản phẩm'}
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Image Section */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: product.primaryImage }} style={styles.mainImage} />
          {product.isSale && (
            <View style={styles.saleBadge}>
              <Text style={styles.saleBadgeText}>SALE</Text>
            </View>
          )}
        </View>

        {/* Thumbnail Images */}
        <View style={styles.thumbnailRow}>
          <View style={[styles.thumbnail, styles.thumbnailActive]}>
            <Image source={{ uri: product.primaryImage }} style={styles.thumbnailImage} />
          </View>
          {product.secondaryImage && (
            <View style={styles.thumbnail}>
              <Image source={{ uri: product.secondaryImage }} style={styles.thumbnailImage} />
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.title}>{product.title}</Text>

          {/* Rating */}
          <View style={styles.ratingContainer}>
            <View style={styles.ratingStars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={16}
                  color={star <= Math.floor(product.rating) ? '#FFB800' : '#D9D9D9'}
                  fill={star <= Math.floor(product.rating) ? '#FFB800' : 'none'}
                />
              ))}
            </View>
            <Text style={styles.ratingValue}>{product.rating.toFixed(1)}</Text>
            <Text style={styles.reviewCount}>(125 đánh giá)</Text>
          </View>

          {/* Price */}
          <View style={styles.priceContainer}>
            <Text style={styles.currentPrice}>{product.price}</Text>
            {product.originalPrice && (
              <Text style={styles.originalPrice}>{product.originalPrice}</Text>
            )}
          </View>

          {/* Description */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.sectionTitle}>Mô tả sản phẩm</Text>
            <Text style={styles.description}>
              {product.title} là sản phẩm chất lượng cao, được chọn lọc kỹ lưỡng để mang lại
              những trải nghiệm tốt nhất cho thú cưng của bạn. Sản phẩm được sản xuất từ các
              nguyên liệu an toàn, không độc hại.{'\n\n'}
              ✓ Chất lượng đảm bảo{'\n'}
              ✓ Giá cả hợp lý{'\n'}
              ✓ Giao hàng nhanh chóng
            </Text>
          </View>

          {/* Quantity Selector */}
          <View style={styles.quantityContainer}>
            <Text style={styles.sectionTitle}>Số lượng</Text>
            <View style={styles.quantityControl}>
              <TouchableOpacity
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                style={styles.quantityButton}
              >
                <Text style={styles.quantityButtonText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.quantityValue}>{quantity}</Text>
              <TouchableOpacity
                onPress={() => setQuantity(quantity + 1)}
                style={styles.quantityButton}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Shipping Info */}
          <View style={styles.shippingContainer}>
            <Text style={styles.sectionTitle}>Thông tin giao hàng</Text>
            <View style={styles.shippingInfo}>
              <Text style={styles.shippingLabel}>📦 Giao hàng miễn phí từ 500.000đ</Text>
              <Text style={styles.shippingLabel}>⏱️ Giao hàng trong 1-3 ngày</Text>
              <Text style={styles.shippingLabel}>🔄 Trả hàng miễn phí trong 7 ngày</Text>
            </View>
          </View>
        </View>
      </ScrollView>
      )}

      {/* Action Buttons */}
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
          <ShoppingCart size={20} color="#fff" />
          <Text style={styles.addToCartText}>Thêm giỏ</Text>
        </TouchableOpacity>
        
        {/* Nút Mua ngay được cập nhật hiển thị giá tiền */}
        <TouchableOpacity style={styles.buyNowButton} onPress={handleBuyNow}>
          <Text style={styles.buyNowText}>Mua ngay</Text>
          <Text style={styles.buyNowPrice}>{totalPrice}</Text>
        </TouchableOpacity>
      </View>

      <Toast visible={toastVisible} message={toastMessage} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // ... (giữ nguyên các style cũ của bạn từ đầu đến addToCartText) ...
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  statusContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  statusText: { fontSize: 14, color: colors.text, textAlign: 'center' },
  scrollContent: { paddingTop: 8, paddingBottom: 100 },
  imageContainer: { position: 'relative', width: '100%', height: 350, backgroundColor: colors.softPink },
  mainImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  saleBadge: { position: 'absolute', top: 16, right: 16, backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  saleBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  thumbnailRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  thumbnail: { width: 80, height: 80, borderRadius: 12, overflow: 'hidden', backgroundColor: colors.softPink, borderWidth: 2, borderColor: 'transparent' },
  thumbnailActive: { borderColor: colors.primary },
  thumbnailImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  infoContainer: { paddingHorizontal: 16 },
  title: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 12, lineHeight: 24 },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 },
  ratingStars: { flexDirection: 'row', gap: 4 },
  ratingValue: { fontSize: 14, fontWeight: '600', color: colors.text },
  reviewCount: { fontSize: 12, color: '#999999' },
  priceContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
  currentPrice: { fontSize: 20, fontWeight: '700', color: colors.primary },
  originalPrice: { fontSize: 14, color: '#999999', textDecorationLine: 'line-through' },
  descriptionContainer: { marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 10 },
  description: { fontSize: 13, color: colors.text, lineHeight: 20 },
  quantityContainer: { marginBottom: 20 },
  quantityControl: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 10 },
  quantityButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.softPink, alignItems: 'center', justifyContent: 'center' },
  quantityButtonText: { fontSize: 20, fontWeight: '600', color: colors.primary },
  quantityValue: { fontSize: 16, fontWeight: '600', color: colors.text, minWidth: 40, textAlign: 'center' },
  shippingContainer: { marginBottom: 20, padding: 12, borderRadius: 12, backgroundColor: colors.softPink },
  shippingInfo: { gap: 8 },
  shippingLabel: { fontSize: 12, color: colors.text, lineHeight: 18 },
  actionBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 12, paddingBottom: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: colors.border },
  addToCartButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, backgroundColor: colors.primary, borderRadius: 12 },
  addToCartText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  
  // -- CẬP NHẬT STYLE NÚT MUA NGAY --
  buyNowButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10, // Giảm một chút padding dọc do có 2 dòng text
    backgroundColor: colors.secondary,
    borderRadius: 12,
  },
  buyNowText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  buyNowPrice: {
    fontSize: 12,
    fontWeight: '500',
    color: '#fff',
    marginTop: 2,
  },
});

export default ProductDetailScreen;
