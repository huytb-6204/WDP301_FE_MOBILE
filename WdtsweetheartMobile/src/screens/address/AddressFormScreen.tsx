import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, Check, Search } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { createAddress, updateAddress, type SavedAddress } from '../../services/api/dashboard';
import {
  resolveSuggestionToCoords,
  searchAddressSuggestions,
  type GeocodeSuggestion,
} from '../../services/api/geocode';
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
    latitude: Number(addressItem?.latitude) || 10.7410688,
    longitude: Number(addressItem?.longitude) || 106.7164031,
  });

  const [searchKeyword, setSearchKeyword] = useState(addressItem?.address || '');
  const [suggestions, setSuggestions] = useState<GeocodeSuggestion[]>([]);
  const [searchingAddress, setSearchingAddress] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  };

  useEffect(() => {
    const timer = setTimeout(async () => {
      const keyword = searchKeyword.trim();
      if (keyword.length < 3) {
        setSuggestions([]);
        return;
      }
      try {
        setSearchingAddress(true);
        const next = await searchAddressSuggestions(keyword);
        setSuggestions(next);
      } catch {
        setSuggestions([]);
      } finally {
        setSearchingAddress(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchKeyword]);

  const handleSelectSuggestion = async (item: GeocodeSuggestion) => {
    try {
      setSearchingAddress(true);
      const resolved = await resolveSuggestionToCoords(item);
      setForm((prev) => ({
        ...prev,
        address: item.displayName,
        latitude: resolved.latitude,
        longitude: resolved.longitude,
      }));
      setSearchKeyword(item.displayName);
      setSuggestions([]);
    } catch {
      showToast('Khong lay duoc toa do tu goi y nay');
    } finally {
      setSearchingAddress(false);
    }
  };

  const handleSave = async () => {
    if (!form.fullName.trim() || !form.phone.trim() || !form.address.trim()) {
      showToast('Vui long nhap day du thong tin');
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        await updateAddress(addressItem._id, form);
        showToast('Cap nhat thanh cong');
      } else {
        await createAddress(form);
        showToast('Da them dia chi moi');
      }
      setTimeout(() => navigation.goBack(), 900);
    } catch {
      showToast('Loi khi luu dia chi');
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
        <Text style={styles.headerTitle}>{isEdit ? 'Sua dia chi' : 'Them dia chi'}</Text>
        <TouchableOpacity onPress={handleSave} disabled={loading} style={styles.saveBtn}>
          {loading ? <ActivityIndicator color={colors.primary} /> : <Check size={24} color={colors.primary} />}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ho va ten nguoi nhan</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhap ten nguoi nhan"
              value={form.fullName}
              onChangeText={(val) => setForm({ ...form, fullName: val })}
              keyboardType="default"
              autoCapitalize="words"
              autoCorrect={false}
              spellCheck={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>So dien thoai</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhap so dien thoai"
              keyboardType="phone-pad"
              value={form.phone}
              onChangeText={(val) => setForm({ ...form, phone: val })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tim dia chi bang Goong</Text>
            <View style={styles.searchWrap}>
              <Search size={16} color="#8A8A8A" />
              <TextInput
                style={styles.searchInput}
                placeholder="Nhap khu vuc, duong, so nha..."
                value={searchKeyword}
                onChangeText={(value) => {
                  setSearchKeyword(value);
                  if (value.trim() !== form.address.trim()) {
                    setForm((prev) => ({ ...prev, latitude: 0, longitude: 0 }));
                  }
                }}
                keyboardType="default"
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
              />
            </View>
            {searchingAddress ? <Text style={styles.muted}>Dang tim goi y dia chi...</Text> : null}
            {suggestions.length > 0 ? (
              <View style={styles.suggestionList}>
                {suggestions.map((item, index) => (
                  <Pressable
                    key={`${item.displayName}-${index}`}
                    style={styles.suggestionItem}
                    onPress={() => void handleSelectSuggestion(item)}
                  >
                    <Text style={styles.suggestionText}>{item.displayName}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Dia chi chi tiet</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="So nha, toa nha, huong dan giao hang..."
              multiline
              numberOfLines={3}
              value={form.address}
              onChangeText={(val) => {
                setForm({ ...form, address: val });
                setSearchKeyword(val);
              }}
              keyboardType="default"
              autoCapitalize="sentences"
              autoCorrect={false}
              spellCheck={false}
            />
            <Text style={styles.helperText}>Nen chon tu goi y de he thong lay dung toa do giao hang.</Text>
          </View>

          <TouchableOpacity
            style={styles.defaultCheckbox}
            onPress={() => setForm({ ...form, isDefault: !form.isDefault })}
          >
            <View style={[styles.checkbox, form.isDefault && styles.checkboxChecked]}>
              {form.isDefault && <Check size={14} color="#fff" />}
            </View>
            <Text style={styles.defaultText}>Dat lam dia chi mac dinh</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.mainBtn} onPress={handleSave} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.mainBtnText}>{isEdit ? 'LUU THAY DOI' : 'THEM DIA CHI'}</Text>
            )}
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
  textArea: { height: 100, textAlignVertical: 'top' },
  searchWrap: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: colors.secondary,
    fontSize: 14,
  },
  suggestionList: {
    borderWidth: 1,
    borderColor: '#F0F0F0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  suggestionItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F6F6F6',
    backgroundColor: '#fff',
  },
  suggestionText: {
    color: colors.secondary,
    fontSize: 13,
  },
  helperText: { color: '#6B7280', fontSize: 12, lineHeight: 18 },
  muted: { color: '#6B7280', fontSize: 12 },
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
