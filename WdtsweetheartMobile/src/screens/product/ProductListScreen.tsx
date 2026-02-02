import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { useProducts } from '../../hooks/useProducts';
import { formatPrice } from '../../utils';
import { ProductCard } from '../../components/ui';
import { StatusMessage } from '../../components/common';
import type { ProductItem } from '../../types';

const bannerImage = {
  uri: 'https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/06/bc-blog-listing.jpg',
};

const ProductListScreen = () => {
  const navigation = useNavigation();
  const { data, loading, error, refetch } = useProducts();
  const [keyword, setKeyword] = useState('');

  const products = useMemo<ProductItem[]>(() => {
    const list = (data || []).map((item) => ({
      id: item._id,
      title: item.name,
      price: formatPrice(item.priceNew || item.priceOld || 0),
      primaryImage: item.images?.[0] || '',
      secondaryImage: item.images?.[1] || item.images?.[0] || '',
      rating: 5,
      isSale: (item.priceOld || 0) > (item.priceNew || 0),
    }));

    if (!keyword.trim()) return list;
    const lower = keyword.trim().toLowerCase();
    return list.filter((item) => item.title.toLowerCase().includes(lower));
  }, [data, keyword]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <ImageBackground source={bannerImage} style={styles.banner}>
          <View style={styles.bannerOverlay}>
            <Text style={styles.bannerTitle}>Cửa hàng</Text>
            <Text style={styles.bannerBreadcrumb}>Trang chủ • Cửa hàng</Text>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.bannerButton}>
              <Text style={styles.bannerButtonText}>Quay lại</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>

        <View style={styles.searchWrap}>
          <TextInput
            placeholder="Tìm sản phẩm"
            placeholderTextColor="#999"
            style={styles.searchInput}
            value={keyword}
            onChangeText={setKeyword}
          />
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
          </View>
        ) : error ? (
          <StatusMessage message={error} actionText="Thử lại" onAction={refetch} />
        ) : (
          <View style={styles.grid}>
            {products.map((item) => (
              <View key={item.id} style={styles.gridItem}>
                <ProductCard product={item} />
              </View>
            ))}
            {!products.length ? (
              <Text style={styles.emptyText}>Không có sản phẩm phù hợp.</Text>
            ) : null}
          </View>
        )}
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
  banner: {
    height: 180,
    justifyContent: 'flex-end',
  },
  bannerOverlay: {
    backgroundColor: 'rgba(16,41,55,0.7)',
    padding: 20,
  },
  bannerTitle: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '800',
  },
  bannerBreadcrumb: {
    color: '#fff',
    marginTop: 6,
  },
  bannerButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  bannerButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  searchWrap: {
    margin: 20,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: colors.secondary,
    backgroundColor: '#fff',
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
    paddingHorizontal: 20,
    gap: 16,
  },
  gridItem: {
    width: '48%',
  },
  emptyText: {
    marginTop: 16,
    color: colors.text,
  },
});

export default ProductListScreen;
