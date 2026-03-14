import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, Clock, DollarSign } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { useServiceDetail } from '../../hooks';
import type { RootStackParamList } from '../../navigation/types';
import type { Service } from '../../types';

type RouteProps = RouteProp<RootStackParamList, 'ServiceDetail'>;
type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

const ServiceDetailScreen = () => {
  const navigation = useNavigation<NavigationProps>();
  const route = useRoute<RouteProps>();
  const { serviceId, service: initialService } = route.params;

  const { data: service, loading, error } = useServiceDetail(serviceId);

  const displayService = service || initialService;

  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, '').trim();
  };

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
          <Text style={styles.serviceTitle}>{displayService.name}</Text>

          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <DollarSign size={16} color={colors.primary} />
              <Text style={styles.metaText}>
                {displayService.price?.toLocaleString('vi-VN')} đ
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Clock size={16} color={colors.primary} />
              <Text style={styles.metaText}>
                {displayService.duration} phút
              </Text>
            </View>
          </View>

          {/* 1. Phần hiển thị Mô tả ngắn (Code cũ của bạn) */}
{displayService.description && (
  <View style={styles.descriptionContainer}>
    <Text style={styles.sectionTitle}>Mô tả</Text>
    <Text style={styles.description}>
      {stripHtml(displayService.description)}
    </Text>
  </View>
)}

{/* 2. THÊM MỚI: Phần hiển thị Quy trình chi tiết */}
{displayService.procedure && (
  <View style={styles.descriptionContainer}>
    <Text style={styles.sectionTitle}>Quy trình dịch vụ</Text>
    <Text style={styles.description}>
      {stripHtml(displayService.procedure)}
    </Text>
  </View>
)}
          {/* Category */}
          {displayService.categoryId && (
            <View style={styles.categoryContainer}>
              <Text style={styles.sectionTitle}>Danh mục</Text>
              <Text style={styles.categoryText}>
                {typeof displayService.categoryId === 'string'
                  ? displayService.categoryId
                  : displayService.categoryId.name}
              </Text>
            </View>
          )}

          {/* Status */}
          <View style={styles.statusContainer}>
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
        </View>

        {/* Action Button */}
        <View style={styles.actionContainer}>
          <Pressable style={styles.bookButton} onPress={() => {
            // Navigate to booking with this service
            navigation.navigate('Booking');
          }}>
            <Text style={styles.bookButtonText}>Đặt lịch dịch vụ</Text>
          </Pressable>
        </View>
      </ScrollView>
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
  serviceTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 16,
    lineHeight: 32,
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
  categoryContainer: {
    marginBottom: 20,
  },
  categoryText: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
  },
  statusContainer: {
    marginBottom: 20,
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
  actionContainer: {
    padding: 16,
  },
  bookButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
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
});

export default ServiceDetailScreen;