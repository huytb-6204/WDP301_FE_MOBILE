<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import {
  ArrowLeft,
  Bone,
  Flame,
  CheckCircle2,
  Clock,
  Camera,
  Trash2,
  ChevronRight,
  Info,
  Calendar
} from 'lucide-react-native';
import { colors } from '../../../theme/colors';
import { updateStaffCareSchedule, FeedingItem, ExerciseItem } from '../../../services/api/staffBoarding';
import type { StaffStackParamList } from '../../../navigation/StaffNavigator';
=======
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, Image, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View, TextInput } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import {
  ArrowLeft, Bone, Flame, CheckCircle2,
  Clock, Camera, Trash2, Info
} from 'lucide-react-native';
import dayjs from 'dayjs';
import { colors } from '../../../theme/colors';
import { updateStaffCareSchedule, FeedingItem, ExerciseItem } from '../../../services/api/staffBoarding';
import type { StaffStackParamList } from '../../../navigation/StaffNavigator';
import * as ImagePicker from 'expo-image-picker';
import { uploadMediaToCloudinary } from '../../../services/api/uploadCloudinary';
import { useNotifier } from '../../../context/NotifierContext';
>>>>>>> main

type CareDetailRouteProp = RouteProp<StaffStackParamList, 'StaffCareDetail'>;

const StaffCareDetailScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<CareDetailRouteProp>();
    const { bookingId, booking } = route.params;
<<<<<<< HEAD

    const [activeTab, setActiveTab] = useState<'feeding' | 'exercise' | 'diary'>('feeding');
    const [feeding, setFeeding] = useState<FeedingItem[]>(booking.feedingSchedule || []);
    const [exercise, setExercise] = useState<ExerciseItem[]>(booking.exerciseSchedule || []);
    const [loading, setLoading] = useState(false);
=======
    const { showToast, showAlert } = useNotifier();

    const [activeTab, setActiveTab] = useState<'feeding' | 'exercise' | 'diary' | 'info'>('feeding');
    const [feeding, setFeeding] = useState<FeedingItem[]>(booking.feedingSchedule || []);
    const [exercise, setExercise] = useState<ExerciseItem[]>(booking.exerciseSchedule || []);
    const [diaryText, setDiaryText] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploadingIndex, setUploadingIndex] = useState<{type: string, index: number} | null>(null);

    const handlePickImage = async (type: 'feeding' | 'exercise' | 'diary', index: number) => {
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

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                setUploadingIndex({ type, index });
                
                try {
                    const uploaded = await uploadMediaToCloudinary(
                        asset.uri,
                        asset.mimeType || 'image/jpeg',
                        asset.fileName || `proof_${Date.now()}.jpg`
                    );

                    if (type === 'feeding') {
                        const newList = [...feeding];
                        const currentProof = newList[index].proofMedia || [];
                        newList[index] = { 
                            ...newList[index], 
                            proofMedia: [...currentProof, uploaded],
                            status: 'done'
                        };
                        setFeeding(newList);
                        showToast('Đã thêm minh chứng bữa ăn', 'success');
                    } else if (type === 'exercise') {
                        const newList = [...exercise];
                        const currentProof = newList[index].proofMedia || [];
                        newList[index] = { 
                            ...newList[index], 
                            proofMedia: [...currentProof, uploaded],
                            status: 'done'
                        };
                        setExercise(newList);
                        showToast('Đã thêm minh chứng vận động', 'success');
                    } else if (type === 'diary') {
                        showToast('Đã tải ảnh lên thành công', 'success');
                    }
                } catch (uploadError: any) {
                    showAlert('Lỗi tải ảnh', uploadError.message || 'Không thể tải ảnh.', 'error');
                } finally {
                    setUploadingIndex(null);
                }
            }
        } catch (error) {
            console.error('Pick image error:', error);
            showAlert('Lỗi', 'Có lỗi xảy ra khi chọn ảnh.', 'error');
        }
    };

    const handleRemoveProof = (type: 'feeding' | 'exercise', itemIndex: number, proofIndex: number) => {
        if (type === 'feeding') {
            const newList = [...feeding];
            const currentProof = [...(newList[itemIndex].proofMedia || [])];
            currentProof.splice(proofIndex, 1);
            newList[itemIndex] = { ...newList[itemIndex], proofMedia: currentProof };
            setFeeding(newList);
        } else {
            const newList = [...exercise];
            const currentProof = [...(newList[itemIndex].proofMedia || [])];
            currentProof.splice(proofIndex, 1);
            newList[itemIndex] = { ...newList[itemIndex], proofMedia: currentProof };
            setExercise(newList);
        }
        showToast('Đã xóa minh chứng');
    };
