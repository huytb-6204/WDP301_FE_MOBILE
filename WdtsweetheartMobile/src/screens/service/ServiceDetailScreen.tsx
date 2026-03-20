import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Image,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, Calendar, Clock, DollarSign, Star } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { useServiceDetail, useServiceReviews } from '../../hooks';
import type { RootStackParamList } from '../../navigation/types';
import type { Service } from '../../types';

type RouteProps = RouteProp<RootStackParamList, 'ServiceDetail'>;
type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

const ServiceDetailScreen = () => {
  const navigation = useNavigation<NavigationProps>();
  const route = useRoute<RouteProps>();
  const { serviceId, service: initialService } = route.params;

  const { data: service, loading, error } = useServiceDetail(serviceId);
  const { data: reviews, summary, loading: reviewsLoading } = useServiceReviews(serviceId);

  const displayService = service || initialService;
  const [reviewModalVisible, setReviewModalVisible] = useState(false);

  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, '').trim();
  };

  const reviewList = useMemo(() => {
    const list = reviews || [];
    return list.filter((review) => !review.status || review.status === 'approved');
  }, [reviews]);
  const ratingValue = summary.averageRating || 0;
  const totalReviews = summary.totalReviews || reviewList.length || 0;

  const priceTiers = useMemo(() => {
    const raw =
      (displayService as any)?.priceTiers ||
      (displayService as any)?.priceTable ||
      (displayService as any)?.pricingTiers ||
      (displayService as any)?.priceList;
    if (Array.isArray(raw) && raw.length) return raw;
    const basePrice =
      displayService?.price ??
      (displayService as any)?.basePrice ??
      (displayService as any)?.minPrice ??
      0;
    if (!basePrice) return [];
    return [
      { label: 'Dưới 3kg', price: basePrice },
      { label: '3 - 5kg', price: Math.round(basePrice * 1.3) },
      { label: 'Trên 5kg', price: Math.round(basePrice * 1.6) },
    ];
  }, [displayService]);

  const procedureSteps = useMemo(() => {
    const raw =
      (displayService as any)?.procedure ||
      (displayService as any)?.process ||
      (displayService as any)?.workflow ||
      '';
    const cleaned = raw ? stripHtml(String(raw)) : '';
    const steps = cleaned
      .split(/\n|•|-\s+/)
      .map((item: string) => item.trim())
      .filter(Boolean);
    if (steps.length >= 2) return steps;
    return [
      'Kiểm tra tình trạng lông, da và tai trước khi tắm.',
      'Chải lông, gỡ rối và làm sạch nhẹ nhàng.',
      'Tắm bằng sản phẩm chuyên dụng phù hợp với bé.',
      'Sấy khô, chải mượt và hoàn thiện.',
    ];
  }, [displayService]);

  const policyNotes = useMemo(() => {
    const raw =
      (displayService as any)?.policy ||
      (displayService as any)?.notes ||
      (displayService as any)?.notice ||
      '';
    const cleaned = raw ? stripHtml(String(raw)) : '';
    const items = cleaned
      .split(/\n|•|-\s+/)
      .map((item: string) => item.trim())
      .filter(Boolean);
    if (items.length >= 2) return items;
    return [
      'Vui lòng đến đúng giờ hẹn (trễ tối đa 10 phút).',
      'Bé cần được tẩy giun và tiêm phòng cơ bản trước khi sử dụng dịch vụ.',
      'Hủy lịch trước 4 giờ để được hỗ trợ đổi lịch miễn phí.',
      'Giá có thể thay đổi theo tình trạng lông và thể trạng của bé.',
    ];
  }, [displayService]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Chi tiết dịch vụ</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !displayService) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Chi tiết dịch vụ</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error || 'Không tìm thấy dịch vụ'}</Text>
          <Pressable style={styles.retryButton} onPress={() => navigation.goBack()}>
            <Text style={styles.retryButtonText}>Quay lại</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Chi tiết dịch vụ</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          {displayService.image ? (
            <Image
              source={{ uri: displayService.image }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.heroPlaceholder}>
              <Text style={styles.heroPlaceholderText}>📷</Text>
            </View>
          )}
        </View>

        {/* Service Info */}
        <View style={styles.infoContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.serviceTitle}>{displayService.name}</Text>
            <Pressable style={styles.reviewChip} onPress={() => setReviewModalVisible(true)}>
              <Star size={14} color={colors.primary} fill={colors.primary} />
              <Text style={styles.reviewChipText}>
                {ratingValue.toFixed(1)} ({totalReviews})
              </Text>
            </Pressable>
          </View>

          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <DollarSign size={16} color={colors.primary} />
              <Text style={styles.metaText}>
                {(displayService.price ?? (displayService as any)?.basePrice)?.toLocaleString('vi-VN')} đ
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Clock size={16} color={colors.primary} />
              <Text style={styles.metaText}>
                {displayService.duration} phút
              </Text>
            </View>
          </View>

          {displayService.description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.sectionTitle}>Mô tả</Text>
              <Text style={styles.description}>
                {stripHtml(displayService.description)}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Bảng giá tham khảo</Text>
          {priceTiers.length === 0 ? (
            <Text style={styles.description}>Liên hệ để nhận báo giá chi tiết.</Text>
          ) : (
            <View style={styles.priceTable}>
              {priceTiers.map((tier: any, index: number) => (
                <View key={`${tier.label}-${index}`} style={styles.priceRow}>
                  <Text style={styles.priceLabel}>{tier.label}</Text>
                  <Text style={styles.priceValue}>
                    {Number(tier.price ?? tier.value).toLocaleString('vi-VN')} đ
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Quy trình thực hiện</Text>
          {procedureSteps.map((step, index) => (
            <View key={`step-${index}`} style={styles.processRow}>
              <View style={styles.processBullet} />
              <Text style={styles.processText}>
                Bước {index + 1}: {step}
              </Text>
            </View>
          ))}
        </View>

        {displayService.categoryId && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Danh mục</Text>
            <Text style={styles.categoryText}>
              {typeof displayService.categoryId === 'string'
                ? displayService.categoryId
                : displayService.categoryId.name}
            </Text>
          </View>
        )}

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Trạng thái</Text>
          <View style={[
            styles.statusBadge,
            displayService.status === 'active' ? styles.statusActive : styles.statusInactive
          ]}>
            <Text style={[
              styles.statusText,
              displayService.status === 'active' ? styles.statusTextActive : styles.statusTextInactive
            ]}>
              {displayService.status === 'active' ? 'Đang hoạt động' : 'Tạm ngừng'}
            </Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.reviewHeader}>
            <Text style={styles.sectionTitle}>Đánh giá từ khách hàng</Text>
            <Pressable onPress={() => setReviewModalVisible(true)}>
              <Text style={styles.reviewLink}>Xem tất cả</Text>
            </Pressable>
          </View>
          {reviewsLoading ? (
            <View style={styles.reviewSkeleton}>
              <View style={styles.reviewSkeletonAvatar} />
              <View style={styles.reviewSkeletonContent}>
                <View style={styles.reviewSkeletonLine} />
                <View style={[styles.reviewSkeletonLine, styles.reviewSkeletonLineShort]} />
              </View>
            </View>
          ) : reviewList.length === 0 ? (
            <Text style={styles.description}>Chưa có đánh giá nào.</Text>
          ) : (
            reviewList.slice(0, 1).map((review: any) => (
              <View key={review._id} style={styles.reviewItem}>
                <View style={styles.reviewAvatar}>
                  <Text style={styles.reviewAvatarText}>
                    {review.user?.fullName?.[0] || 'K'}
                  </Text>
                </View>
                <View style={styles.reviewContent}>
                  <View style={styles.reviewMeta}>
                    <Text style={styles.reviewName}>{review.user?.fullName || 'Khách hàng'}</Text>
                    <Text style={styles.reviewDate}>
                      {review.createdAt
                        ? new Date(review.createdAt).toLocaleDateString('vi-VN')
                        : ''}
                    </Text>
                  </View>
                  <Text style={styles.reviewComment}>{review.comment}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Chính sách & Lưu ý</Text>
          {policyNotes.map((item, index) => (
            <View key={`policy-${index}`} style={styles.processRow}>
              <View style={styles.processBullet} />
              <Text style={styles.processText}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={styles.actionContainer}>
          <Pressable
            style={styles.bookButton}
            onPress={() => {
              navigation.navigate('Booking', { serviceId: displayService._id, service: displayService });
            }}>
            <Calendar size={16} color={colors.white} />
            <Text style={styles.bookButtonText}>Chọn ngày & đặt lịch</Text>
          </Pressable>
        </View>
      </ScrollView>

      <Modal visible={reviewModalVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Đánh giá từ khách hàng</Text>
              <Pressable onPress={() => setReviewModalVisible(false)}>
                <Text style={styles.modalClose}>Đóng</Text>
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.modalContent}>
              {reviewsLoading ? (
                <>
                  <View style={styles.reviewSkeleton}>
                    <View style={styles.reviewSkeletonAvatar} />
                    <View style={styles.reviewSkeletonContent}>
                      <View style={styles.reviewSkeletonLine} />
                      <View style={[styles.reviewSkeletonLine, styles.reviewSkeletonLineShort]} />
                    </View>
                  </View>
                  <View style={styles.reviewSkeleton}>
                    <View style={styles.reviewSkeletonAvatar} />
                    <View style={styles.reviewSkeletonContent}>
                      <View style={styles.reviewSkeletonLine} />
                      <View style={[styles.reviewSkeletonLine, styles.reviewSkeletonLineShort]} />
                    </View>
                  </View>
                </>
              ) : reviewList.length === 0 ? (
                <Text style={styles.description}>Chưa có đánh giá nào.</Text>
              ) : (
                reviewList.map((review: any) => (
                  <View key={review._id} style={styles.modalReviewItem}>
                    <View style={styles.reviewAvatar}>
                      <Text style={styles.reviewAvatarText}>
                        {review.user?.fullName?.[0] || 'K'}
                      </Text>
                    </View>
                    <View style={styles.reviewContent}>
                      <View style={styles.reviewMeta}>
                        <Text style={styles.reviewName}>{review.user?.fullName || 'Khách hàng'}</Text>
                        <Text style={styles.reviewDate}>
                          {review.createdAt
                            ? new Date(review.createdAt).toLocaleDateString('vi-VN')
                            : ''}
                        </Text>
                      </View>
                      <View style={styles.reviewStars}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={`${review._id}-${star}`}
                            size={14}
                            color={star <= review.rating ? colors.primary : colors.border}
                            fill={star <= review.rating ? colors.primary : 'transparent'}
                          />
                        ))}
                      </View>
                      <Text style={styles.reviewComment}>{review.comment}</Text>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 100,
  },
  heroContainer: {
    height: 200,
    backgroundColor: colors.lightGray,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroPlaceholderText: {
    fontSize: 48,
  },
  infoContainer: {
    padding: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  serviceTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 10,
    lineHeight: 32,
    flex: 1,
  },
  reviewChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.softPink,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  reviewChipText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  metaContainer: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  descriptionContainer: {
    marginBottom: 20,
  },
  description: {
    fontSize: 15,
    color: colors.textLight,
    lineHeight: 22,
  },
  sectionCard: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  priceTable: {
    gap: 10,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  priceLabel: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 14,
  },
  priceValue: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 14,
  },
  processRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  processBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginTop: 6,
  },
  processText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  categoryText: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusActive: {
    backgroundColor: '#e8f5e8',
  },
  statusInactive: {
    backgroundColor: '#ffebee',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusTextActive: {
    color: '#2e7d32',
  },
  statusTextInactive: {
    color: '#c62828',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewLink: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  reviewItem: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.softPink,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewAvatarText: {
    color: colors.primary,
    fontWeight: '700',
  },
  reviewContent: {
    flex: 1,
    gap: 4,
  },
  reviewMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewName: {
    fontWeight: '700',
    color: colors.text,
    fontSize: 13,
  },
  reviewDate: {
    color: colors.textLight,
    fontSize: 11,
  },
  reviewComment: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 18,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 6,
  },
  reviewSkeleton: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  reviewSkeletonAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.lightGray,
  },
  reviewSkeletonContent: {
    flex: 1,
    gap: 6,
  },
  reviewSkeletonLine: {
    height: 10,
    borderRadius: 6,
    backgroundColor: colors.lightGray,
  },
  reviewSkeletonLineShort: {
    width: '65%',
  },
  actionContainer: {
    padding: 16,
  },
  bookButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 16,
    color: colors.warning,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  modalClose: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '700',
  },
  modalContent: {
    paddingBottom: 30,
    gap: 14,
  },
  modalReviewItem: {
    flexDirection: 'row',
    gap: 10,
  },
});

export default ServiceDetailScreen;
