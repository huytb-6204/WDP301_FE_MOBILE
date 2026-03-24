import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { ArrowLeft, Heart, ShoppingCart, Star } from 'lucide-react-native';
import { useCart } from '../../context/CartContext';
import { useFavorites } from '../../context/FavoritesContext';
import { colors } from '../../theme/colors';
import type { RootStackParamList } from '../../navigation/types';
import { env } from '../../config';
import { getProductDetail, type Product, type ProductAttribute, type ProductVariant } from '../../services/api/product';
import { Toast } from '../../components/common';
import { formatPrice } from '../../utils';

type ProductDetailScreenRouteProp = RouteProp<RootStackParamList, 'ProductDetail'>;
type ProductDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

type UIProduct = {
  id: string;
  slug?: string;
  title: string;
  price: string;
  primaryImage: string;
  secondaryImage?: string;
  rating: number;
  isSale: boolean;
  priceValue: number;
  originalPrice?: string;
  stock?: number;
  variants?: ProductVariant[];
  description?: string;
  content?: string;
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
    slug: item.slug,
    title: item.name,
    price: formatPrice(priceValue),
    primaryImage: toAbsoluteUrl(item.images?.[0]),
    secondaryImage: toAbsoluteUrl(item.images?.[1] || item.images?.[0]),
    rating: 5,
    isSale: !!originalPrice,
    priceValue,
    originalPrice,
    stock: item.stock,
    variants: item.variants,
    description: item.description,
    content: item.content,
  };
};

const toPlainText = (value?: string) => {
  if (!value) return '';

  return value
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<li>/gi, '• ')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
};

