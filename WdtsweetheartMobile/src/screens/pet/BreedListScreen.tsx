import React, { useEffect, useState, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Search, Dog, Cat } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { getBreeds, type Breed } from '../../services/api/breed';
import { Toast } from '../../components/common';

const BreedListScreen = () => {
  const navigation = useNavigation<any>();
  const [breeds, setBreeds] = useState<Breed[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeType, setActiveType] = useState<'all' | 'dog' | 'cat'>('all');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  };

  const fetchBreeds = async () => {
    try {
      const resp = await getBreeds();
      if (resp.success) {
        setBreeds(resp.data || []);
      }
    } catch (error) {
      showToast('Không thể tải danh sách giống');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBreeds();
  }, []);

  const filteredBreeds = useMemo(() => {
    return breeds.filter((b) => {
      const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = activeType === 'all' || b.type === activeType;
      return matchesSearch && matchesType;
    });
  }, [breeds, searchQuery, activeType]);

  const renderItem = ({ item }: { item: Breed }) => (
    <View style={styles.card}>
      <View style={styles.cardInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.breedName}>{item.name}</Text>
          <View style={[styles.typeBadge, { backgroundColor: item.type === 'dog' ? '#EBF5FF' : '#FFF1F2' }]}>
            <Text style={[styles.typeText, { color: item.type === 'dog' ? '#1E40AF' : '#E11D48' }]}>
              {item.type === 'dog' ? 'Chó' : 'Mèo'}
            </Text>
          </View>
        </View>
        <Text style={styles.breedDesc} numberOfLines={2}>
           {item.description || 'Thông tin về giống loài này đang được cập nhật.'}
        </Text>
      </View>
      <TouchableOpacity 
        style={styles.detailBtn}
        onPress={() => showToast(`Tìm hiểu về ${item.name} sẽ sớm quay lại!`)}
      >
        <ArrowLeft size={16} color={colors.primary} style={{ transform: [{ rotate: '180deg' }] }} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color={colors.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Giống thú cưng</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Search size={18} color="#9CA3AF" />
          <TextInput
            placeholder="Tìm kiếm tên giống..."
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.filterRow}>
        <TouchableOpacity 
          style={[styles.filterBtn, activeType === 'all' && styles.filterBtnActive]}
          onPress={() => setActiveType('all')}
        >
          <Text style={[styles.filterText, activeType === 'all' && styles.filterTextActive]}>Tất cả</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterBtn, activeType === 'dog' && styles.filterBtnActive]}
          onPress={() => setActiveType('dog')}
        >
          <Dog size={16} color={activeType === 'dog' ? '#fff' : '#4B5563'} />
          <Text style={[styles.filterText, activeType === 'dog' && styles.filterTextActive]}>Chó</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterBtn, activeType === 'cat' && styles.filterBtnActive]}
          onPress={() => setActiveType('cat')}
        >
          <Cat size={16} color={activeType === 'cat' ? '#fff' : '#4B5563'} />
          <Text style={[styles.filterText, activeType === 'cat' && styles.filterTextActive]}>Mèo</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={filteredBreeds}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchBreeds(); }} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={styles.emptyIconWrap}>
                 <Search size={40} color={colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>Không tìm thấy giống</Text>
              <Text style={styles.emptyText}>Thử tìm kiếm với tên khác xem sao.</Text>
            </View>
          }
        />
      )}
      <Toast visible={toastVisible} message={toastMessage} />
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
  searchContainer: { padding: 16, backgroundColor: '#fff' },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: { flex: 1, height: 44, marginLeft: 8, fontSize: 14, color: colors.secondary },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#fff', gap: 10 },
  filterBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 6,
    paddingVertical: 8, 
    paddingHorizontal: 16, 
    borderRadius: 999, 
    backgroundColor: '#F3F4F6' 
  },
  filterBtnActive: { backgroundColor: colors.primary },
  filterText: { fontSize: 13, fontWeight: '600', color: '#4B5563' },
  filterTextActive: { color: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  cardInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  breedName: { fontSize: 16, fontWeight: '800', color: colors.secondary },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  typeText: { fontSize: 10, fontWeight: '800' },
  breedDesc: { fontSize: 13, color: '#6B7280', lineHeight: 18 },
  detailBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFF5F6', alignItems: 'center', justifyContent: 'center', marginLeft: 12 },
  empty: { alignItems: 'center', justifyContent: 'center', marginTop: 80, paddingHorizontal: 40 },
  emptyIconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFF5F6', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: colors.secondary, marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#7d7b7b', textAlign: 'center', lineHeight: 20 },
});

export default BreedListScreen;
