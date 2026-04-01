import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  AppState,
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
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, Check, ChevronDown, ChevronLeft, ChevronRight, Eye, Hotel, PawPrint, ShieldCheck, Trash2 } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import type { RootStackParamList } from '../../navigation/types';
import { StatusMessage, Toast } from '../../components/common';
import { createPet, deleteMyPet, getMyPets, updateMyPet } from '../../services/api/booking';
import {
  checkBoardingPaymentStatus,
  createBoardingBooking,
  getAvailableBoardingCages,
  getBoardingConfig,
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
const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dxyuuul0q/image/upload';
const UPLOAD_PRESET = 'teddypet';

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
  const [imageActionMode, setImageActionMode] = useState<'create' | 'detail'>('create');
  const [showImageActionModal, setShowImageActionModal] = useState(false);
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
  const [detailPet, setDetailPet] = useState<Pet | null>(null);
  const [deletingPetId, setDeletingPetId] = useState<string | null>(null);
  const [savingDetailPet, setSavingDetailPet] = useState(false);
  const [detailPetName, setDetailPetName] = useState('');
  const [detailPetType, setDetailPetType] = useState<'dog' | 'cat'>('dog');
  const [detailPetGender, setDetailPetGender] = useState<'male' | 'female'>('male');
  const [detailPetWeight, setDetailPetWeight] = useState('');
  const [detailPetAge, setDetailPetAge] = useState('');
  const [detailPetBreed, setDetailPetBreed] = useState('');
  const [detailPetColor, setDetailPetColor] = useState('');
  const [detailPetNotes, setDetailPetNotes] = useState('');
  const [detailPetAvatar, setDetailPetAvatar] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [specialCare, setSpecialCare] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<BoardingPaymentMethod>('pay_at_site');
  const [paymentGateway] = useState<BoardingGateway>('vnpay');
  const [depositPercentage, setDepositPercentage] = useState(20);
  const [minDaysForDeposit, setMinDaysForDeposit] = useState(2);
  const [petName, setPetName] = useState('');
  const [petType, setPetType] = useState<'dog' | 'cat'>('dog');
  const [petGender, setPetGender] = useState<'male' | 'female'>('male');
  const [petWeight, setPetWeight] = useState('');
  const [petAge, setPetAge] = useState('');
  const [petBreed, setPetBreed] = useState('');
  const [petColor, setPetColor] = useState('');
  const [petNotes, setPetNotes] = useState('');
  const [petAvatar, setPetAvatar] = useState('');
  const [petUploading, setPetUploading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [successPopupVisible, setSuccessPopupVisible] = useState(false);
  const [successPopupMessage, setSuccessPopupMessage] = useState('');
  const pendingPaymentRef = React.useRef<{ bookingId: string } | null>(null);
  const checkingPaymentRef = React.useRef(false);

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
    if (paymentMethod !== 'pay_at_site' || stayDays < minDaysForDeposit) return 0;
    return Math.round((estimatedTotal * depositPercentage) / 100);
  }, [estimatedTotal, paymentMethod, stayDays, minDaysForDeposit, depositPercentage]);
  const requiresOnlinePayment = paymentMethod === 'prepaid' || estimatedDeposit > 0;

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 1800);
  };

  const isPaymentCompleted = (status?: string) => ['paid', 'partial'].includes(String(status || '').toLowerCase());

  const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const checkPendingPaymentResult = async () => {
    const pending = pendingPaymentRef.current;
    if (!pending || checkingPaymentRef.current) return;

    checkingPaymentRef.current = true;
    try {
      for (let i = 0; i < 6; i += 1) {
        const result = await checkBoardingPaymentStatus(pending.bookingId).catch(() => null);
        if (isPaymentCompleted((result as any)?.paymentStatus)) {
          pendingPaymentRef.current = null;
          showToast('Thanh toán thành công, đặt phòng thành công');
          navigation.navigate('MyBoardingBookings');
          return;
        }
        await wait(1200);
      }
    } finally {
      checkingPaymentRef.current = false;
    }
  };

  const openPaymentLink = async (bookingId: string) => {
    const payment = await initiateBoardingPayment(bookingId, paymentGateway, 'mobile');
    if (payment.paymentUrl) {
      await Linking.openURL(payment.paymentUrl);
      return;
    }
    throw new Error('Không tạo được liên kết thanh toán');
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
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void checkPendingPaymentResult();
      }
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadConfig = async () => {
      try {
        const config = await getBoardingConfig();
        if (!mounted) return;
        setDepositPercentage(Number(config.depositPercentage || 20));
        setMinDaysForDeposit(Number(config.minDaysForDeposit || 2));
      } catch {
        if (!mounted) return;
        setDepositPercentage(20);
        setMinDaysForDeposit(2);
      }
    };
    void loadConfig();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    fetchAvailableCages();
  }, []);

  const togglePet = (id: string) => {
    setSelectedPetIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : prev.concat(id)));
  };

  const openPetDetail = (pet: Pet) => {
    setDetailPet(pet);
    setDetailPetName(pet.name || '');
    setDetailPetType(pet.type === 'cat' ? 'cat' : 'dog');
    setDetailPetGender(pet.gender === 'female' ? 'female' : 'male');
    setDetailPetWeight(String(pet.weight || ''));
    setDetailPetAge(String(pet.age || ''));
    setDetailPetBreed(pet.breed || '');
    setDetailPetColor(pet.color || '');
    setDetailPetNotes(pet.notes || '');
    setDetailPetAvatar(pet.avatar || '');
  };

  const closePetDetail = () => {
    setDetailPet(null);
    setSavingDetailPet(false);
    setDetailPetName('');
    setDetailPetType('dog');
    setDetailPetGender('male');
    setDetailPetWeight('');
    setDetailPetAge('');
    setDetailPetBreed('');
    setDetailPetColor('');
    setDetailPetNotes('');
    setDetailPetAvatar('');
  };

  const handleUpdateDetailPet = async () => {
    if (!detailPet) return;

    const normalizedName = detailPetName.trim();
    const normalizedWeight = Number(detailPetWeight);

    if (!normalizedName) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên thú cưng');
      return;
    }

    if (!normalizedWeight || normalizedWeight <= 0) {
      Alert.alert('Lỗi', 'Cân nặng phải lớn hơn 0');
      return;
    }

    try {
      setSavingDetailPet(true);
      const res = await updateMyPet(detailPet._id, {
        name: normalizedName,
        type: detailPetType,
        gender: detailPetGender,
        weight: normalizedWeight,
        age: detailPetAge ? Number(detailPetAge) : undefined,
        breed: detailPetBreed.trim() || undefined,
        color: detailPetColor.trim() || undefined,
        notes: detailPetNotes.trim() || undefined,
        avatar: detailPetAvatar || undefined,
      });

      setPets((prev) => prev.map((item) => (item._id === detailPet._id ? res.data : item)));
      setDetailPet(res.data);
      closePetDetail();
      setTimeout(() => {
        setSuccessPopupMessage('Cập nhật thú cưng thành công!');
        setSuccessPopupVisible(true);
      }, 120);
      showToast('Đã lưu thay đổi');
    } catch (err) {
      Alert.alert('Lỗi', err instanceof Error ? err.message : 'Không thể cập nhật thú cưng');
    } finally {
      setSavingDetailPet(false);
    }
  };

  const handleDeletePet = (pet: Pet) => {
    Alert.alert(
      'Xóa thú cưng',
      `Bạn có chắc muốn xóa ${pet.name || 'thú cưng này'} không?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeletingPetId(pet._id);
              await deleteMyPet(pet._id);
              setPets((prev) => prev.filter((item) => item._id !== pet._id));
              setSelectedPetIds((prev) => prev.filter((id) => id !== pet._id));
              if (detailPet?._id === pet._id) {
                closePetDetail();
              }
              showToast('Đã xóa thú cưng');
            } catch (err) {
              Alert.alert('Lỗi', err instanceof Error ? err.message : 'Không thể xóa thú cưng');
            } finally {
              setDeletingPetId(null);
            }
          },
        },
      ]
    );
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
        gender: petGender,
        breed: petBreed.trim() || undefined,
        weight: Number(petWeight),
        age: petAge ? Number(petAge) : undefined,
        color: petColor.trim() || undefined,
        notes: petNotes.trim() || undefined,
        avatar: petAvatar || undefined,
      });
      setPets((prev) => [res.data].concat(prev));
      setSelectedPetIds((prev) => (prev.includes(res.data._id) ? prev : prev.concat(res.data._id)));
      setPetName('');
      setPetType('dog');
      setPetGender('male');
      setPetWeight('');
      setPetAge('');
      setPetBreed('');
      setPetColor('');
      setPetNotes('');
      setPetAvatar('');
      setShowCreatePetModal(false);
      setTimeout(() => {
        setSuccessPopupMessage('Đã lưu thú cưng thành công!');
        setSuccessPopupVisible(true);
      }, 120);
    } catch (err) {
      Alert.alert('Lỗi', err instanceof Error ? err.message : 'Không thể tạo thú cưng');
    }
  };


  const uploadPetImage = async (
    asset: ImagePicker.ImagePickerAsset,
    onUploaded: (url: string) => void,
    successMessage = 'Da them anh thu cung'
  ) => {
    setPetUploading(true);
    try {
      const formData = new FormData();
      const fileUri = asset.uri.startsWith('file://') ? asset.uri : 'file://' + asset.uri;
      const fileName = asset.fileName || 'pet_' + Date.now() + '.jpg';

      formData.append('file', {
        uri: fileUri,
        type: asset.mimeType || 'image/jpeg',
        name: fileName,
      } as any);
      formData.append('upload_preset', UPLOAD_PRESET);

      const response = await fetch(CLOUDINARY_URL, { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok || !data.secure_url) {
        showToast('Khong the tai anh thu cung len');
        return;
      }
      onUploaded(data.secure_url);
      showToast(successMessage);
    } catch {
      showToast('Loi khi tai anh len');
    } finally {
      setPetUploading(false);
    }
  };

  const pickPetImageFromLibrary = async (
    onUploaded: (url: string) => void,
    successMessage?: string
  ) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showToast('Cần cấp quyền truy cập thư viện ảnh');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]) {
      await uploadPetImage(result.assets[0], onUploaded, successMessage);
    }
  };

  const takePetPhoto = async (
    onUploaded: (url: string) => void,
    successMessage?: string
  ) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      showToast('Cần cấp quyền truy cập camera');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      cameraType: ImagePicker.CameraType.front,
    });
    if (!result.canceled && result.assets?.[0]) {
      await uploadPetImage(result.assets[0], onUploaded, successMessage);
    }
  };

  const openPetImageActions = (mode: 'create' | 'detail' = 'create') => {
    setImageActionMode(mode);
    setShowImageActionModal(true);
  };
  const closeImageActionModal = () => setShowImageActionModal(false);
  const currentImageActionAvatar = imageActionMode === 'detail' ? detailPetAvatar : petAvatar;
  const currentImageActionSetter = imageActionMode === 'detail' ? setDetailPetAvatar : setPetAvatar;

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
        pendingPaymentRef.current = { bookingId: created.data._id };
        await openPaymentLink(created.data._id);
        showToast('Đang chuyển đến trang thanh toán...');
        await wait(1500);
        await checkPendingPaymentResult();

        Alert.alert(
          'Chưa hoàn tất thanh toán',
          'Đơn của bạn đang giữ chỗ tạm thời. Vui lòng thanh toán để xác nhận booking.',
          [
            {
              text: 'Thanh toán lại',
              onPress: () => {
                void openPaymentLink(created.data._id);
              },
            },
            {
              text: 'Đơn của tôi',
              onPress: () => navigation.navigate('MyBoardingBookings'),
            },
          ]
        );
        return;
      }

      showToast('Đặt phòng thành công');
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
                    : `Lưu trú từ ${minDaysForDeposit} ngày trở lên và thanh toán tại quầy sẽ cần đặt cọc ${depositPercentage}% trước khi nhận phòng.`}
                </Text>
              </View>
              <View style={styles.toggleRow}>
                <View style={[styles.toggleButton, styles.toggleButtonActive]}>
                  <Text style={[styles.toggleText, styles.toggleTextActive]}>VNPAY</Text>
                </View>
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

      <Modal visible={showPetModal && !detailPet} animationType="slide" transparent>
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
                    <View key={pet._id} style={[styles.petRow, active && styles.petRowActive]}>
                      <View style={{ flex: 1 }}>
                        <TouchableOpacity 
                          onPress={() => togglePet(pet._id)}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.petRowText, active && styles.petRowTextActive]}>
                            {pet.name} | {pet.type === 'dog' ? 'Chó' : 'Mèo'} | {pet.weight}kg
                          </Text>
                          <Text style={styles.petRowMeta}>
                            {[pet.breed, pet.color].filter(Boolean).join(' | ') || 'Chưa có thêm thông tin'}
                          </Text>
                        </TouchableOpacity>
                        
                        <View style={styles.petRowActions}>
                          <TouchableOpacity 
                            style={styles.petActionButton} 
                            onPress={() => {
                              console.log('Detail pressed for pet:', pet.name);
                              openPetDetail(pet);
                            }}
                            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                          >
                            <Eye size={14} color={colors.primary} />
                            <Text style={styles.petActionText}>Chi tiết</Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={[styles.petActionButton, styles.petDeleteButton]} 
                            onPress={() => handleDeletePet(pet)} 
                            disabled={deletingPetId === pet._id}
                            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                          >
                            {deletingPetId === pet._id ? (
                              <ActivityIndicator size="small" color={colors.primary} />
                            ) : (
                              <>
                                <Trash2 size={14} color={colors.primary} />
                                <Text style={styles.petActionText}>Xóa</Text>
                              </>
                            )}
                          </TouchableOpacity>
                        </View>
                      </View>

                      {pet.avatar ? (
                        <Image source={{ uri: pet.avatar }} style={styles.petRowAvatar} />
                      ) : (
                        <View style={styles.petRowAvatarFallback}>
                          <PawPrint size={18} color={colors.primary} />
                        </View>
                      )}
                    </View>
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
            <TouchableOpacity style={styles.petImagePicker} onPress={() => openPetImageActions('create')} disabled={petUploading}>
              {petAvatar ? (
                <Image source={{ uri: petAvatar }} style={styles.petImagePreview} />
              ) : (
                <View style={styles.petImagePlaceholder}>
                  {petUploading ? (
                    <ActivityIndicator color={colors.primary} />
                  ) : (
                    <>
                      <Text style={styles.petImagePlus}>+</Text>
                      <Text style={styles.petImageText}>Thêm ảnh</Text>
                    </>
                  )}
                </View>
              )}
            </TouchableOpacity>
            <Text style={styles.petImageHint}>Chạm để chụp ảnh hoặc chọn từ thư viện</Text>
            
            <View style={{ gap: 12, marginTop: 4 }}>
              <View>
                <Text style={styles.label}>Tên thú cưng *</Text>
                <TextInput style={[styles.input, { marginTop: 6 }]} value={petName} onChangeText={setPetName} placeholder="Tên thú cưng" />
              </View>
              
              <View style={styles.row}>
                <View style={styles.fieldHalf}>
                  <Text style={styles.label}>Loài</Text>
                  <View style={[styles.toggleRow, { marginTop: 6 }]}>
                    {(['dog', 'cat'] as const).map((item) => (
                      <TouchableOpacity key={item} style={[styles.toggleButton, petType === item && styles.toggleButtonActive]} onPress={() => setPetType(item)}>
                        <Text style={[styles.toggleText, petType === item && styles.toggleTextActive]}>{item === 'dog' ? 'Chó' : 'Mèo'}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                <View style={styles.fieldHalf}>
                  <Text style={styles.label}>Giới tính</Text>
                  <View style={[styles.toggleRow, { marginTop: 6 }]}>
                    {(['male', 'female'] as const).map((item) => (
                      <TouchableOpacity key={item} style={[styles.toggleButton, petGender === item && styles.toggleButtonActive]} onPress={() => setPetGender(item)}>
                        <Text style={[styles.toggleText, petGender === item && styles.toggleTextActive]}>{item === 'male' ? 'Đực' : 'Cái'}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.fieldHalf}>
                  <Text style={styles.label}>Cân nặng (kg) *</Text>
                  <TextInput style={[styles.input, { marginTop: 6 }]} value={petWeight} onChangeText={setPetWeight} placeholder="0.0" keyboardType="numeric" />
                </View>
                <View style={styles.fieldHalf}>
                  <Text style={styles.label}>Tuổi</Text>
                  <TextInput style={[styles.input, { marginTop: 6 }]} value={petAge} onChangeText={setPetAge} placeholder="0" keyboardType="numeric" />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.fieldHalf}>
                  <Text style={styles.label}>Giống</Text>
                  <TextInput style={[styles.input, { marginTop: 6 }]} value={petBreed} onChangeText={setPetBreed} placeholder="VD: Poodle" />
                </View>
                <View style={styles.fieldHalf}>
                  <Text style={styles.label}>Màu lông</Text>
                  <TextInput style={[styles.input, { marginTop: 6 }]} value={petColor} onChangeText={setPetColor} placeholder="VD: Vàng" />
                </View>
              </View>

              <View>
                <Text style={styles.label}>Ghi chú</Text>
                <TextInput style={[styles.input, styles.textArea, { marginTop: 6 }]} value={petNotes} onChangeText={setPetNotes} placeholder="Tình trạng sức khỏe, thói quen..." multiline />
              </View>
            </View>
            <View style={styles.row}>
              <TouchableOpacity style={styles.secondaryButton} onPress={() => setShowCreatePetModal(false)}>
                <Text style={styles.secondaryButtonText}>Đóng</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryButtonHalf} onPress={handleCreatePet} disabled={petUploading}>
                <Text style={styles.primaryButtonText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        {showImageActionModal && imageActionMode === 'create' && (
          <View style={[StyleSheet.absoluteFill, styles.centerModalBackdrop, { backgroundColor: 'rgba(64,43,46,0.5)', zIndex: 100 }]}>
            <View style={styles.imageActionModalCard}>
              <View style={styles.imageActionIconWrap}>
                <PawPrint size={24} color={colors.primary} />
              </View>
              <Text style={styles.modalTitle}>Ảnh thú cưng</Text>
              <Text style={styles.imageActionSubtitle}>Chọn cách cập nhật ảnh cho thú cưng của bạn</Text>
              <View style={styles.imageActionList}>
                <TouchableOpacity
                  style={styles.imageActionItem}
                  onPress={() => {
                    closeImageActionModal();
                    void takePetPhoto(setPetAvatar, 'Đã thêm ảnh thú cưng');
                  }}
                >
                  <Text style={styles.imageActionItemTitle}>Chụp ảnh</Text>
                  <Text style={styles.imageActionItemText}>Dùng camera để chụp ảnh mới</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.imageActionItem}
                  onPress={() => {
                    closeImageActionModal();
                    void pickPetImageFromLibrary(setPetAvatar, 'Đã thêm ảnh thú cưng');
                  }}
                >
                  <Text style={styles.imageActionItemTitle}>Chọn từ thư viện</Text>
                  <Text style={styles.imageActionItemText}>Lấy ảnh có sẵn trên thiết bị</Text>
                </TouchableOpacity>
                {petAvatar ? (
                  <TouchableOpacity
                    style={[styles.imageActionItem, styles.imageActionDanger]}
                    onPress={() => {
                      setPetAvatar('');
                      closeImageActionModal();
                    }}
                  >
                    <Text style={styles.imageActionDangerTitle}>Xóa ảnh hiện tại</Text>
                    <Text style={styles.imageActionDangerText}>Gỡ ảnh thú cưng khỏi hồ sơ</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
              <TouchableOpacity style={styles.secondaryButton} onPress={closeImageActionModal}>
                <Text style={styles.secondaryButtonText}>Đóng</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Modal>

      <Modal visible={!!detailPet} animationType="fade" transparent onRequestClose={closePetDetail}>
        <View style={styles.centerModalBackdrop}>
          <View style={styles.petDetailModalCard}>
            <Text style={styles.modalTitle}>Chi tiết thú cưng</Text>
            <TouchableOpacity
              style={styles.petDetailAvatarButton}
              onPress={() => {
                openPetImageActions('detail');
              }}
              disabled={petUploading}
            >
              {detailPetAvatar ? (
                <Image source={{ uri: detailPetAvatar }} style={styles.petDetailAvatar} />
              ) : (
                <View style={styles.petDetailAvatarFallback}>
                  {petUploading ? (
                    <ActivityIndicator color={colors.primary} />
                  ) : (
                    <>
                      <PawPrint size={28} color={colors.primary} />
                      <Text style={styles.petDetailAvatarHint}>Đổi ảnh</Text>
                    </>
                  )}
                </View>
              )}
            </TouchableOpacity>
            <View style={styles.petDetailInfo}>
              <Text style={styles.sectionTitle}>Thông tin thú cưng</Text>
              
              <View style={{ gap: 12, marginTop: 8 }}>
                <View>
                  <Text style={styles.label}>Tên thú cưng *</Text>
                  <TextInput style={[styles.input, { marginTop: 6 }]} value={detailPetName} onChangeText={setDetailPetName} placeholder="Tên thú cưng" />
                </View>
                
                <View style={styles.row}>
                  <View style={styles.fieldHalf}>
                    <Text style={styles.label}>Loài</Text>
                    <View style={[styles.toggleRow, { marginTop: 6 }]}>
                      {(['dog', 'cat'] as const).map((item) => (
                        <TouchableOpacity key={item} style={[styles.toggleButton, detailPetType === item && styles.toggleButtonActive]} onPress={() => setDetailPetType(item)}>
                          <Text style={[styles.toggleText, detailPetType === item && styles.toggleTextActive]}>{item === 'dog' ? 'Chó' : 'Mèo'}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                  <View style={styles.fieldHalf}>
                    <Text style={styles.label}>Giới tính</Text>
                    <View style={[styles.toggleRow, { marginTop: 6 }]}>
                      {(['male', 'female'] as const).map((item) => (
                        <TouchableOpacity key={item} style={[styles.toggleButton, detailPetGender === item && styles.toggleButtonActive]} onPress={() => setDetailPetGender(item)}>
                          <Text style={[styles.toggleText, detailPetGender === item && styles.toggleTextActive]}>{item === 'male' ? 'Đực' : 'Cái'}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={styles.fieldHalf}>
                    <Text style={styles.label}>Cân nặng (kg) *</Text>
                    <TextInput style={[styles.input, { marginTop: 6 }]} value={detailPetWeight} onChangeText={setDetailPetWeight} placeholder="0.0" keyboardType="numeric" />
                  </View>
                  <View style={styles.fieldHalf}>
                    <Text style={styles.label}>Tuổi</Text>
                    <TextInput style={[styles.input, { marginTop: 6 }]} value={detailPetAge} onChangeText={setDetailPetAge} placeholder="0" keyboardType="numeric" />
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={styles.fieldHalf}>
                    <Text style={styles.label}>Giống</Text>
                    <TextInput style={[styles.input, { marginTop: 6 }]} value={detailPetBreed} onChangeText={setDetailPetBreed} placeholder="VD: Poodle" />
                  </View>
                  <View style={styles.fieldHalf}>
                    <Text style={styles.label}>Màu lông</Text>
                    <TextInput style={[styles.input, { marginTop: 6 }]} value={detailPetColor} onChangeText={setDetailPetColor} placeholder="VD: Vàng" />
                  </View>
                </View>

                <View>
                  <Text style={styles.label}>Ghi chú</Text>
                  <TextInput style={[styles.input, styles.textArea, { marginTop: 6 }]} value={detailPetNotes} onChangeText={setDetailPetNotes} placeholder="Tình trạng sức khỏe..." multiline />
                </View>
              </View>
            </View>
            <View style={styles.row}>
              <TouchableOpacity style={styles.secondaryButton} onPress={closePetDetail} disabled={savingDetailPet}>
                <Text style={styles.secondaryButtonText}>Đóng</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryButtonHalf} onPress={handleUpdateDetailPet} disabled={savingDetailPet}>
                {savingDetailPet ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Lưu</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
        {showImageActionModal && imageActionMode === 'detail' && (
          <View style={[StyleSheet.absoluteFill, styles.centerModalBackdrop, { backgroundColor: 'rgba(64,43,46,0.6)', zIndex: 100 }]}>
            <View style={styles.imageActionModalCard}>
              <View style={styles.imageActionIconWrap}>
                <PawPrint size={24} color={colors.primary} />
              </View>
              <Text style={styles.modalTitle}>Ảnh thú cưng</Text>
              <Text style={styles.imageActionSubtitle}>Chọn cách cập nhật ảnh cho thú cưng của bạn</Text>
              <View style={styles.imageActionList}>
                <TouchableOpacity
                  style={styles.imageActionItem}
                  onPress={() => {
                    closeImageActionModal();
                    void takePetPhoto(setDetailPetAvatar, 'Đã cập nhật ảnh thú cưng');
                  }}
                >
                  <Text style={styles.imageActionItemTitle}>Chụp ảnh</Text>
                  <Text style={styles.imageActionItemText}>Dùng camera để chụp ảnh mới</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.imageActionItem}
                  onPress={() => {
                    closeImageActionModal();
                    void pickPetImageFromLibrary(setDetailPetAvatar, 'Đã cập nhật ảnh thú cưng');
                  }}
                >
                  <Text style={styles.imageActionItemTitle}>Chọn từ thư viện</Text>
                  <Text style={styles.imageActionItemText}>Lấy ảnh có sẵn trên thiết bị</Text>
                </TouchableOpacity>
                {detailPetAvatar ? (
                  <TouchableOpacity
                    style={[styles.imageActionItem, styles.imageActionDanger]}
                    onPress={() => {
                      setDetailPetAvatar('');
                      closeImageActionModal();
                    }}
                  >
                    <Text style={styles.imageActionDangerTitle}>Xóa ảnh hiện tại</Text>
                    <Text style={styles.imageActionDangerText}>Gỡ ảnh thú cưng khỏi hồ sơ</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
              <TouchableOpacity style={styles.secondaryButton} onPress={closeImageActionModal}>
                <Text style={styles.secondaryButtonText}>Đóng</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Modal>

      <Modal visible={successPopupVisible} animationType="fade" transparent onRequestClose={() => setSuccessPopupVisible(false)}>
        <View style={styles.successModalBackdrop}>
          <View style={styles.successModalCard}>
            <View style={styles.successAccent} />
            <View style={styles.successIconWrap}>
              <View style={styles.successIconInner}>
                <Check size={30} color="#fff" />
              </View>
            </View>
            <Text style={styles.successModalTitle}>Lưu thành công</Text>
            <Text style={styles.successModalMessage}>
              {successPopupMessage || 'Thông tin đã được cập nhật.'}
            </Text>
            <TouchableOpacity style={styles.successModalButton} onPress={() => setSuccessPopupVisible(false)}>
              <Text style={styles.successModalButtonText}>Đã hiểu</Text>
            </TouchableOpacity>
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
  petImagePicker: {
    width: 112,
    height: 112,
    alignSelf: 'center',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder || colors.border,
    borderStyle: 'dashed',
    backgroundColor: colors.backgroundSoft || colors.softPink,
    overflow: 'hidden',
    marginBottom: 10,
  },
  petImagePreview: { width: '100%', height: '100%' },
  petImagePlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  petImagePlus: { fontSize: 28, lineHeight: 30, color: colors.primary, fontWeight: '400' },
  petImageText: { marginTop: 4, color: colors.primary, fontSize: 12, fontWeight: '700' },
  petImageHint: { textAlign: 'center', color: colors.textLight, fontSize: 11, marginBottom: 10 },
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
    backgroundColor: 'rgba(64, 43, 46, 0.28)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  calendarModalCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 28,
    backgroundColor: '#FFFDFB',
    padding: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: colors.shadow,
    shadowOpacity: 0.18,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 9,
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
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(64, 43, 46, 0.28)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: '#FFFDFB',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 18,
    gap: 12,
    minHeight: 240,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: colors.shadow,
    shadowOpacity: 0.16,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -8 },
    elevation: 10,
  },
  modalTitle: { color: colors.secondary, fontSize: 18, fontWeight: '800', textAlign: 'center' },
  modalList: { maxHeight: 280 },
  petRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginBottom: 8,
  },
  petRowActive: { borderColor: colors.primary, backgroundColor: '#fff7f7' },
  petRowInfo: { flex: 1 },
  petRowText: { color: colors.secondary, fontSize: 13, fontWeight: '600' },
  petRowTextActive: { color: colors.primary },
  petRowMeta: { color: colors.text, fontSize: 11, marginTop: 4 },
  petRowActions: { flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap' },
  petActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#FFD5DE',
    backgroundColor: '#FFF5F7',
  },
  petDeleteButton: {
    backgroundColor: '#FFF1F4',
  },
  petActionText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  petRowAvatar: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#F7D9DE',
  },
  petRowAvatarFallback: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF1F4',
    borderWidth: 1,
    borderColor: '#FFD5DE',
  },
  petDetailModalCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 30,
    backgroundColor: '#FFFDFB',
    padding: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: colors.shadow,
    shadowOpacity: 0.18,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 9,
  },
  petDetailAvatarButton: {
    alignSelf: 'center',
    borderRadius: 24,
    overflow: 'hidden',
  },
  petDetailAvatar: {
    width: 104,
    height: 104,
    borderRadius: 24,
    alignSelf: 'center',
    backgroundColor: '#F7D9DE',
  },
  petDetailAvatarFallback: {
    width: 104,
    height: 104,
    borderRadius: 24,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF1F4',
    borderWidth: 1,
    borderColor: '#FFD5DE',
  },
  petDetailAvatarHint: {
    marginTop: 6,
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  petDetailInfo: {
    borderRadius: 20,
    backgroundColor: '#FFF6F7',
    borderWidth: 1,
    borderColor: '#FFE1E7',
    padding: 14,
    gap: 10,
  },
  petDetailName: {
    color: colors.secondary,
    fontSize: 16,
    fontWeight: '800',
  },
  petDetailMeta: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 18,
  },
  imageActionModalCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 30,
    backgroundColor: '#FFFDFB',
    padding: 20,
    gap: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: colors.shadow,
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 10,
  },
  imageActionIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF1F4',
    borderWidth: 1,
    borderColor: '#FFD8E0',
  },
  imageActionSubtitle: {
    textAlign: 'center',
    color: colors.text,
    fontSize: 13,
    lineHeight: 19,
    marginTop: -4,
    marginBottom: 4,
  },
  imageActionList: {
    gap: 10,
  },
  imageActionItem: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFF6F2',
    borderWidth: 1,
    borderColor: '#FFE2D7',
  },
  imageActionItemTitle: {
    color: colors.secondary,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  imageActionItemText: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 18,
  },
  imageActionDanger: {
    backgroundColor: '#FFF1F4',
    borderColor: '#FFD4DD',
  },
  imageActionDangerTitle: {
    color: colors.danger,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  imageActionDangerText: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 18,
  },
  successModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  successModalCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#FFFDFB',
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFDCE4',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  successAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 8,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: colors.primary,
  },
  successIconWrap: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#FFE9EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#FFD0DB',
  },
  successIconInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#34C759',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successModalTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.secondary,
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  successModalMessage: {
    fontSize: 15,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
    paddingHorizontal: 2,
  },
  successModalButton: {
    width: '100%',
    height: 50,
    borderRadius: 999,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  successModalButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
});

export default BoardingHotelScreen;