const ProductDetailScreen = () => {
  const { addToCart, replaceCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
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
  const [attributeList, setAttributeList] = useState<ProductAttribute[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
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
          setAttributeList(detail.attributeList || []);
          setSelectedOptions({});
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

  const currentVariant = useMemo(() => {
    if (!product?.variants || product.variants.length === 0 || attributeList.length === 0) return null;
    return (
      product.variants.find((variant) => {
        if (variant.status === false) return false;
        return (variant.attributeValue || []).every((attribute) => selectedOptions[attribute.attrId] === attribute.value);
      }) || null
    );
  }, [attributeList.length, product?.variants, selectedOptions]);

  const canAddToCart = useMemo(() => {
    if (!product) return false;
    if (attributeList.length === 0) return true;
    return Object.keys(selectedOptions).length === attributeList.length && !!currentVariant;
  }, [attributeList.length, currentVariant, product, selectedOptions]);

  const currentPriceValue = useMemo(() => {
    if (!product) return 0;
    if (currentVariant?.priceNew !== undefined) return Number(currentVariant.priceNew) || 0;
    if (product.variants && product.variants.length > 0) {
      const prices = product.variants
        .filter((variant) => variant.status !== false)
        .map((variant) => Number(variant.priceNew) || 0)
        .filter((price) => price > 0);
      if (prices.length > 0) return Math.min(...prices);
    }
    return product.priceValue;
  }, [currentVariant, product]);

  const currentOriginalPrice = useMemo(() => {
    if (!product) return undefined;
    const priceOld = currentVariant?.priceOld !== undefined ? Number(currentVariant.priceOld) || 0 : product.originalPrice ? Number(String(product.originalPrice).replace(/\D/g, '')) || 0 : 0;
    return priceOld > currentPriceValue ? formatPrice(priceOld) : undefined;
  }, [currentPriceValue, currentVariant, product]);

  const maxStock = useMemo(() => {
    if (currentVariant?.stock !== undefined) return Math.max(0, Number(currentVariant.stock) || 0);
    return Math.max(0, product?.stock || 0);
  }, [currentVariant, product]);

  useEffect(() => {
    if (maxStock <= 0) {
      setQuantity(0);
      return;
    }
    setQuantity((prev) => Math.min(Math.max(prev, 1), maxStock));
  }, [maxStock]);

  const totalPrice = useMemo(() => formatPrice(currentPriceValue * quantity), [currentPriceValue, quantity]);

  const detailDescription = useMemo(() => {
    const richContent = toPlainText(product?.content);
    if (richContent) return richContent;

    const shortDescription = toPlainText(product?.description);
    if (shortDescription) return shortDescription;

    return `${product?.title || 'Sản phẩm'} là sản phẩm chất lượng cao, được chọn lọc kỹ lưỡng để mang lại những trải nghiệm tốt nhất cho thú cưng của bạn.`;
  }, [product?.content, product?.description, product?.title]);

  const selectedVariant = useMemo(
    () =>
      currentVariant?.attributeValue?.map((item) => ({
        attrId: item.attrId,
        value: item.value,
        label: item.label,
      })) || undefined,
    [currentVariant]
  );

  const handleAddToCart = () => {
    if (!product || quantity <= 0 || !canAddToCart) return;
    addToCart(
      {
        ...product,
        priceValue: currentPriceValue,
        price: formatPrice(currentPriceValue),
        originalPrice: currentOriginalPrice,
      },
      quantity,
      selectedVariant
    );
    showToast(`Đã thêm ${quantity} sản phẩm vào giỏ`);
  };

  const handleBuyNow = () => {
    if (!product || quantity <= 0 || !canAddToCart) return;
    replaceCart(
      {
        ...product,
        priceValue: currentPriceValue,
        price: formatPrice(currentPriceValue),
        originalPrice: currentOriginalPrice,
      },
      quantity,
      selectedVariant
    );
    navigation.navigate('Checkout');
  };

  const handleSelectOption = (attrId: string, value: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [attrId]: value,
    }));
  };

  const favoriteActive = product ? isFavorite(product.id) : false;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết sản phẩm</Text>
        <TouchableOpacity onPress={() => product && toggleFavorite(product)} disabled={!product}>
          <Heart
            size={24}
            color={favoriteActive ? colors.primary : colors.text}
            fill={favoriteActive ? colors.primary : 'none'}
          />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>Đang tải sản phẩm...</Text>
        </View>
      ) : error || !product ? (
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>{error || 'Không tìm thấy thông tin sản phẩm'}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.imageContainer}>
            <Image source={{ uri: product.primaryImage }} style={styles.mainImage} />
            {product.isSale && (
              <View style={styles.saleBadge}>
                <Text style={styles.saleBadgeText}>SALE</Text>
              </View>
            )}
          </View>

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

          <View style={styles.infoContainer}>
            <Text style={styles.title}>{product.title}</Text>

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

            <View style={styles.priceContainer}>
              <Text style={styles.currentPrice}>{formatPrice(currentPriceValue)}</Text>
              {currentOriginalPrice ? <Text style={styles.originalPrice}>{currentOriginalPrice}</Text> : null}
            </View>

            {attributeList.length > 0 ? (
              <View style={styles.variantBlock}>
                <Text style={styles.sectionTitle}>Phân loại</Text>
                {attributeList.map((attribute) => (
                  <View key={attribute._id} style={styles.variantGroup}>
                    <Text style={styles.variantGroupTitle}>
                      {attribute.name}
                      {selectedOptions[attribute._id]
                        ? `: ${attribute.variantsLabel[attribute.variants.indexOf(selectedOptions[attribute._id])] || selectedOptions[attribute._id]}`
                        : ''}
                    </Text>
                    <View style={styles.variantOptions}>
                      {attribute.variants.map((value, index) => {
                        const active = selectedOptions[attribute._id] === value;
                        return (
                          <TouchableOpacity
                            key={`${attribute._id}-${value}`}
                            onPress={() => handleSelectOption(attribute._id, value)}
                            style={[styles.variantChip, active && styles.variantChipActive]}
                          >
                            <Text style={[styles.variantChipText, active && styles.variantChipTextActive]}>
                              {attribute.variantsLabel[index] || value}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                ))}
                {!canAddToCart ? <Text style={styles.variantHint}>Chọn đầy đủ phân loại để thêm vào giỏ hoặc mua ngay.</Text> : null}
              </View>
            ) : null}

            <View style={styles.descriptionContainer}>
              <Text style={styles.sectionTitle}>Mô tả sản phẩm</Text>
              <Text style={styles.description}>{detailDescription}</Text>
            </View>

            <View style={styles.quantityContainer}>
              <Text style={styles.sectionTitle}>Số lượng</Text>
              <View style={styles.quantityControl}>
                <TouchableOpacity
                  onPress={() => setQuantity(Math.max(maxStock > 0 ? 1 : 0, quantity - 1))}
                  style={styles.quantityButton}
                  disabled={maxStock === 0}
                >
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantityValue}>{quantity}</Text>
                <TouchableOpacity
                  onPress={() => setQuantity(Math.min(maxStock, quantity + 1))}
                  style={styles.quantityButton}
                  disabled={maxStock === 0}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.stockText}>{maxStock > 0 ? `Còn ${maxStock} sản phẩm` : 'Tạm hết hàng'}</Text>
            </View>

            <View style={styles.shippingContainer}>
              <Text style={styles.sectionTitle}>Thông tin giao hàng</Text>
              <View style={styles.shippingInfo}>
                <Text style={styles.shippingLabel}>Miễn phí giao hàng từ 500.000đ</Text>
                <Text style={styles.shippingLabel}>Giao hàng trong 1-3 ngày</Text>
                <Text style={styles.shippingLabel}>Đổi trả miễn phí trong 7 ngày</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      )}

      <View style={styles.actionBar}>
        <TouchableOpacity style={[styles.addToCartButton, (!canAddToCart || quantity <= 0) && styles.actionDisabled]} onPress={handleAddToCart} disabled={!canAddToCart || quantity <= 0}>
          <ShoppingCart size={20} color="#fff" />
          <Text style={styles.addToCartText}>Thêm giỏ</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.buyNowButton, (!canAddToCart || quantity <= 0) && styles.actionDisabled]} onPress={handleBuyNow} disabled={!canAddToCart || quantity <= 0}>
          <Text style={styles.buyNowText}>Mua ngay</Text>
          <Text style={styles.buyNowPrice}>{totalPrice}</Text>
        </TouchableOpacity>
      </View>

      <Toast visible={toastVisible} message={toastMessage} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  statusContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  statusText: { fontSize: 14, color: colors.text, textAlign: 'center' },
  scrollContent: { paddingTop: 8, paddingBottom: 100 },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 350,
    backgroundColor: colors.softPink,
  },
  mainImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  saleBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  saleBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  thumbnailRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.softPink,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailActive: { borderColor: colors.primary },
  thumbnailImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  infoContainer: { paddingHorizontal: 16 },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    lineHeight: 24,
  },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 },
  ratingStars: { flexDirection: 'row', gap: 4 },
  ratingValue: { fontSize: 14, fontWeight: '600', color: colors.text },
  reviewCount: { fontSize: 12, color: '#999999' },
  priceContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
  currentPrice: { fontSize: 20, fontWeight: '700', color: colors.primary },
  originalPrice: { fontSize: 14, color: '#999999', textDecorationLine: 'line-through' },
  variantBlock: { marginBottom: 20 },
  variantGroup: { marginBottom: 14 },
  variantGroupTitle: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 8 },
  variantOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  variantChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E7DADA',
    backgroundColor: '#FFF9F9',
  },
  variantChipActive: {
    borderColor: colors.primary,
    backgroundColor: '#FFF0F0',
  },
  variantChipText: { fontSize: 13, color: '#6C5F5F', fontWeight: '600' },
  variantChipTextActive: { color: colors.primary },
  variantHint: { marginTop: 4, fontSize: 12, color: '#B46A6A' },
  descriptionContainer: { marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 10 },
  description: { fontSize: 13, color: colors.text, lineHeight: 20 },
  quantityContainer: { marginBottom: 20 },
  quantityControl: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 10 },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.softPink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonText: { fontSize: 20, fontWeight: '600', color: colors.primary },
  quantityValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    minWidth: 40,
    textAlign: 'center',
  },
  stockText: { marginTop: 8, fontSize: 12, color: '#8E7F7F' },
  shippingContainer: {
    marginBottom: 20,
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.softPink,
  },
  shippingInfo: { gap: 8 },
  shippingLabel: { fontSize: 12, color: colors.text, lineHeight: 18 },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  addToCartButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: colors.primary,
    borderRadius: 12,
  },
  addToCartText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  buyNowButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: colors.secondary,
    borderRadius: 12,
  },
  actionDisabled: { opacity: 0.45 },
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