>>>>>>> main

    const handleUpdateStatus = (type: 'feeding' | 'exercise', index: number, status: 'done' | 'pending' | 'skipped') => {
        if (type === 'feeding') {
            const newList = [...feeding];
            newList[index] = { ...newList[index], status };
            setFeeding(newList);
        } else {
            const newList = [...exercise];
            newList[index] = { ...newList[index], status };
            setExercise(newList);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const payload = {
                feedingSchedule: feeding,
                exerciseSchedule: exercise,
                careDate: new Date().toISOString().split('T')[0]
            };
            await updateStaffCareSchedule(bookingId, payload);
<<<<<<< HEAD
            Alert.alert('Thành công', 'Đã cập nhật lịch trình chăm sóc!');
            navigation.goBack();
        } catch (error) {
            console.error('Update failed', error);
            Alert.alert('Lỗi', 'Không thể lưu thay đổi. Vui lòng thử lại sau.');
=======
            showToast('Cập nhật lịch trình thành công!', 'success');
            setTimeout(() => navigation.goBack(), 1200);
        } catch (error: any) {
            console.error('Update failed', error);
            showAlert('Lỗi cập nhật', error.message || 'Hệ thống đang gặp sự cố. Vui lòng thử lại.', 'error');
>>>>>>> main
        } finally {
            setLoading(false);
        }
    };

    const renderFeedingCard = (item: FeedingItem, index: number) => (
        <View key={index} style={styles.careCard}>
            <View style={styles.cardHeader}>
                <View style={[styles.iconWrap, { backgroundColor: '#E7F5EF' }]}>
                    <Bone size={20} color="#007B55" />
                </View>
                <View style={styles.cardInfo}>
                    <Text style={styles.itemTitle}>{item.time} — {item.food}</Text>
                    <Text style={styles.itemMeta}>Lượng: {item.amount}</Text>
                </View>
                <TouchableOpacity 
                   onPress={() => handleUpdateStatus('feeding', index, item.status === 'done' ? 'pending' : 'done')}
                   style={[styles.statusToggle, item.status === 'done' && styles.statusToggleActive]}
                >
                    {item.status === 'done' ? <CheckCircle2 size={24} color="#fff" /> : <Clock size={24} color="#919EAB" />}
                </TouchableOpacity>
            </View>
            
            {item.note && (
                <View style={styles.noteBox}>
                    <Text style={styles.noteText}>{item.note}</Text>
                </View>
            )}

            <View style={styles.proofRow}>
<<<<<<< HEAD
                <TouchableOpacity style={styles.addProofBtn}>
                    <Camera size={20} color="#637381" />
                    <Text style={styles.addProofText}>Tải minh chứng</Text>
=======
                <TouchableOpacity 
                    style={[styles.addProofBtn, uploadingIndex?.type === 'feeding' && uploadingIndex.index === index && { opacity: 0.5 }]}
                    onPress={() => handlePickImage('feeding', index)}
                    disabled={!!uploadingIndex}
                >
                    {uploadingIndex?.type === 'feeding' && uploadingIndex.index === index ? (
                        <ActivityIndicator size="small" color={colors.primary} style={{ marginRight: 8 }} />
                    ) : (
                        <Camera size={20} color="#637381" />
                    )}
                    <Text style={styles.addProofText}>
                        {uploadingIndex?.type === 'feeding' && uploadingIndex.index === index ? 'Đang tải...' : 'Tải minh chứng'}
                    </Text>
>>>>>>> main
                </TouchableOpacity>
                {item.proofMedia && item.proofMedia.length > 0 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.proofList}>
                        {item.proofMedia.map((m, mi) => (
<<<<<<< HEAD
                            <Image key={mi} source={{ uri: m.url }} style={styles.proofThumb} />
=======
                            <View key={mi} style={styles.proofThumbWrap}>
                                <Image source={{ uri: m.url }} style={styles.proofThumb} />
                                <TouchableOpacity 
                                    style={styles.removeProofBtn}
                                    onPress={() => handleRemoveProof('feeding', index, mi)}
                                >
                                    <Trash2 size={12} color="#fff" />
                                </TouchableOpacity>
                            </View>
>>>>>>> main
                        ))}
                    </ScrollView>
                )}
            </View>
        </View>
    );

    const renderExerciseCard = (item: ExerciseItem, index: number) => (
        <View key={index} style={styles.careCard}>
            <View style={styles.cardHeader}>
                <View style={[styles.iconWrap, { backgroundColor: '#FFF7CD' }]}>
                    <Flame size={20} color="#B78103" />
                </View>
                <View style={styles.cardInfo}>
                    <Text style={styles.itemTitle}>{item.time} — {item.activity}</Text>
                    <Text style={styles.itemMeta}>{item.durationMinutes} phút</Text>
                </View>
                <TouchableOpacity 
                   onPress={() => handleUpdateStatus('exercise', index, item.status === 'done' ? 'pending' : 'done')}
                   style={[styles.statusToggle, item.status === 'done' && styles.statusToggleActive]}
                >
                    {item.status === 'done' ? <CheckCircle2 size={24} color="#fff" /> : <Clock size={24} color="#919EAB" />}
                </TouchableOpacity>
            </View>

            <View style={styles.proofRow}>
<<<<<<< HEAD
                <TouchableOpacity style={styles.addProofBtn}>
                    <Camera size={20} color="#637381" />
                    <Text style={styles.addProofText}>Tải minh chứng</Text>
                </TouchableOpacity>
=======
                <TouchableOpacity 
                    style={[styles.addProofBtn, uploadingIndex?.type === 'exercise' && uploadingIndex.index === index && { opacity: 0.5 }]}
                    onPress={() => handlePickImage('exercise', index)}
                    disabled={!!uploadingIndex}
                >
                    {uploadingIndex?.type === 'exercise' && uploadingIndex.index === index ? (
                        <ActivityIndicator size="small" color={colors.primary} style={{ marginRight: 8 }} />
                    ) : (
                        <Camera size={20} color="#637381" />
                    )}
                    <Text style={styles.addProofText}>
                        {uploadingIndex?.type === 'exercise' && uploadingIndex.index === index ? 'Đang tải...' : 'Tải minh chứng'}
                    </Text>
                </TouchableOpacity>
                {item.proofMedia && item.proofMedia.length > 0 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.proofList}>
                        {item.proofMedia.map((m, mi) => (
                            <View key={mi} style={styles.proofThumbWrap}>
                                <Image source={{ uri: m.url }} style={styles.proofThumb} />
                                <TouchableOpacity 
                                    style={styles.removeProofBtn}
                                    onPress={() => handleRemoveProof('exercise', index, mi)}
                                >
                                    <Trash2 size={12} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
                )}
>>>>>>> main
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.safe}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIcon}>
                    <ArrowLeft size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Chi tiết chăm sóc</Text>
                <View style={{ width: 44 }} />
            </View>

            <View style={styles.petSummary}>
                <Image source={{ uri: booking.petIds?.[0]?.avatar || 'https://via.placeholder.com/100' }} style={styles.petAvatar} />
                <View style={styles.petDetails}>
