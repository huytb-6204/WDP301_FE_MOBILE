import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ScrollView,
  ImageBackground,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, House, Clock, Activity, Utensils, Info, Calendar, ShieldCheck, X, ChevronRight, CheckCircle2 } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { getMyBoardingBookings, getMyBoardingBookingDetail } from '../../services/api/boarding';
import { Toast } from '../../components/common';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
};

const BoardingCagesScreen = () => {
  const navigation = useNavigation<any>();
  const [cages, setCages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  // Modal State
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedCage, setSelectedCage] = useState<any>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  };

  const fetchCages = async () => {
    try {
      const bookings = await getMyBoardingBookings();
      const eligible = bookings.filter(b => 
        ['confirmed', 'checked-in', 'checked-out'].includes(b.boardingStatus || '')
      );

      const details = await Promise.all(
        eligible.map(b => getMyBoardingBookingDetail(b._id).catch(() => null))
      );

      const cageItems = details.filter(Boolean).flatMap((detail: any) => {
        const cage = detail.cage;
        const booking = detail.booking;
        const pets = detail.pets || [];
        
        return pets.map((pet: any, index: number) => ({
          id: `${booking._id}-${pet._id || index}`,
          bookingId: booking._id,
          cage: cage,
          booking: booking,
          pet: pet,
          displayCode: cage?.cageCode || 'CHUỒNG'
        }));
      });

      setCages(cageItems);
    } catch (error) {
      showToast('Lỗi khi tải thông tin chuồng');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCages();
  }, []);

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'checked-in': return { text: 'Đang lưu trú', bg: '#F0FDF4', color: '#166534' };
      case 'confirmed': return { text: 'Đã xác nhận', bg: '#EFF6FF', color: '#1E40AF' };
      case 'checked-out': return { text: 'Đã trả phòng', bg: '#F9FAFB', color: '#374151' };
      default: return { text: status || 'Chờ xử lý', bg: '#FFF7ED', color: '#9A3412' };
    }
  };

  const openCareDetail = (item: any) => {
    setSelectedCage(item);
    setDetailModalVisible(true);
  };

  const renderItem = ({ item }: { item: any }) => {
    const status = getStatusLabel(item.booking.boardingStatus);
    const paymentStatus = item.booking.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán';
    const paymentColor = item.booking.paymentStatus === 'paid' ? '#05A845' : '#FF4D4D';
    
    const feeding = item.booking.feedingSchedule || [];
    const workouts = item.booking.exerciseSchedule || [];
    const schedules = [...feeding, ...workouts];
    const completed = schedules.filter(s => s.status === 'done').length;
    const total = schedules.length;
    const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

    return (
      <View style={styles.card}>
        <ImageBackground 
          source={{ uri: item.cage?.avatar || 'https://via.placeholder.com/400x200' }} 
          style={styles.cardBanner}
          imageStyle={{ borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
        >
          <View style={styles.bannerOverlay}>
            <View style={styles.bannerTop}>
              <View style={styles.badgeStandard}>
                <Text style={styles.badgeStandardText}>{item.cage?.category?.name || 'STANDARD'}</Text>
              </View>
              <View style={[styles.badgeStatus, { backgroundColor: status.bg }]}>
                <Text style={[styles.badgeStatusText, { color: status.color }]}>{status.text}</Text>
              </View>
            </View>
            <View style={styles.bannerBottom}>
              <Text style={styles.cageName}>{item.cage?.cageCode || 'M03'}</Text>
              <Text style={styles.cageSize}>{item.cage?.size || 'M'} ({item.cage?.maxWeight || '8-15kg'} kg)</Text>
            </View>
          </View>
        </ImageBackground>

        <View style={styles.cardBody}>
          <View style={styles.petPriceRow}>
             <Text style={styles.petText}>Thú cưng: <Text style={{fontWeight: '700'}}>{item.pet?.name || 'Cô'}</Text></Text>
             <View style={styles.priceBadge}>
               <Text style={styles.priceText}>{formatCurrency(item.booking.total || 200000)}</Text>
             </View>
          </View>

          <View style={styles.progressRow}>
             <View style={styles.progressCircle}>
                <Text style={styles.progressPercent}>{progressPercent}%</Text>
             </View>
             <View>
                <Text style={styles.progressTitle}>Tiến độ chăm sóc</Text>
                <Text style={styles.progressSub}>{completed}/{total || 5} mục hoàn thành</Text>
             </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Calendar size={18} color="#FF6B6B" />
            <Text style={styles.infoText}>Lưu trú:   <Text style={{fontWeight: '700'}}>{new Date(item.booking.checkInDate).toLocaleDateString('vi-VN')} - {new Date(item.booking.checkOutDate).toLocaleDateString('vi-VN')}</Text></Text>
          </View>

          <View style={styles.infoRow}>
            <ShieldCheck size={18} color={paymentColor} />
            <Text style={styles.infoText}>Thanh toán:   <Text style={{color: paymentColor, fontWeight: '700'}}>{paymentStatus}</Text></Text>
          </View>

          {feeding.length > 0 && (
             <View style={styles.dietSection}>
               <View style={styles.dietHeaderRow}>
                 <Text style={styles.dietTitle}>Lịch ăn uống</Text>
                 <View style={styles.dietBadge}><Text style={styles.dietBadgeText}>{feeding.length} mục</Text></View>
               </View>
               {feeding.slice(0, 3).map((f: any, idx: number) => (
                  <View key={idx} style={styles.dietItem}>
                     <View style={styles.dietItemTop}>
                        <Text style={styles.dietTime}>{f.time}</Text>
                        <View style={[styles.dietStatus, f.status === 'done' ? styles.dietStatusDone : styles.dietStatusPending]}>
                           <Text style={[styles.dietStatusText, f.status === 'done' ? styles.dietStatusTextDone : styles.dietStatusTextPending]}>
                             {f.status === 'done' ? 'Đã hoàn thành' : 'Chưa thực hiện'}
                           </Text>
                        </View>
                     </View>
                     <Text style={styles.dietFood}>{f.food}</Text>
                  </View>
               ))}
             </View>
          )}

          <TouchableOpacity style={styles.detailBtn} onPress={() => openCareDetail(item)}>
            <Text style={styles.detailBtnText}>Xem chi tiết chuồng</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderModal = () => {
    if (!selectedCage) return null;
    const { booking, pet, cage } = selectedCage;

    const schedules = [...(booking.feedingSchedule || []), ...(booking.exerciseSchedule || [])];
    const completed = schedules.filter((s:any) => s.status === 'done').length;
    const total = schedules.length;
    const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

    return (
      <Modal visible={detailModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
           <View style={styles.modalContainer}>
             <View style={styles.modalHeader}>
                <Text style={styles.modalHeaderTitle}>Lịch chăm sóc chi tiết</Text>
                <TouchableOpacity onPress={() => setDetailModalVisible(false)} style={styles.modalCloseBtn}>
                   <X size={24} color="#666" />
                </TouchableOpacity>
             </View>

             <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                {/* Pet Info Card */}
                <View style={[styles.modalCard, { flexDirection: 'row', alignItems: 'center' }]}>
                   <Image source={{ uri: pet.avatar || 'https://via.placeholder.com/150' }} style={styles.modalPetAvatar} />
                   <View style={styles.modalPetInfo}>
                     <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
                       <Text style={styles.modalPetName}>{pet.name}</Text>
                     </View>
                     <Text style={styles.modalPetSub}>{pet.breed || 'Thú cưng'}</Text>
                     <View style={{flexDirection: 'row', gap: 6, marginTop: 4}}>
                        <View style={styles.modalTag}><Text style={styles.modalTagText}>{pet.weight || 'M (8-15kg)'}</Text></View>
                        <View style={styles.modalTag}><Text style={[styles.modalTagText, {color: colors.primary}]}>1 thú cưng</Text></View>
                     </View>
                   </View>
                   <View style={styles.modalProgressBox}>
                     <Text style={styles.modalProgTitle}>TIẾN ĐỘ TRONG NGÀY</Text>
                     <Text style={styles.modalProgValue}>{progressPercent}%</Text>
                     <Text style={styles.modalProgSub}>{completed}/{total || 5} mục</Text>
                   </View>
                </View>

                {/* Body details */}
                <View style={styles.modalRow}>
                   {/* Lịch ăn uống chi tiết */}
                   <View style={[styles.modalCard, { flex: 1, marginRight: 8 }]}>
                      <View style={styles.modalCardHeader}>
                         <Utensils size={18} color="#FF6B6B" />
                         <Text style={styles.modalCardTitle}>Lịch ăn uống</Text>
                      </View>
                      {booking.feedingSchedule?.map((f: any, i: number) => (
                         <View key={i} style={styles.dietItem}>
                            <View style={styles.dietItemTop}>
                              <Text style={styles.dietTime}>{f.time}</Text>
                              <Text style={[styles.dietStatusText, f.status === 'done' ? styles.dietStatusTextDone : styles.dietStatusTextPending]}>{f.status === 'done' ? 'Hoàn thành' : 'Chưa thực hiện'}</Text>
                            </View>
                            <Text style={styles.dietFood}>{f.food}</Text>
                            {f.note ? <Text style={styles.modalNote}>{f.note}</Text> : null}
                         </View>
                      ))}
                      {(!booking.feedingSchedule || booking.feedingSchedule.length === 0) && (
                         <Text style={styles.modalNote}>Chưa có lịch ăn uống</Text>
                      )}
                   </View>

                   {/* Thông tin lưu trú */}
                   <View style={[styles.modalCard, { flex: 1, marginLeft: 8 }]}>
                      <View style={styles.modalCardHeader}>
                         <House size={18} color="#3B82F6" />
                         <Text style={styles.modalCardTitle}>Lưu trú</Text>
                      </View>
                      <View style={{marginBottom: 12}}>
                         <Text style={styles.modalLabel}>THỜI GIAN LƯU TRÚ</Text>
                         <Text style={styles.modalValue}>{new Date(booking.checkInDate).toLocaleDateString('vi-VN')} - {new Date(booking.checkOutDate).toLocaleDateString('vi-VN')}</Text>
                      </View>
                      <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12}}>
                         <View>
                           <Text style={styles.modalLabel}>GIÁ LƯU TRÚ</Text>
                           <Text style={[styles.modalValue, {color: '#FF4D4D'}]}>{formatCurrency(booking.total)}</Text>
                         </View>
                      </View>
                      <View style={{marginBottom: 12}}>
                         <Text style={styles.modalLabel}>Ghi chú chăm sóc</Text>
                         <Text style={styles.modalNote}>{booking.notes || 'Chưa có ghi chú'}</Text>
                      </View>
                      <View>
                         <Text style={styles.modalLabel}>Thú cưng đang lưu trú</Text>
                         <View style={styles.modalTag}><Text style={styles.modalTagText}>{pet.name}</Text></View>
                      </View>
                   </View>
                </View>

                {/* Hoạt động vận động */}
                <View style={styles.modalCard}>
                   <View style={styles.modalCardHeader}>
                      <Activity size={18} color="#05A845" />
                      <Text style={styles.modalCardTitle}>Hoạt động vận động</Text>
                   </View>
                   {booking.exerciseSchedule?.map((e: any, i: number) => (
                      <View key={i} style={styles.dietItem}>
                         <View style={styles.dietItemTop}>
                           <Text style={styles.dietTime}>{e.time}</Text>
                           <Text style={[styles.dietStatusText, e.status === 'done' ? styles.dietStatusTextDone : styles.dietStatusTextPending]}>{e.status === 'done' ? 'Hoàn thành' : 'Chưa thực hiện'}</Text>
                         </View>
                         <Text style={styles.dietFood}>{e.activity || 'Vận động'}</Text>
                         {e.note ? <Text style={styles.modalNote}>{e.note}</Text> : null}
                      </View>
                   ))}
                   {(!booking.exerciseSchedule || booking.exerciseSchedule.length === 0) && (
                      <Text style={styles.modalNote}>Chưa có lịch vận động</Text>
                   )}
                </View>

             </ScrollView>

             <View style={styles.modalFooter}>
                <TouchableOpacity style={styles.modalSecondaryBtn} onPress={() => setDetailModalVisible(false)}>
                  <Text style={styles.modalSecondaryText}>Đóng</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                   style={styles.modalPrimaryBtn} 
                   onPress={() => {
                     setDetailModalVisible(false);
                     navigation.navigate('BoardingBookingDetail', { bookingId: booking._id });
                   }}
                >
                  <Text style={styles.modalPrimaryText}>Xem chi tiết chuồng</Text>
                </TouchableOpacity>
             </View>
           </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color={colors.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chuồng khách sạn</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.banner}>
         <Info size={16} color="#1E40AF" />
         <Text style={styles.bannerText}>Theo dõi thông tin chuồng và tiến độ chăm sóc trong ngày.</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={cages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchCages(); }} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={styles.emptyIconWrap}>
                 <House size={40} color={colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>Chưa có thông tin chuồng</Text>
              <Text style={styles.emptyText}>Các chuồng bạn đã đặt sẽ xuất hiện tại đây khi được xác nhận.</Text>
              <TouchableOpacity 
                style={styles.bookBtn}
                onPress={() => navigation.navigate('BoardingHotel')}
              >
                <Text style={styles.bookBtnText}>ĐẶT PHÒNG NGAY</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
      <Toast visible={toastVisible} message={toastMessage} />
      {renderModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: colors.secondary },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  banner: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8, 
    backgroundColor: '#F0FDF4', 
    padding: 12, 
    marginHorizontal: 16, 
    marginTop: 16, 
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DCFCE7'
  },
  bannerText: { fontSize: 13, color: '#166534', fontWeight: '500' },
  list: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  cardBanner: {
    height: 140,
    width: '100%',
    justifyContent: 'flex-end',
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 12,
    justifyContent: 'space-between'
  },
  bannerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  badgeStandard: {
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99
  },
  badgeStandardText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#333'
  },
  badgeStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99
  },
  badgeStatusText: {
    fontSize: 10,
    fontWeight: '800'
  },
  bannerBottom: {
    marginTop: 'auto'
  },
  cageName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800'
  },
  cageSize: {
    color: '#ddd',
    fontSize: 13
  },
  cardBody: {
    padding: 16
  },
  petPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  petText: {
    fontSize: 14,
    color: '#666'
  },
  priceBadge: {
    backgroundColor: '#FFF5F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8
  },
  priceText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12
  },
  progressCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: '#E2E8F0',
    borderTopColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333'
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2
  },
  progressSub: {
    fontSize: 12,
    color: '#888'
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 12
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10
  },
  infoText: {
    fontSize: 13,
    color: '#666'
  },
  dietSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6'
  },
  dietHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  dietTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333'
  },
  dietBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4
  },
  dietBadgeText: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: '700'
  },
  dietItem: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6'
  },
  dietItemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  dietTime: {
    fontSize: 13,
    fontWeight: '800',
    color: '#333'
  },
  dietStatus: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4
  },
  dietStatusPending: { backgroundColor: '#F3F4F6' },
  dietStatusDone: { backgroundColor: '#DCFCE7' },
  dietStatusText: { fontSize: 10, fontWeight: '600' },
  dietStatusTextPending: { color: '#6B7280' },
  dietStatusTextDone: { color: '#16A34A' },
  dietFood: {
    fontSize: 13,
    color: '#666'
  },
  detailBtn: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 99,
    paddingVertical: 12,
    alignItems: 'center'
  },
  detailBtnText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  modalContainer: {
    backgroundColor: '#F3F4F6',
    height: '90%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#333'
  },
  modalCloseBtn: {
    padding: 4
  },
  modalContent: {
    padding: 16
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2
  },
  modalPetAvatar: {
    width: 60,
    height: 60,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee'
  },
  modalPetInfo: {
    flex: 1,
    marginLeft: 12
  },
  modalPetName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#333'
  },
  modalPetSub: {
    fontSize: 13,
    color: '#888',
    marginTop: 2
  },
  modalTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start'
  },
  modalTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666'
  },
  modalProgressBox: {
    alignItems: 'flex-end'
  },
  modalProgTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#999'
  },
  modalProgValue: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
    marginVertical: 4
  },
  modalProgSub: {
    fontSize: 11,
    color: '#666'
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  modalCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16
  },
  modalCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333'
  },
  modalLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#999',
    marginBottom: 4
  },
  modalValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333'
  },
  modalNote: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 4
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    gap: 12
  },
  modalSecondaryBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center'
  },
  modalSecondaryText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#666'
  },
  modalPrimaryBtn: {
    flex: 2,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 99,
    alignItems: 'center'
  },
  modalPrimaryText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff'
  },
  empty: { alignItems: 'center', justifyContent: 'center', marginTop: 100, paddingHorizontal: 40 },
  emptyIconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFF5F6', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: colors.secondary, marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#7d7b7b', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  bookBtn: { backgroundColor: colors.primary, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 999 },
  bookBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
});

export default BoardingCagesScreen;
