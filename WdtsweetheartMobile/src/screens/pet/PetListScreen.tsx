import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Plus, PawPrint, Camera, Trash2, Edit2 } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { getMyPets, deletePet, type Pet } from '../../services/api/pet';
import { Toast } from '../../components/common';

const PetListScreen = () => {
  const navigation = useNavigation<any>();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  };

  const fetchPets = async () => {
    try {
      const data = await getMyPets();
      setPets(data);
    } catch (error) {
      showToast('Không thể tải danh sách thú cưng');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPets();
  }, []);

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Xóa thú cưng', `Bạn có chắc muốn xóa bé ${name}?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            await deletePet(id);
            showToast('Đã xóa bé cưng');
            fetchPets();
          } catch (error) {
            showToast('Lỗi khi xóa thú cưng');
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: Pet }) => (
    <View style={styles.petCard}>
      <View style={styles.petImageContainer}>
        {item.avatar ? (
          <Image source={{ uri: item.avatar }} style={styles.petAvatar} />
        ) : (
          <View style={styles.placeholderAvatar}>
            <Camera size={30} color="#ccc" />
          </View>
        )}
      </View>
      <View style={styles.petInfo}>
        <View style={styles.petHeader}>
          <Text style={styles.petName}>{item.name}</Text>
          <View style={[styles.typeBadge, { backgroundColor: item.type === 'dog' ? '#FFF7ED' : '#EFF6FF' }]}>
            <Text style={[styles.typeBadgeText, { color: item.type === 'dog' ? '#EA580C' : '#2563EB' }]}>
              {item.type === 'dog' ? 'Chó' : 'Mèo'}
            </Text>
          </View>
        </View>
        <Text style={styles.petMeta}>Giống: {item.breed || 'Chưa rõ'}</Text>
        <Text style={styles.petMeta}>Cân nặng: {item.weight ? `${item.weight} kg` : '?'}</Text>
        <Text style={styles.petMeta}>Tuổi: {item.age && item.age > 0 ? `${item.age} tháng` : 'Chưa cập nhật'}</Text>
        
        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.editBtn]}
            onPress={() => navigation.navigate('PetForm', { pet: item })}
          >
            <Edit2 size={16} color={colors.primary} />
            <Text style={styles.editBtnText}>Sửa</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.deleteBtn]}
            onPress={() => handleDelete(item._id, item.name)}
          >
            <Trash2 size={16} color="#FF4D4D" />
            <Text style={styles.deleteBtnText}>Xóa</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color={colors.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bé cưng của tôi</Text>
        <TouchableOpacity 
          onPress={() => navigation.navigate('PetForm')}
          style={styles.addBtn}
        >
          <Plus size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={pets}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchPets(); }} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <PawPrint size={60} color="#eee" />
              <Text style={styles.emptyText}>Bạn chưa có bé cưng nào</Text>
              <TouchableOpacity 
                style={styles.emptyAddBtn}
                onPress={() => navigation.navigate('PetForm')}
              >
                <Text style={styles.emptyAddText}>THÊM BÉ CƯNG NGAY</Text>
              </TouchableOpacity>
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
  addBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 16, paddingBottom: 40 },
  petCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  petImageContainer: {
    width: 90,
    height: 90,
    borderRadius: 15,
    backgroundColor: '#F3F4F6',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
  },
  petAvatar: { width: '100%', height: '100%' },
  placeholderAvatar: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  petInfo: { flex: 1, marginLeft: 16 },
  petHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  petName: { fontSize: 18, fontWeight: '800', color: colors.secondary },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  typeBadgeText: { fontSize: 10, fontWeight: '700' },
  petMeta: { fontSize: 13, color: '#7d7b7b', marginBottom: 2 },
  actionRow: { flexDirection: 'row', marginTop: 12, gap: 10 },
  actionBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6, 
    paddingVertical: 6, 
    paddingHorizontal: 12, 
    borderRadius: 12,
    borderWidth: 1,
  },
  editBtn: { borderColor: colors.primary, backgroundColor: colors.softPink },
  editBtnText: { fontSize: 12, fontWeight: '700', color: colors.primary },
  deleteBtn: { borderColor: '#FFEBEA' },
  deleteBtnText: { fontSize: 12, fontWeight: '700', color: '#FF4D4D' },
  empty: { alignItems: 'center', justifyContent: 'center', marginTop: 100, gap: 16 },
  emptyText: { fontSize: 16, color: '#aaa', fontWeight: '500' },
  emptyAddBtn: { backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24, marginTop: 10 },
  emptyAddText: { color: '#fff', fontSize: 13, fontWeight: '800' },
});

export default PetListScreen;