<<<<<<< HEAD
                    <Text style={styles.petName}>{booking.petIds?.[0]?.name}</Text>
                    <View style={styles.badgeRow}>
                       <View style={styles.cageBadge}><Text style={styles.badgeText}>{booking.cageId?.cageCode || 'N/A'}</Text></View>
                       <View style={[styles.cageBadge, { backgroundColor: '#E7F5EF' }]}><Text style={[styles.badgeText, { color: '#007B55' }]}>ĐANG Ở</Text></View>
                    </View>
=======
                    <View style={styles.petHeaderTop}>
                        <Text style={styles.petName}>{booking.petIds?.[0]?.name}</Text>
                        <View style={styles.badgeRow}>
                            <View style={styles.cageBadge}><Text style={styles.badgeText}>{booking.cageId?.cageCode || 'N/A'}</Text></View>
                            <View style={[styles.cageBadge, { backgroundColor: '#E7F5EF' }]}><Text style={[styles.badgeText, { color: '#007B55' }]}>ĐANG Ở</Text></View>
                        </View>
                    </View>
                    
                    {/* <View style={styles.infoCols}>
                        <View style={styles.infoCol}>
                            <Text style={styles.infoLabel}>GIỐNG/CÂN NẶNG</Text>
                            <Text style={styles.infoValue}>
                                {booking.petIds?.[0]?.breed || 'N/A'} • {booking.petIds?.[0]?.weight || '?'} kg
                            </Text>
                        </View>
                        <View style={styles.infoDivider} />
                        <View style={styles.infoCol}>
                            <Text style={styles.infoLabel}>CHỦ SỞ HỮU</Text>
                            <Text style={styles.infoValue} numberOfLines={1}>
                                {booking.fullName || 'User'} • {booking.phone || ''}
                            </Text>
                        </View>
                    </View> */}
