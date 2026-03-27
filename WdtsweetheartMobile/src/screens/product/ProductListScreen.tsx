import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ArrowLeft,
  ChevronDown,
  Search,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles,
  Star,
  X,
} from 'lucide-react-native';
import type { RootStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';
import { useCart } from '../../context/CartContext';
import { useFavorites } from '../../context/FavoritesContext';
import { StatusMessage, Toast } from '../../components/common';
import { formatPrice } from '../../utils';
import { env } from '../../config';
import { useProductBrands, useProductCategories, useProductSuggestions, useProducts } from '../../hooks/useProducts';
import type { GetProductsParams, ProductCategory } from '../../services/api/product';
import type { ProductItem } from '../../types';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

type SortKey = 'newest' | 'price-low' | 'price-high' | 'best-selling';

type UIProduct = ProductItem & {
  priceValue: number;
  originalPrice?: string;
  slug?: string;
  hasVariants: boolean;
};

type CategoryChip = {
  key: string;
  label: string;
  parent?: string | null;
  productCount?: number;
};

const sortOptions: Array<{ value: SortKey; label: string }> = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'price-low', label: 'Giá thấp đến cao' },
  { value: 'price-high', label: 'Giá cao đến thấp' },
  { value: 'best-selling', label: 'Bán chạy' },
];

const toAbsoluteUrl = (url?: string) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  return `${env.apiBaseUrl}/${url.replace(/^\/+/, '')}`;
};

