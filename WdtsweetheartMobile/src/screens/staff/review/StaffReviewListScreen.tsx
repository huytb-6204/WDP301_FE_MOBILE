import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, FlatList, ActivityIndicator, TextInput, Alert } from 'react-native';
import { ArrowLeft, Search, Star, MessageSquareDashed, UserCircle } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../../theme/colors';
import { getStaffReviews, changeStaffReviewStatus, deleteStaffReview, StaffReview } from '../../../services/api/review';
import dayjs from 'dayjs';

const StaffReviewListScreen = () => {
  const navigation = useNavigation();
  const [reviews, setReviews] = useState<StaffReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const data = await getStaffReviews({ limit: 100 });
      setReviews(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch reviews', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách đánh giá');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (item: StaffReview) => {
    const newStatus = item.status === 'active' ? 'inactive' : 'active';
    try {
      await changeStaffReviewStatus(item._id, newStatus);
      Alert.alert('Thành công', 'Đã cập nhật trạng thái đánh giá');
      fetchReviews();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái');
    }
  };

  const filteredReviews = reviews.filter(r => 
    (r.comment && r.comment.toLowerCase().includes(searchQuery.toLowerCase())) || 
    (r.userId?.fullName && r.userId.fullName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderReviewItem = ({ item }: { item: StaffReview }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.userInfo}>
          <UserCircle size={40} color="#919EAB" />
          <View style={styles.userMeta}>
            <Text style={styles.userName}>{item.userId?.fullName || 'Khách hàng ẩn danh'}</Text>
            <Text style={styles.productName}>{item.productId?.name}</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={[styles.statusBadge, { backgroundColor: item.status === 'active' ? '#E7F5EF' : '#FFE7E6' }]}
          onPress={() => handleToggleStatus(item)}
        >
          <Text style={[styles.statusText, { color: item.status === 'active' ? '#007B55' : '#FF4842' }]}>
            {item.status === 'active' ? 'Hiển thị' : 'Đã ẩn'}
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.cardBody}>
        <View style={styles.ratingRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Star 
              key={star} 
              size={16} 
              color={star <= item.rating ? '#FFAB00' : '#DFE3E8'} 
              fill={star <= item.rating ? '#FFAB00' : 'transparent'} 
            />
          ))}
          <Text style={styles.dateText}>{dayjs(item.createdAt).format('DD/MM/YYYY HH:mm')}</Text>
        </View>
        <Text style={styles.commentText}>{item.comment || 'Không có nhận xét chi tiết.'}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quản lý Đánh giá</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color="#919EAB" />
        <TextInput 
          placeholder="Tìm theo nội dung, tên khách hàng..." 
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredReviews}
          keyExtractor={(item) => item._id}
          renderItem={renderReviewItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
             <View style={styles.emptyWrap}>
              <MessageSquareDashed size={48} color="#DFE3E8" />
              <Text style={styles.emptyText}>Chưa có đánh giá nào</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 16, 
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F4F6F8'
  },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', margin: 16, paddingHorizontal: 16, height: 48, borderRadius: 12, borderWidth: 1, borderColor: '#F4F6F8' },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: '#111827' },
  list: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 },
  userInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 8 },
  userMeta: { marginLeft: 12 },
  userName: { fontSize: 15, fontWeight: '700', color: '#212B36' },
  productName: { fontSize: 12, color: '#637381', marginTop: 2, fontWeight: '500' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  cardBody: { paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F4F6F8' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  dateText: { marginLeft: 'auto', fontSize: 12, color: '#919EAB', fontWeight: '500' },
  commentText: { fontSize: 14, color: '#212B36', lineHeight: 22 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyWrap: { padding: 40, alignItems: 'center', gap: 16 },
  emptyText: { color: '#919EAB', fontSize: 15, fontWeight: '600' }
});

export default StaffReviewListScreen;
