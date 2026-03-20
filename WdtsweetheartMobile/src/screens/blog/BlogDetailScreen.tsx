import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { ArrowLeft, BookOpen } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { StatusMessage } from '../../components/common';
import type { RootStackParamList } from '../../navigation/types';
import { getBlogDetail, type BlogItem } from '../../services/api/blog';

type Navigation = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, 'BlogDetail'>;

const stripHtml = (value?: string) => {
  if (!value) return '';
  return value
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
};

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

const BlogDetailScreen = () => {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<RouteProps>();
  const { slug, blog: initialBlog } = route.params;
  const resolvedSlug = slug || initialBlog?.slug || initialBlog?._id;
  const [blog, setBlog] = useState<BlogItem | undefined>(initialBlog);
  const [loading, setLoading] = useState(!initialBlog);
  const [error, setError] = useState<string | null>(null);

  const fetchBlog = async () => {
    if (!resolvedSlug) {
      setError('Không tìm thấy mã bài viết');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getBlogDetail(resolvedSlug);
      setBlog(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải bài viết');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlog();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedSlug]);

  const contentText = useMemo(
    () => stripHtml(blog?.content || blog?.description || ''),
    [blog?.content, blog?.description]
  );

  const categories = useMemo(() => (blog ? getCategoryNames(blog) : []), [blog]);
  const dateLabel = formatBlogDate(blog?.publishAt || blog?.createdAt);
  const image = blog?.featuredImage || blog?.avatar;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.headerButton}>
          <ArrowLeft size={20} color={colors.secondary} />
        </Pressable>
        <Text style={styles.headerTitle}>Chi tiết bài viết</Text>
        <View style={styles.headerButtonPlaceholder} />
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.loadingText}>Đang tải bài viết...</Text>
        </View>
      ) : error ? (
        <View style={styles.statusWrap}>
          <StatusMessage message={error} actionText="Thử lại" onAction={fetchBlog} />
        </View>
      ) : !blog ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIllustration}>
            <BookOpen size={48} color={colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>Không tìm thấy bài viết</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.container}>
          {image ? (
            <Image source={{ uri: image }} style={styles.heroImage} />
          ) : (
            <View style={styles.heroImagePlaceholder} />
          )}
          <View style={styles.contentCard}>
            <View style={styles.metaRow}>
              {dateLabel ? <Text style={styles.metaDate}>{dateLabel}</Text> : null}
              {categories.length > 0 ? (
                <View style={styles.categoryPill}>
                  <Text style={styles.categoryText}>{categories.join(', ')}</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.title}>{blog.name}</Text>
            {blog.excerpt || blog.expert || blog.description ? (
              <Text style={styles.excerpt}>
                {blog.excerpt || blog.expert || blog.description}
              </Text>
            ) : null}
            {contentText ? <Text style={styles.content}>{contentText}</Text> : null}
          </View>
        </ScrollView>
      )}
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
  headerButtonPlaceholder: { width: 40, height: 40 },
  container: {
    paddingBottom: 32,
  },
  heroImage: {
    width: '100%',
    height: 240,
    backgroundColor: colors.softPink,
  },
  heroImagePlaceholder: {
    width: '100%',
    height: 240,
    backgroundColor: colors.softPink,
  },
  contentCard: {
    marginTop: -20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metaDate: { color: colors.primary, fontSize: 11, fontWeight: '700' },
  categoryPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.softPink,
  },
  categoryText: { color: colors.secondary, fontSize: 10, fontWeight: '600' },
  title: { color: colors.secondary, fontSize: 20, fontWeight: '700', marginTop: 10 },
  excerpt: { color: colors.text, fontSize: 13, lineHeight: 19, marginTop: 8 },
  content: { color: colors.text, fontSize: 14, lineHeight: 22, marginTop: 12 },
  loadingWrap: { alignItems: 'center', justifyContent: 'center', marginTop: 40, gap: 8 },
  loadingText: { color: colors.text, fontSize: 13 },
  statusWrap: { paddingHorizontal: 20, marginTop: 20 },
  emptyState: { paddingHorizontal: 24, paddingVertical: 40, alignItems: 'center' },
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
});

export default BlogDetailScreen;
