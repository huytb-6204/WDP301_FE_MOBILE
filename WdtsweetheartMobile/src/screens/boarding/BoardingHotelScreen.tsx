import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, ChevronDown, ChevronLeft, ChevronRight, Hotel, PawPrint, ShieldCheck } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import type { RootStackParamList } from '../../navigation/types';
import { StatusMessage, Toast } from '../../components/common';
import { createPet, getMyPets } from '../../services/api/booking';
import {
  createBoardingBooking,
  getAvailableBoardingCages,
  initiateBoardingPayment,
} from '../../services/api/boarding';
import { getProfile } from '../../services/api/dashboard';
import type {
  BoardingCage,
  BoardingGateway,
  BoardingPaymentMethod,
  Pet,
} from '../../types';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'BoardingHotel'>;

const phoneRegex = /^(0?)(3[2-9]|5[6|8|9]|7[0|6-9]|8[0-6|8|9]|9[0-4|6-9])[0-9]{7}$/;
const typeOptions = ['standard', 'vip'] as const;
const sizeOptions = ['S', 'M', 'L', 'XL_XXL'] as const;
const weekDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

const formatDisplayDate = (date: Date) => {
  const d = `${date.getDate()}`.padStart(2, '0');
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
};

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const toApiDate = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return '';

  const slashMatch = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (slashMatch) {
    const [, day, month, year] = slashMatch;
    return `${year}-${month}-${day}`;
  }

  const dashMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dashMatch) return trimmed;

  return '';
};

