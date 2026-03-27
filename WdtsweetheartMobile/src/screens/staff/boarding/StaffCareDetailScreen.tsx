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

type CareDetailRouteProp = RouteProp<StaffStackParamList, 'StaffCareDetail'>;

const StaffCareDetailScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<CareDetailRouteProp>();
    const { bookingId, booking } = route.params;

    const [activeTab, setActiveTab] = useState<'feeding' | 'exercise' | 'diary'>('feeding');
    const [feeding, setFeeding] = useState<FeedingItem[]>(booking.feedingSchedule || []);
    const [exercise, setExercise] = useState<ExerciseItem[]>(booking.exerciseSchedule || []);
    const [loading, setLoading] = useState(false);

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
            Alert.alert('Thành công', 'Đã cập nhật lịch trình chăm sóc!');
            navigation.goBack();
        } catch (error) {
            console.error('Update failed', error);
            Alert.alert('Lỗi', 'Không thể lưu thay đổi. Vui lòng thử lại sau.');
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
                <TouchableOpacity style={styles.addProofBtn}>
                    <Camera size={20} color="#637381" />
                    <Text style={styles.addProofText}>Tải minh chứng</Text>
                </TouchableOpacity>
                {item.proofMedia && item.proofMedia.length > 0 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.proofList}>
                        {item.proofMedia.map((m, mi) => (
                            <Image key={mi} source={{ uri: m.url }} style={styles.proofThumb} />
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
                <TouchableOpacity style={styles.addProofBtn}>
                    <Camera size={20} color="#637381" />
                    <Text style={styles.addProofText}>Tải minh chứng</Text>
                </TouchableOpacity>
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
                    <Text style={styles.petName}>{booking.petIds?.[0]?.name}</Text>
                    <View style={styles.badgeRow}>
                       <View style={styles.cageBadge}><Text style={styles.badgeText}>{booking.cageId?.cageCode || 'N/A'}</Text></View>
                       <View style={[styles.cageBadge, { backgroundColor: '#E7F5EF' }]}><Text style={[styles.badgeText, { color: '#007B55' }]}>ĐANG Ở</Text></View>
                    </View>
                </View>
            </View>

            <View style={styles.tabs}>
                <TouchableOpacity onPress={() => setActiveTab('feeding')} style={[styles.tab, activeTab === 'feeding' && styles.activeTab]}>
                    <Text style={[styles.tabText, activeTab === 'feeding' && styles.activeTabText]}>Ăn uống ({feeding.length})</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setActiveTab('exercise')} style={[styles.tab, activeTab === 'exercise' && styles.activeTab]}>
                    <Text style={[styles.tabText, activeTab === 'exercise' && styles.activeTabText]}>Vận động ({exercise.length})</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setActiveTab('diary')} style={[styles.tab, activeTab === 'diary' && styles.activeTab]}>
                    <Text style={[styles.tabText, activeTab === 'diary' && styles.activeTabText]}>Nhật ký</Text>
                </TouchableOpacity>
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
                        />
                         <TouchableOpacity style={styles.cameraBtnFull}>
                            <Camera size={24} color="#637381" />
                            <Text style={styles.cameraText}>Chụp ảnh cập nhật cho chủ bé</Text>
                        </TouchableOpacity>
                    </View>
                )}
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
    badgeRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
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
    proofThumb: { width: 60, height: 60, borderRadius: 8, marginRight: 8 },
    diaryTitle: { fontSize: 18, fontWeight: '800', color: '#212B36', marginBottom: 16 },
    diaryInput: { minHeight: 150, padding: 16, backgroundColor: '#F4F6F8', borderRadius: 20, fontSize: 15, color: '#212B36' },
    cameraBtnFull: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 20, borderRadius: 20, borderStyle: 'dashed', borderWidth: 2, borderColor: '#919EAB', marginTop: 16 },
    cameraText: { marginLeft: 12, fontSize: 15, fontWeight: '700', color: '#637381' },
    emptyText: { textAlign: 'center', marginTop: 40, color: '#919EAB', fontWeight: '600' },
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F4F6F8' },
    saveBtn: { backgroundColor: '#111827', paddingVertical: 18, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
    saveBtnLoading: { opacity: 0.7 },
});

export default StaffCareDetailScreen;
