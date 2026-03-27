import React, { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, Check, Search, MapPin } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { createAddress, updateAddress, type SavedAddress } from '../../services/api/dashboard';
import { Toast } from '../../components/common';

const AddressFormScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const addressItem = route.params?.address as SavedAddress | undefined;
  const isEdit = !!addressItem;

  const [form, setForm] = useState({
    fullName: addressItem?.fullName || '',
    phone: addressItem?.phone || '',
    address: addressItem?.address || '',
    isDefault: addressItem?.isDefault || false,
    latitude: addressItem?.latitude || 10.7410688,
    longitude: addressItem?.longitude || 106.7164031,
  });

  const [loading, setLoading] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  };

  const handleSave = async () => {
    if (!form.fullName || !form.phone || !form.address) {
      showToast('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        await updateAddress(addressItem._id, form);
        showToast('Cập nhật thành công');
      } else {
        await createAddress(form);
        showToast('Đã thêm địa chỉ mới');
      }
      setTimeout(() => navigation.goBack(), 1000);
    } catch (error) {
      showToast('Lỗi khi lưu địa chỉ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color={colors.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEdit ? 'Sửa địa chỉ' : 'Thêm địa chỉ'}</Text>
        <TouchableOpacity onPress={handleSave} disabled={loading} style={styles.saveBtn}>
          {loading ? <ActivityIndicator color={colors.primary} /> : <Check size={24} color={colors.primary} />}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Họ và tên người nhận</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập tên người nhận"
              value={form.fullName}
              onChangeText={(val) => setForm({ ...form, fullName: val })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Số điện thoại</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập số điện thoại"
              keyboardType="phone-pad"
              value={form.phone}
              onChangeText={(val) => setForm({ ...form, phone: val })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Địa chỉ chi tiết</Text>
            <View style={styles.addressInputWrapper}>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Gõ địa chỉ hoặc chọn trên bản đồ..."
                multiline
                numberOfLines={3}
                value={form.address}
                onChangeText={(val) => setForm({ ...form, address: val })}
              />
              <TouchableOpacity style={styles.mapIconBtn}>
                <MapPin size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.mapPlaceholder}>
             <MapPin size={40} color={colors.primary} style={{ opacity: 0.2 }} />
             <Text style={styles.mapText}>Tính năng bản đồ đang được phát triển</Text>
          </View>

          <TouchableOpacity 
            style={styles.defaultCheckbox}
            onPress={() => setForm({ ...form, isDefault: !form.isDefault })}
          >
            <View style={[styles.checkbox, form.isDefault && styles.checkboxChecked]}>
              {form.isDefault && <Check size={14} color="#fff" />}
            </View>
            <Text style={styles.defaultText}>Đặt làm địa chỉ mặc định</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.mainBtn}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.mainBtnText}>{isEdit ? 'LƯU THAY ĐỔI' : 'THÊM MỚI ĐỊA CHỈ'}</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>

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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: colors.secondary },
  saveBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20 },
  form: { gap: 20 },
  inputGroup: { gap: 8 },
  label: { fontSize: 13, fontWeight: '700', color: colors.secondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.secondary,
  },
  addressInputWrapper: { position: 'relative' },
  textArea: { height: 100, textAlignVertical: 'top', paddingRight: 44 },
  mapIconBtn: { position: 'absolute', right: 12, top: 12, width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  mapPlaceholder: {
    height: 150,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  mapText: { fontSize: 12, color: '#999', fontWeight: '500' },
  defaultCheckbox: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  defaultText: { fontSize: 14, fontWeight: '600', color: '#555' },
  mainBtn: { 
    backgroundColor: colors.secondary, 
    paddingVertical: 16, 
    borderRadius: 16, 
    alignItems: 'center', 
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  mainBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});

export default AddressFormScreen;