>>>>>>> main
                </View>
            </View>

            <View style={styles.tabs}>
                <TouchableOpacity onPress={() => setActiveTab('feeding')} style={[styles.tab, activeTab === 'feeding' && styles.activeTab]}>
<<<<<<< HEAD
                    <Text style={[styles.tabText, activeTab === 'feeding' && styles.activeTabText]}>Ăn uống ({feeding.length})</Text>
=======
                    <Text style={[styles.tabText, activeTab === 'feeding' && styles.activeTabText]}>Ăn ({feeding.length})</Text>
>>>>>>> main
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setActiveTab('exercise')} style={[styles.tab, activeTab === 'exercise' && styles.activeTab]}>
                    <Text style={[styles.tabText, activeTab === 'exercise' && styles.activeTabText]}>Vận động ({exercise.length})</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setActiveTab('diary')} style={[styles.tab, activeTab === 'diary' && styles.activeTab]}>
                    <Text style={[styles.tabText, activeTab === 'diary' && styles.activeTabText]}>Nhật ký</Text>
                </TouchableOpacity>
<<<<<<< HEAD
=======
                <TouchableOpacity onPress={() => setActiveTab('info')} style={[styles.tab, activeTab === 'info' && styles.activeTab]}>
                    <Text style={[styles.tabText, activeTab === 'info' && styles.activeTabText]}>Thông tin</Text>
                </TouchableOpacity>
>>>>>>> main
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>
                {activeTab === 'feeding' && (
                    <View style={styles.list}>
                        <View style={styles.suggestionBox}>
                            <Info size={18} color="#007B55" />
                            <Text style={styles.suggestionText}>Khẩu phần bữa sáng: 80g hạt Puppy</Text>
                        </View>
                        {feeding.map((item, idx) => renderFeedingCard(item, idx))}
                    </View>
                )}
                {activeTab === 'exercise' && (
                    <View style={styles.list}>
                       {exercise.length > 0 ? exercise.map((item, idx) => renderExerciseCard(item, idx)) : <Text style={styles.emptyText}>Chưa có lịch vận động</Text>}
                    </View>
                )}
                {activeTab === 'diary' && (
                    <View style={styles.list}>
                        <Text style={styles.diaryTitle}>Nhật ký hằng ngày</Text>
                        <TextInput 
                          multiline 
                          placeholder="Nhập tình trạng sức khỏe, tâm trạng bé hôm nay..." 
                          style={styles.diaryInput}
                          textAlignVertical="top"
<<<<<<< HEAD
                        />
                         <TouchableOpacity style={styles.cameraBtnFull}>
                            <Camera size={24} color="#637381" />
                            <Text style={styles.cameraText}>Chụp ảnh cập nhật cho chủ bé</Text>
                        </TouchableOpacity>
                    </View>
                )}
