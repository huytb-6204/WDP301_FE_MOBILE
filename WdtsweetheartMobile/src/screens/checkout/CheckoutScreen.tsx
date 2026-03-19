import React, { useMemo, useState } from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MapPin, Package, Wallet } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { formatPrice } from '../../utils';
import { useCart } from '../../context/CartContext';
import { createOrder } from '../../services/api/order';
import { env } from '../../config';
import { geocodeAddress } from '../../services/api/geocode';

type ShippingOption = {
  id?: string;
  rate?: string;
  code?: string;
  carrier?: string;
  carrier_short_name?: string; 
  fee?: number;
};

const getShippingMethodValue = (option?: ShippingOption | null) => {
  if (!option) return '';
  // Backend createPost uses req.body.shippingMethod as GoShip shipment.rate.
  return option.rate || option.id || option.code || option.carrier_short_name || option.carrier || '';
};

const CheckoutScreen = () => {
  const navigation = useNavigation<any>();
  const {
    cartItems,
    cartDetailItems,
    cartDetailTotal,
    cartTotal,
    shippingOptions,
    fetchCartDetail,
    clearCart,
  } = useCart();

  const displayItems = cartDetailItems.length > 0 ? cartDetailItems : cartItems;
  const subTotal = cartDetailItems.length > 0 ? cartDetailTotal : cartTotal;

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [resolvedCoords, setResolvedCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'money' | 'zalopay' | 'vnpay'>('money');
  const [shippingSelectedMethod, setShippingSelectedMethod] = useState('');
  const [shippingLoading, setShippingLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const shippingOptionsTyped = useMemo(
    () => ((shippingOptions || []) as ShippingOption[]),
    [shippingOptions]
  );

  const shippingSelected = useMemo(
    () => shippingOptionsTyped.find((item) => getShippingMethodValue(item) === shippingSelectedMethod) || null,
    [shippingOptionsTyped, shippingSelectedMethod]
  );

  const shippingFee = useMemo(() => {
    return shippingSelected?.fee ? Number(shippingSelected.fee) : 0;
  }, [shippingSelected]);

  const total = useMemo(() => {
    return subTotal + shippingFee;
  }, [subTotal, shippingFee]);

  const resolveCoords = async () => {
    if (!address.trim()) {
      throw new Error('Vui lòng nhập địa chỉ để tính phí giao hàng.');
    }
    const coords = await geocodeAddress(address);
    setResolvedCoords(coords);
    return coords;
  };

  const handleFetchShipping = async () => {
    try {
      setShippingLoading(true);
      const coords = await resolveCoords();
      const res = await fetchCartDetail(coords);
      if (res?.shippingOptions && res.shippingOptions.length > 0) {
        const first = (res.shippingOptions[0] || null) as ShippingOption | null;
        setShippingSelectedMethod(getShippingMethodValue(first));
      } else {
        setShippingSelectedMethod('');
        Alert.alert('Không có phương thức vận chuyển', 'Không tìm thấy gói ship phù hợp cho địa chỉ này.');
      }
    } catch (err) {
      Alert.alert('Lỗi vị trí', err instanceof Error ? err.message : 'Không thể xử lý địa chỉ.');
    } finally {
      setShippingLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (displayItems.length === 0) {
      Alert.alert('Giỏ hàng trống', 'Vui lòng thêm sản phẩm trước khi thanh toán.');
      return;
    }
    if (!fullName || !phone || !address) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập họ tên, số điện thoại và địa chỉ.');
      return;
    }
    if (!shippingSelectedMethod) {
      Alert.alert('Chưa chọn vận chuyển', 'Vui lòng chọn phương thức vận chuyển.');
      return;
    }

    let coords = resolvedCoords;
    if (!coords) {
      try {
        coords = await resolveCoords();
      } catch (err) {
        Alert.alert('Lỗi vị trí', err instanceof Error ? err.message : 'Không thể xử lý địa chỉ.');
        return;
      }
    }

    try {
      setSubmitting(true);
      const res = await createOrder({
        fullName,
        phone,
        address,
        latitude: coords.latitude,
        longitude: coords.longitude,
        note,
        paymentMethod,
        shippingMethod: shippingSelectedMethod,
        items: displayItems.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      });

      if (res.code !== 'success' || !res.orderCode || !res.phone) {
        Alert.alert('Không thể đặt hàng', res.message || 'Vui lòng thử lại.');
        return;
      }

      if (paymentMethod === 'zalopay' || paymentMethod === 'vnpay') {
        const path = paymentMethod === 'zalopay' ? 'payment-zalopay' : 'payment-vnpay';
        const url = `${env.apiBaseUrl}/api/v1/client/order/${path}?orderCode=${res.orderCode}&phone=${res.phone}`;
        await Linking.openURL(url);
      } else {
        Alert.alert('Đặt hàng thành công', 'Chúng tôi sẽ liên hệ xác nhận đơn hàng.');
      }

      clearCart();
      navigation.navigate('Home');
    } catch (err) {
      Alert.alert('Lỗi đặt hàng', err instanceof Error ? err.message : 'Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thanh toán</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <MapPin size={16} color={colors.primary} />
            <Text style={styles.sectionTitle}>Thông tin giao hàng</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Họ và tên</Text>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="Nguyễn Văn A"
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Số điện thoại</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="0909 123 456"
              keyboardType="phone-pad"
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Địa chỉ</Text>
            <TextInput
              value={address}
              onChangeText={(value) => {
                setAddress(value);
                setResolvedCoords(null);
                setShippingSelectedMethod('');
              }}
              placeholder="Số nhà, đường, phường..."
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ghi chú (tùy chọn)</Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Ví dụ: giao giờ hành chính..."
              style={[styles.input, styles.inputMultiline]}
              multiline
            />
          </View>

          <TouchableOpacity
            style={[styles.shipBtn, shippingLoading && styles.shipBtnDisabled]}
            onPress={handleFetchShipping}
            disabled={shippingLoading}
          >
            <Text style={styles.shipBtnText}>
              {shippingLoading ? 'Đang tính...' : 'Tính phí giao hàng'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Package size={16} color={colors.primary} />
            <Text style={styles.sectionTitle}>Phương thức vận chuyển</Text>
          </View>
          {shippingOptionsTyped.length > 0 ? (
            shippingOptionsTyped.map((option, idx) => {
              const title = option.carrier_short_name || option.carrier || `Gói ${idx + 1}`;
              const fee = option.fee ?? 0;
              const methodValue = getShippingMethodValue(option);
              const active = shippingSelectedMethod === methodValue;
              return (
                <TouchableOpacity
                  key={`${title}-${idx}`}
                  style={[styles.shippingOption, active && styles.shippingOptionActive]}
                  onPress={() => setShippingSelectedMethod(methodValue)}
                >
                  <View>
                    <Text style={styles.shippingTitle}>{title}</Text>
                    <Text style={styles.shippingFee}>{formatPrice(Number(fee))}</Text>
                  </View>
                  <View style={[styles.radio, active && styles.radioActive]} />
                </TouchableOpacity>
              );
            })
          ) : (
            <Text style={styles.emptyHint}>
              Nhập địa chỉ và bấm "Tính phí giao hàng" để tải phương thức.
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Wallet size={16} color={colors.primary} />
            <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
          </View>
          {[
            { key: 'money', label: 'Thanh toán khi nhận hàng (COD)' },
            { key: 'zalopay', label: 'ZaloPay' },
            { key: 'vnpay', label: 'VNPay' },
          ].map((option) => {
            const active = paymentMethod === option.key;
            return (
              <TouchableOpacity
                key={option.key}
                style={[styles.paymentOption, active && styles.paymentOptionActive]}
                onPress={() => setPaymentMethod(option.key as 'money' | 'zalopay' | 'vnpay')}
              >
                <Text style={styles.paymentText}>{option.label}</Text>
                <View style={[styles.radio, active && styles.radioActive]} />
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tóm tắt đơn hàng</Text>
          {displayItems.map((item) => (
            <View key={item.product.id} style={styles.summaryRow}>
              <Text style={styles.summaryName} numberOfLines={1}>
                {item.product.title} x{item.quantity}
              </Text>
              <Text style={styles.summaryValue}>
                {formatPrice(item.product.priceValue * item.quantity)}
              </Text>
            </View>
          ))}
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tạm tính</Text>
            <Text style={styles.summaryValue}>{formatPrice(subTotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Phí vận chuyển</Text>
            <Text style={styles.summaryValue}>{formatPrice(shippingFee)}</Text>
          </View>
          <View style={styles.summaryTotalRow}>
            <Text style={styles.summaryTotalLabel}>Tổng cộng</Text>
            <Text style={styles.summaryTotalValue}>{formatPrice(total)}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.submitText}>{submitting ? 'Đang xử lý...' : 'Đặt hàng'}</Text>
        </TouchableOpacity>
      </View>
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: '#fff',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.softPink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  content: {
    padding: 16,
    paddingBottom: 120,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
    backgroundColor: '#fafafa',
  },
  inputMultiline: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  shipBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  shipBtnDisabled: {
    opacity: 0.7,
  },
  shipBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
  shippingOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  shippingOptionActive: {
    borderColor: colors.primary,
    backgroundColor: '#fff5f5',
  },
  shippingTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  shippingFee: {
    fontSize: 12,
    color: colors.primary,
    marginTop: 4,
  },
  paymentOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  paymentOptionActive: {
    borderColor: colors.primary,
    backgroundColor: '#fff5f5',
  },
  paymentText: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '600',
  },
  radio: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ccc',
  },
  radioActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  emptyHint: {
    fontSize: 12,
    color: '#888',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryName: {
    fontSize: 12,
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#777',
  },
  summaryValue: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '600',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 10,
  },
  summaryTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  summaryTotalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  summaryTotalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 20,
  },
  submitBtn: {
    backgroundColor: colors.secondary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default CheckoutScreen;
