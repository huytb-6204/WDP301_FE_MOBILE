import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import {
  ArrowLeft,
  Bone,
  Camera,
  CheckCircle2,
  Clock,
  Flame,
  Info,
  LogIn,
  LogOut,
  Receipt,
  RefreshCw,
  Trash2,
  XCircle,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import dayjs from 'dayjs';
import { colors } from '../../../theme/colors';
import { useTheme } from '../../../context/ThemeContext';
import { getStaffThemeColors } from '../../../theme/staffTheme';
import {
  BoardingBooking,
  ExerciseItem,
  FeedingItem,
  getStaffBoardingBookingDetail,
  updateStaffBoardingBookingStatus,
  updateStaffBoardingPaymentStatus,
  updateStaffCareSchedule,
} from '../../../services/api/staffBoarding';
import {
  getBoardingPetDiaries,
  upsertBoardingPetDiary,
  type BoardingPetDiaryRecord,
} from '../../../services/api/boardingPetDiary';
import { uploadMediaToCloudinary } from '../../../services/api/uploadCloudinary';
import { useNotifier } from '../../../context/NotifierContext';
import type { StaffStackParamList } from '../../../navigation/StaffNavigator';

type CareDetailRouteProp = RouteProp<StaffStackParamList, 'StaffCareDetail'>;
type CareTab = 'feeding' | 'exercise' | 'diary' | 'info';

const diaryMealOptions = ['Sang', 'Trua', 'Toi'] as const;
const eatingStatusOptions = ['Het', 'An it', 'Bo an'] as const;
const digestionStatusOptions = ['Binh thuong', 'Tieu chay', 'Tao bon', 'Non mua'] as const;
const moodStatusOptions = ['Vui ve', 'Binh thuong', 'Cang thang', 'U ru', 'So hai'] as const;

const boardingStatusOptions = [
  { value: 'confirmed', label: 'Đã xác nhận', icon: Clock, bg: '#D0F2FF', color: '#0C53B7' },
  { value: 'checked-in', label: 'Đã nhận chuồng', icon: LogIn, bg: '#E7F5EF', color: '#007B55' },
  { value: 'checked-out', label: 'Đã trả chuồng', icon: LogOut, bg: '#F4F6F8', color: '#637381' },
  { value: 'cancelled', label: 'Đã hủy', icon: XCircle, bg: '#FFE7E6', color: '#FF4842' },
] as const;

const paymentStatusOptions = [
  { value: 'unpaid', label: 'Chưa thanh toán' },
  { value: 'partial', label: 'Đặt cọc' },
  { value: 'paid', label: 'Đã thanh toán' },
] as const;

const StaffCareDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<CareDetailRouteProp>();
  const { bookingId, booking: initialBooking } = route.params;
  const { showToast, showAlert } = useNotifier();
  const { isDarkMode } = useTheme();
  const staffTheme = getStaffThemeColors(isDarkMode);

  const [activeTab, setActiveTab] = useState<CareTab>('feeding');
  const [booking, setBooking] = useState<BoardingBooking>(initialBooking as BoardingBooking);
  const [feeding, setFeeding] = useState<FeedingItem[]>(initialBooking.feedingSchedule || []);
  const [exercise, setExercise] = useState<ExerciseItem[]>(initialBooking.exerciseSchedule || []);
  const [diaryRecords, setDiaryRecords] = useState<BoardingPetDiaryRecord[]>([]);
  const [selectedMeal, setSelectedMeal] = useState<(typeof diaryMealOptions)[number]>('Sang');
  const [eatingStatus, setEatingStatus] = useState<(typeof eatingStatusOptions)[number]>('Het');
  const [digestionStatus, setDigestionStatus] = useState<(typeof digestionStatusOptions)[number]>('Binh thuong');
  const [moodStatus, setMoodStatus] = useState<(typeof moodStatusOptions)[number]>('Vui ve');
  const [diaryText, setDiaryText] = useState('');
  const [diaryLoading, setDiaryLoading] = useState(false);
  const [diarySaving, setDiarySaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [updatingPayment, setUpdatingPayment] = useState<string | null>(null);
  const [uploadingIndex, setUploadingIndex] = useState<{ type: 'feeding' | 'exercise'; index: number } | null>(null);

  const loadDiary = async (targetPetId?: string) => {
    const petId = targetPetId || booking?.petIds?.[0]?._id;
    if (!petId) return;

    setDiaryLoading(true);
    try {
      const records = await getBoardingPetDiaries({ bookingId, petId });
      setDiaryRecords(records);
    } catch (error: any) {
      showAlert('Lỗi tải nhật ký', error.message || 'Không thể tải nhật ký nội trú.', 'error');
    } finally {
      setDiaryLoading(false);
    }
  };

  const loadDetail = async (silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      const detail = await getStaffBoardingBookingDetail(bookingId);
      setBooking(detail);
      setFeeding(detail.feedingSchedule || []);
      setExercise(detail.exerciseSchedule || []);
      await loadDiary(detail?.petIds?.[0]?._id);
    } catch (error: any) {
      if (!silent) {
        showAlert('Lỗi tải dữ liệu', error.message || 'Không thể tải chi tiết booking.', 'error');
      }
    } finally {
      if (!silent) setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadDetail();
  }, [bookingId]);

  useEffect(() => {
    const today = dayjs().format('YYYY-MM-DD');
    const current = diaryRecords.find(
      (item) => dayjs(item.date).format('YYYY-MM-DD') === today && item.meal === selectedMeal
    );

    if (!current) {
      setEatingStatus('Het');
      setDigestionStatus('Binh thuong');
      setMoodStatus('Vui ve');
      setDiaryText('');
      return;
    }

    setEatingStatus((current.eatingStatus as (typeof eatingStatusOptions)[number]) || 'Het');
    setDigestionStatus((current.digestionStatus as (typeof digestionStatusOptions)[number]) || 'Binh thuong');
    setMoodStatus((current.moodStatus as (typeof moodStatusOptions)[number]) || 'Vui ve');
    setDiaryText(current.note || '');
  }, [diaryRecords, selectedMeal]);

  const pet = booking?.petIds?.[0];
  const owner = booking?.userId;

  const progress = useMemo(() => {
    const allItems = [...feeding, ...exercise];
    if (!allItems.length) return 0;
    const done = allItems.filter((item) => item.status === 'done').length;
    return Math.round((done / allItems.length) * 100);
  }, [feeding, exercise]);

  const silentSave = async (payloadFeeding: FeedingItem[], payloadExercise: ExerciseItem[]) => {
    try {
      await updateStaffCareSchedule(bookingId, {
        feedingSchedule: payloadFeeding,
        exerciseSchedule: payloadExercise,
        careDate: new Date().toISOString().split('T')[0],
      });
      setBooking((prev) => ({ ...prev, feedingSchedule: payloadFeeding, exerciseSchedule: payloadExercise }));
    } catch (error) {
      console.error('Auto save failed', error);
    }
  };

  const handlePickImage = async (type: 'feeding' | 'exercise', index: number) => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showAlert('Thiếu quyền', 'Cần quyền truy cập thư viện ảnh để tải minh chứng.', 'warning');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: false,
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];
      setUploadingIndex({ type, index });
      try {
        const uploaded = await uploadMediaToCloudinary(
          asset.uri,
          asset.mimeType || 'image/jpeg',
          asset.fileName || `proof_${Date.now()}.jpg`
        );

        if (type === 'feeding') {
          const next = [...feeding];
          next[index] = {
            ...next[index],
            proofMedia: [...(next[index].proofMedia || []), uploaded],
            status: 'done',
          };
          setFeeding(next);
          await silentSave(next, exercise);
        } else {
          const next = [...exercise];
          next[index] = {
            ...next[index],
            proofMedia: [...(next[index].proofMedia || []), uploaded],
            status: 'done',
          };
          setExercise(next);
          await silentSave(feeding, next);
        }
        showToast('Đã thêm minh chứng', 'success');
      } catch (uploadError: any) {
        showAlert('Lỗi tải ảnh', uploadError.message || 'Không thể tải ảnh.', 'error');
      } finally {
        setUploadingIndex(null);
      }
    } catch (error) {
      console.error('Pick image error:', error);
      showAlert('Lỗi', 'Có lỗi xảy ra khi chọn ảnh.', 'error');
      setUploadingIndex(null);
    }
  };

  const handleRemoveProof = async (type: 'feeding' | 'exercise', itemIndex: number, proofIndex: number) => {
    if (type === 'feeding') {
      const next = [...feeding];
      next[itemIndex] = {
        ...next[itemIndex],
        proofMedia: [...(next[itemIndex].proofMedia || [])].filter((_, idx) => idx !== proofIndex),
      };
      setFeeding(next);
      await silentSave(next, exercise);
    } else {
      const next = [...exercise];
      next[itemIndex] = {
        ...next[itemIndex],
        proofMedia: [...(next[itemIndex].proofMedia || [])].filter((_, idx) => idx !== proofIndex),
      };
      setExercise(next);
      await silentSave(feeding, next);
    }
    showToast('Đã xóa minh chứng');
  };

  const handleUpdateStatus = async (type: 'feeding' | 'exercise', index: number, status: 'done' | 'pending' | 'skipped') => {
    if (type === 'feeding') {
      const next = [...feeding];
      next[index] = { ...next[index], status };
      setFeeding(next);
      await silentSave(next, exercise);
    } else {
      const next = [...exercise];
      next[index] = { ...next[index], status };
      setExercise(next);
      await silentSave(feeding, next);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateStaffCareSchedule(bookingId, {
        feedingSchedule: feeding,
        exerciseSchedule: exercise,
        careDate: new Date().toISOString().split('T')[0],
      });
      showToast('Cập nhật lịch trình thành công', 'success');
      await loadDetail(true);
    } catch (error: any) {
      showAlert('Lỗi cập nhật', error.message || 'Không thể lưu thay đổi.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDiary = async () => {
    const petId = booking?.petIds?.[0]?._id;
    if (!petId) {
      showAlert('Thiếu thú cưng', 'Booking này chưa có thú cưng để ghi nhật ký.', 'warning');
      return;
    }

    setDiarySaving(true);
    try {
      await upsertBoardingPetDiary({
        bookingId,
        petId,
        date: dayjs().format('YYYY-MM-DD'),
        meal: selectedMeal,
        eatingStatus,
        digestionStatus,
        moodStatus,
        note: diaryText,
      });
      showToast('Đã lưu nhật ký', 'success');
      await loadDiary(petId);
    } catch (error: any) {
      showAlert('Lỗi cập nhật', error.message || 'Không thể lưu nhật ký.', 'error');
    } finally {
      setDiarySaving(false);
    }
  };

  const renderOptionGroup = <T extends string>(
    options: readonly T[],
    value: T,
    onChange: (next: T) => void
  ) => (
    <View style={styles.optionWrap}>
      {options.map((option) => {
        const active = option === value;
        return (
          <TouchableOpacity
            key={option}
            style={[
              styles.optionPill,
              {
                backgroundColor: active ? 'rgba(245,109,126,0.12)' : staffTheme.iconSurface,
                borderColor: active ? colors.primary : staffTheme.border,
              },
            ]}
            onPress={() => onChange(option)}
          >
            <Text style={[styles.optionText, { color: active ? colors.primary : staffTheme.textMuted }]}>{option}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const confirmUpdateBoardingStatus = (nextStatus: string) => {
    Alert.alert('Cập nhật trạng thái', 'Xác nhận cập nhật trạng thái booking?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xác nhận',
        onPress: async () => {
          setUpdatingStatus(nextStatus);
          try {
            const updated = await updateStaffBoardingBookingStatus(bookingId, nextStatus);
            setBooking((prev) => ({ ...prev, ...(updated || {}), boardingStatus: nextStatus }));
            showToast('Đã cập nhật trạng thái', 'success');
            await loadDetail(true);
          } catch (error: any) {
            showAlert('Lỗi cập nhật', error.message || 'Không thể cập nhật trạng thái booking.', 'error');
          } finally {
            setUpdatingStatus(null);
          }
        },
      },
    ]);
  };

  const confirmUpdatePaymentStatus = (nextStatus: string) => {
    Alert.alert('Cập nhật thanh toán', 'Xác nhận cập nhật trạng thái thanh toán?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xác nhận',
        onPress: async () => {
          setUpdatingPayment(nextStatus);
          try {
            const updated = await updateStaffBoardingPaymentStatus(bookingId, nextStatus);
            setBooking((prev) => ({ ...prev, ...(updated || {}), paymentStatus: nextStatus }));
            showToast('Đã cập nhật thanh toán', 'success');
            await loadDetail(true);
          } catch (error: any) {
            showAlert('Lỗi cập nhật', error.message || 'Không thể cập nhật thanh toán.', 'error');
          } finally {
            setUpdatingPayment(null);
          }
        },
      },
    ]);
  };

  const renderProofList = (type: 'feeding' | 'exercise', item: FeedingItem | ExerciseItem, itemIndex: number) => {
    if (!item.proofMedia?.length) return null;
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.proofList}>
        {item.proofMedia.map((media, proofIndex) => (
          <View key={`${media.url}-${proofIndex}`} style={styles.proofThumbWrap}>
            <Image source={{ uri: media.url }} style={styles.proofThumb} />
            <TouchableOpacity style={styles.removeProofBtn} onPress={() => void handleRemoveProof(type, itemIndex, proofIndex)}>
              <Trash2 size={12} color="#fff" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    );
  };

  const renderCareCard = (type: 'feeding' | 'exercise', item: FeedingItem | ExerciseItem, index: number) => {
    const isFeeding = type === 'feeding';
    const done = item.status === 'done';
    return (
      <View key={`${type}-${item._id || index}`} style={[styles.careCard, { backgroundColor: staffTheme.surface, borderColor: staffTheme.border }]}> 
        <View style={styles.cardHeader}>
          <View style={[styles.iconWrap, { backgroundColor: isFeeding ? '#E7F5EF' : '#FFF7CD' }]}>
            {isFeeding ? <Bone size={20} color="#007B55" /> : <Flame size={20} color="#B78103" />}
          </View>
          <View style={styles.cardInfo}>
            <Text style={[styles.itemTitle, { color: staffTheme.textStrong }]}>
              {item.time} • {isFeeding ? (item as FeedingItem).food : (item as ExerciseItem).activity}
            </Text>
            <Text style={[styles.itemMeta, { color: staffTheme.textMuted }]}>
              {isFeeding ? `Lượng: ${(item as FeedingItem).amount || 'Chưa cập nhật'}` : `${(item as ExerciseItem).durationMinutes || 0} phút`}
            </Text>
            {!!item.staffName && <Text style={[styles.assigneeText, { color: staffTheme.textSoft }]}>Nhân viên: {item.staffName}</Text>}
          </View>
          <TouchableOpacity
            onPress={() => void handleUpdateStatus(type, index, done ? 'pending' : 'done')}
            style={[styles.statusToggle, { backgroundColor: done ? colors.primary : staffTheme.iconSurface }]}
          >
            {done ? <CheckCircle2 size={22} color="#fff" /> : <Clock size={22} color={staffTheme.textSoft} />}
          </TouchableOpacity>
        </View>

        {!!item.note && (
          <View style={[styles.noteBox, { backgroundColor: staffTheme.iconSurface }]}> 
            <Text style={[styles.noteText, { color: staffTheme.textMuted }]}>{item.note}</Text>
          </View>
        )}

        <View style={styles.proofRow}>
          <TouchableOpacity
            style={[styles.addProofBtn, { backgroundColor: staffTheme.iconSurface, borderColor: staffTheme.border }, uploadingIndex?.type === type && uploadingIndex.index === index && styles.disabledBtn]}
            onPress={() => void handlePickImage(type, index)}
            disabled={!!uploadingIndex}
          >
            {uploadingIndex?.type === type && uploadingIndex.index === index ? (
              <ActivityIndicator size="small" color={colors.primary} style={{ marginRight: 8 }} />
            ) : (
              <Camera size={18} color={staffTheme.textMuted} />
            )}
            <Text style={[styles.addProofText, { color: staffTheme.textMuted }]}>
              {uploadingIndex?.type === type && uploadingIndex.index === index ? 'Đang tải...' : 'Tải minh chứng'}
            </Text>
          </TouchableOpacity>
          {renderProofList(type, item, index)}
        </View>
      </View>
    );
  };

  const renderStatusSection = () => (
    <View style={[styles.summaryCard, { backgroundColor: staffTheme.surface, borderColor: staffTheme.border }]}> 
      <View style={styles.summaryTop}>
        <View style={styles.summaryLeft}>
          <Text style={[styles.codeText, { color: staffTheme.textStrong }]}>#{booking.code}</Text>
          <Text style={[styles.summaryMeta, { color: staffTheme.textMuted }]}>
            {dayjs(booking.checkInDate).format('DD/MM/YYYY')} - {dayjs(booking.checkOutDate).format('DD/MM/YYYY')}
          </Text>
        </View>
        <TouchableOpacity style={[styles.refreshBtn, { backgroundColor: staffTheme.iconSurface }]} onPress={() => void loadDetail()}>
          {refreshing ? <ActivityIndicator size="small" color={colors.primary} /> : <RefreshCw size={18} color={staffTheme.textMuted} />}
        </TouchableOpacity>
      </View>

      <View style={[styles.progressBar, { backgroundColor: staffTheme.iconSurface }]}> 
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
      <Text style={[styles.progressLabel, { color: staffTheme.textMuted }]}>Tiến độ chăm sóc {progress}%</Text>

      <Text style={[styles.sectionCaption, { color: staffTheme.textSoft }]}>Trạng thái booking</Text>
      <View style={styles.optionWrap}>
        {boardingStatusOptions.map((option) => {
          const active = booking.boardingStatus === option.value;
          const Icon = option.icon;
          return (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionPill,
                { backgroundColor: active ? option.bg : staffTheme.iconSurface, borderColor: active ? option.color : staffTheme.border },
              ]}
              onPress={() => !active && !updatingStatus && confirmUpdateBoardingStatus(option.value)}
              disabled={!!updatingStatus}
            >
              {updatingStatus === option.value ? (
                <ActivityIndicator size="small" color={option.color} />
              ) : (
                <Icon size={14} color={active ? option.color : staffTheme.textMuted} />
              )}
              <Text style={[styles.optionText, { color: active ? option.color : staffTheme.textMuted }]}>{option.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={[styles.sectionCaption, { color: staffTheme.textSoft }]}>Trạng thái thanh toán</Text>
      <View style={styles.optionWrap}>
        {paymentStatusOptions.map((option) => {
          const active = booking.paymentStatus === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionPill,
                { backgroundColor: active ? 'rgba(245,109,126,0.12)' : staffTheme.iconSurface, borderColor: active ? colors.primary : staffTheme.border },
              ]}
              onPress={() => !active && !updatingPayment && confirmUpdatePaymentStatus(option.value)}
              disabled={!!updatingPayment}
            >
              {updatingPayment === option.value ? <ActivityIndicator size="small" color={colors.primary} /> : <Receipt size={14} color={active ? colors.primary : staffTheme.textMuted} />}
              <Text style={[styles.optionText, { color: active ? colors.primary : staffTheme.textMuted }]}>{option.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: staffTheme.screen }]}> 
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View style={[styles.header, { backgroundColor: staffTheme.surface, borderBottomColor: staffTheme.border }]}> 
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIcon}>
          <ArrowLeft size={24} color={staffTheme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: staffTheme.text }]}>Chi tiết chăm sóc</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.petSummary, { backgroundColor: staffTheme.surface, borderColor: staffTheme.border }]}> 
          <Image source={{ uri: pet?.avatar || 'https://via.placeholder.com/100' }} style={[styles.petAvatar, { backgroundColor: staffTheme.iconSurface }]} />
          <View style={styles.petDetails}>
            <Text style={[styles.petName, { color: staffTheme.text }]}>{pet?.name || 'Thú cưng'}</Text>
            <Text style={[styles.petSub, { color: staffTheme.textMuted }]}>
              {pet?.breed || 'Chưa cập nhật'} • {pet?.weight ? `${pet.weight} kg` : 'Chưa có cân nặng'}
            </Text>
            <View style={styles.badgeRow}>
              <View style={[styles.cageBadge, { backgroundColor: staffTheme.iconSurface, borderColor: staffTheme.border }]}>
                <Text style={[styles.badgeText, { color: staffTheme.textMuted }]}>{booking.cageId?.cageCode || 'N/A'}</Text>
              </View>
              <View style={[styles.cageBadge, { backgroundColor: '#E7F5EF', borderColor: '#E7F5EF' }]}>
                <Text style={[styles.badgeText, { color: '#007B55' }]}>{String(booking.boardingStatus || '').toUpperCase()}</Text>
              </View>
            </View>
          </View>
        </View>

        {renderStatusSection()}

        <View style={[styles.tabs, { borderBottomColor: staffTheme.border }]}> 
          {[
            { key: 'feeding', label: `Ăn (${feeding.length})` },
            { key: 'exercise', label: `Vận động (${exercise.length})` },
            { key: 'diary', label: 'Nhật ký' },
            { key: 'info', label: 'Thông tin' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key as CareTab)}
              style={[styles.tab, activeTab === tab.key && { borderBottomColor: colors.primary }]}
            >
              <Text style={[styles.tabText, { color: activeTab === tab.key ? colors.primary : staffTheme.textMuted }]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'feeding' && (
          <View style={styles.list}>
            <View style={styles.suggestionBox}>
              <Info size={18} color="#007B55" />
              <Text style={styles.suggestionText}>Theo dõi đủ ảnh minh chứng trước khi chuyển sang hoàn thành.</Text>
            </View>
            {feeding.length ? feeding.map((item, idx) => renderCareCard('feeding', item, idx)) : <Text style={[styles.emptyText, { color: staffTheme.textSoft }]}>Chưa có lịch ăn</Text>}
          </View>
        )}

        {activeTab === 'exercise' && (
          <View style={styles.list}>
            {exercise.length ? exercise.map((item, idx) => renderCareCard('exercise', item, idx)) : <Text style={[styles.emptyText, { color: staffTheme.textSoft }]}>Chưa có lịch vận động</Text>}
          </View>
        )}

        {activeTab === 'diary' && (
          <View style={styles.list}>
            <View style={[styles.infoSection, { backgroundColor: staffTheme.surface, borderColor: staffTheme.border }]}>
              <Text style={[styles.diaryTitle, { color: staffTheme.textStrong }]}>Nhật ký thú cưng</Text>
              <Text style={[styles.diaryLabel, { color: staffTheme.textMuted }]}>Bữa ghi nhận</Text>
              {renderOptionGroup(diaryMealOptions, selectedMeal, setSelectedMeal)}
              <Text style={[styles.diaryLabel, { color: staffTheme.textMuted }]}>Tình trạng ăn uống</Text>
              {renderOptionGroup(eatingStatusOptions, eatingStatus, setEatingStatus)}
              <Text style={[styles.diaryLabel, { color: staffTheme.textMuted }]}>Tình trạng tiêu hóa</Text>
              {renderOptionGroup(digestionStatusOptions, digestionStatus, setDigestionStatus)}
              <Text style={[styles.diaryLabel, { color: staffTheme.textMuted }]}>Tâm trạng</Text>
              {renderOptionGroup(moodStatusOptions, moodStatus, setMoodStatus)}
              <Text style={[styles.diaryLabel, { color: staffTheme.textMuted }]}>Ghi chú</Text>
            </View>
            <TextInput
              multiline
              placeholder="Ghi nhận tình trạng sức khỏe, tâm trạng, lưu ý phát sinh..."
              placeholderTextColor={staffTheme.textSoft}
              style={[styles.diaryInput, { backgroundColor: staffTheme.surface, color: staffTheme.text, borderColor: staffTheme.border }]}
              textAlignVertical="top"
              value={diaryText}
              onChangeText={setDiaryText}
            />
            <TouchableOpacity style={[styles.diarySaveBtn, diarySaving && styles.disabledBtn]} onPress={() => void handleSaveDiary()} disabled={diarySaving}>
              {diarySaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.diarySaveText}>Lưu nhật ký hôm nay</Text>}
            </TouchableOpacity>
            <Text style={[styles.diaryLabel, { color: staffTheme.textMuted }]}>Lịch sử gần đây</Text>
            {diaryLoading ? (
              <ActivityIndicator style={{ marginTop: 16 }} color={colors.primary} />
            ) : diaryRecords.length === 0 ? (
              <Text style={[styles.diaryHint, { color: staffTheme.textSoft }]}>Chưa có bản ghi nhật ký nào.</Text>
            ) : (
              diaryRecords.slice(0, 5).map((item) => (
                <View key={item._id} style={[styles.infoSection, { backgroundColor: staffTheme.surface, borderColor: staffTheme.border }]}>
                  <Text style={[styles.sectionTitle, { color: staffTheme.textStrong }]}>
                    {item.meal} • {dayjs(item.date).format('DD/MM/YYYY')}
                  </Text>
                  <Text style={[styles.longNote, { color: staffTheme.textMuted }]}>
                    Ăn uống: {item.eatingStatus || '-'} | Tiêu hóa: {item.digestionStatus || '-'} | Tâm trạng: {item.moodStatus || '-'}
                  </Text>
                  {!!item.note && <Text style={[styles.longNote, { color: staffTheme.textMuted }]}>Ghi chú: {item.note}</Text>}
                  {!!item.staffName && <Text style={[styles.longNote, { color: staffTheme.textSoft }]}>Nhân viên: {item.staffName}</Text>}
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'info' && (
          <View style={styles.list}>
            <View style={[styles.infoSection, { backgroundColor: staffTheme.surface, borderColor: staffTheme.border }]}> 
              <Text style={[styles.sectionTitle, { color: staffTheme.textStrong }]}>Thông tin thú cưng</Text>
              <View style={styles.detailRow}><Text style={[styles.detailLabel, { color: staffTheme.textMuted }]}>Tên</Text><Text style={[styles.detailValue, { color: staffTheme.textStrong }]}>{pet?.name || 'N/A'}</Text></View>
              <View style={styles.detailRow}><Text style={[styles.detailLabel, { color: staffTheme.textMuted }]}>Giống</Text><Text style={[styles.detailValue, { color: staffTheme.textStrong }]}>{pet?.breed || 'N/A'}</Text></View>
              <View style={styles.detailRow}><Text style={[styles.detailLabel, { color: staffTheme.textMuted }]}>Cân nặng</Text><Text style={[styles.detailValue, { color: staffTheme.textStrong }]}>{pet?.weight ? `${pet.weight} kg` : 'N/A'}</Text></View>
            </View>

            <View style={[styles.infoSection, { backgroundColor: staffTheme.surface, borderColor: staffTheme.border }]}> 
              <Text style={[styles.sectionTitle, { color: staffTheme.textStrong }]}>Thông tin khách hàng</Text>
              <View style={styles.detailRow}><Text style={[styles.detailLabel, { color: staffTheme.textMuted }]}>Họ tên</Text><Text style={[styles.detailValue, { color: staffTheme.textStrong }]}>{booking.fullName || owner?.fullName || 'N/A'}</Text></View>
              <View style={styles.detailRow}><Text style={[styles.detailLabel, { color: staffTheme.textMuted }]}>SĐT</Text><Text style={[styles.detailValue, { color: staffTheme.textStrong }]}>{booking.phone || owner?.phone || 'N/A'}</Text></View>
              <View style={styles.detailRow}><Text style={[styles.detailLabel, { color: staffTheme.textMuted }]}>Email</Text><Text style={[styles.detailValue, { color: staffTheme.textStrong }]}>{booking.email || owner?.email || 'N/A'}</Text></View>
            </View>

            <View style={[styles.infoSection, { backgroundColor: staffTheme.surface, borderColor: staffTheme.border }]}> 
              <Text style={[styles.sectionTitle, { color: staffTheme.textStrong }]}>Thông tin đặt chỗ</Text>
              <View style={styles.detailRow}><Text style={[styles.detailLabel, { color: staffTheme.textMuted }]}>Mã đơn</Text><Text style={[styles.detailValue, { color: staffTheme.textStrong }]}>#{booking.code}</Text></View>
              <View style={styles.detailRow}><Text style={[styles.detailLabel, { color: staffTheme.textMuted }]}>Nhận chuồng</Text><Text style={[styles.detailValue, { color: staffTheme.textStrong }]}>{dayjs(booking.checkInDate).format('DD/MM/YYYY')}</Text></View>
              <View style={styles.detailRow}><Text style={[styles.detailLabel, { color: staffTheme.textMuted }]}>Trả chuồng</Text><Text style={[styles.detailValue, { color: staffTheme.textStrong }]}>{dayjs(booking.checkOutDate).format('DD/MM/YYYY')}</Text></View>
              <View style={styles.detailRow}><Text style={[styles.detailLabel, { color: staffTheme.textMuted }]}>Thanh toán</Text><Text style={[styles.detailValue, { color: staffTheme.textStrong }]}>{booking.paymentStatus || 'N/A'}</Text></View>
              <View style={styles.detailRow}><Text style={[styles.detailLabel, { color: staffTheme.textMuted }]}>Tổng tiền</Text><Text style={[styles.detailValue, { color: staffTheme.textStrong }]}>{typeof booking.total === 'number' ? `${booking.total.toLocaleString('vi-VN')}đ` : 'N/A'}</Text></View>
              {!!booking.notes && <Text style={[styles.longNote, { color: staffTheme.textMuted }]}>Ghi chú: {booking.notes}</Text>}
              {!!booking.specialCare && <Text style={[styles.longNote, { color: staffTheme.textMuted }]}>Chăm sóc đặc biệt: {booking.specialCare}</Text>}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: staffTheme.surface, borderTopColor: staffTheme.border }]}> 
        <TouchableOpacity style={[styles.saveBtn, loading && styles.disabledBtn]} onPress={() => void handleSave()} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Lưu thay đổi</Text>}
        </TouchableOpacity>
      </View>
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
    borderBottomWidth: 1,
  },
  headerIcon: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  scroll: { padding: 16, paddingBottom: 120 },
  petSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  petAvatar: { width: 80, height: 80, borderRadius: 20 },
  petDetails: { flex: 1, marginLeft: 16 },
  petName: { fontSize: 22, fontWeight: '900' },
  petSub: { marginTop: 4, fontSize: 13, fontWeight: '600' },
  badgeRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  cageBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, borderWidth: 1 },
  badgeText: { fontSize: 11, fontWeight: '800' },
  summaryCard: { borderRadius: 20, padding: 16, borderWidth: 1, marginBottom: 16 },
  summaryTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  summaryLeft: { flex: 1 },
  codeText: { fontSize: 18, fontWeight: '900' },
  summaryMeta: { marginTop: 4, fontSize: 13, fontWeight: '600' },
  refreshBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  progressBar: { height: 8, borderRadius: 999, marginTop: 14, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 999 },
  progressLabel: { marginTop: 8, fontSize: 12, fontWeight: '700' },
  sectionCaption: { marginTop: 14, marginBottom: 8, fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  optionWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  optionText: { fontSize: 12, fontWeight: '800' },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, marginBottom: 8 },
  tab: { paddingVertical: 14, paddingHorizontal: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabText: { fontSize: 13, fontWeight: '800' },
  list: { paddingTop: 12 },
  suggestionBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E7F5EF', padding: 12, borderRadius: 12, marginBottom: 16 },
  suggestionText: { marginLeft: 10, fontSize: 13, color: '#007B55', fontWeight: '700', flex: 1 },
  careCard: { padding: 16, borderRadius: 18, marginBottom: 14, borderWidth: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  iconWrap: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cardInfo: { flex: 1, marginLeft: 14 },
  itemTitle: { fontSize: 15, fontWeight: '800' },
  itemMeta: { fontSize: 13, marginTop: 2, fontWeight: '600' },
  assigneeText: { fontSize: 12, marginTop: 4, fontWeight: '600' },
  statusToggle: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  noteBox: { marginTop: 12, padding: 12, borderRadius: 12 },
  noteText: { fontSize: 13, lineHeight: 18 },
  proofRow: { marginTop: 12 },
  addProofBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
  },
  addProofText: { marginLeft: 8, fontSize: 13, fontWeight: '700' },
  proofList: { marginTop: 10 },
  proofThumbWrap: { position: 'relative', marginRight: 8 },
  proofThumb: { width: 64, height: 64, borderRadius: 10 },
  removeProofBtn: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF4842',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  diaryTitle: { fontSize: 18, fontWeight: '800', marginBottom: 12 },
  diaryLabel: { marginTop: 10, marginBottom: 8, fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  diaryInput: { minHeight: 160, padding: 16, borderRadius: 18, borderWidth: 1, fontSize: 15 },
  diaryHint: { marginTop: 10, fontSize: 12, lineHeight: 18, fontWeight: '500' },
  diarySaveBtn: { marginTop: 12, marginBottom: 16, backgroundColor: '#111827', height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  diarySaveText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  infoSection: { borderRadius: 18, padding: 16, borderWidth: 1, marginBottom: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 12 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  detailLabel: { fontSize: 14, fontWeight: '600' },
  detailValue: { fontSize: 14, fontWeight: '700', maxWidth: '58%', textAlign: 'right' },
  longNote: { marginTop: 8, fontSize: 13, lineHeight: 20, fontWeight: '500' },
  emptyText: { textAlign: 'center', marginTop: 36, fontSize: 14, fontWeight: '600' },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    borderTopWidth: 1,
  },
  saveBtn: { backgroundColor: '#111827', height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  disabledBtn: { opacity: 0.6 },
});

export default StaffCareDetailScreen;
