import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, BookOpen, Search } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { useBlogs } from '../../hooks/useBlogs';
import { StatusMessage } from '../../components/common';
import type { RootStackParamList } from '../../navigation/types';
import type { BlogItem } from '../../services/api/blog';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

const PAGE_SIZE = 6;

const formatBlogDate = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('vi-VN');
};

const getCategoryNames = (blog: BlogItem) => {
  if (!blog.category) return [];
  if (Array.isArray(blog.category)) {
    return blog.category.map((item) => item?.name).filter(Boolean) as string[];
  }
  if (typeof blog.category === 'object') {
    return blog.category.name ? [blog.category.name] : [];
  }
  return [];
};

const BlogListScreen = () => {
  const navigation = useNavigation<Navigation>();
  const [keyword, setKeyword] = useState('');
  const [queryKeyword, setQueryKeyword] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const { data, loading, error, refetch } = useBlogs({ keyword: queryKeyword });

  const filteredBlogs = useMemo(() => {
    const normalized = queryKeyword.trim().toLowerCase();
    if (!normalized) return data;
    return data.filter((item) => item.name?.toLowerCase().includes(normalized));
  }, [data, queryKeyword]);

  const visibleBlogs = useMemo(
    () => filteredBlogs.slice(0, visibleCount),
    [filteredBlogs, visibleCount]
  );

  const handleSearch = () => {
    const trimmed = keyword.trim();
    setQueryKeyword(trimmed);
    setVisibleCount(PAGE_SIZE);
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filteredBlogs.length));
  };

  const hasMore = visibleCount < filteredBlogs.length;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.headerButton}>
          <ArrowLeft size={20} color={colors.secondary} />
        </Pressable>
        <Text style={styles.headerTitle}>Blog</Text>
        <View style={styles.headerButtonPlaceholder} />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.searchBox}>
          <Search size={16} color={colors.text} style={styles.searchIcon} />
          <TextInput
            placeholder="Tìm bài viết"
            placeholderTextColor="#9b9b9b"
            style={styles.searchInput}
            value={keyword}
            onChangeText={setKeyword}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <Pressable onPress={handleSearch} style={styles.searchButton}>
            <Text style={styles.searchButtonText}>Tìm</Text>
          </Pressable>
        </View>

        {loading && data.length === 0 ? (
          <View style={styles.skeletonList}>
            {[1, 2, 3].map((item) => (
              <View key={item} style={styles.skeletonCard}>
                <View style={styles.skeletonImage} />
                <View style={styles.skeletonBody}>
                  <View style={styles.skeletonLineWide} />
                  <View style={styles.skeletonLineMedium} />
                  <View style={styles.skeletonLineFull} />
                </View>
              </View>
            ))}
          </View>
        ) : error ? (
          <View style={styles.statusWrap}>
            <StatusMessage message={error} actionText="Thử lại" onAction={refetch} />
          </View>
        ) : filteredBlogs.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIllustration}>
              <BookOpen size={48} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>Chưa có bài viết</Text>
            <Text style={styles.emptyDesc}>
              Hãy thử tìm kiếm với từ khóa khác hoặc quay lại sau nhé.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {visibleBlogs.map((item) => {
              const image = item.featuredImage || item.avatar;
              const dateLabel = formatBlogDate(item.publishAt || item.createdAt);
              const categories = getCategoryNames(item);
              return (
                <Pressable
                  key={item._id}
                  onPress={() =>
                    navigation.navigate('BlogDetail', { slug: item.slug, blog: item })
                  }
                  style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
                >
                  {image ? (
                    <Image source={{ uri: image }} style={styles.cardImage} />
                  ) : (
                    <View style={styles.cardImagePlaceholder} />
                  )}
                  <View style={styles.cardBody}>
                    <View style={styles.metaRow}>
                      {dateLabel ? <Text style={styles.cardDate}>{dateLabel}</Text> : null}
                      {categories.length > 0 ? (
                        <View style={styles.categoryPill}>
                          <Text style={styles.categoryText}>{categories[0]}</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={styles.cardTitle} numberOfLines={2}>
                      {item.name}
                    </Text>
                    <Text style={styles.cardDesc} numberOfLines={3}>
                      {item.excerpt || item.expert || item.description || 'Xem chi tiết bài viết'}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}

        {loading && data.length > 0 ? (
          <View style={styles.inlineLoading}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.inlineLoadingText}>Đang tải...</Text>
          </View>
        ) : null}

        {!loading && !error && filteredBlogs.length > 0 && hasMore ? (
          <Pressable style={styles.loadMoreButton} onPress={handleLoadMore}>
            <Text style={styles.loadMoreText}>Tải thêm</Text>
          </Pressable>
        ) : null}
      </ScrollView>
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
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F1F1',
    backgroundColor: '#fff',
  },
  headerTitle: { color: colors.secondary, fontSize: 18, fontWeight: '700' },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.softPink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButtonPlaceholder: {
    width: 40,
    height: 40,
  },
  container: {
    paddingTop: 12,
    paddingBottom: 120,
  },
  searchBox: {
    marginHorizontal: 20,
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f3f5',
    borderRadius: 999,
    paddingHorizontal: 14,
    height: 48,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    color: colors.secondary,
    fontSize: 14,
  },
  searchButton: {
    marginLeft: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  searchButtonText: { color: '#fff', fontWeight: '600', fontSize: 12 },
  list: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 14,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardPressed: { transform: [{ scale: 0.99 }], opacity: 0.92 },
  cardImage: {
    width: '100%',
    height: 180,
    backgroundColor: colors.softPink,
  },
  cardImagePlaceholder: {
    width: '100%',
    height: 180,
    backgroundColor: colors.softPink,
  },
  cardBody: { padding: 14, gap: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardDate: { color: colors.primary, fontSize: 11, fontWeight: '700' },
  categoryPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.softPink,
  },
  categoryText: { color: colors.secondary, fontSize: 10, fontWeight: '600' },
  cardTitle: { color: colors.secondary, fontSize: 16, fontWeight: '700' },
  cardDesc: { color: colors.text, fontSize: 13, lineHeight: 18 },
  skeletonList: { paddingHorizontal: 20, paddingTop: 16, gap: 14 },
  skeletonCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    overflow: 'hidden',
  },
  skeletonImage: {
    height: 180,
    backgroundColor: colors.softPink,
  },
  skeletonBody: { padding: 14, gap: 10 },
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
  statusWrap: { paddingHorizontal: 20, marginTop: 20 },
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
  loadMoreButton: {
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  loadMoreText: { color: '#fff', fontWeight: '600' },
  inlineLoading: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  inlineLoadingText: { color: colors.text, fontSize: 12 },
});

export default BlogListScreen;
