import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, FlatList, ActivityIndicator, TextInput, Alert } from 'react-native';
import { ArrowLeft, Search, Plus, Building2, UserCircle } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../../theme/colors';
import { getDepartments, Department } from '../../../services/api/department';

const DepartmentListScreen = () => {
  const navigation = useNavigation();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const data = await getDepartments({ limit: 100 });
      setDepartments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch departments', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách phòng ban');
    } finally {
      setLoading(false);
    }
  };

  const filteredDepartments = departments.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (d.managerId?.fullName && d.managerId.fullName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderDepartmentItem = ({ item }: { item: Department }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconWrap}>
          <Building2 size={20} color={colors.primary} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.itemTitle}>{item.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: item.status === 'active' ? '#E7F5EF' : '#FFE7E6' }]}>
            <Text style={[styles.statusText, { color: item.status === 'active' ? '#007B55' : '#FF4842' }]}>
              {item.status === 'active' ? 'Hoạt động' : 'Ngừng'}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <UserCircle size={16} color="#637381" />
          <Text style={styles.infoText}>Trưởng phòng: <Text style={{fontWeight: '600'}}>{item.managerId?.fullName || 'Chưa có'}</Text></Text>
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
        <Text style={styles.headerTitle}>Phòng ban</Text>
        <TouchableOpacity style={styles.addBtn}>
          <Plus size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color="#919EAB" />
        <TextInput 
          placeholder="Tìm kiếm phòng ban..." 
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
          data={filteredDepartments}
          keyExtractor={(item) => item._id}
          renderItem={renderDepartmentItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>Chưa có phòng ban nào</Text>
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
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconWrap: { width: 48, height: 48, borderRadius: 12, backgroundColor: 'rgba(255, 107, 107, 0.1)', alignItems: 'center', justifyContent: 'center' },
  cardInfo: { flex: 1, marginLeft: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  itemTitle: { fontSize: 16, fontWeight: '700', color: '#212B36' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: '700' },
  cardBody: { paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F4F6F8' },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  infoText: { fontSize: 14, color: '#637381', marginLeft: 8, fontWeight: '400' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyWrap: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#919EAB', fontSize: 15, fontWeight: '600' }
});

export default DepartmentListScreen;
