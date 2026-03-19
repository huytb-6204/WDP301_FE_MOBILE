import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../../theme/colors';
import type { RootStackParamList } from '../../navigation/types';
import { StatusMessage, Toast } from '../../components/common';
import {
  createBooking,
  createPet,
  getMyPets,
  getServices,
  getTimeSlots,
} from '../../services/api/booking';
import type { Pet, ServiceItem, TimeSlot } from '../../types';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'Booking'>;

const formatDateInput = (date: Date) => {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const parseDateInput = (value: string) => {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? new Date() : date;
};

const formatDateLabel = (value: string) => {
  const date = parseDateInput(value);
  return date.toLocaleDateString('vi-VN');
};

const weekDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const phoneRegex = /^(0?)(3[2-9]|5[6|8|9]|7[0|6-9]|8[0-6|8|9]|9[0-4|6-9])[0-9]{7}$/;

const BookingScreen = () => {
  const navigation = useNavigation<Navigation>();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);

  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingPets, setLoadingPets] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [serviceId, setServiceId] = useState('');
  const [slotId, setSlotId] = useState('');
  const [date, setDate] = useState(formatDateInput(new Date()));
  const [selectedPetIds, setSelectedPetIds] = useState<string[]>([]);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [notes, setNotes] = useState('');

  const [showPetModal, setShowPetModal] = useState(false);
  const [showCreatePetModal, setShowCreatePetModal] = useState(false);
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(parseDateInput(date));

  const [petName, setPetName] = useState('');
  const [petType, setPetType] = useState<'dog' | 'cat'>('dog');
  const [petWeight, setPetWeight] = useState('');
  const [petBreed, setPetBreed] = useState('');
  const [petColor, setPetColor] = useState('');
  const [petNotes, setPetNotes] = useState('');
  const [petGender, setPetGender] = useState<'male' | 'female' | 'unknown'>('unknown');

  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const selectedPetsLabel = useMemo(() => {
    if (selectedPetIds.length === 0) return 'Chưa chọn thú cưng';
    return pets
      .filter((pet) => selectedPetIds.includes(pet._id))
      .map((pet) => pet.name)
      .join(', ');
  }, [pets, selectedPetIds]);

  const monthMeta = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: Array<number | null> = [];

    for (let i = 0; i < firstDay; i += 1) cells.push(null);
    for (let day = 1; day <= daysInMonth; day += 1) cells.push(day);

    return {
      label: currentMonth.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' }),
      year,
      month,
      cells,
    };
  }, [currentMonth]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 1600);
  };

  const fetchServices = async () => {
    setLoadingServices(true);
    setError(null);
    try {
      const res = await getServices();
      setServices(res.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải dịch vụ');
    } finally {
      setLoadingServices(false);
    }
  };

  const fetchPets = async () => {
    setLoadingPets(true);
    try {
      const res = await getMyPets();
      setPets(res.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải thú cưng');
    } finally {
      setLoadingPets(false);
    }
  };

  const fetchSlots = async (nextServiceId: string, nextDate: string) => {
    if (!nextServiceId || !nextDate) return;
    setLoadingSlots(true);
    setError(null);
    try {
      const res = await getTimeSlots({ serviceId: nextServiceId, date: nextDate });
      const available = (res.data || []).filter((slot) => slot.status === 'available');
      setSlots(available);
      setSlotId('');
    } catch (err) {
      setSlots([]);
      setError(err instanceof Error ? err.message : 'Không thể tải khung giờ');
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    fetchServices();
    fetchPets();
  }, []);

  useEffect(() => {
    if (serviceId && date) {
      fetchSlots(serviceId, date);
    }
  }, [serviceId, date]);

  const togglePet = (id: string) => {
    setSelectedPetIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const validate = () => {
    if (!serviceId) return 'Vui lòng chọn dịch vụ';
    if (!date) return 'Vui lòng chọn ngày';
    if (!slotId) return 'Vui lòng chọn khung giờ';
    if (selectedPetIds.length === 0) return 'Vui lòng chọn ít nhất một thú cưng';
    if (!customerName.trim()) return 'Vui lòng nhập tên khách hàng';
    if (!customerPhone.trim()) return 'Vui lòng nhập số điện thoại';
    if (!phoneRegex.test(customerPhone.trim())) return 'Số điện thoại không đúng định dạng';
    if (customerEmail.trim() && !customerEmail.includes('@')) return 'Email không đúng định dạng';
    return null;
  };

  const handleCreatePet = async () => {
    if (!petName.trim()) {
      showToast('Vui lòng nhập tên thú cưng');
      return;
    }

    if (!petWeight.trim() || Number(petWeight) <= 0) {
      showToast('Vui lòng nhập cân nặng hợp lệ');
      return;
    }

    try {
      const res = await createPet({
        name: petName.trim(),
        type: petType,
        breed: petBreed.trim() || undefined,
        weight: Number(petWeight),
        color: petColor.trim() || undefined,
        gender: petGender,
        notes: petNotes.trim() || undefined,
      });
      setPets((prev) => [res.data, ...prev]);
      setSelectedPetIds((prev) => [...prev, res.data._id]);
      setPetName('');
      setPetWeight('');
      setPetBreed('');
      setPetColor('');
      setPetNotes('');
      setPetType('dog');
      setPetGender('unknown');
      setShowCreatePetModal(false);
      showToast('Tạo thú cưng thành công');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Không thể tạo thú cưng');
    }
  };

  const handleSelectDate = (day: number) => {
    const nextDate = formatDateInput(new Date(monthMeta.year, monthMeta.month, day));
    setDate(nextDate);
    setShowDatePickerModal(false);
  };

  const handleCreateBooking = async () => {
    const message = validate();
    if (message) {
      setError(message);
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await createBooking({
        serviceId,
        slotId,
        petIds: selectedPetIds,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      showToast('Đặt lịch thành công');
      setSlotId('');
      setSelectedPetIds([]);
      setNotes('');
      navigation.navigate('MyBookings');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tạo lịch đặt');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color={colors.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đặt lịch dịch vụ</Text>
        <TouchableOpacity style={styles.rightButton} onPress={() => navigation.navigate('MyBookings')}>
          <Text style={styles.rightButtonText}>Lịch của tôi</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {error ? <StatusMessage message={error} /> : null}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>1. Chọn dịch vụ</Text>
          {loadingServices ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            services.map((item) => {
              const active = serviceId === item._id;
              return (
                <TouchableOpacity
                  key={item._id}
                  style={[styles.selectItem, active && styles.selectItemActive]}
                  onPress={() => setServiceId(item._id)}
                >
                  <View style={styles.selectMain}>
                    <Text style={[styles.selectTitle, active && styles.selectTitleActive]}>{item.name}</Text>
                    <Text style={styles.selectDesc}>
                      {item.duration ? `${item.duration} phút` : 'Không rõ thời lượng'}
                    </Text>
                  </View>
                  <Text style={styles.selectPrice}>
                    {item.basePrice ? `${item.basePrice.toLocaleString()}đ` : 'Liên hệ'}
                  </Text>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>2. Chọn ngày và khung giờ</Text>

          <View style={styles.pickerPanel}>
            <View style={styles.fieldCol}>
              <Text style={styles.fieldLabel}>Ngày</Text>
              <TouchableOpacity style={styles.triggerButton} onPress={() => setShowDatePickerModal(true)} activeOpacity={0.9}>
                <Text style={styles.triggerText}>{formatDateLabel(date)}</Text>
                <ChevronDown size={16} color={colors.text} />
              </TouchableOpacity>
            </View>

            {loadingSlots ? <ActivityIndicator color={colors.primary} style={styles.loader} /> : null}
            {!loadingSlots && serviceId && slots.length === 0 ? (
              <Text style={styles.emptyText}>Không có khung giờ khả dụng cho ngày đã chọn</Text>
            ) : null}

            {!loadingSlots && slots.length > 0 ? (
              <View style={styles.slotChipWrap}>
                {slots.map((slot) => {
                  const active = slotId === slot._id;
                  return (
                    <TouchableOpacity
                      key={slot._id}
                      style={[styles.slotChip, active && styles.slotChipActive]}
                      onPress={() => setSlotId(slot._id)}
                    >
                      <Text style={[styles.slotChipText, active && styles.slotChipTextActive]}>
                        {slot.startTime} - {slot.endTime}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>3. Chọn thú cưng</Text>
          <Text style={styles.selectedPets}>{selectedPetsLabel}</Text>
          <View style={styles.row}>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => setShowPetModal(true)}>
              <Text style={styles.secondaryBtnText}>Chọn thú cưng</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => setShowCreatePetModal(true)}>
              <Text style={styles.secondaryBtnText}>Thêm thú cưng</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>4. Thông tin khách hàng</Text>
          <TextInput
            style={styles.input}
            value={customerName}
            onChangeText={setCustomerName}
            placeholder="Họ và tên"
          />
          <TextInput
            style={styles.input}
            value={customerPhone}
            onChangeText={setCustomerPhone}
            placeholder="Số điện thoại"
            keyboardType="phone-pad"
          />
          <TextInput
            style={styles.input}
            value={customerEmail}
            onChangeText={setCustomerEmail}
            placeholder="Email (tùy chọn)"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={[styles.input, styles.inputArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Ghi chú"
            multiline
          />
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={handleCreateBooking} disabled={submitting}>
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Xác nhận đặt lịch</Text>}
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={showDatePickerModal} animationType="fade" transparent>
        <View style={styles.centerModalBackdrop}>
          <View style={styles.calendarModalCard}>
            <View style={styles.calendarHeader}>
              <TouchableOpacity onPress={() => setCurrentMonth(new Date(monthMeta.year, monthMeta.month - 1, 1))}>
                <ChevronLeft size={18} color={colors.secondary} />
              </TouchableOpacity>
              <Text style={styles.calendarTitle}>{monthMeta.label}</Text>
              <TouchableOpacity onPress={() => setCurrentMonth(new Date(monthMeta.year, monthMeta.month + 1, 1))}>
                <ChevronRight size={18} color={colors.secondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.weekHeaderRow}>
              {weekDays.map((label) => (
                <Text key={label} style={styles.weekHeaderText}>{label}</Text>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {monthMeta.cells.map((day, index) => {
                if (!day) return <View key={`empty-${index}`} style={styles.dayCell} />;
                const thisDate = formatDateInput(new Date(monthMeta.year, monthMeta.month, day));
                const active = thisDate === date;
                return (
                  <TouchableOpacity
                    key={`${monthMeta.month}-${day}`}
                    style={[styles.dayCell, styles.dayButton, active && styles.dayButtonActive]}
                    onPress={() => handleSelectDate(day)}
                  >
                    <Text style={[styles.dayText, active && styles.dayTextActive]}>{day}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity style={styles.secondaryCloseBtn} onPress={() => setShowDatePickerModal(false)}>
              <Text style={styles.secondaryBtnText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showPetModal} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Chọn thú cưng</Text>
            {loadingPets ? (
              <ActivityIndicator color={colors.primary} />
            ) : pets.length === 0 ? (
              <Text style={styles.emptyText}>Bạn chưa có thú cưng</Text>
            ) : (
              <ScrollView style={styles.modalList}>
                {pets.map((pet) => {
                  const active = selectedPetIds.includes(pet._id);
                  return (
                    <TouchableOpacity
                      key={pet._id}
                      style={[styles.selectItem, active && styles.selectItemActive]}
                      onPress={() => togglePet(pet._id)}
                    >
                      <View style={styles.selectMain}>
                        <Text style={[styles.selectTitle, active && styles.selectTitleActive]}>
                          {pet.name} ({pet.type === 'dog' ? 'Chó' : 'Mèo'})
                        </Text>
                        <Text style={styles.selectDesc}>
                          {[pet.breed, pet.color].filter(Boolean).join(' | ') || 'Chưa có thêm thông tin'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
            <TouchableOpacity style={styles.primaryBtn} onPress={() => setShowPetModal(false)}>
              <Text style={styles.primaryBtnText}>Xong</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showCreatePetModal} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Thêm thú cưng</Text>
            <TextInput style={styles.input} placeholder="Tên thú cưng" value={petName} onChangeText={setPetName} />
            <TextInput style={styles.input} placeholder="Giống thú cưng" value={petBreed} onChangeText={setPetBreed} />
            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.chip, petType === 'dog' && styles.chipActive]}
                onPress={() => setPetType('dog')}
              >
                <Text style={[styles.chipText, petType === 'dog' && styles.chipTextActive]}>Chó</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.chip, petType === 'cat' && styles.chipActive]}
                onPress={() => setPetType('cat')}
              >
                <Text style={[styles.chipText, petType === 'cat' && styles.chipTextActive]}>Mèo</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Cân nặng (kg)"
              keyboardType="numeric"
              value={petWeight}
              onChangeText={setPetWeight}
            />
            <TextInput style={styles.input} placeholder="Màu lông" value={petColor} onChangeText={setPetColor} />
            <TextInput
              style={[styles.input, styles.inputArea]}
              placeholder="Ghi chú thú cưng"
              value={petNotes}
              onChangeText={setPetNotes}
              multiline
            />
            <View style={styles.row}>
              {(['unknown', 'male', 'female'] as const).map((gender) => (
                <TouchableOpacity
                  key={gender}
                  style={[styles.chip, petGender === gender && styles.chipActive]}
                  onPress={() => setPetGender(gender)}
                >
                  <Text style={[styles.chipText, petGender === gender && styles.chipTextActive]}>
                    {gender === 'unknown' ? 'Không rõ' : gender === 'male' ? 'Đực' : 'Cái'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.row}>
              <TouchableOpacity style={styles.secondaryBtn} onPress={() => setShowCreatePetModal(false)}>
                <Text style={styles.secondaryBtnText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primarySmallBtn} onPress={handleCreatePet}>
                <Text style={styles.primaryBtnText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
  backButton: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  rightButton: { minWidth: 68, alignItems: 'flex-end' },
  rightButtonText: { color: colors.primary, fontWeight: '600', fontSize: 12 },
  headerTitle: { color: colors.secondary, fontSize: 18, fontWeight: '700' },
  content: { padding: 16, paddingBottom: 30, gap: 12 },
  card: {
    backgroundColor: colors.softPink,
    borderRadius: 16,
    padding: 12,
    gap: 10,
  },
  sectionTitle: { fontWeight: '700', color: colors.secondary, fontSize: 14 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.secondary,
  },
  inputArea: { minHeight: 74, textAlignVertical: 'top' },
  selectItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  selectItemActive: {
    borderColor: colors.primary,
    backgroundColor: '#fff9f9',
  },
  selectMain: { flex: 1 },
  selectTitle: { color: colors.secondary, fontWeight: '600', fontSize: 13 },
  selectTitleActive: { color: colors.primary },
  selectDesc: { color: colors.text, fontSize: 12, marginTop: 4 },
  selectPrice: { color: colors.primary, fontWeight: '700', fontSize: 12 },
  pickerPanel: {
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    gap: 8,
  },
  fieldCol: { gap: 6 },
  fieldLabel: { color: colors.secondary, fontSize: 12, fontWeight: '600' },
  triggerButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: '#fff',
    minHeight: 42,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  triggerText: { color: colors.secondary, fontSize: 12, fontWeight: '500' },
  slotChipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slotChip: {
    minHeight: 40,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  slotChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  slotChipText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  slotChipTextActive: {
    color: '#fff',
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#fff',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flex: 1,
    alignItems: 'center',
  },
  chipActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  chipText: { color: colors.text, fontSize: 12, fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  row: { flexDirection: 'row', gap: 8 },
  secondaryBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: '#fff',
    paddingVertical: 10,
  },
  secondaryBtnText: { color: colors.primary, fontWeight: '700', fontSize: 12 },
  selectedPets: { color: colors.text, fontSize: 12 },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 46,
  },
  primarySmallBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 42,
  },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  loader: { marginTop: 6 },
  emptyText: { color: colors.text, fontSize: 12 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  centerModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    gap: 10,
    minHeight: 240,
  },
  calendarModalCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalTitle: { color: colors.secondary, fontSize: 16, fontWeight: '700' },
  modalList: { maxHeight: 260 },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calendarTitle: { color: colors.secondary, fontSize: 14, fontWeight: '700', textTransform: 'capitalize' },
  weekHeaderRow: { flexDirection: 'row' },
  weekHeaderText: {
    width: '14.2857%',
    textAlign: 'center',
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
    paddingVertical: 4,
  },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: {
    width: '14.2857%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayButton: { borderRadius: 8 },
  dayButtonActive: { backgroundColor: colors.primary },
  dayText: { color: colors.secondary, fontWeight: '500' },
  dayTextActive: { color: '#fff', fontWeight: '700' },
  secondaryCloseBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: '#fff',
    paddingVertical: 10,
    marginTop: 6,
  },
});

export default BookingScreen;
