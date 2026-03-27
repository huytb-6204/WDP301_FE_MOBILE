import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView, TextInput, ActivityIndicator, Alert } from 'react-native';
import { ArrowLeft, Save } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../../theme/colors';
import { getAdminUsers, getAdminPets, getAdminCages, createAdminBoardingBooking } from '../../../services/api/adminBookingHelper';
import dayjs from 'dayjs';

const StaffBoardingBookingCreateScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [userId, setUserId] = useState('');
  const [petId, setPetId] = useState('');
  const [cageId, setCageId] = useState('');
  const [checkInDate, setCheckInDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [checkOutDate, setCheckOutDate] = useState(dayjs().add(1, 'day').format('YYYY-MM-DD'));
  const [notes, setNotes] = useState('');

  // Data states
  const [users, setUsers] = useState<any[]>([]);
  const [pets, setPets] = useState<any[]>([]);
  const [cages, setCages] = useState<any[]>([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchPetsForUser(userId);
    } else {
      setPets([]);
      setPetId('');
    }
  }, [userId]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [u, c] = await Promise.all([getAdminUsers(), getAdminCages()]);
      setUsers(u);
      setCages(c);
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu khởi tạo');
    } finally {
      setLoading(false);
    }
  };

  const fetchPetsForUser = async (uid: string) => {
    try {
      const p = await getAdminPets(uid);
      setPets(p);
      if (p.length === 1) setPetId(p[0]._id);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async () => {
    if (!userId || !petId || !cageId || !checkInDate || !checkOutDate) {
      Alert.alert('Lỗi', 'Vui lòng điền đủ thông tin bắt buộc');
      return;
    }

    const selectedUser = users.find(u => u._id === userId);
    if (!selectedUser) return;

    setSubmitting(true);
    try {
      const payload = {
        userId,
        fullName: selectedUser.fullName,
        phone: selectedUser.phone,
        email: selectedUser.email,
        checkInDate: dayjs(checkInDate).startOf('day').toISOString(),
        checkOutDate: dayjs(checkOutDate).startOf('day').toISOString(),
        petId,
        cageId,
        notes,
        boardingStatus: 'confirmed',
        paymentMethod: 'pay_at_site',
        paymentStatus: 'unpaid'
      };

      await createAdminBoardingBooking(payload);
      Alert.alert('Thành công', 'Đã tạo đơn khách sạn thành công', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể tạo đơn');
    } finally {
      setSubmitting(false);
    }
  };

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
        <Text style={styles.headerTitle}>Tạo đặt chỗ</Text>
        <TouchableOpacity style={styles.addBtn} onPress={handleSubmit} disabled={submitting}>
          {submitting ? <ActivityIndicator size="small" color={colors.primary} /> : <Save size={24} color={colors.primary} />}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Thông tin khách hàng</Text>
          
          <Text style={styles.label}>Chọn khách hàng *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            {users.map((u: any) => (
              <TouchableOpacity
                key={u._id}
                style={[styles.chip, userId === u._id && styles.chipActive]}
                onPress={() => setUserId(u._id)}
              >
                <Text style={[styles.chipText, userId === u._id && styles.chipTextActive]}>
                  {u.fullName}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {userId && pets.length > 0 && (
            <>
              <Text style={[styles.label, { marginTop: 16 }]}>Chọn thú cưng *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                {pets.map((p: any) => (
                  <TouchableOpacity
                    key={p._id}
                    style={[styles.chip, petId === p._id && styles.chipActive]}
                    onPress={() => setPetId(p._id)}
                  >
                    <Text style={[styles.chipText, petId === p._id && styles.chipTextActive]}>
                      {p.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}

          {userId && pets.length === 0 && (
            <Text style={styles.errorText}>Khách hàng này chưa có thú cưng</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Thời gian lưu lại</Text>
          <Text style={styles.label}>Ngày nhận chuồng (YYYY-MM-DD) *</Text>
          <TextInput
            style={styles.input}
            value={checkInDate}
            onChangeText={setCheckInDate}
            placeholder="Ví dụ: 2024-12-01"
          />
          <Text style={styles.label}>Ngày trả chuồng (YYYY-MM-DD) *</Text>
          <TextInput
            style={styles.input}
            value={checkOutDate}
            onChangeText={setCheckOutDate}
            placeholder="Ví dụ: 2024-12-05"
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Chọn Chuồng & Dịch vụ</Text>
          
          <Text style={styles.label}>Chuồng *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            {cages.map((c: any) => (
              <TouchableOpacity
                key={c._id}
                style={[styles.chip, cageId === c._id && styles.chipActive]}
                onPress={() => setCageId(c._id)}
              >
                <Text style={[styles.chipText, cageId === c._id && styles.chipTextActive]}>
                  {c.cageCode} - {c.size}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={[styles.label, { marginTop: 16 }]}>Ghi chú (Tùy chọn)</Text>
          <TextInput
            style={[styles.input, { height: 80 }]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Yêu cầu đặc biệt, chế độ ăn..."
            multiline
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity 
          style={[styles.submitBtn, submitting && { opacity: 0.7 }]} 
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.submitBtnText}>{submitting ? 'Đang tạo...' : 'Xác nhận tạo đặt chỗ'}</Text>
        </TouchableOpacity>
        <View style={{height: 40}} />
      </ScrollView>
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
    borderBottomColor: '#F4F6F8'
  },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  addBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  content: { padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#212B36', marginBottom: 16 },
  label: { fontSize: 13, color: '#637381', marginBottom: 8, fontWeight: '600' },
  input: { backgroundColor: '#F4F6F8', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, color: '#212B36', marginBottom: 16, borderWidth: 1, borderColor: '#DFE3E8' },
  chipScroll: { flexDirection: 'row', marginBottom: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: '#F4F6F8', marginRight: 8, borderWidth: 1, borderColor: 'transparent' },
  chipActive: { backgroundColor: 'rgba(255, 107, 107, 0.1)', borderColor: colors.primary },
  chipText: { fontSize: 14, color: '#637381', fontWeight: '500' },
  chipTextActive: { color: colors.primary, fontWeight: '700' },
  errorText: { color: '#FF4842', fontSize: 13, marginTop: 8 },
  submitBtn: { backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' }
});

export default StaffBoardingBookingCreateScreen;
