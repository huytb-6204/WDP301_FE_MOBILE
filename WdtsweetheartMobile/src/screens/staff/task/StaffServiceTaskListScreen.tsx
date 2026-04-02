import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, FlatList, Image, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AlertCircle, CalendarDays, ChevronLeft, Eye } from 'lucide-react-native';
import dayjs from 'dayjs';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { getStaffThemeColors } from '../../../theme/staffTheme';
import { useNotifier } from '../../../context/NotifierContext';
import type { StaffStackParamList } from '../../../navigation/StaffNavigator';
import StaffDatePickerModal from '../../../components/common/StaffDatePickerModal';
import { getStaffServiceTasks, startStaffServiceTask, completeStaffServiceTask, type StaffServiceTask } from '../../../services/api/staffTask';

const statusLabel = (status?: string) => {
  switch (status) {
    case 'pending':
    case 'confirmed':
      return { text: 'Chờ thực hiện', bg: '#D0F2FF', color: '#0C53B7' };
    case 'in-progress':
      return { text: 'Đang thực hiện', bg: '#FFF7CD', color: '#B78103' };
    case 'completed':
      return { text: 'Hoàn thành', bg: '#E7F5EF', color: '#007B55' };
    case 'delayed':
      return { text: 'Trễ hẹn', bg: '#FFE7E6', color: '#FF4842' };
    case 'cancelled':
      return { text: 'Đã hủy', bg: '#FFE7E6', color: '#FF4842' };
    default:
      return { text: status || 'Không rõ', bg: '#F4F6F8', color: '#637381' };
  }
};

const StaffServiceTaskListScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<StaffStackParamList>>();
  const route = useRoute<any>();
  const { user } = useAuth();
  const { showAlert } = useNotifier();
  const { isDarkMode } = useTheme();
  const staffTheme = getStaffThemeColors(isDarkMode);
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<StaffServiceTask[]>([]);
  const [filterDate, setFilterDate] = useState(route.params?.date ? dayjs(route.params.date) : dayjs());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [processingPet, setProcessingPet] = useState<string | null>(null);

  const myId = (user as any)?.id || (user as any)?._id;

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await getStaffServiceTasks({ date: filterDate.format('YYYY-MM-DD'), noLimit: true });
      setTasks(Array.isArray(res) ? res : []);
    } catch (error: any) {
      showAlert('Lỗi tải dữ liệu', error.message || 'Không thể tải danh sách công việc.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchTasks();
  }, [filterDate]);

  const stats = useMemo(() => {
    let waiting = 0;
    let inProgress = 0;
    let completed = 0;

    tasks.forEach((task) => {
      const mine = (task.petStaffMap || []).filter((item: any) => {
        const staffId = item?.staffId?._id || item?.staffId;
        return staffId === myId;
      });

      mine.forEach((item) => {
        if (item.status === 'completed') completed += 1;
        else if (item.status === 'in-progress') inProgress += 1;
        else waiting += 1;
      });
    });

    return { waiting, inProgress, completed };
  }, [myId, tasks]);

  const handleStart = async (bookingId: string, petId: string) => {
    setProcessingPet(petId);
    try {
      await startStaffServiceTask(bookingId, petId);
      showAlert('Thành công', 'Đã bắt đầu dịch vụ', 'success');
      fetchTasks();
    } catch (error: any) {
      showAlert('Lỗi', error.message || 'Không thể bắt đầu', 'error');
    } finally {
      setProcessingPet(null);
    }
  };

  const handleComplete = async (bookingId: string, petId: string) => {
    setProcessingPet(petId);
    try {
      await completeStaffServiceTask(bookingId, petId);
      showAlert('Thành công', 'Đã hoàn thành dịch vụ', 'success');
      fetchTasks();
    } catch (error: any) {
      showAlert('Lỗi', error.message || 'Không thể hoàn thành', 'error');
    } finally {
      setProcessingPet(null);
    }
  };

  const renderItem = ({ item }: { item: StaffServiceTask }) => {
    const assignedToMe = (item.petStaffMap || []).filter((entry: any) => {
      const staffId = entry?.staffId?._id || entry?.staffId;
      return staffId === myId;
    });
    const bookingState = statusLabel(item.bookingStatus);

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: staffTheme.surface, borderColor: staffTheme.border }]}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('StaffServiceTaskDetail', { bookingId: item._id })}
      >
        {item.isOverrun && (
          <View style={styles.warningBox}>
            <AlertCircle size={14} color="#FF6B00" />
            <Text style={styles.warningText}>Việc quá giờ này có thể gây trễ các lịch đặt sau.</Text>
          </View>
        )}

        <View style={styles.cardTop}>
          <View style={styles.timeBlock}>
            <Text style={styles.timeText}>{dayjs(item.start).format('HH:mm')}</Text>
            <Text style={[styles.dateText, { color: staffTheme.textMuted }]}>{dayjs(item.start).format('DD/MM/YYYY')}</Text>
            <Text style={styles.codeText}>#{item.code || '---'}</Text>
          </View>

          <View style={styles.mainBlock}>
            <View style={styles.serviceRow}>
              <View style={[styles.statusChip, { backgroundColor: bookingState.bg }]}>
                <Text style={[styles.statusChipText, { color: bookingState.color }]}>{bookingState.text}</Text>
              </View>
              <Text style={[styles.serviceName, { color: staffTheme.text }]}>{item.serviceId?.name || 'Dịch vụ'}</Text>
            </View>

            <View style={styles.customerRow}>
              <Image
                source={{ uri: item.userId?.avatar || `https://api.dicebear.com/7.x/avataaars/png?seed=${item.userId?.fullName || item.customerName || item.code}` }}
                style={styles.customerAvatar}
              />
              <View>
                <Text style={[styles.customerName, { color: staffTheme.textStrong }]}>{item.userId?.fullName || item.customerName || 'Khách hàng'}</Text>
                <Text style={[styles.customerPhone, { color: staffTheme.textMuted }]}>{item.userId?.phone || item.customerPhone || '-'}</Text>
              </View>
            </View>
          </View>

          <View style={[styles.eyeBtn, { backgroundColor: staffTheme.iconSurface }]}>
            <Eye size={18} color={staffTheme.textSoft} />
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: staffTheme.border }]} />

        <Text style={[styles.sectionLabel, { color: staffTheme.textMuted }]}>THÚ CƯNG BẠN PHỤ TRÁCH ({assignedToMe.length})</Text>
        <View style={styles.petList}>
          {assignedToMe.map((entry: any, index: number) => {
            const pet = entry?.petId || {};
            const petState = statusLabel(entry?.status || item.bookingStatus);
            return (
              <View key={`${pet._id || index}`} style={[styles.petCard, { borderColor: staffTheme.border, backgroundColor: staffTheme.screen }]}>
                <View style={styles.petLeft}>
                  <Image
                    source={{ uri: pet.avatar || `https://api.dicebear.com/7.x/thumbs/png?seed=${pet.name || index}` }}
                    style={styles.petAvatar}
                  />
                  <View>
                    <Text style={[styles.petName, { color: staffTheme.textStrong }]}>{pet.name || 'Thú cưng'}</Text>
                    <Text style={[styles.petBreed, { color: staffTheme.textMuted }]}>{pet.breed || 'Chưa có giống'}</Text>
                  </View>
                </View>
                
                <View style={styles.petRight}>
                  <View style={[styles.statusChip, { backgroundColor: petState.bg, marginBottom: 8, alignSelf: 'flex-end' }]}>
                    <Text style={[styles.statusChipText, { color: petState.color }]}>{petState.text}</Text>
                  </View>
                  
                  {item.bookingStatus !== 'cancelled' && (
                    <View style={styles.actionBlock}>
                      {(entry?.status === 'pending' || !entry?.status) && (
                        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#0C53B7' }]} disabled={processingPet === pet._id || item.bookingStatus === 'pending'} onPress={() => handleStart(item._id, pet._id)}>
                          {processingPet === pet._id ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.actionBtnText}>{item.bookingStatus === 'pending' ? 'Chờ xác nhận' : 'Bắt đầu'}</Text>}
                        </TouchableOpacity>
                      )}
                      
                      {entry?.status === 'in-progress' && (
                        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#007B55' }]} disabled={processingPet === pet._id} onPress={() => handleComplete(item._id, pet._id)}>
                          {processingPet === pet._id ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.actionBtnText}>Hoàn thành</Text>}
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: staffTheme.screen }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: staffTheme.surface }]}>
            <ChevronLeft size={24} color={staffTheme.text} />
          </TouchableOpacity>
          <View>
            <Text style={[styles.title, { color: staffTheme.text }]}>Công việc hôm nay</Text>
            <Text style={[styles.subtitle, { color: staffTheme.textMuted }]}>Bộ phận Dịch vụ • {filterDate.format('DD/MM/YYYY')}</Text>
          </View>
        </View>
        <TouchableOpacity style={[styles.dateBtn, { backgroundColor: staffTheme.surface }]} onPress={() => setShowDatePicker(true)}>
          <CalendarDays size={18} color={staffTheme.textSoft} />
          <Text style={[styles.dateBtnText, { color: staffTheme.textStrong }]}>{filterDate.format('DD/MM/YYYY')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statRow}>
        <View style={[styles.statCard, { backgroundColor: '#FFF7CD' }]}>
          <Text style={styles.statValueDark}>{stats.waiting}</Text>
          <Text style={styles.statLabelDark}>Chờ thực hiện</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#D0F2FF' }]}>
          <Text style={styles.statValueDark}>{stats.inProgress}</Text>
          <Text style={styles.statLabelDark}>Đang làm</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#E7F5EF' }]}>
          <Text style={styles.statValueDark}>{stats.completed}</Text>
          <Text style={styles.statLabelDark}>Hoàn thành</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={[styles.emptyText, { color: staffTheme.textStrong }]}>Không có công việc nào trong ngày này.</Text>
            </View>
          }
          refreshing={loading}
          onRefresh={fetchTasks}
        />
      )}

      <StaffDatePickerModal visible={showDatePicker} date={filterDate} onClose={() => setShowDatePicker(false)} onSelect={setFilterDate} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 22, paddingBottom: 12, flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  headerLeft: { flexDirection: 'row', gap: 12, alignItems: 'center', flex: 1 },
  backBtn: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '900' },
  subtitle: { marginTop: 4, fontSize: 13, fontWeight: '600' },
  dateBtn: { height: 42, borderRadius: 12, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  dateBtnText: { fontSize: 13, fontWeight: '800' },
  statRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginVertical: 8 },
  statCard: { flex: 1, borderRadius: 18, paddingVertical: 14, paddingHorizontal: 12 },
  statValueDark: { fontSize: 22, fontWeight: '900', color: '#111827' },
  statLabelDark: { marginTop: 4, fontSize: 12, fontWeight: '700', color: '#475467' },
  list: { padding: 20, paddingTop: 12, gap: 16 },
  card: { borderWidth: 1, borderRadius: 24, padding: 16 },
  warningBox: { marginBottom: 12, borderRadius: 12, backgroundColor: '#FFF1E6', paddingVertical: 10, paddingHorizontal: 12, flexDirection: 'row', gap: 8, alignItems: 'center' },
  warningText: { flex: 1, fontSize: 12, lineHeight: 18, color: '#E65100', fontWeight: '700' },
  cardTop: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  timeBlock: { width: 76 },
  timeText: { fontSize: 26, fontWeight: '900', color: '#00A76F' },
  dateText: { marginTop: 2, fontSize: 12, fontWeight: '600' },
  codeText: { marginTop: 10, fontSize: 13, fontWeight: '900', color: '#111827' },
  mainBlock: { flex: 1 },
  serviceRow: { flexDirection: 'row', gap: 10, alignItems: 'center', flexWrap: 'wrap' },
  statusChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  statusChipText: { fontSize: 11, fontWeight: '800' },
  serviceName: { fontSize: 22, fontWeight: '800' },
  customerRow: { flexDirection: 'row', gap: 10, alignItems: 'center', marginTop: 16 },
  customerAvatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#E5E7EB' },
  customerName: { fontSize: 15, fontWeight: '800' },
  customerPhone: { marginTop: 2, fontSize: 13, fontWeight: '500' },
  eyeBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  divider: { height: 1, marginVertical: 14 },
  sectionLabel: { fontSize: 12, fontWeight: '800', marginBottom: 10 },
  petList: { gap: 10 },
  petCard: { borderWidth: 1, borderRadius: 18, padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  petLeft: { flexDirection: 'row', gap: 10, alignItems: 'center', flex: 1 },
  petAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E5E7EB' },
  petName: { fontSize: 15, fontWeight: '800' },
  petBreed: { marginTop: 2, fontSize: 12, fontWeight: '500' },
  petRight: { alignItems: 'flex-end' },
  actionBlock: { flexDirection: 'row', gap: 8 },
  actionBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, minWidth: 80, alignItems: 'center' },
  actionBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyWrap: { paddingVertical: 80, alignItems: 'center' },
  emptyText: { fontSize: 15, fontWeight: '700', textAlign: 'center' },
});

export default StaffServiceTaskListScreen;