const toDate = (value: string) => {
  const normalized = toApiDate(value);
  if (!normalized) return null;
  const date = new Date(`${normalized}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
};

const parseDisplayDate = (value: string) => toDate(value) || new Date();

const getStayDays = (checkInDate: string, checkOutDate: string) => {
  const start = toDate(checkInDate);
  const end = toDate(checkOutDate);
  if (!start || !end) return 0;
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
};

const formatCurrency = (value: number) => `${Math.max(0, value || 0).toLocaleString('vi-VN')}đ`;

const formatRoomTypeLabel = (value?: string) => {
  const normalized = String(value || '').trim().toLowerCase();
  if (!normalized) return 'Không rõ loại phòng';
  if (normalized === 'standard') return 'Phòng tiêu chuẩn';
  if (normalized === 'vip') return 'Phòng VIP';
  if (normalized === 'deluxe') return 'Phòng deluxe';
  if (normalized === 'premium') return 'Phòng premium';
  return value || 'Không rõ loại phòng';
};

const formatRoomSizeLabel = (value?: string) => {
  const normalized = String(value || '').trim().toUpperCase();
  if (!normalized) return 'Không rõ kích thước';
  if (normalized === 'S' || normalized === 'C') return 'Nhỏ';
  if (normalized === 'M' || normalized === 'B') return 'Vừa';
  if (normalized === 'L' || normalized === 'A') return 'Lớn';
  if (normalized === 'XL_XXL' || normalized === 'XL' || normalized === 'XXL') return 'Rất lớn';
  return normalized;
};

const BoardingHotelScreen = () => {
  const navigation = useNavigation<Navigation>();
  const [checkInDate, setCheckInDate] = useState(formatDisplayDate(addDays(new Date(), 1)));
  const [checkOutDate, setCheckOutDate] = useState(formatDisplayDate(addDays(new Date(), 2)));
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);
  const [dateField, setDateField] = useState<'checkIn' | 'checkOut'>('checkIn');
  const [currentMonth, setCurrentMonth] = useState(parseDisplayDate(formatDisplayDate(addDays(new Date(), 1))));
  const [type, setType] = useState('');
  const [size, setSize] = useState('');
  const [allCages, setAllCages] = useState<BoardingCage[]>([]);
  const [loadingCages, setLoadingCages] = useState(false);
  const [loadingPets, setLoadingPets] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPetIds, setSelectedPetIds] = useState<string[]>([]);
  const [selectedCageId, setSelectedCageId] = useState('');
  const [showPetModal, setShowPetModal] = useState(false);
  const [showCreatePetModal, setShowCreatePetModal] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [specialCare, setSpecialCare] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<BoardingPaymentMethod>('pay_at_site');
  const [paymentGateway, setPaymentGateway] = useState<BoardingGateway>('vnpay');
  const [petName, setPetName] = useState('');
  const [petType, setPetType] = useState<'dog' | 'cat'>('dog');
  const [petWeight, setPetWeight] = useState('');
  const [petBreed, setPetBreed] = useState('');
  const [petColor, setPetColor] = useState('');
  const [petNotes, setPetNotes] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const stayDays = useMemo(() => getStayDays(checkInDate, checkOutDate), [checkInDate, checkOutDate]);
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
  const cages = useMemo(
    () => (type ? allCages.filter((item) => String(item.type || '').trim() === type) : allCages),
    [allCages, type]
  );
  const selectedCage = useMemo(
    () => allCages.find((item) => item._id === selectedCageId) || null,
    [allCages, selectedCageId]
  );
  const selectedPets = useMemo(
    () => pets.filter((pet) => selectedPetIds.includes(pet._id)),
    [pets, selectedPetIds]
  );
  const estimatedTotal = useMemo(() => {
    const pricePerDay = Number(selectedCage?.dailyPrice || 0);
    return pricePerDay * stayDays * selectedPetIds.length;
  }, [selectedCage?.dailyPrice, selectedPetIds.length, stayDays]);
  const estimatedDeposit = useMemo(() => {
    if (paymentMethod !== 'pay_at_site' || stayDays < 2) return 0;
    return Math.round(estimatedTotal * 0.2);
  }, [estimatedTotal, paymentMethod, stayDays]);
  const requiresOnlinePayment = paymentMethod === 'prepaid' || estimatedDeposit > 0;

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 1800);
  };

  const fetchPets = async () => {
    setLoadingPets(true);
    try {
      const petsRes = await getMyPets();
      const profile = await getProfile().catch(() => null);
      setPets(petsRes.data || []);
      if (profile) {
        setFullName((current) => current || profile.fullName || '');
        setPhone((current) => current || profile.phone || '');
        setEmail((current) => current || profile.email || '');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu thú cưng');
    } finally {
      setLoadingPets(false);
    }
  };

  const fetchAvailableCages = async () => {
    const normalizedCheckInDate = toApiDate(checkInDate);
    const normalizedCheckOutDate = toApiDate(checkOutDate);

    if (stayDays <= 0) {
      setError('Ngày trả phòng phải lớn hơn ngày nhận phòng');
      return;
    }

    setLoadingCages(true);
    setError(null);
    try {
      const data = await getAvailableBoardingCages({
        checkInDate: normalizedCheckInDate,
        checkOutDate: normalizedCheckOutDate,
        size: size || undefined,
      });
      setAllCages(data);
      if (!data.some((item) => item._id === selectedCageId)) {
        setSelectedCageId('');
      }
    } catch (err) {
      setAllCages([]);
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách chuồng');
    } finally {
      setLoadingCages(false);
    }
  };

  useEffect(() => {
    fetchPets();
  }, []);

  useEffect(() => {
    fetchAvailableCages();
  }, []);

  const togglePet = (id: string) => {
    setSelectedPetIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : prev.concat(id)));
  };

  const openDatePicker = (field: 'checkIn' | 'checkOut') => {
    setDateField(field);
    setCurrentMonth(parseDisplayDate(field === 'checkIn' ? checkInDate : checkOutDate));
    setShowDatePickerModal(true);
  };

  const handleSelectDate = (day: number) => {
    const selected = formatDisplayDate(new Date(monthMeta.year, monthMeta.month, day));
    if (dateField === 'checkIn') {
      setCheckInDate(selected);
    } else {
      setCheckOutDate(selected);
    }
    setShowDatePickerModal(false);
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
        notes: petNotes.trim() || undefined,
      });
      setPets((prev) => [res.data].concat(prev));
      setSelectedPetIds((prev) => (prev.includes(res.data._id) ? prev : prev.concat(res.data._id)));
      setPetName('');
      setPetType('dog');
      setPetWeight('');
      setPetBreed('');
      setPetColor('');
      setPetNotes('');
      setShowCreatePetModal(false);
      showToast('Đã thêm thú cưng');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Không thể tạo thú cưng');
    }
  };

  const validate = () => {
    if (!checkInDate || !checkOutDate) return 'Vui lòng nhập ngày nhận và ngày trả phòng';
    if (!toDate(checkInDate) || !toDate(checkOutDate)) return 'Ngày không đúng định dạng DD/MM/YYYY';
    if (stayDays <= 0) return 'Ngày trả phòng phải lớn hơn ngày nhận phòng';
    if (!selectedCageId) return 'Vui lòng chọn chuồng';
    if (selectedPetIds.length === 0) return 'Vui lòng chọn ít nhất 1 thú cưng';
    if (!fullName.trim()) return 'Vui lòng nhập họ tên';
    if (!phoneRegex.test(phone.trim())) return 'Số điện thoại không hợp lệ';
    if (email.trim() && !email.includes('@')) return 'Email không hợp lệ';
    if (
      selectedCage &&
      selectedCage.remainingRooms !== undefined &&
      selectedPetIds.length > Number(selectedCage.remainingRooms || 0)
    ) {
      return 'Số thú cưng đang vượt quá số phòng còn trống';
    }
    return null;
  };

  const handleSubmit = async () => {
    const message = validate();
    if (message) {
      setError(message);
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const normalizedCheckInDate = toApiDate(checkInDate);
      const normalizedCheckOutDate = toApiDate(checkOutDate);
      const created = await createBoardingBooking({
        cageId: selectedCageId,
        checkInDate: normalizedCheckInDate,
        checkOutDate: normalizedCheckOutDate,
        petIds: selectedPetIds,
        quantity: selectedPetIds.length,
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        notes: notes.trim() || undefined,
        specialCare: specialCare.trim() || undefined,
        paymentMethod,
        paymentGateway: requiresOnlinePayment ? paymentGateway : undefined,
      });

      if (created.data.boardingStatus === 'held' || requiresOnlinePayment) {
        const payment = await initiateBoardingPayment(created.data._id, paymentGateway);
        if (payment.paymentUrl) {
          await Linking.openURL(payment.paymentUrl);
        }
        showToast('Đã tạo booking. Vui lòng hoàn tất thanh toán');
      } else {
        showToast('Đặt phòng thành công');
      }

      navigation.navigate('MyBoardingBookings');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tạo booking khách sạn');
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
        <Text style={styles.headerTitle}>Khách sạn thú cưng</Text>
        <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate('MyBoardingBookings')}>
          <Text style={styles.linkText}>Đơn của tôi</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {error ? <StatusMessage message={error} actionText="Tải lại chuồng" onAction={fetchAvailableCages} /> : null}

        <View style={styles.heroCard}>
          <View style={styles.heroIconWrap}>
            <Hotel size={18} color="#fff" />
          </View>
          <View style={styles.heroBody}>
            <Text style={styles.heroTitle}>Đặt chuồng lưu trú cho boss</Text>
            <Text style={styles.heroText}>
              Chọn ngày ở, tìm chuồng còn trống và tạo booking ngay trên app.
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>1. Tìm chuồng còn trống</Text>
          <View style={styles.row}>
            <View style={styles.fieldHalf}>
              <Text style={styles.label}>Nhận phòng</Text>
              <TouchableOpacity style={styles.dateButton} onPress={() => openDatePicker('checkIn')}>
                <Text style={styles.dateButtonText}>{checkInDate}</Text>
                <ChevronDown size={16} color={colors.text} />
              </TouchableOpacity>
            </View>
            <View style={styles.fieldHalf}>
              <Text style={styles.label}>Trả phòng</Text>
              <TouchableOpacity style={styles.dateButton} onPress={() => openDatePicker('checkOut')}>
                <Text style={styles.dateButtonText}>{checkOutDate}</Text>
                <ChevronDown size={16} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.fieldHalf}>
              <Text style={styles.label}>Loại phòng</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipWrap}>
                <TouchableOpacity style={[styles.chip, !type && styles.chipActive]} onPress={() => setType('')}>
                  <Text style={[styles.chipText, !type && styles.chipTextActive]}>Tất cả</Text>
                </TouchableOpacity>
                {typeOptions.map((item) => (
                  <TouchableOpacity key={item} style={[styles.chip, type === item && styles.chipActive]} onPress={() => setType(item)}>
                    <Text style={[styles.chipText, type === item && styles.chipTextActive]}>{formatRoomTypeLabel(item)}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <View style={styles.fieldHalf}>
              <Text style={styles.label}>Kích thước</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipWrap}>
                <TouchableOpacity style={[styles.chip, !size && styles.chipActive]} onPress={() => setSize('')}>
                  <Text style={[styles.chipText, !size && styles.chipTextActive]}>Tất cả</Text>
                </TouchableOpacity>
                {sizeOptions.map((item) => (
                  <TouchableOpacity key={item} style={[styles.chip, size === item && styles.chipActive]} onPress={() => setSize(item)}>
                    <Text style={[styles.chipText, size === item && styles.chipTextActive]}>{formatRoomSizeLabel(item)}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={fetchAvailableCages} disabled={loadingCages}>
            {loadingCages ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Tìm chuồng</Text>}
          </TouchableOpacity>
          <Text style={styles.helperText}>Số đêm lưu trú: {stayDays > 0 ? stayDays : 0}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>2. Chọn chuồng</Text>
            <Text style={styles.helperText}>{cages.length} kết quả</Text>
          </View>
          {loadingCages ? <ActivityIndicator color={colors.primary} /> : null}
          {!loadingCages && cages.length === 0 ? <Text style={styles.emptyText}>Không có chuồng phù hợp cho khoảng ngày đã chọn</Text> : null}

          {cages.map((cage) => {
            const active = cage._id === selectedCageId;
            return (
              <TouchableOpacity key={cage._id} style={[styles.cageCard, active && styles.cageCardActive]} onPress={() => setSelectedCageId(cage._id)}>
                <Image source={{ uri: cage.avatar || cage.gallery?.[0] || 'https://placehold.co/120x120/png' }} style={styles.cageImage} />
                <View style={styles.cageBody}>
                  <View style={styles.cageTop}>
                    <Text style={styles.cageCode}>{cage.cageCode || 'Phòng lưu trú'}</Text>
                    <Text style={styles.cagePrice}>{formatCurrency(Number(cage.dailyPrice || 0))}/ngày</Text>
                  </View>
                  <Text style={styles.cageMeta}>
                    {formatRoomTypeLabel(cage.type)} | {formatRoomSizeLabel(cage.size)} | Còn {cage.remainingRooms ?? 0}/{cage.totalRooms ?? 0} phòng
                  </Text>
                  {cage.maxWeightCapacity ? <Text style={styles.cageMeta}>Tải trọng tối đa: {cage.maxWeightCapacity} kg</Text> : null}
                  {Array.isArray(cage.amenities) && cage.amenities.length > 0 ? (
                    <Text style={styles.cageAmenities} numberOfLines={2}>
                      Tiện ích: {cage.amenities.join(', ')}
                    </Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.card}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>3. Chọn thú cưng</Text>
            <TouchableOpacity style={styles.inlineAction} onPress={() => setShowCreatePetModal(true)}>
              <Text style={styles.inlineActionText}>Thêm thú cưng</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.selectorButton} onPress={() => setShowPetModal(true)}>
            <View style={styles.selectorLeft}>
              <PawPrint size={16} color={colors.primary} />
              <Text style={styles.selectorText}>
                {selectedPets.length > 0 ? selectedPets.map((pet) => pet.name).join(', ') : 'Chọn thú cưng'}
              </Text>
            </View>
            <ChevronDown size={16} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.helperText}>Mỗi thú cưng sẽ chiếm 1 phòng. Hiện tại đã chọn {selectedPetIds.length} thú cưng.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>4. Thông tin đặt phòng</Text>
          <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="Họ và tên" />
          <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="Số điện thoại" keyboardType="phone-pad" />
          <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email" autoCapitalize="none" keyboardType="email-address" />
          <TextInput style={[styles.input, styles.textArea]} value={specialCare} onChangeText={setSpecialCare} placeholder="Yêu cầu chăm sóc đặc biệt" multiline />
          <TextInput style={[styles.input, styles.textArea]} value={notes} onChangeText={setNotes} placeholder="Ghi chú thêm" multiline />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>5. Thanh toán</Text>
          <View style={styles.toggleRow}>
            {(['pay_at_site', 'prepaid'] as BoardingPaymentMethod[]).map((item) => (
              <TouchableOpacity key={item} style={[styles.toggleButton, paymentMethod === item && styles.toggleButtonActive]} onPress={() => setPaymentMethod(item)}>
                <Text style={[styles.toggleText, paymentMethod === item && styles.toggleTextActive]}>
                  {item === 'pay_at_site' ? 'Thanh toán tại quầy' : 'Trả trước online'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {requiresOnlinePayment ? (
            <>
              <View style={styles.noticeCard}>
                <ShieldCheck size={16} color={colors.primary} />
                <Text style={styles.noticeText}>
                  {paymentMethod === 'prepaid'
                    ? 'Đơn này sẽ được giữ phòng và chuyển sang cổng thanh toán online.'
                    : 'Lưu trú từ 2 ngày trở lên và thanh toán tại quầy sẽ cần đặt cọc 20% trước khi nhận phòng.'}
                </Text>
              </View>
              <View style={styles.toggleRow}>
                {(['vnpay', 'zalopay'] as BoardingGateway[]).map((item) => (
                  <TouchableOpacity key={item} style={[styles.toggleButton, paymentGateway === item && styles.toggleButtonActive]} onPress={() => setPaymentGateway(item)}>
                    <Text style={[styles.toggleText, paymentGateway === item && styles.toggleTextActive]}>{item.toUpperCase()}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          ) : null}

          <View style={styles.summaryBox}>
            <Text style={styles.summaryLine}>Tổng tạm tính: {formatCurrency(estimatedTotal)}</Text>
            <Text style={styles.summaryLine}>Đặt cọc dự kiến: {formatCurrency(estimatedDeposit)}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit} disabled={submitting}>
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Tạo booking</Text>}
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={showPetModal} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Chọn thú cưng</Text>
            {loadingPets ? (
              <ActivityIndicator color={colors.primary} />
            ) : pets.length === 0 ? (
              <Text style={styles.emptyText}>Bạn chưa có thú cưng nào</Text>
            ) : (
              <ScrollView style={styles.modalList}>
                {pets.map((pet) => {
                  const active = selectedPetIds.includes(pet._id);
                  return (
                    <TouchableOpacity key={pet._id} style={[styles.petRow, active && styles.petRowActive]} onPress={() => togglePet(pet._id)}>
                      <Text style={[styles.petRowText, active && styles.petRowTextActive]}>
                        {pet.name} | {pet.type === 'dog' ? 'Chó' : 'Mèo'} | {pet.weight}kg
                      </Text>
                      <Text style={styles.petRowMeta}>
                        {[pet.breed, pet.color].filter(Boolean).join(' | ') || 'Chưa có thêm thông tin'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}

            <TouchableOpacity style={styles.primaryButton} onPress={() => setShowPetModal(false)}>
              <Text style={styles.primaryButtonText}>Xong</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showDatePickerModal} animationType="fade" transparent onRequestClose={() => setShowDatePickerModal(false)}>
        <View style={styles.centerModalBackdrop}>
          <View style={styles.calendarModalCard}>
            <Text style={styles.modalTitle}>
              {dateField === 'checkIn' ? 'Chọn ngày nhận phòng' : 'Chọn ngày trả phòng'}
            </Text>

            <View style={styles.calendarHeader}>
              <TouchableOpacity
                style={styles.calendarArrow}
                onPress={() => setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
              >
                <ChevronLeft size={18} color={colors.secondary} />
              </TouchableOpacity>
              <Text style={styles.calendarTitle}>{monthMeta.label}</Text>
              <TouchableOpacity
                style={styles.calendarArrow}
                onPress={() => setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
              >
                <ChevronRight size={18} color={colors.secondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.weekRow}>
              {weekDays.map((day) => (
                <Text key={day} style={styles.weekCell}>
                  {day}
                </Text>
              ))}
            </View>

            <View style={styles.daysGrid}>
              {monthMeta.cells.map((day, index) => {
                if (!day) {
                  return <View key={`empty-${index}`} style={styles.dayCell} />;
                }

                const candidate = formatDisplayDate(new Date(monthMeta.year, monthMeta.month, day));
                const isSelected = candidate === (dateField === 'checkIn' ? checkInDate : checkOutDate);

                return (
                  <TouchableOpacity
                    key={`${monthMeta.month}-${day}`}
                    style={[styles.dayCell, isSelected && styles.dayCellActive]}
                    onPress={() => handleSelectDate(day)}
                  >
                    <Text style={[styles.dayCellText, isSelected && styles.dayCellTextActive]}>{day}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity style={styles.secondaryButton} onPress={() => setShowDatePickerModal(false)}>
              <Text style={styles.secondaryButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showCreatePetModal} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Thêm thú cưng</Text>
            <TextInput style={styles.input} value={petName} onChangeText={setPetName} placeholder="Tên thú cưng" />
            <TextInput style={styles.input} value={petBreed} onChangeText={setPetBreed} placeholder="Giống thú cưng" />
            <View style={styles.toggleRow}>
              {(['dog', 'cat'] as const).map((item) => (
                <TouchableOpacity key={item} style={[styles.toggleButton, petType === item && styles.toggleButtonActive]} onPress={() => setPetType(item)}>
                  <Text style={[styles.toggleText, petType === item && styles.toggleTextActive]}>
                    {item === 'dog' ? 'Chó' : 'Mèo'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput style={styles.input} value={petWeight} onChangeText={setPetWeight} keyboardType="numeric" placeholder="Cân nặng (kg) *" />
            <TextInput style={styles.input} value={petColor} onChangeText={setPetColor} placeholder="Màu lông" />
            <TextInput style={[styles.input, styles.textArea]} value={petNotes} onChangeText={setPetNotes} placeholder="Ghi chú thú cưng" multiline />
            <View style={styles.row}>
              <TouchableOpacity style={styles.secondaryButton} onPress={() => setShowCreatePetModal(false)}>
                <Text style={styles.secondaryButtonText}>Đóng</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryButtonHalf} onPress={handleCreatePet}>
                <Text style={styles.primaryButtonText}>Lưu</Text>
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
  backButton: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: colors.secondary, fontSize: 18, fontWeight: '700' },
  linkButton: { minWidth: 72, alignItems: 'flex-end' },
  linkText: { color: colors.primary, fontWeight: '700', fontSize: 12 },
  content: { padding: 16, paddingBottom: 34, gap: 12 },
  heroCard: { borderRadius: 18, padding: 14, backgroundColor: '#102937', flexDirection: 'row', gap: 12 },
  heroIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBody: { flex: 1, gap: 4 },
  heroTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  heroText: { color: '#d7dee4', fontSize: 12, lineHeight: 18 },
  card: { backgroundColor: colors.softPink, borderRadius: 18, padding: 12, gap: 10 },
  sectionTitle: { color: colors.secondary, fontSize: 14, fontWeight: '700' },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  row: { flexDirection: 'row', gap: 8 },
  fieldHalf: { flex: 1, gap: 6 },
  label: { color: colors.secondary, fontSize: 12, fontWeight: '600' },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    color: colors.secondary,
  },
  dateButton: {
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  dateButtonText: { color: colors.secondary, fontSize: 14, fontWeight: '500' },
  textArea: { minHeight: 78, textAlignVertical: 'top' },
  chipWrap: { gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#fff',
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text, fontSize: 12, fontWeight: '700' },
  chipTextActive: { color: '#fff' },
  primaryButton: {
    minHeight: 46,
    borderRadius: 999,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonHalf: {
    flex: 1,
    minHeight: 44,
    borderRadius: 999,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  secondaryButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: { color: colors.primary, fontSize: 13, fontWeight: '700' },
  helperText: { color: colors.text, fontSize: 12 },
  emptyText: { color: colors.text, fontSize: 12, lineHeight: 18 },
  cageCard: {
    borderRadius: 14,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    flexDirection: 'row',
    gap: 10,
  },
  cageCardActive: { borderColor: colors.primary, backgroundColor: '#fff7f7' },
  cageImage: { width: 82, height: 82, borderRadius: 12, backgroundColor: '#f6f6f6' },
  cageBody: { flex: 1, gap: 4 },
  cageTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  cageCode: { flex: 1, color: colors.secondary, fontSize: 14, fontWeight: '700' },
  cagePrice: { color: colors.primary, fontSize: 12, fontWeight: '700' },
  cageMeta: { color: colors.text, fontSize: 12, lineHeight: 18 },
  cageAmenities: { color: colors.secondary, fontSize: 12, lineHeight: 18 },
  inlineAction: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  inlineActionText: { color: colors.primary, fontSize: 12, fontWeight: '700' },
  selectorButton: {
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  selectorLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  selectorText: { color: colors.secondary, fontSize: 12, fontWeight: '600', flex: 1 },
  toggleRow: { flexDirection: 'row', gap: 8 },
  toggleButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  toggleButtonActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  toggleText: { color: colors.text, fontSize: 12, fontWeight: '700', textAlign: 'center' },
  toggleTextActive: { color: '#fff' },
  noticeCard: {
    borderRadius: 12,
    padding: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ffd5d5',
    flexDirection: 'row',
    gap: 8,
  },
  noticeText: { flex: 1, color: colors.secondary, fontSize: 12, lineHeight: 18 },
  summaryBox: {
    borderRadius: 12,
    backgroundColor: '#fff',
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  summaryLine: { color: colors.secondary, fontSize: 13, fontWeight: '600' },
  centerModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  calendarModalCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 20,
    backgroundColor: '#fff',
    padding: 16,
    gap: 12,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  calendarArrow: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarTitle: { color: colors.secondary, fontSize: 15, fontWeight: '700', textTransform: 'capitalize' },
  weekRow: { flexDirection: 'row' },
  weekCell: {
    flex: 1,
    textAlign: 'center',
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 8,
  },
  dayCell: {
    width: '14.2857%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  dayCellActive: { backgroundColor: colors.primary },
  dayCellText: { color: colors.secondary, fontSize: 14, fontWeight: '600' },
  dayCellTextActive: { color: '#fff' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    gap: 10,
    minHeight: 240,
  },
  modalTitle: { color: colors.secondary, fontSize: 16, fontWeight: '700' },
  modalList: { maxHeight: 280 },
  petRow: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginBottom: 8,
  },
  petRowActive: { borderColor: colors.primary, backgroundColor: '#fff7f7' },
  petRowText: { color: colors.secondary, fontSize: 13, fontWeight: '600' },
  petRowTextActive: { color: colors.primary },
  petRowMeta: { color: colors.text, fontSize: 11, marginTop: 4 },
});

export default BoardingHotelScreen;