=======
                          value={diaryText}
                          onChangeText={setDiaryText}
                        />
                         <TouchableOpacity style={styles.cameraBtnFull} onPress={() => handlePickImage('diary', 0)}>
                            <Camera size={24} color="#637381" />
                            <Text style={styles.cameraText}>Đính kèm ảnh hôm nay</Text>
                        </TouchableOpacity>
                    </View>
                )}
                {activeTab === 'info' && (
                    <View style={styles.list}>
                        <View style={styles.infoSection}>
                            <Text style={styles.sectionTitle}>Thông tin thú cưng</Text>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Tên:</Text>
                                <Text style={styles.detailValue}>{booking.petIds?.[0]?.name}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Giống:</Text>
                                <Text style={styles.detailValue}>{booking.petIds?.[0]?.breed || 'N/A'}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Cây cân nặng:</Text>
                                <Text style={styles.detailValue}>{booking.petIds?.[0]?.weight || '?'} kg</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Giới tính:</Text>
                                <Text style={styles.detailValue}>{booking.petIds?.[0]?.gender === 'male' ? 'Đực' : 'Cái'}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Ngày sinh:</Text>
                                <Text style={styles.detailValue}>{booking.petIds?.[0]?.birthday ? dayjs(booking.petIds[0].birthday).format('DD/MM/YYYY') : 'N/A'}</Text>
                            </View>
                        </View>

                        <View style={[styles.infoSection, { marginTop: 20 }]}>
                            <Text style={styles.sectionTitle}>Thông tin chủ nhân</Text>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Họ tên:</Text>
                                <Text style={styles.detailValue}>{booking.fullName}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>SĐT:</Text>
                                <Text style={styles.detailValue}>{booking.phone}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Email:</Text>
                                <Text style={styles.detailValue}>{booking.email || 'N/A'}</Text>
                            </View>
                        </View>

                        <View style={[styles.infoSection, { marginTop: 20 }]}>
                            <Text style={styles.sectionTitle}>Chi tiết đặt chỗ</Text>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Mã đơn:</Text>
                                <Text style={styles.detailValue}>#{booking.code}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Thời gian:</Text>
                                <Text style={styles.detailValue}>
                                    {dayjs(booking.checkInDate).format('DD/MM')} - {dayjs(booking.checkOutDate).format('DD/MM')}
                                </Text>
                            </View>
                             <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Trạng thái:</Text>
                                <Text style={[styles.detailValue, { color: colors.primary, fontWeight: '800' }]}>{booking.boardingStatus}</Text>
                            </View>
                        </View>
                    </View>
                )}
>>>>>>> main
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity 
                   style={[styles.saveBtn, loading && styles.saveBtnLoading]} 
                   onPress={handleSave}
                   disabled={loading}
                >
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Lưu thay đổi</Text>}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#fff' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F4F6F8' },
    headerIcon: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
    petSummary: { flexDirection: 'row', padding: 20, alignItems: 'center', backgroundColor: '#F9FAFB' },
    petAvatar: { width: 80, height: 80, borderRadius: 24, backgroundColor: '#E5E7EB', borderWidth: 4, borderColor: '#fff' },
    petDetails: { marginLeft: 20, flex: 1 },
    petName: { fontSize: 24, fontWeight: '900', color: '#111827' },
<<<<<<< HEAD
    badgeRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