const ProductListScreen = () => {
  const navigation = useNavigation<Navigation>();
  const { addToCart, cartCount } = useCart();
  const { isFavorite } = useFavorites();
  const { data: categoryData } = useProductCategories();
  const { data: brandData } = useProductBrands();

  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [activeParentCategory, setActiveParentCategory] = useState('all');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeBrand, setActiveBrand] = useState('all');
  const [sortBy, setSortBy] = useState<SortKey>('newest');
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const apiCategories = (Array.isArray(categoryData) ? categoryData : []) as ProductCategory[];
  const brands = useMemo(
    () => [{ key: 'all', label: 'Tất cả' }, ...(brandData || []).map((item) => ({ key: item.slug || item._id || item.name, label: item.name }))],
    [brandData]
  );

  const categories = useMemo<CategoryChip[]>(
    () => [{ key: 'all', label: 'Tất cả' }, ...apiCategories.map((item) => ({
      key: item.slug || item._id || item.name,
      label: item.name,
      parent: item.parent || null,
      productCount: item.productCount ?? 0,
    }))],
    [apiCategories]
  );

  const parentCategoryId = useMemo(() => {
    if (activeParentCategory === 'all') return '';
    const item = apiCategories.find((category) => (category.slug || category._id || category.name) === activeParentCategory);
    return item?._id || '';
  }, [activeParentCategory, apiCategories]);

  const parentCategories = useMemo(
    () => categories.filter((item) => item.key === 'all' || !item.parent),
    [categories]
  );

  const childCategories = useMemo(
    () => (parentCategoryId ? categories.filter((item) => item.parent === parentCategoryId) : []),
    [categories, parentCategoryId]
  );

  const productParams = useMemo<GetProductsParams>(() => {
    const params: GetProductsParams = { page: 1, limit: 20 };
    if (activeCategory !== 'all') params.categorySlug = activeCategory;
    if (activeBrand !== 'all') params.brandSlug = activeBrand;
    if (debouncedKeyword) params.keyword = debouncedKeyword;

    if (sortBy === 'price-low') {
      params.sortKey = 'priceNew';
      params.sortValue = 'asc';
    } else if (sortBy === 'price-high') {
      params.sortKey = 'priceNew';
      params.sortValue = 'desc';
    } else if (sortBy === 'best-selling') {
      params.sortKey = 'view';
      params.sortValue = 'desc';
    } else {
      params.sortKey = 'createdAt';
      params.sortValue = 'desc';
    }

    return params;
  }, [activeBrand, activeCategory, debouncedKeyword, sortBy]);

  const { data, loading, error, refetch } = useProducts(productParams);
  const { data: suggestions } = useProductSuggestions(keyword);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedKeyword(keyword.trim()), 300);
    return () => clearTimeout(timer);
  }, [keyword]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastVisible(false), 1400);
  };

  const products = useMemo<UIProduct[]>(() => {
    return (Array.isArray(data) ? data : []).map((item) => {
      const priceValue = item.priceNew ?? item.priceOld ?? 0;
      return {
        id: item._id,
        title: item.name,
        slug: item.slug,
        price: formatPrice(priceValue),
        priceValue,
        primaryImage: toAbsoluteUrl(item.images?.[0]),
        secondaryImage: toAbsoluteUrl(item.images?.[1] || item.images?.[0]),
        originalPrice: item.priceOld && item.priceOld > priceValue ? formatPrice(item.priceOld) : undefined,
        isSale: !!(item.priceOld && item.priceOld > priceValue),
        rating: 4.5,
        hasVariants: (item.variants?.length || 0) > 0,
      };
    });
  }, [data]);

  const visibleProducts = useMemo(() => {
    const sorted = [...products];
    if (sortBy === 'price-low') sorted.sort((a, b) => a.priceValue - b.priceValue);
    if (sortBy === 'price-high') sorted.sort((a, b) => b.priceValue - a.priceValue);
    sorted.sort((a, b) => Number(isFavorite(b.id)) - Number(isFavorite(a.id)));
    return sorted;
  }, [products, sortBy, isFavorite]);

  const renderProduct = ({ item }: { item: UIProduct }) => (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => navigation.navigate('ProductDetail', { productSlug: item.slug || item.id, product: item })}
    >
      {item.primaryImage ? (
        <Image source={{ uri: item.primaryImage }} style={styles.cardImage} />
      ) : (
        <View style={styles.cardImagePlaceholder} />
      )}
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={3}>{item.title}</Text>
        <View style={styles.ratingRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={`${item.id}-${star}`}
              size={12}
              color={star <= Math.round(item.rating) ? '#FFB800' : '#E5E7EB'}
              fill={star <= Math.round(item.rating) ? '#FFB800' : 'none'}
            />
          ))}
          <Text style={styles.ratingText}>({item.rating.toFixed(1)})</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceText}>{item.price}</Text>
          {item.originalPrice ? <Text style={styles.oldPriceText}>{item.originalPrice}</Text> : null}
        </View>
        <Pressable
          style={styles.addButton}
          onPress={(event) => {
            event.stopPropagation();
            if (item.hasVariants) {
              showToast('Vui lòng chọn phân loại sản phẩm');
              navigation.navigate('ProductDetail', { productSlug: item.slug || item.id, product: item });
              return;
            }
            addToCart(item, 1);
            showToast('Đã thêm sản phẩm vào giỏ hàng');
          }}
        >
          <Text style={styles.addButtonText}>Thêm giỏ</Text>
        </Pressable>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.headerButton}>
          <ArrowLeft size={20} color={colors.secondary} />
        </Pressable>
        <Text style={styles.headerTitle}>Cửa hàng</Text>
        <Pressable onPress={() => setFilterOpen(true)} style={styles.headerButton}>
          <SlidersHorizontal size={20} color={colors.secondary} />
        </Pressable>
      </View>

      <FlatList
        data={visibleProducts}
        keyExtractor={(item) => item.id}
        renderItem={renderProduct}
        numColumns={2}
        columnWrapperStyle={visibleProducts.length > 1 ? styles.gridRow : undefined}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <View style={styles.searchBox}>
              <Search size={18} color="#9CA3AF" />
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm kiếm sản phẩm"
                placeholderTextColor="#9CA3AF"
                value={keyword}
                onChangeText={setKeyword}
              />
            </View>

            {keyword.trim().length > 1 && suggestions.length > 0 ? (
              <View style={styles.suggestionWrap}>
                {suggestions.map((item) => (
                  <Pressable
                    key={item._id}
                    style={styles.suggestionItem}
                    onPress={() => {
                      setKeyword(item.name);
                      navigation.navigate('ProductDetail', { productSlug: item.slug || item._id || item.name });
                    }}
                  >
                    <Text style={styles.suggestionTitle}>{item.name}</Text>
                    <Text style={styles.suggestionPrice}>{formatPrice(item.priceNew ?? item.priceOld ?? 0)}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
              {parentCategories.map((category) => (
                <Pressable
                  key={category.key}
                  style={[styles.chip, activeParentCategory === category.key && styles.chipActive]}
                  onPress={() => {
                    setActiveParentCategory(category.key);
                    setActiveCategory(category.key);
                  }}
                >
                  <Sparkles size={14} color={activeParentCategory === category.key ? '#fff' : colors.text} />
                  <Text style={[styles.chipText, activeParentCategory === category.key && styles.chipTextActive]}>
                    {category.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {childCategories.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subcategoryRow}>
                {childCategories.map((category) => (
                  <Pressable
                    key={category.key}
                    style={[styles.subChip, activeCategory === category.key && styles.subChipActive]}
                    onPress={() => setActiveCategory(category.key)}
                  >
                    <Text style={[styles.subChipText, activeCategory === category.key && styles.subChipTextActive]}>
                      {category.label}
                      {typeof category.productCount === 'number' ? ` (${category.productCount})` : ''}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            ) : null}

            <View style={styles.sortRow}>
              <Text style={styles.sortLabel}>
                Hiển thị <Text style={styles.sortHighlight}>{visibleProducts.length}</Text> sản phẩm
              </Text>
              <Pressable style={styles.sortPill} onPress={() => setSortOpen(true)}>
                <Text style={styles.sortPillText}>
                  {sortOptions.find((item) => item.value === sortBy)?.label || 'Mới nhất'}
                </Text>
                <ChevronDown size={16} color={colors.text} />
              </Pressable>
            </View>

            {loading ? (
              <View style={styles.statusWrap}>
                <StatusMessage message="Đang tải sản phẩm..." />
              </View>
            ) : error ? (
              <View style={styles.statusWrap}>
                <StatusMessage message={error} actionText="Thử lại" onAction={refetch} />
              </View>
            ) : visibleProducts.length === 0 ? (
              <View style={styles.statusWrap}>
                <StatusMessage
                  message="Không tìm thấy sản phẩm phù hợp"
                  actionText="Xóa bộ lọc"
                  onAction={() => {
                    setKeyword('');
                    setDebouncedKeyword('');
                    setActiveParentCategory('all');
                    setActiveCategory('all');
                    setActiveBrand('all');
                  }}
                />
              </View>
            ) : null}
          </>
        }
        ListEmptyComponent={null}
      />

      <Toast visible={toastVisible} message={toastMessage} />

      <Pressable style={styles.fab} onPress={() => navigation.navigate('Cart')}>
        <ShoppingCart size={22} color="#fff" />
        {cartCount > 0 ? (
          <View style={styles.fabBadge}>
            <Text style={styles.fabBadgeText}>{cartCount > 99 ? '99+' : cartCount}</Text>
          </View>
        ) : null}
      </Pressable>

      <Modal visible={filterOpen} transparent animationType="fade" onRequestClose={() => setFilterOpen(false)}>
        <View style={styles.modalWrap}>
          <Pressable style={styles.modalOverlay} onPress={() => setFilterOpen(false)} />
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Bộ lọc</Text>
              <Pressable onPress={() => setFilterOpen(false)} style={styles.sheetClose}>
                <X size={18} color={colors.text} />
              </Pressable>
            </View>
            <Text style={styles.sheetLabel}>Thương hiệu</Text>
            <View style={styles.sheetChipRow}>
              {brands.map((brand) => (
                <Pressable
                  key={brand.key}
                  style={[styles.sheetChip, activeBrand === brand.key && styles.sheetChipActive]}
                  onPress={() => setActiveBrand(brand.key)}
                >
                  <Text style={[styles.sheetChipText, activeBrand === brand.key && styles.sheetChipTextActive]}>
                    {brand.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={sortOpen} transparent animationType="fade" onRequestClose={() => setSortOpen(false)}>
        <View style={styles.modalWrap}>
          <Pressable style={styles.modalOverlay} onPress={() => setSortOpen(false)} />
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Sắp xếp theo</Text>
              <Pressable onPress={() => setSortOpen(false)} style={styles.sheetClose}>
                <X size={18} color={colors.text} />
              </Pressable>
            </View>
            {sortOptions.map((item) => (
              <Pressable
                key={item.value}
                style={[styles.sortOption, sortBy === item.value && styles.sortOptionActive]}
                onPress={() => {
                  setSortBy(item.value);
                  setSortOpen(false);
                }}
              >
                <Text style={[styles.sortOptionText, sortBy === item.value && styles.sortOptionTextActive]}>
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F1F1',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.secondary },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.softPink,
  },
  listContent: { padding: 20, paddingBottom: 120 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    height: 48,
    borderRadius: 999,
    backgroundColor: '#F3F4F6',
  },
  searchInput: { flex: 1, color: colors.secondary, fontSize: 14 },
  suggestionWrap: {
    marginTop: 10,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F1F1',
    overflow: 'hidden',
  },
  suggestionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  suggestionTitle: { color: colors.secondary, fontWeight: '600', flex: 1, marginRight: 10 },
  suggestionPrice: { color: colors.primary, fontWeight: '700' },
  categoryRow: { paddingTop: 16, paddingBottom: 6, gap: 10 },
  subcategoryRow: { paddingBottom: 6, gap: 10 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.softPink,
  },
  chipActive: { backgroundColor: colors.primary },
  chipText: { color: colors.text, fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  subChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#FFF4F6',
    borderWidth: 1,
    borderColor: '#FFD5DE',
  },
  subChipActive: { backgroundColor: colors.secondary, borderColor: colors.secondary },
  subChipText: { color: colors.text, fontSize: 12, fontWeight: '600' },
  subChipTextActive: { color: '#fff' },
  sortRow: {
    marginTop: 8,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sortLabel: { color: colors.text, fontSize: 13 },
  sortHighlight: { color: colors.primary, fontWeight: '700' },
  sortPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.softPink,
  },
  sortPillText: { color: colors.text, fontSize: 12, fontWeight: '600' },
  statusWrap: { marginBottom: 16 },
  gridRow: { justifyContent: 'space-between', marginBottom: 14 },
  card: {
    width: '48%',
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  cardPressed: { transform: [{ scale: 0.98 }] },
  cardImage: { width: '100%', height: 170, backgroundColor: '#F8FAFC' },
  cardImagePlaceholder: { width: '100%', height: 170, backgroundColor: '#F8FAFC' },
  cardBody: { padding: 12 },
  cardTitle: { fontSize: 14, lineHeight: 20, color: colors.secondary, fontWeight: '600', minHeight: 62 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 8 },
  ratingText: { marginLeft: 4, fontSize: 11, color: colors.text },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  priceText: { color: colors.primary, fontSize: 15, fontWeight: '800' },
  oldPriceText: { color: colors.text, fontSize: 11, textDecorationLine: 'line-through' },
  addButton: {
    marginTop: 12,
    borderRadius: 999,
    paddingVertical: 11,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  addButtonText: { color: '#fff', fontWeight: '700' },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
  fabBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: colors.secondary,
    minWidth: 20,
    height: 20,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  fabBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  modalWrap: { flex: 1, justifyContent: 'flex-end' },
  modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sheetTitle: { fontSize: 16, fontWeight: '700', color: colors.secondary },
  sheetClose: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.softPink,
  },
  sheetLabel: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 10 },
  sheetChipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sheetChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: colors.softPink },
  sheetChipActive: { backgroundColor: colors.primary },
  sheetChipText: { fontSize: 12, fontWeight: '600', color: colors.text },
  sheetChipTextActive: { color: '#fff' },
  sortOption: { padding: 14, borderRadius: 16, backgroundColor: '#F7F7F7', marginBottom: 8 },
  sortOptionActive: { backgroundColor: colors.softPink, borderWidth: 1, borderColor: colors.primary },
  sortOptionText: { color: colors.text, fontWeight: '600' },
  sortOptionTextActive: { color: colors.primary },
});

export default ProductListScreen;
