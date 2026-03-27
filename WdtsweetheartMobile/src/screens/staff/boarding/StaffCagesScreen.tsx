<<<<<<< HEAD
import React from 'react';
import { SafeAreaView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, LayoutGrid } from 'lucide-react-native';

const StaffCagesScreen = () => {
    const navigation = useNavigation();
    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <ArrowLeft size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.title}>Chuồng nội trú</Text>
                <View style={{ width: 24 }} />
            </View>
            <View style={styles.content}>
                <LayoutGrid size={64} color="#919EAB" strokeWidth={1} />
                <Text style={styles.emptyText}>Trạng thái các chuồng đang được cập nhật</Text>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#fff' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F4F6F8' },
    title: { fontSize: 18, fontWeight: '800', color: '#111827' },
    content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
    emptyText: { marginTop: 16, fontSize: 15, color: '#637381', textAlign: 'center', fontWeight: '600' }
=======
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar,
  FlatList, ActivityIndicator, TextInput, Alert
} from 'react-native';
import { ArrowLeft, Search, LayoutGrid, CheckCircle, XCircle, Clock } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../../theme/colors';
import { getCages } from '../../../services/api/staffBoarding';

type Cage = {
  _id: string;
  cageCode: string;
  name?: string;
  size: 'small' | 'medium' | 'large';
  status: 'available' | 'occupied' | 'maintenance';
  petType?: 'dog' | 'cat' | 'all';
  currentBookingId?: any;
};

const StaffCagesScreen = () => {
  const navigation = useNavigation();
  const [cages, setCages] = useState<Cage[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'available' | 'occupied' | 'maintenance'>('all');

  useEffect(() => {
    fetchCages();
  }, []);

  const fetchCages = async () => {
    setLoading(true);
    try {
      const data = await getCages({ limit: 100 });
      setCages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch cages', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách chuồng');
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'available': return { bg: '#E7F5EF', color: '#007B55', label: 'Trống', icon: CheckCircle };
      case 'occupied': return { bg: '#D0F2FF', color: '#0C53B7', label: 'Đang dùng', icon: Clock };
      case 'maintenance': return { bg: '#FFE7E6', color: '#FF4842', label: 'Bảo trì', icon: XCircle };
      default: return { bg: '#F4F6F8', color: '#637381', label: status, icon: Clock };
    }
  };

  const getSizeLabel = (size: string) => {
    switch (size) {
      case 'small': return 'Nhỏ';
      case 'medium': return 'Vừa';
      case 'large': return 'Lớn';
      default: return size;
    }
  };

  const filteredCages = cages.filter(c => {
    const matchSearch = c.cageCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchFilter = filter === 'all' || c.status === filter;
    return matchSearch && matchFilter;
  });

  const stats = {
    available: cages.filter(c => c.status === 'available').length,
    occupied: cages.filter(c => c.status === 'occupied').length,
    maintenance: cages.filter(c => c.status === 'maintenance').length,
  };

  const renderCageItem = ({ item }: { item: Cage }) => {
    const statusInfo = getStatusInfo(item.status);
    const StatusIcon = statusInfo.icon;

    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.cageIconWrap}>
            <LayoutGrid size={22} color={colors.primary} />
          </View>
          <View style={styles.cageInfo}>
            <Text style={styles.cageCode}>{item.cageCode}</Text>
            <Text style={styles.cageMeta}>
              {getSizeLabel(item.size)} • {item.petType === 'dog' ? 'Chó' : item.petType === 'cat' ? 'Mèo' : 'Đa loài'}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
            <StatusIcon size={12} color={statusInfo.color} />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
          </View>
        </View>
        {item.currentBookingId && (
          <View style={styles.occupiedInfo}>
            <Text style={styles.occupiedLabel}>Đang ở: {item.currentBookingId.code || 'N/A'}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chuồng nội trú</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: '#E7F5EF' }]}>
          <Text style={[styles.statNum, { color: '#007B55' }]}>{stats.available}</Text>
          <Text style={[styles.statLabel, { color: '#007B55' }]}>Trống</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#D0F2FF' }]}>
          <Text style={[styles.statNum, { color: '#0C53B7' }]}>{stats.occupied}</Text>
          <Text style={[styles.statLabel, { color: '#0C53B7' }]}>Đang dùng</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#FFE7E6' }]}>
          <Text style={[styles.statNum, { color: '#FF4842' }]}>{stats.maintenance}</Text>
          <Text style={[styles.statLabel, { color: '#FF4842' }]}>Bảo trì</Text>
        </View>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Search size={18} color="#919EAB" />
          <TextInput
            placeholder="Tìm theo mã chuồng..."
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.filterRow}>
        {(['all', 'available', 'occupied', 'maintenance'] as const).map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === 'all' ? 'Tất cả' : f === 'available' ? 'Trống' : f === 'occupied' ? 'Đang dùng' : 'Bảo trì'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredCages}
          keyExtractor={(item) => item._id}
          renderItem={renderCageItem}
          contentContainerStyle={styles.list}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <LayoutGrid size={64} color="#DFE3E8" strokeWidth={1} />
              <Text style={styles.emptyText}>Không tìm thấy chuồng nào</Text>
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
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  statsRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F4F6F8'
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12
  },
  statNum: { fontSize: 24, fontWeight: '900' },
  statLabel: { fontSize: 12, fontWeight: '700', marginTop: 2 },
  searchRow: { padding: 16, paddingBottom: 8 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F4F6F8'
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: '#111827' },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8
  },
  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F4F6F8'
  },
  filterBtnActive: { backgroundColor: colors.primary },
  filterText: { fontSize: 12, fontWeight: '700', color: '#637381' },
  filterTextActive: { color: '#fff' },
  list: { padding: 8, paddingBottom: 40 },
  columnWrapper: { gap: 8, marginHorizontal: 8, marginBottom: 8 },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    elevation: 2,
    shadowColor: '#919EAB',
    shadowOpacity: 0.1,
    shadowRadius: 8
  },
  cardTop: { flexDirection: 'column', alignItems: 'flex-start' },
  cageIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,107,107,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10
  },
  cageInfo: { marginBottom: 10 },
  cageCode: { fontSize: 16, fontWeight: '800', color: '#212B36' },
  cageMeta: { fontSize: 12, color: '#637381', marginTop: 2 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4
  },
  statusText: { fontSize: 11, fontWeight: '800' },
  occupiedInfo: {
    borderTopWidth: 1,
    borderTopColor: '#F4F6F8',
    paddingTop: 8,
    marginTop: 8
  },
  occupiedLabel: { fontSize: 12, color: '#637381', fontWeight: '500' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  loadingText: { marginTop: 12, color: '#637381', fontWeight: '600' },
  emptyWrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  emptyText: { marginTop: 16, fontSize: 15, color: '#919EAB', fontWeight: '600' }
>>>>>>> main
});

export default StaffCagesScreen;
