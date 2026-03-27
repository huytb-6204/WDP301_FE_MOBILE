import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, FlatList, ActivityIndicator, TextInput } from 'react-native';
import { ArrowLeft, Search, Bone, Flame, Plus } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../../theme/colors';
import { getFoodTemplates, getExerciseTemplates, FoodTemplate, ExerciseTemplate } from '../../../services/api/petCareTemplate';

const PetCareTemplateScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<'food' | 'exercise'>('food');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [foodTemplates, setFoodTemplates] = useState<FoodTemplate[]>([]);
  const [exerciseTemplates, setExerciseTemplates] = useState<ExerciseTemplate[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'food') {
        const data = await getFoodTemplates();
        setFoodTemplates(data || []);
      } else {
        const data = await getExerciseTemplates();
        setExerciseTemplates(data || []);
      }
    } catch (error) {
      console.error('Failed to fetch templates', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFood = foodTemplates.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.group.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredExercise = exerciseTemplates.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderFoodItem = ({ item }: { item: FoodTemplate }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconWrap, { backgroundColor: '#E7F5EF' }]}>
          <Bone size={20} color="#007B55" />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.itemTitle}>{item.name}</Text>
          <Text style={styles.itemSubtitle}>Nhóm: {item.group}</Text>
        </View>
        <View style={styles.petTypeBadge}>
          <Text style={styles.petTypeBadgeText}>{item.petType === 'dog' ? 'Chó' : item.petType === 'cat' ? 'Mèo' : 'Tất cả'}</Text>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.metaText}>Độ tuổi: {item.ageGroup}</Text>
        <View style={[styles.statusDot, { backgroundColor: item.isActive ? '#007B55' : '#FF4842' }]} />
      </View>
    </View>
  );

  const renderExerciseItem = ({ item }: { item: ExerciseTemplate }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconWrap, { backgroundColor: '#FFF7CD' }]}>
          <Flame size={20} color="#B78103" />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.itemTitle}>{item.name}</Text>
          <Text style={styles.itemSubtitle}>Thời gian: {item.durationMinutes} phút</Text>
        </View>
        <View style={styles.petTypeBadge}>
          <Text style={styles.petTypeBadgeText}>{item.petType === 'dog' ? 'Chó' : item.petType === 'cat' ? 'Mèo' : 'Tất cả'}</Text>
        </View>
      </View>
      <View style={styles.cardFooter}>
         <Text style={styles.metaText}>Cường độ: {item.intensity}</Text>
         <View style={[styles.statusDot, { backgroundColor: item.isActive ? '#007B55' : '#FF4842' }]} />
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
        <Text style={styles.headerTitle}>Mẫu chăm sóc</Text>
        <TouchableOpacity style={styles.addBtn}>
          <Plus size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'food' && styles.activeTab]} 
          onPress={() => setActiveTab('food')}
        >
          <Text style={[styles.tabText, activeTab === 'food' && styles.activeTabText]}>Thức ăn</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'exercise' && styles.activeTab]} 
          onPress={() => setActiveTab('exercise')}
        >
          <Text style={[styles.tabText, activeTab === 'exercise' && styles.activeTabText]}>Vận động</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color="#919EAB" />
        <TextInput 
          placeholder="Tìm kiếm mẫu chăm sóc..." 
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
          data={activeTab === 'food' ? filteredFood : filteredExercise}
          keyExtractor={(item) => item._id}
          renderItem={activeTab === 'food' ? renderFoodItem as any : renderExerciseItem as any}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>Chưa có mẫu nào</Text>
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
  tabs: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F4F6F8' },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: colors.primary },
  tabText: { fontSize: 14, fontWeight: '600', color: '#637381' },
  activeTabText: { color: colors.primary, fontWeight: '700' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', margin: 16, paddingHorizontal: 16, height: 48, borderRadius: 12, borderWidth: 1, borderColor: '#F4F6F8' },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: '#111827' },
  list: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  iconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cardInfo: { flex: 1, marginLeft: 16 },
  itemTitle: { fontSize: 16, fontWeight: '700', color: '#212B36' },
  itemSubtitle: { fontSize: 13, color: '#637381', marginTop: 4 },
  petTypeBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, backgroundColor: '#F4F6F8' },
  petTypeBadgeText: { fontSize: 12, fontWeight: '700', color: '#111827' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F4F6F8' },
  metaText: { fontSize: 13, color: '#637381', fontWeight: '500' },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyWrap: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#919EAB', fontSize: 15, fontWeight: '600' }
});

export default PetCareTemplateScreen;
