import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, FlatList, ActivityIndicator, TextInput, Alert } from 'react-native';
import { ArrowLeft, Search, Clock, Plus, Building2, MapPin } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../../theme/colors';
import { getShifts, Shift } from '../../../services/api/shift';

const StaffShiftListScreen = () => {
  const navigation = useNavigation();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchShifts();
  }, []);

  const fetchShifts = async () => {
    setLoading(true);
    try {
      const data = await getShifts({ limit: 100 });
      setShifts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch shifts', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách ca làm việc');
    } finally {
      setLoading(false);
    }
  };

  const filteredShifts = shifts.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.departmentId?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderShiftItem = ({ item }: { item: Shift }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardInfo}>
          <Text style={styles.itemTitle}>{item.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: item.status === 'active' ? '#E7F5EF' : '#FFE7E6' }]}>
            <Text style={[styles.statusText, { color: item.status === 'active' ? '#007B55' : '#FF4842' }]}>
              {item.status === 'active' ? 'Hoạt động' : 'Ngừng'}
            </Text>
          </View>
        </View>
        {item.color && <View style={[styles.colorDot, { backgroundColor: item.color }]} />}
      </View>
      
      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Clock size={16} color="#637381" />
          <Text style={styles.infoText}>{item.startTime} - {item.endTime}</Text>
        </View>
        <View style={styles.infoRow}>
          <Building2 size={16} color="#637381" />
          <Text style={styles.infoText}>{item.departmentId?.name || 'Tất cả phòng ban'}</Text>
        </View>
        <View style={styles.infoRow}>
          <MapPin size={16} color="#637381" />
          <Text style={styles.infoText}>{item.location === 'online' ? 'Làm việc từ xa (Online)' : 'Tại cửa hàng (Offline)'}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quản lý ca trực</Text>
        <TouchableOpacity style={styles.addBtn}>
          <Plus size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color="#919EAB" />
        <TextInput 
          placeholder="Tìm kiếm ca trực..." 
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredShifts}
          keyExtractor={(item) => item._id}
          renderItem={renderShiftItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>Chưa có ca làm việc nào</Text>
            </View>
          }
        />
      )}
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
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', margin: 16, paddingHorizontal: 16, height: 48, borderRadius: 12, borderWidth: 1, borderColor: '#F4F6F8' },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: '#111827' },
  list: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 },
  cardInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  itemTitle: { fontSize: 16, fontWeight: '700', color: '#212B36' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: '700' },
  colorDot: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: '#fff' },
  cardBody: { gap: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F4F6F8' },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  infoText: { fontSize: 14, color: '#637381', marginLeft: 8, fontWeight: '500' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyWrap: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#919EAB', fontSize: 15, fontWeight: '600' }
});

export default StaffShiftListScreen;
