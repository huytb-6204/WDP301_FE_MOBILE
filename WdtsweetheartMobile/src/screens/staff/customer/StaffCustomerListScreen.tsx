<<<<<<< HEAD
import React from 'react';
import { SafeAreaView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Users } from 'lucide-react-native';

const StaffCustomerListScreen = () => {
    const navigation = useNavigation();
    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <ArrowLeft size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.title}>Hồ sơ khách hàng</Text>
                <View style={{ width: 24 }} />
            </View>
            <View style={styles.content}>
                <Users size={64} color="#919EAB" strokeWidth={1} />
                <Text style={styles.emptyText}>Danh sách khách hàng đang được cập nhật</Text>
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
import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  StyleSheet, Text, View, TouchableOpacity, FlatList, 
  ActivityIndicator, TextInput, Image, StatusBar, Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Search, UserCircle, Phone, Mail } from 'lucide-react-native';
import { colors } from '../../../theme/colors';
import { getCustomers, Customer } from '../../../services/api/customer';

const STATUS_TABS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'active', label: 'Đang hoạt động' },
  { key: 'inactive', label: 'Bị khóa' },
] as const;

const StaffCustomerListScreen = () => {
  const navigation = useNavigation();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [totalRecords, setTotalRecords] = useState(0);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCustomers({ 
        limit: 100, 
        page: 1,
        ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
        ...(searchQuery.trim() ? { q: searchQuery.trim() } : {})
      });
      // res is { recordList, statusCounts, pagination }
      const list = res?.recordList ?? [];
      setCustomers(list);
      setTotalRecords(res?.pagination?.totalRecords ?? 0);
    } catch (error: any) {
      console.error('[StaffCustomerListScreen] fetch error:', error?.message || error);
      Alert.alert('Lỗi', error?.message || 'Không thể tải danh sách khách hàng');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    fetchCustomers();
  }, [statusFilter]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const renderCustomerItem = ({ item }: { item: Customer }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatarWrap}>
          {item.avatar ? (
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarInitial}>
                {item.fullName?.charAt(0)?.toUpperCase() || '?'}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName} numberOfLines={1}>{item.fullName}</Text>
          <View style={[
            styles.statusBadge, 
            { backgroundColor: item.status === 'active' ? '#E7F5EF' : '#FFE7E6' }
          ]}>
            <Text style={[
              styles.statusText, 
              { color: item.status === 'active' ? '#007B55' : '#FF4842' }
            ]}>
              {item.status === 'active' ? 'Đang hoạt động' : 'Bị khóa'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Phone size={14} color="#919EAB" />
          <Text style={styles.infoText}>{item.phone || 'Chưa cập nhật'}</Text>
        </View>
        <View style={[styles.infoRow, { marginTop: 6 }]}>
          <Mail size={14} color="#919EAB" />
          <Text style={styles.infoText} numberOfLines={1}>{item.email || 'Chưa cập nhật'}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>Hồ sơ khách hàng</Text>
          {totalRecords > 0 && (
            <Text style={styles.subtitle}>{totalRecords} khách hàng</Text>
          )}
        </View>
        <View style={{ width: 44 }} />
      </View>

      {/* Search bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Search size={18} color="#919EAB" />
          <TextInput
            placeholder="Tìm theo tên, SĐT, email..."
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Status tabs */}
      <View style={styles.tabsRow}>
        {STATUS_TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, statusFilter === tab.key && styles.tabActive]}
            onPress={() => setStatusFilter(tab.key as any)}
          >
            <Text style={[styles.tabText, statusFilter === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Đang tải khách hàng...</Text>
        </View>
      ) : (
        <FlatList
          data={customers}
          keyExtractor={(item) => item._id}
          renderItem={renderCustomerItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <UserCircle size={64} color="#DFE3E8" strokeWidth={1} />
              <Text style={styles.emptyTitle}>Không có khách hàng nào</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery ? 'Thử từ khóa khác' : 'Danh sách trống'}
              </Text>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F4F6F8'
  },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  title: { fontSize: 17, fontWeight: '800', color: '#111827' },
  subtitle: { fontSize: 12, color: '#919EAB', fontWeight: '500', marginTop: 1 },
  searchSection: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F4F6F8' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F6F8',
    paddingHorizontal: 14,
    height: 44,
    borderRadius: 10,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 14, color: '#212B36' },
  clearBtn: { color: '#919EAB', fontSize: 14, paddingHorizontal: 4 },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F4F6F8',
    paddingHorizontal: 8
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent'
  },
  tabActive: { borderBottomColor: colors.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: '#637381' },
  tabTextActive: { color: colors.primary, fontWeight: '800' },
  list: { padding: 16, paddingBottom: 60 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#919EAB',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  avatarWrap: { marginRight: 14 },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  avatarFallback: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '22',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarInitial: { fontSize: 20, fontWeight: '800', color: colors.primary },
  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: '700', color: '#212B36', marginBottom: 6 },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  statusText: { fontSize: 11, fontWeight: '800' },
  cardBody: { paddingTop: 14, borderTopWidth: 1, borderTopColor: '#F4F6F8' },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  infoText: { marginLeft: 10, fontSize: 14, color: '#637381', fontWeight: '500', flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  loadingText: { marginTop: 12, color: '#637381', fontWeight: '600', fontSize: 14 },
  emptyWrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  emptyTitle: { marginTop: 16, fontSize: 17, color: '#212B36', fontWeight: '700' },
  emptySubtitle: { marginTop: 6, fontSize: 14, color: '#919EAB' }
>>>>>>> main
});

export default StaffCustomerListScreen;
