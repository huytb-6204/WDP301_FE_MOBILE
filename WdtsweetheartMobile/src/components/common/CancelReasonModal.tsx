import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { CircleAlert, CircleDot, X } from 'lucide-react-native';

const DEFAULT_CANCEL_REASONS = [
  'Tôi muốn cập nhật địa chỉ hoặc số điện thoại nhận hàng.',
  'Tôi muốn thêm hoặc thay đổi mã giảm giá.',
  'Tôi muốn thay đổi sản phẩm, phân loại hoặc số lượng.',
  'Thủ tục thanh toán đang gây bất tiện.',
  'Tôi tìm thấy nơi mua khác phù hợp hơn.',
  'Tôi hiện không còn nhu cầu mua nữa.',
  'Tôi không tìm thấy lý do phù hợp.',
  'Lý do khác',
];

type CancelReasonModalProps = {
  visible: boolean;
  processing?: boolean;
  paymentStatus?: string;
  title?: string;
  reasons?: string[];
  onClose: () => void;
  onConfirm: (reason: string) => void;
};

const CancelReasonModal = ({
  visible,
  processing = false,
  paymentStatus,
  title = 'Lý do hủy đơn',
  reasons = DEFAULT_CANCEL_REASONS,
  onClose,
  onConfirm,
}: CancelReasonModalProps) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  useEffect(() => {
    if (!visible) return;
    setSelectedReason('');
    setCustomReason('');
  }, [visible]);

  const isOtherReason = selectedReason === 'Lý do khác';
  const finalReason = useMemo(() => {
    if (!selectedReason) return '';
    if (isOtherReason) return customReason.trim();
    return selectedReason;
  }, [customReason, isOtherReason, selectedReason]);

  const handleConfirm = () => {
    if (!finalReason) return;
    onConfirm(finalReason);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>
                Chọn lý do phù hợp nhất để gửi yêu cầu hủy đơn hàng.
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} disabled={processing}>
              <X size={18} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.noticeBox}>
            <CircleAlert size={18} color="#B45309" />
            <Text style={styles.noticeText}>
              Nếu bạn xác nhận hủy, đơn hàng sẽ được cập nhật theo yêu cầu này.
            </Text>
          </View>

          {String(paymentStatus || '').toLowerCase() === 'paid' && (
            <Text style={styles.paymentHint}>
              Đơn đã thanh toán sẽ chuyển sang yêu cầu hủy để admin kiểm tra và xử lý hoàn tiền.
            </Text>
          )}

          <ScrollView
            style={styles.reasonList}
            contentContainerStyle={styles.reasonListContent}
            showsVerticalScrollIndicator={false}
          >
            {reasons.map((reason) => {
              const selected = selectedReason === reason;
              return (
                <TouchableOpacity
                  key={reason}
                  style={[styles.reasonItem, selected && styles.reasonItemSelected]}
                  onPress={() => setSelectedReason(reason)}
                  activeOpacity={0.9}
                >
                  <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
                    {selected && <CircleDot size={10} color="#E1554E" fill="#E1554E" />}
                  </View>
                  <Text style={[styles.reasonText, selected && styles.reasonTextSelected]}>{reason}</Text>
                </TouchableOpacity>
              );
            })}

            {isOtherReason && (
              <TextInput
                style={styles.input}
                value={customReason}
                onChangeText={setCustomReason}
                placeholder="Nhập lý do của bạn..."
                placeholderTextColor="#9CA3AF"
                multiline
                textAlignVertical="top"
                editable={!processing}
              />
            )}
          </ScrollView>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.secondaryBtn} onPress={onClose} disabled={processing}>
              <Text style={styles.secondaryBtnText}>Để sau</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.primaryBtn, !finalReason && styles.primaryBtnDisabled]}
              onPress={handleConfirm}
              disabled={!finalReason || processing}
            >
              <Text style={styles.primaryBtnText}>{processing ? 'Đang xử lý...' : 'Xác nhận hủy'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '85%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 26,
  },
  header: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerContent: { flex: 1 },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1F2937',
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
    color: '#6B7280',
    fontWeight: '500',
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noticeBox: {
    marginTop: 14,
    borderRadius: 14,
    padding: 12,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    flexDirection: 'row',
    gap: 10,
  },
  noticeText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: '#9A3412',
    fontWeight: '500',
  },
  paymentHint: {
    marginTop: 10,
    fontSize: 12,
    lineHeight: 18,
    color: '#DC2626',
    fontWeight: '700',
  },
  reasonList: {
    marginTop: 14,
  },
  reasonListContent: {
    gap: 10,
    paddingBottom: 8,
  },
  reasonItem: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
  },
  reasonItemSelected: {
    borderColor: '#F6B6B2',
    backgroundColor: '#FFF5F5',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  radioOuterSelected: {
    borderColor: '#E1554E',
  },
  reasonText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#374151',
    fontWeight: '600',
  },
  reasonTextSelected: {
    color: '#111827',
  },
  input: {
    minHeight: 110,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    lineHeight: 20,
    color: '#111827',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  secondaryBtn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#4B5563',
  },
  primaryBtn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#E1554E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnDisabled: {
    backgroundColor: '#FCA5A5',
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

export default CancelReasonModal;
