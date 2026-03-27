import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Star, MessageSquare, Edit3 } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { getMyReviews } from '../../services/api/review';
import { Toast } from '../../components/common';

const ReviewScreen = () => {
  const navigation = useNavigation<any>();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  };

  const fetchReviews = async () => {
    try {
      const resp = await getMyReviews() as any;
      // Handle the case where the API returns { success: true, data: [...] }
      const data = resp?.data || resp;
      setReviews(Array.isArray(data) ? data : []);
    } catch (error) {
      showToast('Không thể tải lịch sử đánh giá');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved': return { text: 'Đã duyệt', bg: '#DCFCE7', color: '#166534' };
      case 'pending': return { text: 'Chờ duyệt', bg: '#FFEDD5', color: '#9A3412' };
      case 'rejected': return { text: 'Từ chối', bg: '#FEE2E2', color: '#991B1B' };
      default: return { text: 'Ẩn', bg: '#F3F4F6', color: '#374151' };
    }
  };

  const renderStars = (rating: number) => {
    return (
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((s) => (
          <Star 
            key={s} 
            size={12} 
            color={s <= rating ? '#F9A61C' : '#E5E7EB'} 
            fill={s <= rating ? '#F9A61C' : 'none'} 
          />
        ))}
      </View>
    );
  };

  const renderItem = ({ item }: { item: any }) => {
    const status = getStatusLabel(item.status);
    const product = item.productId || {};

    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <Image source={{ uri: product.images?.[0] || 'https://via.placeholder.com/150' }} style={styles.productImg} />
          <View style={styles.topInfo}>
            <Text style={styles.productName} numberOfLines={1}>{product.name || 'Sản phẩm'}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
              <View style={[styles.badge, { backgroundColor: status.bg }]}>
                <Text style={[styles.badgeText, { color: status.color }]}>{status.text}</Text>
              </View>
            </View>
            {renderStars(item.rating || 5)}
          </View>
        </View>
        
        <View style={styles.commentContent}>
          <Text style={styles.comment}>{item.comment || 'Không có bình luận'}</Text>
          {item.images && item.images.length > 0 && (
            <FlatList
              data={item.images}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(_, idx) => `img-${idx}`}
              renderItem={({ item: img }) => (
                <Image source={{ uri: img }} style={styles.reviewImg} />
              )}
              style={styles.imgList}
            />
          )}
        </View>

        <TouchableOpacity 
          style={styles.editBtn} 
          onPress={() => showToast('Tính năng cập nhật đánh giá sẽ sớm có mặt!')}
        >
          <Edit3 size={14} color={colors.primary} />
          <Text style={styles.editBtnText}>Cập nhật nhật ký</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color={colors.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đánh giá của tôi ({reviews.length})</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchReviews(); }} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={styles.emptyIconWrap}>
                 <MessageSquare size={40} color={colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>Chưa có đánh giá</Text>
              <Text style={styles.emptyText}>Bạn chưa để lại cảm nhận về sản phẩm nào.</Text>
            </View>
          }
        />
      )}
      <Toast visible={toastVisible} message={toastMessage} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: colors.secondary },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  cardTop: { flexDirection: 'row', marginBottom: 16 },
  productImg: { width: 70, height: 70, borderRadius: 12, backgroundColor: '#f5f5f5', borderWidth: 1, borderColor: '#eee' },
  topInfo: { flex: 1, marginLeft: 16, justifyContent: 'center' },
  productName: { fontSize: 15, fontWeight: '800', color: colors.secondary, marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  date: { fontSize: 11, color: '#999' },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  badgeText: { fontSize: 10, fontWeight: '700' },
  stars: { flexDirection: 'row', gap: 2 },
  commentContent: { backgroundColor: '#F9FAFB', borderRadius: 16, padding: 12 },
  comment: { fontSize: 13, color: '#4B5563', lineHeight: 20 },
  imgList: { marginTop: 12 },
  reviewImg: { width: 60, height: 60, borderRadius: 8, marginRight: 8, backgroundColor: '#eee' },
  editBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 8, 
    marginTop: 16, 
    paddingVertical: 10, 
    borderWidth: 1, 
    borderColor: colors.softPink, 
    borderRadius: 12,
    backgroundColor: '#FFF5F6'
  },
  editBtnText: { fontSize: 13, fontWeight: '700', color: colors.primary },
  empty: { alignItems: 'center', justifyContent: 'center', marginTop: 120, paddingHorizontal: 40 },
  emptyIconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFF5F6', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: colors.secondary, marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#7d7b7b', textAlign: 'center', lineHeight: 20 },
});

export default ReviewScreen;
