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
import { getProductDetail, getProducts, type Product, type ProductAttribute, type ProductVariant } from '../../services/api/product';
import { getReviewsByProduct, type MyReview } from '../../services/api/review';
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
  images?: string[];
  rating: number;
  isSale: boolean;
  priceValue: number;
  originalPrice?: string;
  stock?: number;
  variants?: ProductVariant[];
  description?: string;
  content?: string;
  categorySlug?: string;
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
    images: (item.images || []).map(toAbsoluteUrl),
    rating: 5,
    isSale: !!originalPrice,
    priceValue,
    originalPrice,
    stock: item.stock,
    variants: item.variants,
    description: item.description,
    content: item.content,
    categorySlug: item.categorySlug,
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
      images: (initialProduct.images || []).map(toAbsoluteUrl),
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

  const [activeImage, setActiveImage] = useState<string>('');
  const [relatedProducts, setRelatedProducts] = useState<UIProduct[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);

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
          const mappedProduct = mapToUIProduct(detail.productDetail);
          setProduct(mappedProduct);
          setAttributeList(detail.attributeList || []);
          setSelectedOptions({});
          setActiveImage(mappedProduct.primaryImage);

          // Fetch related products
          if (mappedProduct.categorySlug) {
            getProducts({ categorySlug: mappedProduct.categorySlug, limit: 10 }).then(list => {
               if (active) {
                 setRelatedProducts(list.filter(p => p._id !== mappedProduct.id).map(p => ({
                   ...mapToUIProduct(p),
                 })));
               }
            }).catch(() => {});
          }

          // Fetch reviews
          getReviewsByProduct(mappedProduct.id).then(resp => {
             if (active) {
                const reviewData = resp?.data || resp;
                setReviews(Array.isArray(reviewData) ? reviewData : []);
             }
          }).catch(() => {});
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

  const favoriteActive = product ? isFavorite(product.id, selectedVariant) : false;

  const handleToggleFavorite = () => {
    if (!product) return;

    if (attributeList.length > 0 && !canAddToCart) {
      showToast('Vui lòng chọn đầy đủ phân loại để lưu yêu thích');
      return;
    }

    const isFav = isFavorite(product.id, selectedVariant);
    toggleFavorite({
      productId: product.id,
      quantity: quantity,
      variant: selectedVariant,
      detail: {
        ...product,
        attributeList,
      },
    });

    showToast(!isFav ? 'Đã thêm vào danh sách yêu thích' : 'Đã xóa khỏi danh sách yêu thích');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết sản phẩm</Text>
        <TouchableOpacity onPress={handleToggleFavorite} disabled={!product}>
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
            <Image source={{ uri: activeImage || product.primaryImage }} style={styles.mainImage} />
            {product.isSale && (
              <View style={styles.saleBadge}>
                <Text style={styles.saleBadgeText}>SALE</Text>
              </View>
            )}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbnailRow} contentContainerStyle={styles.thumbnailContainer}>
            {product.images?.map((img, idx) => (
              <TouchableOpacity key={idx} onPress={() => setActiveImage(img)} style={[styles.thumbnail, activeImage === img && styles.thumbnailActive]}>
                <Image source={{ uri: img }} style={styles.thumbnailImage} />
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.infoContainer}>
            <View style={styles.topInfo}>
              <Text style={styles.title}>{product.title}</Text>
              
              <View style={styles.ratingAndSku}>
                <View style={styles.ratingStars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={14}
                      color={star <= Math.floor(product.rating) ? '#FFB800' : '#D9D9D9'}
                      fill={star <= Math.floor(product.rating) ? '#FFB800' : 'none'}
                    />
                  ))}
                  <Text style={styles.reviewCount}>({reviews.length} đánh giá từ khách hàng)</Text>
                </View>
                <Text style={styles.skuText}>SKU: KDW0NHRZGJ</Text>
              </View>

              <View style={styles.priceContainer}>
                {attributeList.length > 0 && !currentVariant ? (
                  <Text style={styles.currentPrice}>
                    {formatPrice(Math.min(...(product.variants?.map(v => Number(v.priceNew) || 0).filter(p => p > 0) || [product.priceValue])))} - {formatPrice(Math.max(...(product.variants?.map(v => Number(v.priceNew) || 0).filter(p => p > 0) || [product.priceValue])))}
                  </Text>
                ) : (
                  <>
                    <Text style={styles.currentPrice}>{formatPrice(currentPriceValue)}</Text>
                    {currentOriginalPrice ? <Text style={styles.originalPrice}>{currentOriginalPrice}</Text> : null}
                  </>
                )}
              </View>

              <View style={styles.promoBanner}>
                <View style={styles.promoIconWrap}>
                    <Text style={styles.promoIconText}>%</Text>
                </View>
                <Text style={styles.promoText}>Giảm 200.000đ cho đơn hàng từ 999.000đ, miễn phí giao hàng</Text>
              </View>
            </View>

            {attributeList.length > 0 ? (
              <View style={styles.variantBlock}>
                {attributeList.map((attribute) => (
                  <View key={attribute._id} style={styles.variantGroup}>
                    <Text style={styles.variantGroupTitle}>
                      {attribute.name} :
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
              </View>
            ) : null}

            <View style={styles.actionSection}>
                <View style={styles.qtyAndPrimaryAction}>
                    <View style={styles.qtySelector}>
                      <TouchableOpacity
                        onPress={() => setQuantity(Math.max(maxStock > 0 ? 1 : 0, quantity - 1))}
                        style={styles.qtyBtn}
                        disabled={maxStock === 0}
                      >
                        <Text style={styles.qtyBtnText}>-</Text>
                      </TouchableOpacity>
                      <Text style={styles.qtyValue}>{quantity}</Text>
                      <TouchableOpacity
                        onPress={() => setQuantity(Math.min(maxStock, quantity + 1))}
                        style={styles.qtyBtn}
                        disabled={maxStock === 0}
                      >
                        <Text style={styles.qtyBtnText}>+</Text>
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity 
                        style={[styles.mainAddToCartBtn, (!canAddToCart || quantity <= 0) && styles.actionDisabled]} 
                        onPress={handleAddToCart} 
                        disabled={!canAddToCart || quantity <= 0}
                    >
                        <Text style={styles.mainAddToCartText}>Thêm vào giỏ hàng</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        onPress={handleToggleFavorite} 
                        style={[styles.heartBtnBorder, favoriteActive && styles.heartBtnActive]}
                    >
                        <Heart
                            size={20}
                            color={favoriteActive ? colors.primary : colors.text}
                            fill={favoriteActive ? colors.primary : 'none'}
                        />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity 
                    style={[styles.buyNowLargeBtn, (!canAddToCart || quantity <= 0) && styles.actionDisabled]} 
                    onPress={handleBuyNow} 
                    disabled={!canAddToCart || quantity <= 0}
                >
                    <Text style={styles.buyNowLargeText}>Mua ngay</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.footerInfo}>
                <View style={styles.deliveryInfo}>
                    <View style={styles.deliveryIconWrap}>
                         <ShoppingCart size={14} color="#FF6F61" />
                    </View>
                    <Text style={styles.deliveryText}>
                        Chỉ còn <Text style={styles.timeHighlight}>23 giờ 23 phút!</Text> Đặt ngay để nhận hàng sớm.
                    </Text>
                </View>
            </View>

            <View style={styles.descriptionContainer}>
              <Text style={styles.tabTitle}>Mô tả sản phẩm</Text>
              <View style={styles.tabUnderline} />
              <Text style={styles.description}>{detailDescription}</Text>
            </View>

            {reviews.length > 0 && (
              <View style={styles.reviewsArea}>
                 <Text style={styles.tabTitle}>Đánh giá ({reviews.length})</Text>
                 <View style={styles.tabUnderline} />
                 {reviews.map((rev, idx) => (
                   <View key={idx} style={styles.reviewItem}>
                      <View style={styles.reviewHeader}>
                         <Image source={{ uri: rev.user?.avatar || 'https://secure.gravatar.com/avatar/4b4d70c085ba692974261304da0860f360cb1f3a616203402e9e19f2d3bda5f8?s=60&d=mm&r=g' }} style={styles.revAvatar} />
                         <View style={{ flex: 1 }}>
                            <Text style={styles.revUser}>{rev.user?.fullName || 'Khách hàng'}</Text>
                            <View style={styles.revStars}>
                               {[...Array(5)].map((_, i) => (
                                 <Star key={i} size={10} color={i < (rev.rating || 5) ? '#FFF1DC' : '#eee'} fill={i < (rev.rating || 5) ? '#FFB800' : 'none'} />
                               ))}
                            </View>
                         </View>
                         <Text style={styles.revDate}>{new Date(rev.createdAt).toLocaleDateString('vi-VN')}</Text>
                      </View>
                      <Text style={styles.revText}>{rev.comment}</Text>
                      {rev.images && rev.images.length > 0 && (
                        <View style={styles.revGallery}>
                            {rev.images.map((img: string, i: number) => (
                               <Image key={i} source={{ uri: img }} style={styles.revGalleryImg} />
                            ))}
                        </View>
                      )}
                   </View>
                 ))}
                 <TouchableOpacity style={styles.moreReviewsBtn} onPress={() => navigation.navigate('ReviewList')}>
                    <Text style={styles.moreReviewsText}>Xem tất cả đánh giá</Text>
                 </TouchableOpacity>
              </View>
            )}

            {relatedProducts.length > 0 && (
              <View style={styles.relatedArea}>
                 <Text style={styles.tabTitle}>Sản phẩm liên quan</Text>
                 <View style={styles.tabUnderline} />
                 <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.relatedScroll}>
                    {relatedProducts.map((item) => (
                      <TouchableOpacity 
                        key={item.id} 
                        style={styles.relatedCard}
                        onPress={() => navigation.navigate('ProductDetail', { productSlug: item.slug || item.id })}
                      >
                         <Image source={{ uri: item.primaryImage }} style={styles.relatedImg} />
                         <View style={styles.relatedInfo}>
                            <Text style={styles.relatedTitle} numberOfLines={1}>{item.title}</Text>
                            <Text style={styles.relatedPrice}>{item.price}</Text>
                         </View>
                      </TouchableOpacity>
                    ))}
                 </ScrollView>
              </View>
            )}
          </View>
        </ScrollView>
      )}

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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.secondary },
  statusContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  statusText: { fontSize: 14, color: '#666', textAlign: 'center' },
  scrollContent: { paddingBottom: 40 },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 380,
    backgroundColor: '#F9F9F9',
  },
  mainImage: { width: '100%', height: '100%', resizeMode: 'contain' },
  saleBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: '#FF6F61',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  saleBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  thumbnailRow: { marginVertical: 12 },
  thumbnailContainer: { paddingHorizontal: 16, gap: 10 },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  thumbnailActive: { borderColor: '#FF6F61', borderWidth: 2 },
  thumbnailImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  infoContainer: { paddingHorizontal: 16, marginTop: 8 },
  topInfo: { gap: 10, marginBottom: 20 },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A1A',
    lineHeight: 32,
  },
  ratingAndSku: { gap: 8 },
  ratingStars: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  reviewCount: { fontSize: 12, color: '#888', marginLeft: 4 },
  skuText: { fontSize: 13, color: '#555', fontWeight: '600' },
  priceContainer: { marginTop: 4, flexDirection: 'row', alignItems: 'baseline', gap: 10 },
  currentPrice: { fontSize: 22, fontWeight: '800', color: '#1A1A1A' },
  originalPrice: { fontSize: 16, color: '#999', textDecorationLine: 'line-through' },
  promoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF4F2',
    padding: 12,
    borderRadius: 99,
    gap: 10,
    marginTop: 8,
  },
  promoIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF6F61',
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoIconText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  promoText: { flex: 1, fontSize: 12, color: '#FF6F61', fontWeight: '600', lineHeight: 16 },
  variantBlock: { gap: 20, marginBottom: 24 },
  variantGroup: { gap: 10 },
  variantGroupTitle: { fontSize: 14, fontWeight: '700', color: '#1A1A1A' },
  variantOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  variantChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  variantChipActive: {
    borderColor: '#FF6F61',
    backgroundColor: '#FFF4F2',
  },
  variantChipText: { fontSize: 13, color: '#4B5563', fontWeight: '600' },
  variantChipTextActive: { color: '#FF6F61' },
  actionSection: { gap: 12, marginBottom: 24 },
  qtyAndPrimaryAction: { flexDirection: 'row', gap: 10, height: 48 },
  qtySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF4F2',
    borderRadius: 8,
    paddingHorizontal: 4,
    width: 100,
  },
  qtyBtn: { width: 30, height: 40, alignItems: 'center', justifyContent: 'center' },
  qtyBtnText: { fontSize: 18, color: '#1A1A1A', fontWeight: '600' },
  qtyValue: { flex: 1, textAlign: 'center', fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
  mainAddToCartBtn: {
    flex: 1,
    backgroundColor: '#7D8E95',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainAddToCartText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  heartBtnBorder: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartBtnActive: { borderColor: '#FF6F61' },
  buyNowLargeBtn: {
    width: '100%',
    height: 54,
    backgroundColor: '#FF7D75',
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF7D75',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buyNowLargeText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  actionDisabled: { opacity: 0.6 },
  footerInfo: { marginBottom: 30 },
  deliveryInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  deliveryIconWrap: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#FFF4F2', alignItems: 'center', justifyContent: 'center' },
  deliveryText: { fontSize: 13, color: '#666', lineHeight: 20 },
  timeHighlight: { color: '#FF6F61', fontWeight: '700' },
  descriptionContainer: { borderTopWidth: 1, borderTopColor: '#F2F2F2', paddingTop: 24, marginBottom: 30 },
  tabTitle: { fontSize: 15, fontWeight: '800', color: '#1A1A1A', marginBottom: 4 },
  tabUnderline: { width: 40, height: 3, backgroundColor: '#FF6F61', marginBottom: 16 },
  description: { fontSize: 14, color: '#444', lineHeight: 22 },
  reviewsArea: { borderTopWidth: 1, borderTopColor: '#F2F2F2', paddingTop: 24, marginBottom: 30 },
  reviewItem: { marginBottom: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
  reviewHeader: { flexDirection: 'row', gap: 12, marginBottom: 10, alignItems: 'center' },
  revAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f0f0f0' },
  revUser: { fontSize: 14, fontWeight: '700', color: '#1A1A1A', marginBottom: 2 },
  revStars: { flexDirection: 'row', gap: 2 },
  revDate: { fontSize: 12, color: '#999' },
  revText: { fontSize: 13, color: '#666', lineHeight: 20 },
  revGallery: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  revGalleryImg: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#f5f5f5' },
  moreReviewsBtn: { alignItems: 'center', paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#FF6F61', backgroundColor: '#FFF4F2' },
  moreReviewsText: { color: '#FF6F61', fontWeight: '700', fontSize: 14 },
  relatedArea: { borderTopWidth: 1, borderTopColor: '#F2F2F2', paddingTop: 24 },
  relatedScroll: { gap: 16 },
  relatedCard: { width: 160, gap: 10 },
  relatedImg: { width: 160, height: 160, borderRadius: 12, backgroundColor: '#F9FAFB', resizeMode: 'contain' },
  relatedInfo: { gap: 4 },
  relatedTitle: { fontSize: 14, fontWeight: '600', color: '#1A1A1A' },
  relatedPrice: { fontSize: 14, fontWeight: '700', color: '#FF6F61' },
});

export default ProductDetailScreen;
