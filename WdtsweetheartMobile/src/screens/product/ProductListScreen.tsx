import React, { useMemo, useState } from 'react';
import {
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
  Bone,
  Cat,
  ChevronDown,
  Dog,
  PawPrint,
  Search,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles,
  Star,
  X,
} from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { useProducts } from '../../hooks/useProducts';
import { formatPrice } from '../../utils';
import { StatusMessage } from '../../components/common';
import type { RootStackParamList } from '../../navigation/types';
import type { ProductItem } from '../../types';

type UIProduct = ProductItem & {
  priceValue: number;
  originalPrice?: string;
};

type SortOption = {
  value: 'newest' | 'price-low' | 'price-high' | 'best-selling';
  label: string;
};

type CategoryOption = {
  key: string;
  label: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  keywords?: string[];
};

type PriceOption = {
  key: string;
  label: string;
  min: number;
  max: number;
};

const categories: CategoryOption[] = [
  { key: 'all', label: 'Tất cả', icon: Sparkles },
  { key: 'dog', label: 'Chó cưng', icon: Dog, keywords: ['chó', 'dog'] },
  { key: 'cat', label: 'Mèo cưng', icon: Cat, keywords: ['mèo', 'cat'] },
  { key: 'food', label: 'Đồ ăn', icon: Bone, keywords: ['thức ăn', 'food'] },
  { key: 'accessories', label: 'Phụ kiện', icon: PawPrint, keywords: ['phụ kiện', 'accessories', 'đồ chơi'] },
];

const sortOptions: SortOption[] = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'price-low', label: 'Giá thấp đến cao' },
  { value: 'price-high', label: 'Giá cao đến thấp' },
  { value: 'best-selling', label: 'Bán chạy' },
];

const priceOptions: PriceOption[] = [
  { key: 'all', label: 'Tất cả', min: 0, max: Number.MAX_SAFE_INTEGER },
  { key: 'under-200', label: 'Dưới 200k', min: 0, max: 200000 },
  { key: '200-500', label: '200k - 500k', min: 200000, max: 500000 },
  { key: 'above-500', label: 'Trên 500k', min: 500000, max: Number.MAX_SAFE_INTEGER },
];

const ProductListScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { data, loading, error, refetch } = useProducts();
  const [keyword, setKeyword] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption['value']>('newest');
  const [priceFilter, setPriceFilter] = useState('all');
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [cartCount] = useState(2);

  const products = useMemo<UIProduct[]>(() => {
    return (data || []).map((item, index) => {
      const priceValue = item.priceNew ?? item.priceOld ?? 0;
      const originalPrice =
        item.priceOld && item.priceNew && item.priceOld > item.priceNew
          ? formatPrice(item.priceOld)
          : undefined;

      return {
        id: item._id,
        title: item.name,
        price: formatPrice(priceValue),
        primaryImage: item.images?.[0] || '',
        secondaryImage: item.images?.[1] || item.images?.[0] || '',
        rating: 5 - (index % 2 === 0 ? 0 : 1),
        isSale: !!originalPrice,
        priceValue,
        originalPrice,
      };
    });
  }, [data]);

  const filteredProducts = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();
    const activeCategoryMeta = categories.find((item) => item.key === activeCategory);
    const priceMeta = priceOptions.find((item) => item.key === priceFilter) ?? priceOptions[0];

    let list = products;

    if (normalized) {
      list = list.filter((item) => item.title.toLowerCase().includes(normalized));
    }

    if (activeCategoryMeta && activeCategoryMeta.key !== 'all') {
      const keywords = activeCategoryMeta.keywords || [];
      list = list.filter((item) =>
        keywords.some((key) => item.title.toLowerCase().includes(key))
      );
    }

    list = list.filter(
      (item) => item.priceValue >= priceMeta.min && item.priceValue <= priceMeta.max
    );

    const sorted = [...list];
    if (sortBy === 'price-low') {
      sorted.sort((a, b) => a.priceValue - b.priceValue);
    }
    if (sortBy === 'price-high') {
      sorted.sort((a, b) => b.priceValue - a.priceValue);
    }

    return sorted;
  }, [products, keyword, activeCategory, sortBy, priceFilter]);

  const activeSortLabel = useMemo(
    () => sortOptions.find((item) => item.value === sortBy)?.label || 'Mới nhất',
    [sortBy]
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

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.searchBox}>
          <Search size={16} color={colors.text} style={styles.searchIcon} />
          <TextInput
            placeholder="Tìm kiếm sản phẩm"
            placeholderTextColor="#9b9b9b"
            style={styles.searchInput}
            value={keyword}
            onChangeText={setKeyword}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRow}>
          {categories.map((category) => (
            <Pressable
              key={category.key}
              onPress={() => setActiveCategory(category.key)}
              style={({ pressed }) => [
                styles.categoryChip,
                activeCategory === category.key && styles.categoryChipActive,
                pressed && styles.categoryChipPressed,
              ]}
            >
              <View style={styles.categoryChipContent}>
                <category.icon
                  size={14}
                  color={activeCategory === category.key ? '#fff' : colors.text}
                />
                <Text
                  style={[
                    styles.categoryChipText,
                    activeCategory === category.key && styles.categoryChipTextActive,
                  ]}
                >
                  {category.label}
                </Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.sortRow}>
          <Text style={styles.sortLabel}>
            Hiển thị <Text style={styles.sortHighlight}>{filteredProducts.length}</Text> sản phẩm
          </Text>
          <Pressable onPress={() => setSortOpen(true)} style={styles.sortPill}>
            <Text style={styles.sortPillText}>{activeSortLabel}</Text>
            <ChevronDown size={16} color={colors.text} />
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.skeletonGrid}>
            {[1, 2, 3, 4].map((item) => (
              <View key={item} style={styles.skeletonCard}>
                <View style={styles.skeletonImage} />
                <View style={styles.skeletonBody}>
                  <View style={styles.skeletonLineWide} />
                  <View style={styles.skeletonLineMedium} />
                  <View style={styles.skeletonLineFull} />
                  <View style={styles.skeletonButton} />
                </View>
              </View>
            ))}
          </View>
        ) : error ? (
          <View style={styles.statusWrap}>
            <StatusMessage message={error} actionText="Thử lại" onAction={refetch} />
          </View>
        ) : filteredProducts.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIllustration}>
              <Search size={48} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>Không tìm thấy sản phẩm</Text>
            <Text style={styles.emptyDesc}>
              Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác
            </Text>
            <Pressable
              onPress={() => {
                setKeyword('');
                setActiveCategory('all');
                setPriceFilter('all');
              }}
              style={styles.emptyAction}
            >
              <Text style={styles.emptyActionText}>Xóa bộ lọc</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.grid}>
            {filteredProducts.map((item) => (
              <View key={item.id} style={styles.gridItem}>
                <Pressable style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
                  <View style={styles.cardImageWrap}>
                    {item.primaryImage ? (
                      <Image source={{ uri: item.primaryImage }} style={styles.cardImage} />
                    ) : (
                      <View style={styles.cardImagePlaceholder} />
                    )}
                    {item.isSale ? (
                      <View style={styles.cardBadge}>
                        <Text style={styles.cardBadgeText}>SALE</Text>
                      </View>
                    ) : null}
                  </View>
                  <View style={styles.cardBody}>
                    <Text style={styles.cardTitle} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <View style={styles.ratingRow}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={`${item.id}-${star}`}
                          size={12}
                          color={star <= Math.floor(item.rating) ? '#FFB800' : '#D9D9D9'}
                          fill={star <= Math.floor(item.rating) ? '#FFB800' : 'none'}
                        />
                      ))}
                      <Text style={styles.ratingText}>({item.rating.toFixed(1)})</Text>
                    </View>
                    <View style={styles.priceRow}>
                      <Text style={styles.priceText}>{item.price}</Text>
                      {item.originalPrice ? (
                        <Text style={styles.originalPriceText}>{item.originalPrice}</Text>
                      ) : null}
                    </View>
                    <View style={styles.cardButton}>
                      <Text style={styles.cardButtonText}>Thêm giỏ</Text>
                    </View>
                  </View>
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <Pressable style={styles.fab}>
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
                <X size={20} color={colors.text} />
              </Pressable>
            </View>

            <View style={styles.sheetSection}>
              <Text style={styles.sheetLabel}>Danh mục</Text>
              <View style={styles.sheetChipRow}>
                {categories.map((category) => (
                  <Pressable
                    key={category.key}
                    onPress={() => setActiveCategory(category.key)}
                    style={({ pressed }) => [
                      styles.sheetChip,
                      activeCategory === category.key && styles.sheetChipActive,
                      pressed && styles.sheetChipPressed,
                    ]}
                  >
                    <View style={styles.sheetChipContent}>
                      <category.icon
                        size={13}
                        color={activeCategory === category.key ? '#fff' : colors.text}
                      />
                      <Text
                        style={[
                          styles.sheetChipText,
                          activeCategory === category.key && styles.sheetChipTextActive,
                        ]}
                      >
                        {category.label}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.sheetSection}>
              <Text style={styles.sheetLabel}>Khoảng giá</Text>
              <View style={styles.sheetChipRow}>
                {priceOptions.map((option) => (
                  <Pressable
                    key={option.key}
                    onPress={() => setPriceFilter(option.key)}
                    style={({ pressed }) => [
                      styles.sheetChip,
                      priceFilter === option.key && styles.sheetChipActive,
                      pressed && styles.sheetChipPressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.sheetChipText,
                        priceFilter === option.key && styles.sheetChipTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.sheetActions}>
              <Pressable
                style={styles.sheetApply}
                onPress={() => setFilterOpen(false)}
              >
                <Text style={styles.sheetApplyText}>Áp dụng</Text>
              </Pressable>
              <Pressable
                style={styles.sheetClear}
                onPress={() => {
                  setActiveCategory('all');
                  setPriceFilter('all');
                }}
              >
                <Text style={styles.sheetClearText}>Xóa lọc</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={sortOpen} transparent animationType="fade" onRequestClose={() => setSortOpen(false)}>
        <View style={styles.modalWrap}>
          <Pressable style={styles.modalOverlay} onPress={() => setSortOpen(false)} />
          <View style={styles.sortSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Sắp xếp theo</Text>
              <Pressable onPress={() => setSortOpen(false)} style={styles.sheetClose}>
                <X size={20} color={colors.text} />
              </Pressable>
            </View>
            {sortOptions.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => {
                  setSortBy(option.value);
                  setSortOpen(false);
                }}
                style={({ pressed }) => [
                  styles.sortOption,
                  sortBy === option.value && styles.sortOptionActive,
                  pressed && styles.sortOptionPressed,
                ]}
              >
                <Text
                  style={[
                    styles.sortOptionText,
                    sortBy === option.value && styles.sortOptionTextActive,
                  ]}
                >
                  {option.label}
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
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F1F1',
    backgroundColor: '#fff',
  },
  headerTitle: {
    color: colors.secondary,
    fontSize: 18,
    fontWeight: '700',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.softPink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBox: {
    marginHorizontal: 20,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f3f5',
    borderRadius: 999,
    paddingHorizontal: 14,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: colors.secondary,
    fontSize: 14,
  },
  categoryRow: {
    paddingLeft: 20,
    marginTop: 16,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.softPink,
    marginRight: 10,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
  },
  categoryChipPressed: {
    opacity: 0.85,
  },
  categoryChipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  sortRow: {
    marginHorizontal: 20,
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sortLabel: {
    color: colors.text,
    fontSize: 13,
  },
  sortHighlight: {
    color: colors.primary,
    fontWeight: '700',
  },
  sortPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.softPink,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  sortPillText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  gridItem: {
    width: '47%',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardPressed: {
    transform: [{ scale: 0.97 }],
  },
  cardImageWrap: {
    backgroundColor: colors.softPink,
  },
  cardImage: {
    width: '100%',
    height: 160,
  },
  cardImagePlaceholder: {
    width: '100%',
    height: 160,
    backgroundColor: colors.border,
  },
  cardBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  cardBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  cardBody: {
    padding: 12,
  },
  cardTitle: {
    color: colors.secondary,
    fontSize: 13,
    fontWeight: '600',
    minHeight: 36,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 8,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 10,
    color: colors.text,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  priceText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  originalPriceText: {
    color: colors.text,
    fontSize: 11,
    textDecorationLine: 'line-through',
  },
  cardButton: {
    marginTop: 10,
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: 'center',
  },
  cardButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  skeletonCard: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
  },
  skeletonImage: {
    height: 160,
    backgroundColor: colors.softPink,
  },
  skeletonBody: {
    padding: 12,
    gap: 8,
  },
  skeletonLineWide: {
    height: 10,
    borderRadius: 999,
    backgroundColor: colors.softPink,
    width: '80%',
  },
  skeletonLineMedium: {
    height: 10,
    borderRadius: 999,
    backgroundColor: colors.softPink,
    width: '60%',
  },
  skeletonLineFull: {
    height: 10,
    borderRadius: 999,
    backgroundColor: colors.softPink,
    width: '100%',
  },
  skeletonButton: {
    height: 34,
    borderRadius: 999,
    backgroundColor: colors.softPink,
  },
  statusWrap: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  emptyState: {
    paddingHorizontal: 24,
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyIllustration: {
    width: 140,
    height: 140,
    borderRadius: 32,
    backgroundColor: colors.softPink,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.secondary,
    textAlign: 'center',
  },
  emptyDesc: {
    marginTop: 8,
    textAlign: 'center',
    color: colors.text,
    fontSize: 13,
    lineHeight: 18,
  },
  emptyAction: {
    marginTop: 20,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  emptyActionText: {
    color: '#fff',
    fontWeight: '600',
  },
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
    shadowColor: colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  fabBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: colors.secondary,
    borderRadius: 999,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  fabBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  modalWrap: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  sortSheet: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sheetTitle: {
    color: colors.secondary,
    fontSize: 16,
    fontWeight: '700',
  },
  sheetClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.softPink,
  },
  sheetSection: {
    marginBottom: 16,
  },
  sheetLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
  },
  sheetChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sheetChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.softPink,
  },
  sheetChipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sheetChipActive: {
    backgroundColor: colors.primary,
  },
  sheetChipPressed: {
    opacity: 0.85,
  },
  sheetChipText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  sheetChipTextActive: {
    color: '#fff',
  },
  sheetActions: {
    marginTop: 6,
    gap: 10,
  },
  sheetApply: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
  },
  sheetApplyText: {
    color: '#fff',
    fontWeight: '600',
  },
  sheetClear: {
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
  },
  sheetClearText: {
    color: colors.primary,
    fontWeight: '600',
  },
  sortOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 8,
    backgroundColor: '#f7f7f7',
  },
  sortOptionActive: {
    backgroundColor: colors.softPink,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  sortOptionPressed: {
    opacity: 0.85,
  },
  sortOptionText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  sortOptionTextActive: {
    color: colors.primary,
  },
});

export default ProductListScreen;
