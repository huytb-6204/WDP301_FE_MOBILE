import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Plus, MapPin, Trash2, Edit2, CheckCircle2 } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { getAddresses, deleteAddress, changeDefaultAddress, type SavedAddress } from '../../services/api/dashboard';
import { Toast } from '../../components/common';

const AddressListScreen = () => {
  const navigation = useNavigation<any>();
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  };

  const fetchAddresses = async () => {
    try {
      const data = await getAddresses();
      setAddresses(data);
    } catch (error) {
      showToast('Không thể tải danh sách địa chỉ');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleDelete = (id: string) => {
    Alert.alert('Xóa địa chỉ', 'Bạn có chắc muốn xóa địa chỉ này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteAddress(id);
            showToast('Đã xóa địa chỉ');
            fetchAddresses();
          } catch (error) {
            showToast('Lỗi khi xóa địa chỉ');
          }
        },
      },
    ]);
  };

  const handleSetDefault = async (id: string) => {
    try {
      await changeDefaultAddress(id);
      showToast('Đã cập nhật địa chỉ mặc định');
      fetchAddresses();
    } catch (error) {
      showToast('Lỗi khi cập nhật địa chỉ mặc định');
    }
  };

  const renderItem = ({ item }: { item: SavedAddress }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconWrap}>
          <MapPin size={22} color={colors.primary} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.name}>{item.fullName}</Text>
          <Text style={styles.phone}>{item.phone}</Text>
        </View>
        {item.isDefault && (
          <View style={styles.defaultBadge}>
            <CheckCircle2 size={12} color="#05A845" />
            <Text style={styles.defaultText}>Mặc định</Text>
          </View>
        )}
      </View>
      <Text style={styles.address}>{item.address}</Text>
      
      <View style={styles.actionRow}>
        {!item.isDefault && (
          <TouchableOpacity 
            style={styles.setDefaultBtn}
            onPress={() => handleSetDefault(item._id)}
          >
            <Text style={styles.setDefaultBtnText}>Đặt làm mặc định</Text>
          </TouchableOpacity>
        )}
        <View style={styles.rightActions}>
          <TouchableOpacity 
            style={styles.actionIconBtn} 
            onPress={() => navigation.navigate('AddressForm', { address: item })}
          >
            <Edit2 size={18} color={colors.secondary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionIconBtn} 
            onPress={() => handleDelete(item._id)}
          >
            <Trash2 size={18} color="#FF6B6B" />
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
        <Text style={styles.headerTitle}>Sổ địa chỉ</Text>
        <TouchableOpacity 
          onPress={() => navigation.navigate('AddressForm')}
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
          data={addresses}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAddresses(); }} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <MapPin size={60} color="#eee" />
              <Text style={styles.emptyText}>Chưa có địa chỉ nào</Text>
              <TouchableOpacity 
                style={styles.emptyAddBtn}
                onPress={() => navigation.navigate('AddressForm')}
              >
                <Text style={styles.emptyAddText}>THÊM ĐỊA CHỈ</Text>
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
  card: {
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
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.softPink, alignItems: 'center', justifyContent: 'center' },
  cardInfo: { marginLeft: 12, flex: 1 },
  name: { fontSize: 16, fontWeight: '700', color: colors.secondary },
  phone: { fontSize: 13, color: '#999', marginTop: 2 },
  defaultBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#E8F6EF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 99 },
  defaultText: { fontSize: 10, color: '#05A845', fontWeight: '800' },
  address: { fontSize: 14, color: '#7d7b7b', lineHeight: 20, marginBottom: 16 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F5F5F5' },
  setDefaultBtn: { paddingVertical: 6 },
  setDefaultBtnText: { fontSize: 13, fontWeight: '700', color: colors.primary },
  rightActions: { flexDirection: 'row', gap: 16 },
  actionIconBtn: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', justifyContent: 'center', marginTop: 100, gap: 16 },
  emptyText: { fontSize: 16, color: '#aaa', fontWeight: '500' },
  emptyAddBtn: { backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24, marginTop: 10 },
  emptyAddText: { color: '#fff', fontSize: 13, fontWeight: '800' },
});

export default AddressListScreen;
