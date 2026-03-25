import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MapPin, Trash2 } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusMessage, Toast } from '../../components/common';
import { colors } from '../../theme/colors';
import type { RootStackParamList } from '../../navigation/types';
import {
  changeDefaultAddress,
  createAddress,
  deleteAddress,
  getAddresses,
  type SavedAddress,
} from '../../services/api/dashboard';
import { geocodeAddress } from '../../services/api/geocode';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'AddressBook'>;

const AddressBookScreen = () => {
  const navigation = useNavigation<Navigation>();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 1600);
  };

  const fetchAddresses = async () => {
    setLoading(true);
    setError(null);
    try {
      setAddresses(await getAddresses());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải sổ địa chỉ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleCreate = async () => {
    if (!fullName.trim() || !phone.trim() || !address.trim()) {
      showToast('Vui lòng nhập đủ thông tin địa chỉ');
      return;
    }

    try {
      setSubmitting(true);
      const coords = await geocodeAddress(address.trim());
      const res = await createAddress({
        fullName: fullName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        latitude: coords.latitude,
        longitude: coords.longitude,
        isDefault,
      });

      showToast(res.message || 'Đã thêm địa chỉ');
      setFullName('');
      setPhone('');
      setAddress('');
      setIsDefault(false);
      await fetchAddresses();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Không thể thêm địa chỉ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteAddress(id);
      showToast(res.message || 'Đã xóa địa chỉ');
      await fetchAddresses();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Không thể xóa địa chỉ');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const res = await changeDefaultAddress(id);
      showToast(res.message || 'Đã đổi địa chỉ mặc định');
      await fetchAddresses();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Không thể đổi địa chỉ mặc định');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color={colors.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sổ địa chỉ</Text>
        <View style={styles.backButton} />
      </View>

      {error ? <StatusMessage message={error} actionText="Thử lại" onAction={fetchAddresses} /> : null}

      <FlatList
        data={addresses}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={
          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Thêm địa chỉ mới</Text>
            <TextInput value={fullName} onChangeText={setFullName} placeholder="Họ và tên" style={styles.input} />
            <TextInput value={phone} onChangeText={setPhone} placeholder="Số điện thoại" style={styles.input} keyboardType="phone-pad" />
            <TextInput value={address} onChangeText={setAddress} placeholder="Địa chỉ chi tiết" style={[styles.input, styles.textarea]} multiline />
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Đặt làm địa chỉ mặc định</Text>
              <Switch value={isDefault} onValueChange={setIsDefault} trackColor={{ true: colors.primary }} />
            </View>
            <TouchableOpacity style={[styles.primaryBtn, submitting && styles.btnDisabled]} onPress={handleCreate} disabled={submitting}>
              {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Lưu địa chỉ</Text>}
            </TouchableOpacity>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.centerWrap}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : (
            <StatusMessage message="Chưa có địa chỉ nào" />
          )
        }
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.addressCard}>
            <View style={styles.addressTop}>
              <View style={styles.iconWrap}>
                <MapPin size={16} color={colors.primary} />
              </View>
              <View style={styles.flex}>
                <Text style={styles.nameText}>{item.fullName}</Text>
                <Text style={styles.metaText}>{item.phone}</Text>
              </View>
              {item.isDefault ? <Text style={styles.defaultBadge}>Mặc định</Text> : null}
            </View>
            <Text style={styles.addressText}>{item.address}</Text>
            <View style={styles.actionRow}>
              {!item.isDefault ? (
                <TouchableOpacity style={styles.secondaryBtn} onPress={() => handleSetDefault(item._id)}>
                  <Text style={styles.secondaryBtnText}>Đặt mặc định</Text>
                </TouchableOpacity>
              ) : null}
              <TouchableOpacity style={styles.dangerBtn} onPress={() => handleDelete(item._id)}>
                <Trash2 size={14} color="#fff" />
                <Text style={styles.dangerBtnText}>Xóa</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <Toast visible={toastVisible} message={toastMessage} />
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
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: colors.secondary, fontSize: 18, fontWeight: '700' },
  listContent: { padding: 16, paddingBottom: 34, gap: 12 },
  formCard: { backgroundColor: colors.softPink, borderRadius: 18, padding: 14, gap: 10, marginBottom: 14 },
  sectionTitle: { color: colors.secondary, fontSize: 16, fontWeight: '700' },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.text,
  },
  textarea: { minHeight: 92, textAlignVertical: 'top' },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  switchLabel: { color: colors.text, fontSize: 13, fontWeight: '600' },
  primaryBtn: {
    minHeight: 44,
    borderRadius: 999,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: { color: '#fff', fontWeight: '700' },
  btnDisabled: { opacity: 0.7 },
  centerWrap: { paddingVertical: 24, alignItems: 'center', justifyContent: 'center' },
  addressCard: { borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: 14, gap: 10 },
  addressTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.softPink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: { flex: 1 },
  nameText: { color: colors.secondary, fontWeight: '700', fontSize: 14 },
  metaText: { color: colors.textLight, fontSize: 12, marginTop: 2 },
  defaultBadge: {
    color: colors.primary,
    backgroundColor: '#FFF4F4',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '700',
  },
  addressText: { color: colors.text, lineHeight: 20, fontSize: 13 },
  actionRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  secondaryBtn: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 14,
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: { color: colors.primary, fontWeight: '700', fontSize: 12 },
  dangerBtn: {
    borderRadius: 999,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 14,
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  dangerBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },
});

export default AddressBookScreen;
