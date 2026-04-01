import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { ArrowLeft, Save, ChevronDown, Search, CalendarDays, Check } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../../theme/colors';
import {
  getAdminUsers,
  getAdminPets,
  getAdminCages,
  createAdminBoardingBooking,
} from '../../../services/api/adminBookingHelper';
import StaffDatePickerModal from '../../../components/common/StaffDatePickerModal';
import dayjs from 'dayjs';

type PickerType = 'pet' | 'cage' | null;

type BoardingStatus = 'pending' | 'held' | 'confirmed' | 'checked-in';
type PaymentMethod = 'pay_at_site' | 'money' | 'vnpay' | 'prepaid';
type PaymentStatus = 'unpaid' | 'partial' | 'paid';

const BOARDING_STATUS_OPTIONS: Array<{ value: BoardingStatus; label: string }> = [
  { value: 'pending', label: 'Cho xu ly' },
  { value: 'held', label: 'Giu cho' },
  { value: 'confirmed', label: 'Da xac nhan' },
  { value: 'checked-in', label: 'Da nhan chuong' },
];

const PAYMENT_METHOD_OPTIONS: Array<{ value: PaymentMethod; label: string }> = [
  { value: 'pay_at_site', label: 'Thanh toan tai quay' },
  { value: 'money', label: 'Tien mat' },
  { value: 'vnpay', label: 'VNPay' },
  { value: 'prepaid', label: 'Tra truoc' },
];

const PAYMENT_STATUS_OPTIONS: Array<{ value: PaymentStatus; label: string }> = [
  { value: 'unpaid', label: 'Chua thanh toan' },
  { value: 'partial', label: 'Da coc 20%' },
  { value: 'paid', label: 'Da thanh toan' },
];

const normalizeCageSizeLabel = (value?: string) => {
  const raw = String(value || '').toUpperCase();
  if (raw === 'S' || raw === 'C') return 'S (duoi 8kg)';
  if (raw === 'M' || raw === 'B') return 'M (8-15kg)';
  if (raw === 'L' || raw === 'A') return 'L (15-20kg)';
  if (raw === 'XL_XXL' || raw === 'XL' || raw === 'XXL') return 'XL/XXL (tren 20kg)';
  return value || '-';
};

const StaffBoardingBookingCreateScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [userId, setUserId] = useState('');
  const [petId, setPetId] = useState('');
  const [cageId, setCageId] = useState('');
  const [checkInDate, setCheckInDate] = useState(dayjs());
  const [checkOutDate, setCheckOutDate] = useState(dayjs().add(1, 'day'));
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [specialCare, setSpecialCare] = useState('');
  const [discount, setDiscount] = useState('0');
  const [boardingStatus, setBoardingStatus] = useState<BoardingStatus>('confirmed');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pay_at_site');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('unpaid');

  const [users, setUsers] = useState<any[]>([]);
  const [pets, setPets] = useState<any[]>([]);
  const [cages, setCages] = useState<any[]>([]);

  const [userSearch, setUserSearch] = useState('');
  const [showUserSuggestions, setShowUserSuggestions] = useState(false);
  const [pickerType, setPickerType] = useState<PickerType>(null);
  const [pickerSearch, setPickerSearch] = useState('');
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);

  useEffect(() => {
    void fetchInitialData();
  }, []);

  useEffect(() => {
    if (userId) {
      void fetchPetsForUser(userId);
    } else {
      setPets([]);
      setPetId('');
    }
  }, [userId]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [u, c] = await Promise.all([getAdminUsers(), getAdminCages()]);
      setUsers(Array.isArray(u) ? u : []);
      setCages(Array.isArray(c) ? c : []);
    } catch (error) {
      console.error(error);
      Alert.alert('Loi', 'Khong the tai du lieu khoi tao');
    } finally {
      setLoading(false);
    }
  };

  const fetchPetsForUser = async (uid: string) => {
    try {
      const p = await getAdminPets(uid);
      const nextPets = Array.isArray(p) ? p : [];
      setPets(nextPets);
      if (!nextPets.find((item: any) => item._id === petId)) {
        setPetId(nextPets.length === 1 ? nextPets[0]._id : '');
      }
    } catch (error) {
      console.error(error);
      setPets([]);
      setPetId('');
    }
  };

  const selectedUser = useMemo(() => users.find((u: any) => u._id === userId), [users, userId]);
  const selectedPet = useMemo(() => pets.find((p: any) => p._id === petId), [pets, petId]);
  const selectedCage = useMemo(() => cages.find((c: any) => c._id === cageId), [cages, cageId]);

  const filteredUsers = useMemo(() => {
    const keyword = userSearch.trim().toLowerCase();
    if (!keyword) return users.slice(0, 8);

    return users.filter((item: any) =>
      [item.fullName, item.email, item.phone]
        .some((value) => String(value || '').toLowerCase().includes(keyword))
    ).slice(0, 8);
  }, [userSearch, users]);

  const filteredPickerItems = useMemo(() => {
    const keyword = pickerSearch.trim().toLowerCase();
    const source = pickerType === 'pet' ? pets : pickerType === 'cage' ? cages : [];
    if (!keyword) return source;

    return source.filter((item: any) => {
      if (pickerType === 'pet') {
        return [item.name, item.breed, item.type, item.species].some((value) => String(value || '').toLowerCase().includes(keyword));
      }
      return [item.cageCode, item.size, item.status, item.petType, item.type].some((value) => String(value || '').toLowerCase().includes(keyword));
    });
  }, [pickerSearch, pickerType, pets, cages]);

  const totalDays = useMemo(() => {
    const diff = checkOutDate.diff(checkInDate, 'day');
    return diff > 0 ? diff : 0;
  }, [checkInDate, checkOutDate]);

  const estimatedTotal = useMemo(() => {
    const pricePerDay = Number(selectedCage?.dailyPrice || 0);
    const total = (pricePerDay * totalDays) - Math.max(Number(discount || 0), 0);
    return total > 0 ? total : 0;
  }, [selectedCage, totalDays, discount]);

  const openPicker = (type: PickerType) => {
    setPickerSearch('');
    setPickerType(type);
  };

  const closePicker = () => {
    setPickerType(null);
    setPickerSearch('');
  };

  const handleUserSearchChange = (text: string) => {
    setUserSearch(text);
    setShowUserSuggestions(true);

    if (selectedUser) {
      const normalized = text.trim().toLowerCase();
      const matchesSelected = [selectedUser.fullName, selectedUser.phone, selectedUser.email]
        .some((value) => String(value || '').toLowerCase() === normalized);

      if (!matchesSelected) {
        setUserId('');
        setPetId('');
        setFullName('');
        setPhone('');
        setEmail('');
      }
    }
  };

  const handleSelectUser = (item: any) => {
    setUserId(item._id);
    setPetId('');
    setUserSearch(item.fullName || item.phone || item.email || '');
    setFullName(item.fullName || '');
    setPhone(item.phone || '');
    setEmail(item.email || '');
    setShowUserSuggestions(false);
  };

  const handleSelectItem = (item: any) => {
    if (pickerType === 'pet') {
      setPetId(item._id);
    } else if (pickerType === 'cage') {
      setCageId(item._id);
    }
    closePicker();
  };

  const handleSelectCheckIn = (date: dayjs.Dayjs) => {
    setCheckInDate(date.startOf('day'));
    if (!checkOutDate.isAfter(date, 'day')) {
      setCheckOutDate(date.add(1, 'day').startOf('day'));
    }
  };

  const handleSelectCheckOut = (date: dayjs.Dayjs) => {
    if (!date.isAfter(checkInDate, 'day')) {
      Alert.alert('Ngay khong hop le', 'Ngay tra chuong phai sau ngay nhan chuong it nhat 1 ngay.');
      return;
    }
    setCheckOutDate(date.startOf('day'));
  };

  const handleSubmit = async () => {
    if (!userId) {
      Alert.alert('Loi', 'Vui long chon khach hang.');
      return;
    }
    if (!petId || !cageId) {
      Alert.alert('Loi', 'Vui long chon du thu cung va chuong.');
      return;
    }
    if (totalDays <= 0) {
      Alert.alert('Loi', 'Ngay tra chuong phai sau ngay nhan chuong.');
      return;
    }
    if (!fullName.trim() || !phone.trim() || !email.trim()) {
      Alert.alert('Loi', 'Vui long nhap du ho ten, so dien thoai va email nguoi nhan.');
      return;
    }

    setSubmitting(true);
    try {
      await createAdminBoardingBooking({
        userId,
        petId,
        cageId,
        checkInDate: checkInDate.startOf('day').toISOString(),
        checkOutDate: checkOutDate.startOf('day').toISOString(),
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        notes: notes.trim(),
        specialCare: specialCare.trim(),
        discount: Math.max(Number(discount || 0), 0),
        boardingStatus,
        paymentMethod,
        paymentStatus,
      });

      Alert.alert('Thanh cong', 'Da tao don khach san thanh cong', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert('Loi', error?.message || 'Khong the tao don');
    } finally {
      setSubmitting(false);
    }
  };

  const renderPickerLabel = () => {
    if (pickerType === 'pet') return 'Chon thu cung';
    if (pickerType === 'cage') return 'Chon chuong';
    return '';
  };

  const renderPickerItem = ({ item }: { item: any }) => {
    const selectedId = pickerType === 'pet' ? petId : cageId;
    const isSelected = selectedId === item._id;

    return (
      <TouchableOpacity style={[styles.optionItem, isSelected && styles.optionItemActive]} onPress={() => handleSelectItem(item)}>
        <View style={{ flex: 1 }}>
          {pickerType === 'pet' && (
            <>
              <Text style={styles.optionTitle}>{item.name || 'Thu cung'}</Text>
              <Text style={styles.optionMeta}>{item.breed || item.type || item.species || 'Chua cap nhat'}{item.weight ? ` • ${item.weight}kg` : ''}</Text>
            </>
          )}
          {pickerType === 'cage' && (
            <>
              <Text style={styles.optionTitle}>{item.cageCode || 'Chuong'}</Text>
              <Text style={styles.optionMeta}>{String(item.type || '').toUpperCase() || 'N/A'} • {normalizeCageSizeLabel(item.size)}</Text>
            </>
          )}
        </View>
        {isSelected && <Check size={18} color={colors.primary} />}
      </TouchableOpacity>
    );
  };

  const OptionChips = ({
    title,
    options,
    value,
    onChange,
  }: {
    title: string;
    options: Array<{ value: string; label: string }>;
    value: string;
    onChange: (next: any) => void;
  }) => (
    <View style={styles.optionGroup}>
      <Text style={styles.label}>{title}</Text>
      <View style={styles.chipRow}>
        {options.map((item) => {
          const active = item.value === value;
          return (
            <TouchableOpacity
              key={item.value}
              style={[styles.smallChip, active && styles.smallChipActive]}
              onPress={() => onChange(item.value)}
            >
              <Text style={[styles.smallChipText, active && styles.smallChipTextActive]}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tao dat cho</Text>
        <TouchableOpacity style={styles.addBtn} onPress={handleSubmit} disabled={submitting}>
          {submitting ? <ActivityIndicator size="small" color={colors.primary} /> : <Save size={24} color={colors.primary} />}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Thong tin luu tru</Text>

          <Text style={styles.label}>Khach hang *</Text>
          <View style={styles.customerSearchWrap}>
            <View style={[styles.selectBox, showUserSuggestions && styles.selectBoxActive]}>
              <Search size={18} color="#637381" />
              <TextInput
                style={styles.customerSearchInput}
                value={userSearch}
                onChangeText={handleUserSearchChange}
                onFocus={() => setShowUserSuggestions(true)}
                placeholder="Nhap ten hoac so dien thoai khach hang"
                placeholderTextColor="#919EAB"
              />
              {!!userSearch && (
                <TouchableOpacity
                  onPress={() => {
                    setUserSearch('');
                    setUserId('');
                    setPetId('');
                    setFullName('');
                    setPhone('');
                    setEmail('');
                    setShowUserSuggestions(true);
                  }}
                >
                  <Text style={styles.clearText}>Xoa</Text>
                </TouchableOpacity>
              )}
            </View>

            {showUserSuggestions && (
              <View style={styles.userSuggestionList}>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((item: any) => {
                    const isSelected = item._id === userId;
                    return (
                      <TouchableOpacity
                        key={item._id}
                        style={[styles.userSuggestionItem, isSelected && styles.optionItemActive]}
                        onPress={() => handleSelectUser(item)}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={styles.optionTitle}>{item.fullName || 'Khach hang'}</Text>
                          <Text style={styles.optionMeta}>{item.phone || 'Chua co SDT'} • {item.email || 'Chua co email'}</Text>
                        </View>
                        {isSelected && <Check size={18} color={colors.primary} />}
                      </TouchableOpacity>
                    );
                  })
                ) : (
                  <Text style={styles.emptyText}>Khong tim thay khach hang phu hop</Text>
                )}
              </View>
            )}
          </View>

          {!!selectedUser && !showUserSuggestions && (
            <Text style={styles.selectedHint}>
              Da chon: {selectedUser.fullName || 'Khach hang'} • {selectedUser.phone || 'Chua co SDT'}
            </Text>
          )}

          <Text style={[styles.label, styles.formGap]}>Thu cung *</Text>
          <TouchableOpacity style={[styles.selectBox, !userId && styles.disabledField]} onPress={() => userId && openPicker('pet')} disabled={!userId}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.selectText, !selectedPet && styles.placeholderText]}>
                {selectedPet ? selectedPet.name : userId ? 'Chon thu cung' : 'Chon khach hang truoc'}
              </Text>
              {!!selectedPet && <Text style={styles.selectSubText}>{selectedPet.breed || selectedPet.type || selectedPet.species || 'Chua cap nhat'}</Text>}
            </View>
            <ChevronDown size={20} color="#637381" />
          </TouchableOpacity>

          <Text style={[styles.label, styles.formGap]}>Chuong *</Text>
          <TouchableOpacity style={styles.selectBox} onPress={() => openPicker('cage')}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.selectText, !selectedCage && styles.placeholderText]}>
                {selectedCage ? selectedCage.cageCode : 'Chon chuong'}
              </Text>
              {!!selectedCage && (
                <Text style={styles.selectSubText}>
                  {String(selectedCage.type || '').toUpperCase()} • {normalizeCageSizeLabel(selectedCage.size)}
                </Text>
              )}
            </View>
            <ChevronDown size={20} color="#637381" />
          </TouchableOpacity>

          <Text style={[styles.label, styles.formGap]}>Ngay nhan chuong *</Text>
          <TouchableOpacity style={styles.selectBox} onPress={() => setShowCheckInPicker(true)}>
            <View style={styles.dateRow}>
              <CalendarDays size={18} color="#637381" />
              <Text style={[styles.selectText, { marginLeft: 10 }]}>{checkInDate.format('DD/MM/YYYY')}</Text>
            </View>
            <ChevronDown size={20} color="#637381" />
          </TouchableOpacity>

          <Text style={[styles.label, styles.formGap]}>Ngay tra chuong *</Text>
          <TouchableOpacity style={styles.selectBox} onPress={() => setShowCheckOutPicker(true)}>
            <View style={styles.dateRow}>
              <CalendarDays size={18} color="#637381" />
              <Text style={[styles.selectText, { marginLeft: 10 }]}>{checkOutDate.format('DD/MM/YYYY')}</Text>
            </View>
            <ChevronDown size={20} color="#637381" />
          </TouchableOpacity>

          <Text style={styles.helperText}>So dem luu tru: {totalDays}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Thong tin nguoi nhan</Text>
          <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="Ho va ten" placeholderTextColor="#919EAB" />
          <TextInput style={[styles.input, styles.formGap]} value={phone} onChangeText={setPhone} placeholder="So dien thoai" keyboardType="phone-pad" placeholderTextColor="#919EAB" />
          <TextInput style={[styles.input, styles.formGap]} value={email} onChangeText={setEmail} placeholder="Email" autoCapitalize="none" keyboardType="email-address" placeholderTextColor="#919EAB" />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Trang thai don</Text>
          <OptionChips title="Trang thai luu tru" options={BOARDING_STATUS_OPTIONS} value={boardingStatus} onChange={setBoardingStatus} />
          <OptionChips title="Phuong thuc thanh toan" options={PAYMENT_METHOD_OPTIONS} value={paymentMethod} onChange={setPaymentMethod} />
          <OptionChips title="Trang thai thanh toan" options={PAYMENT_STATUS_OPTIONS} value={paymentStatus} onChange={setPaymentStatus} />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Chi phi va ghi chu</Text>
          <TextInput
            style={styles.input}
            value={discount}
            onChangeText={setDiscount}
            placeholder="Giam gia rieng (VND)"
            keyboardType="numeric"
            placeholderTextColor="#919EAB"
          />
          <TextInput
            style={[styles.input, styles.formGap]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Ghi chu"
            placeholderTextColor="#919EAB"
          />
          <TextInput
            style={[styles.input, styles.formGap, { height: 90 }]}
            value={specialCare}
            onChangeText={setSpecialCare}
            placeholder="Cham soc dac biet"
            placeholderTextColor="#919EAB"
            multiline
            textAlignVertical="top"
          />

          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Tam tinh</Text>
            <Text style={styles.summaryValue}>{estimatedTotal.toLocaleString('vi-VN')} VND</Text>
          </View>
        </View>

        <TouchableOpacity style={[styles.submitBtn, submitting && styles.disabledField]} onPress={handleSubmit} disabled={submitting}>
          <Text style={styles.submitBtnText}>{submitting ? 'Dang tao...' : 'Xac nhan tao dat cho'}</Text>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal visible={!!pickerType} transparent animationType="slide" onRequestClose={closePicker}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{renderPickerLabel()}</Text>
              <TouchableOpacity onPress={closePicker}><Text style={styles.closeText}>Dong</Text></TouchableOpacity>
            </View>
            <View style={styles.searchBox}>
              <Search size={18} color="#919EAB" />
              <TextInput
                style={styles.searchInput}
                value={pickerSearch}
                onChangeText={setPickerSearch}
                placeholder="Tim kiem..."
                placeholderTextColor="#919EAB"
              />
            </View>
            <FlatList
              data={filteredPickerItems}
              keyExtractor={(item) => item._id}
              renderItem={renderPickerItem}
              contentContainerStyle={styles.optionList}
              ListEmptyComponent={<Text style={styles.emptyText}>Khong co du lieu phu hop</Text>}
            />
          </View>
        </View>
      </Modal>

      <StaffDatePickerModal
        visible={showCheckInPicker}
        date={checkInDate}
        onClose={() => setShowCheckInPicker(false)}
        onSelect={handleSelectCheckIn}
        title="Chon ngay nhan chuong"
        todayLabel="Chon hom nay"
      />
      <StaffDatePickerModal
        visible={showCheckOutPicker}
        date={checkOutDate}
        onClose={() => setShowCheckOutPicker(false)}
        onSelect={handleSelectCheckOut}
        title="Chon ngay tra chuong"
        minDate={checkInDate.add(1, 'day')}
        todayLabel="Chon ngay gan nhat"
      />
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
    borderBottomColor: '#F4F6F8',
  },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  addBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  content: { padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#212B36', marginBottom: 16 },
  label: { fontSize: 13, color: '#637381', marginBottom: 8, fontWeight: '600' },
  formGap: { marginTop: 16 },
  input: {
    backgroundColor: '#F4F6F8',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#212B36',
    borderWidth: 1,
    borderColor: '#DFE3E8',
  },
  selectBox: {
    minHeight: 54,
    backgroundColor: '#F4F6F8',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#DFE3E8',
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectBoxActive: { borderColor: colors.primary },
  customerSearchWrap: { zIndex: 5 },
  customerSearchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#212B36',
    fontWeight: '600',
  },
  clearText: { color: colors.primary, fontSize: 13, fontWeight: '700', marginLeft: 8 },
  userSuggestionList: {
    marginTop: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DFE3E8',
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  userSuggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F6F8',
  },
  selectText: { fontSize: 15, color: '#212B36', fontWeight: '600' },
  placeholderText: { color: '#919EAB', fontWeight: '500' },
  selectSubText: { marginTop: 3, fontSize: 12, color: '#637381', fontWeight: '500' },
  selectedHint: { marginTop: 8, fontSize: 12, color: '#637381', fontWeight: '600' },
  helperText: { marginTop: 10, fontSize: 12, color: '#637381', fontWeight: '600' },
  dateRow: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  optionGroup: { marginTop: 4, marginBottom: 10 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  smallChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#DFE3E8',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  smallChipActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(255, 107, 107, 0.08)',
  },
  smallChipText: { fontSize: 13, fontWeight: '700', color: '#637381' },
  smallChipTextActive: { color: colors.primary },
  summaryBox: {
    marginTop: 14,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FFD8D8',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: { fontSize: 13, fontWeight: '700', color: '#637381' },
  summaryValue: { fontSize: 16, fontWeight: '800', color: colors.primary },
  submitBtn: { backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  disabledField: { opacity: 0.6 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F6F8',
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  closeText: { fontSize: 14, fontWeight: '700', color: colors.primary },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F6F8',
    margin: 16,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 14, color: '#212B36' },
  optionList: { paddingHorizontal: 16, paddingBottom: 20 },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#F4F6F8',
    marginBottom: 10,
  },
  optionItemActive: { borderColor: colors.primary, backgroundColor: 'rgba(255, 107, 107, 0.06)' },
  optionTitle: { fontSize: 15, fontWeight: '700', color: '#212B36' },
  optionMeta: { marginTop: 4, fontSize: 12, color: '#637381', fontWeight: '500' },
  emptyText: { textAlign: 'center', color: '#919EAB', fontSize: 14, fontWeight: '600', marginTop: 20 },
});

export default StaffBoardingBookingCreateScreen;
