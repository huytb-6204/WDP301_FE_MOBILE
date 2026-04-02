import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, Alert, Image, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { ArrowLeft, CheckCircle2, Clock3, PlayCircle, RefreshCw, UserRound } from 'lucide-react-native';
import dayjs from 'dayjs';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { getStaffThemeColors } from '../../../theme/staffTheme';
import { useNotifier } from '../../../context/NotifierContext';
import type { StaffStackParamList } from '../../../navigation/StaffNavigator';
import { completeStaffServiceTask, getStaffServiceTaskDetail, startStaffServiceTask, type StaffServiceTask } from '../../../services/api/staffTask';

type DetailRoute = RouteProp<StaffStackParamList, 'StaffServiceTaskDetail'>;

const getStatusMeta = (status?: string) => {
  switch (status) {
    case 'pending':
    case 'confirmed':
      return { text: 'Chờ thực hiện', bg: '#D0F2FF', color: '#0C53B7' };
    case 'in-progress':
      return { text: 'Đang thực hiện', bg: '#FFF7CD', color: '#B78103' };
    case 'completed':
      return { text: 'Hoàn thành', bg: '#E7F5EF', color: '#007B55' };
    case 'cancelled':
      return { text: 'Đã hủy', bg: '#FFE7E6', color: '#FF4842' };
    default:
      return { text: status || 'Không rõ', bg: '#F4F6F8', color: '#637381' };
  }
};

const StaffServiceTaskDetailScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<DetailRoute>();
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const { showAlert, showToast } = useNotifier();
  const staffTheme = getStaffThemeColors(isDarkMode);
  const [loading, setLoading] = useState(true);
  const [processingPetId, setProcessingPetId] = useState<string | null>(null);
  const [task, setTask] = useState<StaffServiceTask | null>(null);

  const bookingId = route.params.bookingId;
  const myId = (user as any)?.id || (user as any)?._id;

  const loadDetail = async () => {
    try {
      setLoading(true);
      const detail = await getStaffServiceTaskDetail(bookingId);
      setTask(detail);
    } catch (error: any) {
      showAlert('Lỗi tải dữ liệu', error.message || 'Không thể tải chi tiết công việc.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDetail();
  }, [bookingId]);

  const assignedPets = useMemo(() => {
    return (task?.petStaffMap || []).filter((item: any) => {
      const staffId = item?.staffId?._id || item?.staffId;
      return staffId === myId;
    });
  }, [myId, task?.petStaffMap]);

  const handleStart = (petId?: string) => {
    if (!petId) return;
    Alert.alert('Bắt đầu dịch vụ', 'Xác nhận bắt đầu thực hiện cho thú cưng này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Bắt đầu',
        onPress: async () => {
          try {
            setProcessingPetId(petId);
            await startStaffServiceTask(bookingId, petId);
            showToast('Đã bắt đầu thực hiện', 'success');
            await loadDetail();
          } catch (error: any) {
            showAlert('Không thể bắt đầu', error.message || 'Có lỗi xảy ra khi bắt đầu dịch vụ.', 'error');
          } finally {
            setProcessingPetId(null);
          }
        },
      },
    ]);
  };

  const handleComplete = (petId?: string) => {
    if (!petId) return;
    Alert.alert('Hoàn thành dịch vụ', 'Xác nhận hoàn thành cho thú cưng này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Hoàn thành',
        onPress: async () => {
          try {
            setProcessingPetId(petId);
            await completeStaffServiceTask(bookingId, petId);
            showToast('Đã hoàn thành phần việc', 'success');
            await loadDetail();
          } catch (error: any) {
            showAlert('Không thể hoàn thành', error.message || 'Có lỗi xảy ra khi hoàn thành dịch vụ.', 'error');
          } finally {
            setProcessingPetId(null);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!task) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: staffTheme.screen }]}>
        <View style={styles.center}>
          <Text style={{ color: staffTheme.textStrong }}>Không tìm thấy công việc.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const bookingMeta = getStatusMeta(task.bookingStatus);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: staffTheme.screen }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View style={[styles.header, { backgroundColor: staffTheme.surface, borderBottomColor: staffTheme.border }]}>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: staffTheme.iconSurface }]} onPress={() => navigation.goBack()}>
          <ArrowLeft size={22} color={staffTheme.textStrong} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: staffTheme.textStrong }]}>Chi tiết công việc</Text>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: staffTheme.iconSurface }]} onPress={() => loadDetail()}>
          <RefreshCw size={18} color={staffTheme.textSoft} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.heroCard, { backgroundColor: staffTheme.surface, borderColor: staffTheme.border }]}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.timeText}>{dayjs(task.start).format('HH:mm')}</Text>
              <Text style={[styles.subtle, { color: staffTheme.textMuted }]}>{dayjs(task.start).format('DD/MM/YYYY')}</Text>
              <Text style={styles.codeText}>#{task.code || '---'}</Text>
            </View>
            <View style={[styles.statusPill, { backgroundColor: bookingMeta.bg }]}>
              <Text style={[styles.statusPillText, { color: bookingMeta.color }]}>{bookingMeta.text}</Text>
            </View>
          </View>

          <Text style={[styles.serviceName, { color: staffTheme.textStrong }]}>{task.serviceId?.name || 'Dịch vụ'}</Text>
          <View style={styles.customerBlock}>
            <View style={[styles.customerAvatarWrap, { backgroundColor: staffTheme.iconSurface }]}>
              <UserRound size={18} color={staffTheme.textSoft} />
            </View>
            <View>
              <Text style={[styles.customerName, { color: staffTheme.textStrong }]}>{task.userId?.fullName || task.customerName || 'Khách hàng'}</Text>
              <Text style={[styles.subtle, { color: staffTheme.textMuted }]}>{task.userId?.phone || task.customerPhone || '-'}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.sectionCard, { backgroundColor: staffTheme.surface, borderColor: staffTheme.border }]}>
          <Text style={[styles.sectionTitle, { color: staffTheme.textStrong }]}>Thú cưng bạn phụ trách</Text>
          <View style={styles.petList}>
            {assignedPets.map((entry: any, index: number) => {
              const pet = entry?.petId || {};
              const petMeta = getStatusMeta(entry?.status);
              const petId = pet?._id;
              const isProcessing = processingPetId === petId;
              const canStart = ['pending', undefined].includes(entry?.status) && task.bookingStatus !== 'pending' && task.bookingStatus !== 'cancelled';
              const canComplete = entry?.status === 'in-progress' && task.bookingStatus !== 'cancelled';

              return (
                <View key={`${petId || index}`} style={[styles.petCard, { borderColor: staffTheme.border, backgroundColor: staffTheme.screen }]}>
                  <View style={styles.petHeader}>
                    <View style={styles.petIdentity}>
                      <Image
                        source={{ uri: pet.avatar || `https://api.dicebear.com/7.x/thumbs/png?seed=${pet.name || index}` }}
                        style={styles.petAvatar}
                      />
                      <View>
                        <Text style={[styles.petName, { color: staffTheme.textStrong }]}>{pet.name || 'Thú cưng'}</Text>
                        <Text style={[styles.subtle, { color: staffTheme.textMuted }]}>{pet.breed || 'Chưa có giống'}</Text>
                      </View>
                    </View>
                    <View style={[styles.statusPill, { backgroundColor: petMeta.bg }]}>
                      <Text style={[styles.statusPillText, { color: petMeta.color }]}>{petMeta.text}</Text>
                    </View>
                  </View>

                  {!!entry?.startedAt && (
                    <View style={styles.infoRow}>
                      <Clock3 size={14} color={staffTheme.textSoft} />
                      <Text style={[styles.subtle, { color: staffTheme.textMuted }]}>Bắt đầu: {dayjs(entry.startedAt).format('HH:mm DD/MM/YYYY')}</Text>
                    </View>
                  )}

                  <View style={styles.actionRow}>
                    {canStart && (
                      <TouchableOpacity style={[styles.actionBtn, styles.startBtn]} onPress={() => handleStart(petId)} disabled={isProcessing}>
                        <PlayCircle size={16} color="#FFFFFF" />
                        <Text style={styles.actionBtnText}>{isProcessing ? 'Đang xử lý...' : 'Bắt đầu'}</Text>
                      </TouchableOpacity>
                    )}
                    {canComplete && (
                      <TouchableOpacity style={[styles.actionBtn, styles.completeBtn]} onPress={() => handleComplete(petId)} disabled={isProcessing}>
                        <CheckCircle2 size={16} color="#FFFFFF" />
                        <Text style={styles.actionBtnText}>{isProcessing ? 'Đang xử lý...' : 'Hoàn thành'}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  backBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '900' },
  content: { padding: 16, gap: 14, paddingBottom: 30 },
  heroCard: { borderWidth: 1, borderRadius: 24, padding: 16 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  timeText: { fontSize: 28, fontWeight: '900', color: '#00A76F' },
  subtle: { fontSize: 13, fontWeight: '500' },
  codeText: { marginTop: 8, fontSize: 14, fontWeight: '900', color: '#111827' },
  statusPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  statusPillText: { fontSize: 11, fontWeight: '800' },
  serviceName: { marginTop: 14, fontSize: 24, fontWeight: '900' },
  customerBlock: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 16 },
  customerAvatarWrap: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  customerName: { fontSize: 15, fontWeight: '800' },
  sectionCard: { borderWidth: 1, borderRadius: 24, padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '900', marginBottom: 12 },
  petList: { gap: 12 },
  petCard: { borderWidth: 1, borderRadius: 20, padding: 14 },
  petHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, alignItems: 'center' },
  petIdentity: { flexDirection: 'row', gap: 10, alignItems: 'center', flex: 1 },
  petAvatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#E5E7EB' },
  petName: { fontSize: 15, fontWeight: '800' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  actionBtn: { minWidth: 132, height: 42, borderRadius: 12, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  startBtn: { backgroundColor: '#0C53B7' },
  completeBtn: { backgroundColor: '#00A76F' },
  actionBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
});

export default StaffServiceTaskDetailScreen;