=======
    petHeaderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' },
    infoCols: { flexDirection: 'row', marginTop: 12, alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#F4F6F8' },
    infoCol: { flex: 1 },
    infoDivider: { width: 1, height: 20, backgroundColor: '#F4F6F8', marginHorizontal: 12 },
    infoLabel: { fontSize: 10, fontWeight: '800', color: '#919EAB', marginBottom: 2 },
    infoValue: { fontSize: 12, fontWeight: '700', color: '#212B36' },
    badgeRow: { flexDirection: 'row', gap: 8 },
>>>>>>> main
    cageBadge: { paddingHorizontal: 10, paddingVertical: 4, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#F4F6F8' },
    badgeText: { fontSize: 11, fontWeight: '800', color: '#637381' },
    tabs: { flexDirection: 'row', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#F4F6F8' },
    tab: { paddingVertical: 16, paddingHorizontal: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
    activeTab: { borderBottomColor: colors.primary },
    tabText: { fontSize: 14, fontWeight: '700', color: '#637381' },
    activeTabText: { color: colors.primary },
    scroll: { paddingBottom: 100 },
    list: { padding: 20 },
    suggestionBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E7F5EF', padding: 12, borderRadius: 12, marginBottom: 20 },
    suggestionText: { marginLeft: 10, fontSize: 13, color: '#007B55', fontWeight: '700' },
    careCard: { padding: 16, borderRadius: 20, backgroundColor: '#F9FAFB', marginBottom: 16, borderLeftWidth: 4, borderLeftColor: colors.primary },
    cardHeader: { flexDirection: 'row', alignItems: 'center' },
    iconWrap: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    cardInfo: { flex: 1, marginLeft: 16 },
    itemTitle: { fontSize: 16, fontWeight: '800', color: '#212B36' },
    itemMeta: { fontSize: 13, color: '#637381', marginTop: 2, fontWeight: '600' },
    statusToggle: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', elevation: 2 },
    statusToggleActive: { backgroundColor: colors.primary },
    noteBox: { marginTop: 12, padding: 12, backgroundColor: '#fff', borderRadius: 12 },
    noteText: { fontSize: 13, color: '#637381', fontStyle: 'italic' },
    proofRow: { marginTop: 12 },
    addProofBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
    addProofText: { marginLeft: 8, fontSize: 14, fontWeight: '700', color: '#637381' },
    proofList: { marginTop: 8 },
<<<<<<< HEAD
    proofThumb: { width: 60, height: 60, borderRadius: 8, marginRight: 8 },
=======
    proofThumbWrap: { position: 'relative', marginRight: 8 },
    proofThumb: { width: 60, height: 60, borderRadius: 8 },
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
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
>>>>>>> main
    diaryTitle: { fontSize: 18, fontWeight: '800', color: '#212B36', marginBottom: 16 },
    diaryInput: { minHeight: 150, padding: 16, backgroundColor: '#F4F6F8', borderRadius: 20, fontSize: 15, color: '#212B36' },
    cameraBtnFull: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 20, borderRadius: 20, borderStyle: 'dashed', borderWidth: 2, borderColor: '#919EAB', marginTop: 16 },
    cameraText: { marginLeft: 12, fontSize: 15, fontWeight: '700', color: '#637381' },
    emptyText: { textAlign: 'center', marginTop: 40, color: '#919EAB', fontWeight: '600' },
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F4F6F8' },
    saveBtn: { backgroundColor: '#111827', paddingVertical: 18, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
    saveBtnLoading: { opacity: 0.7 },
<<<<<<< HEAD
=======
    
    // Additional info styles
    infoSection: { backgroundColor: '#F9FAFB', padding: 16, borderRadius: 20 },
    sectionTitle: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 12 },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, borderBottomWidth: 1, borderBottomColor: '#F4F6F8', paddingBottom: 8 },
    detailLabel: { fontSize: 14, color: '#637381', fontWeight: '600' },
    detailValue: { fontSize: 14, color: '#111827', fontWeight: '700' },
>>>>>>> main
});

export default StaffCareDetailScreen;
