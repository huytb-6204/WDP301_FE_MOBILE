import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, Star, Camera, CheckCircle2 } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { createReview } from '../../services/api/review';
import { createBoardingCageReview } from '../../services/api/boarding';

const CreateReviewScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { type, id, name, image, orderId, orderItemId, variant } = route.params || {};

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (comment.length < 10) {
      Alert.alert('Thông báo', 'Nội dung đánh giá phải tối thiểu 10 ký tự');
      return;
    }

    setLoading(true);
    try {
      if (type === 'product') {
        await createReview({
          productId: id,
          orderId,
          orderItemId,
          rating,
          comment,
          variant: variant || [],
        });
      } else {
        await createBoardingCageReview(id, {
          rating,
          comment,
          fullName: '', // Backend will use account name if empty
        });
      }
      setSubmitted(true);
    } catch (error: any) {
      Alert.alert('Lỗi', error?.message || 'Không thể gửi đánh giá');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successWrap}>
          <CheckCircle2 size={80} color="#05A845" />
          <Text style={styles.successTitle}>Cảm ơn bạn đã đánh giá!</Text>
          <Text style={styles.successSub}>
            Đánh giá của bạn sẽ giúp cộng đồng yêu thú cưng có thêm thông tin hữu ích.
          </Text>
          <TouchableOpacity 
            style={styles.backHomeBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backHomeBtnText}>QUAY LẠI</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft size={24} color={colors.secondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Viết đánh giá</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.targetCard}>
            {image ? (
              <Image source={{ uri: image }} style={styles.targetImage} />
            ) : (
              <View style={[styles.targetImage, styles.placeholderImage]}>
                 <Camera size={24} color="#ccc" />
              </View>
            )}
            <View style={styles.targetInfo}>
              <Text style={styles.targetLabel}>{type === 'product' ? 'Sản phẩm' : 'Phòng khách sạn'}</Text>
              <Text style={styles.targetName} numberOfLines={2}>{name || 'N/A'}</Text>
              {variant && variant.length > 0 && (
                <Text style={styles.variantText}>Phân loại: {variant.join(', ')}</Text>
              )}
            </View>
          </View>

          <View style={styles.ratingSection}>
            <Text style={styles.sectionTitle}>Đánh giá chất lượng</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity 
                  key={star} 
                  onPress={() => setRating(star)}
                  style={styles.starBtn}
                >
                  <Star 
                    size={40} 
                    color={star <= rating ? '#FFAB00' : '#E0E0E0'} 
                    fill={star <= rating ? '#FFAB00' : 'transparent'} 
                  />
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.ratingLabel}>
              {rating === 1 && 'Tệ'}
              {rating === 2 && 'Không hài lòng'}
              {rating === 3 && 'Bình thường'}
              {rating === 4 && 'Hài lòng'}
              {rating === 5 && 'Tuyệt vời'}
            </Text>
          </View>

          <View style={styles.commentSection}>
            <Text style={styles.sectionTitle}>Nội dung đánh giá</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm/dịch vụ này..."
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              value={comment}
              onChangeText={setComment}
            />
            <Text style={styles.charCount}>{comment.length} ký tự (tối thiểu 10)</Text>
          </View>

          <TouchableOpacity 
            style={[styles.submitBtn, comment.length < 10 && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={loading || comment.length < 10}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>GỬI ĐÁNH GIÁ</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: colors.secondary },
  content: { padding: 20 },
  targetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 12,
    marginBottom: 24,
  },
  targetImage: { width: 64, height: 64, borderRadius: 8, backgroundColor: '#eee' },
  placeholderImage: { alignItems: 'center', justifyContent: 'center' },
  targetInfo: { flex: 1, marginLeft: 16 },
  targetLabel: { fontSize: 11, fontWeight: '700', color: colors.primary, marginBottom: 2, textTransform: 'uppercase' },
  targetName: { fontSize: 15, fontWeight: '700', color: colors.secondary },
  variantText: { fontSize: 12, color: '#999', marginTop: 4 },
  ratingSection: { alignItems: 'center', marginBottom: 32 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.secondary, marginBottom: 16, alignSelf: 'flex-start' },
  starsRow: { flexDirection: 'row', gap: 10 },
  starBtn: { padding: 4 },
  ratingLabel: { marginTop: 12, fontSize: 14, fontWeight: '700', color: '#FFAB00' },
  commentSection: { marginBottom: 32 },
  textArea: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
    fontSize: 15,
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#eee',
    color: colors.text,
  },
  charCount: { alignSelf: 'flex-end', marginTop: 8, fontSize: 12, color: '#999' },
  submitBtn: {
    backgroundColor: colors.primary,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnDisabled: { backgroundColor: '#E0E0E0', shadowOpacity: 0 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 1 },
  successWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  successTitle: { fontSize: 22, fontWeight: '800', color: colors.secondary, marginTop: 24, marginBottom: 12, textAlign: 'center' },
  successSub: { fontSize: 15, color: '#7d7b7b', textAlign: 'center', lineHeight: 22, marginBottom: 40 },
  backHomeBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 27,
  },
  backHomeBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});

export default CreateReviewScreen;
