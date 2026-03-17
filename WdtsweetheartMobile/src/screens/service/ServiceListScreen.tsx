import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  Image,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, ChevronDown, Search } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { useServices, useServiceCategories } from '../../hooks';
import type { RootStackParamList } from '../../navigation/types';
import type { Service, ServiceListParams, ServiceCategory } from '../../types';

const ServiceListScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [params, setParams] = useState<ServiceListParams>({ page: 1, limit: 10 });
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [categoryOpen, setCategoryOpen] = useState(false);

  const { data, pagination, loading, error } = useServices({
    ...params,
    categoryId: selectedCategory,
  });
  const { data: categories, loading: categoriesLoading } = useServiceCategories();

  // Debug: log data whenever it changes
  // React.useEffect(() => {
  //   console.log('ServiceListScreen data:', data);
  //   console.log('ServiceListScreen data length:', data.length);
  // }, [data]);

  const handlePageChange = (page: number) => {
    setParams((prev: ServiceListParams) => ({ ...prev, page }));
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId === 'all' ? undefined : categoryId);
    setParams((prev: ServiceListParams) => ({ ...prev, page: 1 }));
    setCategoryOpen(false);
  };

  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, '').trim();
  };

  const renderServiceCard = ({ item }: { item: Service }) => (
    <Pressable
      style={styles.card}
      onPress={() => {
        // Navigate to the service detail screen
        navigation.navigate('ServiceDetail', { serviceId: item._id, service: item });
      }}>
      <View style={styles.cardImageContainer}>
        {item.image ? (
          <Image
            source={{ uri: item.image }}
            style={styles.cardImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.cardImagePlaceholder}>
            <Text style={styles.cardImagePlaceholderText}>📷</Text>
          </View>
        )}
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.name}
        </Text>
        {item.description && (
          <Text style={styles.cardDescription} numberOfLines={2}>
            {stripHtml(item.description)}
          </Text>
        )}
        <View style={styles.cardFooter}>
          <View style={styles.priceContainer}>
            {item.price && (
              <Text style={styles.cardPrice}>
                {item.price?.toLocaleString('vi-VN')} đ
              </Text>
            )}
            {item.priceOld != null && item.priceOld > (item.price ?? 0) && (
              <Text style={styles.cardPriceOld}>
                {item.priceOld.toLocaleString('vi-VN')} đ
              </Text>
            )}
          </View>
          {item.duration && (
            <View style={styles.durationBadge}>
              <Text style={styles.cardDuration}>
                {item.duration} phút
              </Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Dịch vụ</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search & Filters */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInput}>
          <Search size={20} color={colors.textLight} />
          <TextInput
            placeholder="Tìm kiếm dịch vụ..."
            style={styles.input}
            value={searchKeyword}
            onChangeText={setSearchKeyword}
          />
        </View>
      </View>

      {/* Categories Filter */}
      <View style={styles.filterContainer}>
        <Pressable
          style={styles.filterButton}
          onPress={() => setCategoryOpen(!categoryOpen)}>
          <Text style={styles.filterButtonText}>
            {selectedCategory ? 'Danh mục: ' + selectedCategory : 'Tất cả danh mục'}
          </Text>
          <ChevronDown
            size={20}
            color={colors.primary}
            style={{ transform: [{ rotate: categoryOpen ? '180deg' : '0deg' }] }}
          />
        </Pressable>

        {/* Debug: show how many services loaded */}
        {/* {!loading && (
          <Text style={styles.debugText}>Đã tải: {data.length} dịch vụ</Text>
        )} */}

        {categoryOpen && (
          <View style={styles.dropdownMenu}>
            <Pressable onPress={() => handleCategorySelect('all')}>
              <Text style={styles.dropdownItem}>Tất cả</Text>
            </Pressable>
            {categories?.map((category: ServiceCategory) => (
              <Pressable
                key={category._id}
                onPress={() => handleCategorySelect(category._id)}>
                <Text style={styles.dropdownItem}>{category.name}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {/* Loading State */}
      {loading && (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      {/* Error State */}
      {error && (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Empty State */}
      {!loading && data.length === 0 && (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>Không tìm thấy dịch vụ</Text>
        </View>
      )}

      {/* Services List */}
      {!loading && data.length > 0 && (
        <FlatList
          data={data}
          renderItem={renderServiceCard}
          keyExtractor={item => item._id}
          scrollEnabled={true}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Pagination */}
      {!loading && pagination.totalPages > 1 && (
        <View style={styles.pagination}>
          <Pressable
            disabled={pagination.currentPage === 1}
            onPress={() => handlePageChange(pagination.currentPage - 1)}
            style={[styles.paginationButton, pagination.currentPage === 1 && styles.paginationDisabled]}>
            <Text style={styles.paginationText}>Trước</Text>
          </Pressable>

          <Text style={styles.paginationInfo}>
            {pagination.currentPage} / {pagination.totalPages}
          </Text>

          <Pressable
            disabled={pagination.currentPage === pagination.totalPages}
            onPress={() => handlePageChange(pagination.currentPage + 1)}
            style={[styles.paginationButton, pagination.currentPage === pagination.totalPages && styles.paginationDisabled]}>
            <Text style={styles.paginationText}>Tiếp</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.white,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: colors.text,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: colors.white,
  },
  filterButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filterButtonText: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
  },
  dropdownMenu: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.text,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  listContent: {
    paddingHorizontal: 0,
    paddingVertical: 8,
    paddingBottom: 100, // Space for pagination
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginVertical: 8,
    marginHorizontal: 16,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardImageContainer: {
    width: 100,
    height: 100,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardImagePlaceholderText: {
    fontSize: 24,
  },
  cardContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
    lineHeight: 22,
  },
  cardDescription: {
    fontSize: 13,
    color: colors.textLight,
    marginBottom: 10,
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
  },
  cardPriceOld: {
    fontSize: 14,
    color: colors.textLight,
    textDecorationLine: 'line-through',
  },
  durationBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cardDuration: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.white,
  },
  pagination: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 16,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 4,
  },
  paginationButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: colors.primary,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  paginationDisabled: {
    backgroundColor: colors.lightGray,
  },
  paginationText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  paginationInfo: {
    fontSize: 14,
    color: colors.text,
    minWidth: 60,
    textAlign: 'center',
    fontWeight: '500',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
  },
  debugText: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 8,
  },
  debugItemText: {
    fontSize: 10,
    color: colors.textLight,
    marginTop: 2,
  },
  errorText: {
    fontSize: 14,
    color: colors.warning,
    textAlign: 'center',
  },
});

export default ServiceListScreen;