import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Check, LogOut, MapPin, Package, Phone, Truck, User, Wallet } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { formatPrice } from '../../utils';
import { useCart } from '../../context/CartContext';
import { createOrder } from '../../services/api/order';
import { env } from '../../config';
import { geocodeAddress } from '../../services/api/geocode';
import { getAddresses, getProfile, type ProfileUser, type SavedAddress } from '../../services/api/dashboard';
import { logout as logoutApi } from '../../services/api/auth';
import { tokenStorage } from '../../services/auth/token';

type ShippingOption = {
  id?: string;
  rate?: string;
  code?: string;
  carrier?: string;
  carrier_name?: string;
  carrier_short_name?: string;
  service?: string;
  service_name?: string;
  fee?: number;
  total_fee?: number;
};

const getShippingMethodValue = (option?: ShippingOption | null) => {
  if (!option) return '';
  return String(option.id || option.rate || option.code || option.carrier_short_name || option.carrier || '');
};

const getShippingTitle = (option: ShippingOption, idx: number) =>
  option.carrier_name || option.carrier_short_name || option.carrier || `Gói ${idx + 1}`;

const getShippingFee = (option: ShippingOption) => Number(option.fee ?? option.total_fee ?? 0);

const CheckoutScreen = () => {
  const navigation = useNavigation<any>();
  const { cartItems, cartDetailItems, cartDetailTotal, cartTotal, shippingOptions, fetchCartDetail, clearCart } =
    useCart();

  const items = cartDetailItems.length > 0 ? cartDetailItems : cartItems;
  const subTotal = cartDetailItems.length > 0 ? cartDetailTotal : cartTotal;

  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState('new');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [showNote, setShowNote] = useState(false);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'money' | 'zalopay' | 'vnpay'>('money');
  const [shippingMethod, setShippingMethod] = useState('');
  const [booting, setBooting] = useState(true);
  const [loadingShip, setLoadingShip] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const shippingTyped = useMemo(() => ((shippingOptions || []) as ShippingOption[]), [shippingOptions]);
  const currentAddress = useMemo(
    () => addresses.find((item) => item._id === selectedAddressId) || null,
    [addresses, selectedAddressId]
  );
  const shippingFee = useMemo(() => {
    const option = shippingTyped.find((item) => getShippingMethodValue(item) === shippingMethod);
    return option ? getShippingFee(option) : 0;
  }, [shippingMethod, shippingTyped]);
  const total = subTotal + shippingFee;

  useEffect(() => {
    const load = async () => {
      try {
        const [profileResult, addressResult] = await Promise.allSettled([getProfile(), getAddresses()]);
        if (profileResult.status === 'fulfilled') {
          setProfile(profileResult.value);
          setFullName(profileResult.value.fullName || '');
          setPhone(profileResult.value.phone || '');
        }
        if (addressResult.status === 'fulfilled' && addressResult.value.length > 0) {
          setAddresses(addressResult.value);
          const preferred = addressResult.value.find((item) => item.isDefault) || addressResult.value[0];
          setSelectedAddressId(preferred._id);
          setCoords({ latitude: preferred.latitude, longitude: preferred.longitude });
        }
      } finally {
        setBooting(false);
      }
    };
    load();
  }, []);

  const resolveCoords = async () => {
    if (currentAddress) {
      const selected = { latitude: currentAddress.latitude, longitude: currentAddress.longitude };
      setCoords(selected);
      return selected;
    }
    if (!address.trim()) throw new Error('Vui lòng nhập địa chỉ.');
    const next = await geocodeAddress(address.trim());
    setCoords(next);
    return next;
  };

  const calculateShipping = async (silent = false) => {
    try {
      setLoadingShip(true);
      const nextCoords = await resolveCoords();
      const res = await fetchCartDetail(nextCoords);
      const first = ((res?.shippingOptions || [])[0] || null) as ShippingOption | null;
      setShippingMethod(first ? getShippingMethodValue(first) : '');
    } catch (error) {
      if (!silent) {
        Alert.alert('Không thể tính phí ship', error instanceof Error ? error.message : 'Vui lòng thử lại.');
      }
    } finally {
      setLoadingShip(false);
    }
  };

  useEffect(() => {
    if (!currentAddress || items.length === 0) return;
    calculateShipping(true);
  }, [currentAddress, items.length]);

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch {
      await tokenStorage.clear();
    } finally {
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    }
  };

  const handleSubmit = async () => {
    if (items.length === 0) {
      Alert.alert('Giỏ hàng trống', 'Vui lòng thêm sản phẩm trước khi thanh toán.');
      return;
    }
    if (!currentAddress && (!fullName.trim() || !phone.trim() || !address.trim())) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập họ tên, số điện thoại và địa chỉ.');
      return;
    }
    if (!shippingMethod) {
      Alert.alert('Chưa chọn vận chuyển', 'Vui lòng tính và chọn phương thức vận chuyển.');
      return;
    }

    let finalCoords = coords;
    if (!finalCoords) {
      try {
        finalCoords = await resolveCoords();
      } catch (error) {
        Alert.alert('Lỗi địa chỉ', error instanceof Error ? error.message : 'Vui lòng thử lại.');
        return;
      }
    }

    const receiver = currentAddress || {
      fullName: fullName.trim(),
      phone: phone.trim(),
      address: address.trim(),
    };

    try {
      setSubmitting(true);
      const res = await createOrder({
        fullName: receiver.fullName,
        phone: receiver.phone,
        address: receiver.address,
        latitude: finalCoords.latitude,
        longitude: finalCoords.longitude,
        note: note.trim() || undefined,
        paymentMethod,
        shippingMethod,
        items: items.map((item) => ({ productId: item.product.id, quantity: item.quantity })),
      });

      if (res.code !== 'success' || !res.orderCode || !res.phone) {
        Alert.alert('Không thể đặt hàng', res.message || 'Vui lòng thử lại.');
        return;
      }

      clearCart();

      if (paymentMethod === 'zalopay' || paymentMethod === 'vnpay') {
        const path = paymentMethod === 'zalopay' ? 'payment-zalopay' : 'payment-vnpay';
        await Linking.openURL(
          `${env.apiBaseUrl}/api/v1/client/order/${path}?orderCode=${res.orderCode}&phone=${res.phone}`
        );
        return;
      }

      navigation.replace('OrderSuccess', { orderCode: res.orderCode, phone: res.phone });
    } catch (error) {
      Alert.alert('Lỗi đặt hàng', error instanceof Error ? error.message : 'Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  if (booting) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.muted}>Đang tải thông tin thanh toán...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={['#FFF7F6', '#FFFFFF']} style={styles.hero}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <ArrowLeft size={20} color={colors.secondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thanh toán</Text>
          <View style={styles.iconSpacer} />
        </View>

        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>Xác nhận thông tin giao hàng</Text>
          <Text style={styles.bannerText}>Giao diện mobile được làm lại theo flow trang web của bạn.</Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.accountRow}>
            <View style={styles.avatar}><User size={18} color={colors.primary} /></View>
            <View style={styles.flex}>
              <Text style={styles.labelTop}>Tài khoản đặt hàng</Text>
              <Text style={styles.strong}>{profile?.fullName || fullName || 'Khách hàng'}</Text>
              <Text style={styles.muted}>{profile?.phone || phone || 'Chưa cập nhật số điện thoại'}</Text>
            </View>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
              <LogOut size={16} color="#D64545" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionTitleRow}>
            <MapPin size={16} color={colors.primary} />
            <Text style={styles.sectionTitle}>Thông tin nhận hàng</Text>
          </View>

          {addresses.map((item) => {
            const active = selectedAddressId === item._id;
            return (
              <Pressable key={item._id} onPress={() => setSelectedAddressId(item._id)} style={[styles.addressItem, active && styles.addressItemActive]}>
                <View style={[styles.radio, active && styles.radioActive]}>{active ? <View style={styles.radioDot} /> : null}</View>
                <View style={styles.flex}>
                  <Text style={styles.strong}>{item.fullName}</Text>
                  <Text style={styles.muted}>{item.phone}</Text>
                  <Text style={styles.muted}>{item.address}</Text>
                </View>
              </Pressable>
            );
          })}

          <Pressable onPress={() => setSelectedAddressId('new')} style={styles.newAddressRow}>
            <View style={[styles.radio, selectedAddressId === 'new' && styles.radioActive]}>
              {selectedAddressId === 'new' ? <View style={styles.radioDot} /> : null}
            </View>
            <Text style={[styles.newAddressText, selectedAddressId === 'new' && styles.newAddressTextActive]}>
              Sử dụng địa chỉ khác
            </Text>
          </Pressable>

          {selectedAddressId === 'new' ? (
            <View style={styles.formBlock}>
              <TextInput value={fullName} onChangeText={setFullName} placeholder="Họ và tên" style={styles.input} />
              <TextInput value={phone} onChangeText={setPhone} placeholder="Số điện thoại" keyboardType="phone-pad" style={styles.input} />
              <TextInput
                value={address}
                onChangeText={(value) => {
                  setAddress(value);
                  setCoords(null);
                  setShippingMethod('');
                }}
                placeholder="Địa chỉ chi tiết"
                multiline
                style={[styles.input, styles.textarea]}
              />
            </View>
          ) : currentAddress ? (
            <View style={styles.selectedBox}>
              <Check size={16} color={colors.primary} />
              <Text style={styles.selectedText}>{currentAddress.address}</Text>
            </View>
          ) : null}

          <TouchableOpacity style={styles.primaryBtn} onPress={() => calculateShipping(false)} disabled={loadingShip}>
            {loadingShip ? <ActivityIndicator color="#fff" /> : <Truck size={16} color="#fff" />}
            <Text style={styles.primaryBtnText}>Tính phí giao hàng</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Pressable style={styles.noteHeader} onPress={() => setShowNote((prev) => !prev)}>
            <View style={[styles.checkbox, showNote && styles.checkboxActive]}>{showNote ? <Check size={12} color="#fff" /> : null}</View>
            <Text style={styles.sectionTitle}>Thêm ghi chú đơn hàng</Text>
          </Pressable>
          {showNote ? (
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Ví dụ: gọi trước khi giao..."
              multiline
              style={[styles.input, styles.textarea, styles.noteInput]}
            />
          ) : null}
        </View>

        <View style={styles.card}>
          <View style={styles.sectionTitleRow}>
            <Truck size={16} color={colors.primary} />
            <Text style={styles.sectionTitle}>Phương thức vận chuyển</Text>
          </View>
          {shippingTyped.length > 0 ? (
            shippingTyped.map((option, idx) => {
              const value = getShippingMethodValue(option);
              const active = value === shippingMethod;
              return (
                <TouchableOpacity key={`${value}-${idx}`} onPress={() => setShippingMethod(value)} style={[styles.option, active && styles.optionActive]}>
                  <View style={styles.flex}>
                    <Text style={styles.optionTitle}>
                      {getShippingTitle(option, idx)} {option.service ? `(${option.service})` : ''}
                    </Text>
                    <Text style={styles.muted}>Giao hàng dự kiến từ đối tác vận chuyển</Text>
                  </View>
                  <Text style={active ? styles.priceActive : styles.priceNormal}>{formatPrice(getShippingFee(option))}</Text>
                </TouchableOpacity>
              );
            })
          ) : (
            <Text style={styles.muted}>Nhập địa chỉ hoặc chọn địa chỉ đã lưu để tải phương thức vận chuyển.</Text>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.sectionTitleRow}>
            <Wallet size={16} color={colors.primary} />
            <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
          </View>
          {[
            { key: 'money', label: 'Thanh toán khi nhận hàng (COD)' },
            { key: 'zalopay', label: 'Ví điện tử ZaloPay' },
            { key: 'vnpay', label: 'Cổng thanh toán VNPAY' },
          ].map((option) => {
            const active = paymentMethod === option.key;
            return (
              <TouchableOpacity key={option.key} onPress={() => setPaymentMethod(option.key as any)} style={[styles.option, active && styles.optionActive]}>
                <Text style={styles.optionTitle}>{option.label}</Text>
                <View style={[styles.radio, active && styles.radioActive]}>{active ? <View style={styles.radioDot} /> : null}</View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.card}>
          <View style={styles.sectionTitleRow}>
            <Package size={16} color={colors.primary} />
            <Text style={styles.sectionTitle}>Tóm tắt đơn hàng</Text>
          </View>
          {items.map((item) => (
            <View key={item.product.id} style={styles.summaryRow}>
              <Text style={styles.summaryName}>{item.product.title} x{item.quantity}</Text>
              <Text style={styles.summaryValue}>{formatPrice(item.product.priceValue * item.quantity)}</Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.muted}>Tạm tính</Text>
            <Text style={styles.summaryValue}>{formatPrice(subTotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.muted}>Phí vận chuyển</Text>
            <Text style={styles.summaryValue}>{shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Tổng cộng</Text>
            <Text style={styles.totalValue}>{formatPrice(total)}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.labelTop}>Tổng thanh toán</Text>
          <Text style={styles.bottomTotal}>{formatPrice(total)}</Text>
        </View>
        <TouchableOpacity style={[styles.submitBtn, submitting && styles.submitBtnDisabled]} onPress={handleSubmit} disabled={submitting}>
          <Text style={styles.submitText}>{submitting ? 'Đang xử lý...' : 'Đặt hàng ngay'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFF8F7' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: '#FFF8F7' },
  hero: { paddingBottom: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 14 },
  iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  iconSpacer: { width: 36 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.secondary },
  banner: { marginHorizontal: 16, padding: 16, borderRadius: 22, backgroundColor: '#fff' },
  bannerTitle: { fontSize: 16, fontWeight: '700', color: colors.secondary },
  bannerText: { fontSize: 12, color: '#6E6E6E', marginTop: 4, lineHeight: 18 },
  content: { padding: 16, paddingBottom: 144, gap: 16 },
  card: { backgroundColor: '#fff', borderRadius: 22, padding: 16 },
  accountRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.softPink, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  logoutBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF3F3', alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1 },
  labelTop: { fontSize: 11, color: '#8A8A8A', textTransform: 'uppercase', letterSpacing: 0.5 },
  strong: { fontSize: 14, fontWeight: '700', color: colors.secondary },
  muted: { fontSize: 12, color: '#707070', lineHeight: 18 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.secondary },
  addressItem: { flexDirection: 'row', gap: 12, borderWidth: 1, borderColor: '#F0E6E6', borderRadius: 16, padding: 12, marginBottom: 10 },
  addressItemActive: { borderColor: colors.primary, backgroundColor: '#FFF6F5' },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: '#CCC', alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  radioActive: { borderColor: colors.primary },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  newAddressRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  newAddressText: { fontSize: 13, fontWeight: '600', color: '#7A7A7A' },
  newAddressTextActive: { color: colors.primary },
  formBlock: { gap: 12 },
  input: { borderWidth: 1, borderColor: '#F1E7E7', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: colors.text, backgroundColor: '#FFFCFC' },
  textarea: { minHeight: 84, textAlignVertical: 'top' },
  selectedBox: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', borderRadius: 16, padding: 12, backgroundColor: '#FFF8F7', marginBottom: 12 },
  selectedText: { flex: 1, fontSize: 12, color: '#666', lineHeight: 18 },
  primaryBtn: { marginTop: 12, backgroundColor: colors.primary, borderRadius: 16, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  primaryBtnText: { color: '#fff', fontWeight: '700' },
  noteHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 1.5, borderColor: '#D8D8D8', alignItems: 'center', justifyContent: 'center' },
  checkboxActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  noteInput: { marginTop: 14 },
  option: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, borderWidth: 1, borderColor: '#F0E6E6', borderRadius: 16, padding: 14, marginBottom: 10 },
  optionActive: { borderColor: colors.primary, backgroundColor: '#FFF7F6' },
  optionTitle: { flex: 1, fontSize: 13, fontWeight: '600', color: colors.text },
  priceNormal: { fontSize: 12, fontWeight: '700', color: '#6B7280' },
  priceActive: { fontSize: 12, fontWeight: '700', color: colors.primary },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: 8 },
  summaryName: { flex: 1, fontSize: 12, color: colors.text },
  summaryValue: { fontSize: 12, color: colors.text, fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#EEE', marginVertical: 10 },
  totalLabel: { fontSize: 14, fontWeight: '700', color: colors.secondary },
  totalValue: { fontSize: 16, fontWeight: '700', color: colors.primary },
  bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: colors.border, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  bottomTotal: { fontSize: 20, fontWeight: '800', color: colors.primary },
  submitBtn: { backgroundColor: colors.secondary, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 22, alignItems: 'center', minWidth: 170 },
  submitBtnDisabled: { opacity: 0.7 },
  submitText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});

export default CheckoutScreen;
