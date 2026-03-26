import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, PawPrint, Plus, Trash2 } from 'lucide-react-native';
import { createPet, deleteMyPet, getMyPets } from '../../services/api/booking';
import type { Pet } from '../../types';
import type { RootStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'PetList'>;

const PetListScreen = () => {
  const navigation = useNavigation<Navigation>();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [petName, setPetName] = useState('');
  const [petBreed, setPetBreed] = useState('');
  const [petType, setPetType] = useState<'dog' | 'cat'>('dog');
  const [petWeight, setPetWeight] = useState('');
  const [petColor, setPetColor] = useState('');
  const [petNotes, setPetNotes] = useState('');

  const loadPets = useCallback(async (useRefreshing = false) => {
    if (useRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const res = await getMyPets();
      setPets(res.data || []);
    } catch (error) {
      Alert.alert('Lỗi', error instanceof Error ? error.message : 'Không thể tải danh sách thú cưng.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadPets();
  }, [loadPets]);

  const resetForm = () => {
    setPetName('');
    setPetBreed('');
    setPetType('dog');
    setPetWeight('');
    setPetColor('');
    setPetNotes('');
  };

  const handleCreatePet = async () => {
    if (!petName.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên thú cưng.');
      return;
    }

    if (!petWeight.trim() || Number(petWeight) <= 0) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập cân nặng hợp lệ.');
      return;
    }

    setSaving(true);
    try {
      const res = await createPet({
        name: petName.trim(),
        type: petType,
        breed: petBreed.trim() || undefined,
        weight: Number(petWeight),
        color: petColor.trim() || undefined,
        notes: petNotes.trim() || undefined,
      });
      setPets((prev) => [res.data, ...prev]);
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      Alert.alert('Lỗi', error instanceof Error ? error.message : 'Không thể tạo thú cưng.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePet = (pet: Pet) => {
    Alert.alert('Xóa thú cưng', `Bạn có chắc muốn xóa ${pet.name}?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              await deleteMyPet(pet._id);
              setPets((prev) => prev.filter((item) => item._id !== pet._id));
            } catch (error) {
              Alert.alert('Lỗi', error instanceof Error ? error.message : 'Không thể xóa thú cưng.');
            }
          })();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color={colors.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thú cưng của tôi</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowCreateModal(true)}>
          <Plus size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerWrap}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.helperText}>Đang tải danh sách thú cưng...</Text>
        </View>
      ) : (
        <FlatList
          data={pets}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void loadPets(true)} />}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <PawPrint size={22} color={colors.primary} />
              <Text style={styles.emptyTitle}>Chưa có thú cưng nào</Text>
              <Text style={styles.emptyText}>Bạn có thể thêm thú cưng mới để dùng cho đặt lịch và khách sạn.</Text>
              <TouchableOpacity style={styles.emptyButton} onPress={() => setShowCreateModal(true)}>
                <Text style={styles.emptyButtonText}>Thêm thú cưng</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.petCard}>
              <View style={styles.petAvatar}>
                <PawPrint size={18} color={colors.primary} />
              </View>
              <View style={styles.petInfo}>
                <View style={styles.petHeadRow}>
                  <Text style={styles.petName}>{item.name}</Text>
                  <View style={styles.petTypeChip}>
                    <Text style={styles.petTypeText}>{item.type === 'dog' ? 'Chó' : 'Mèo'}</Text>
                  </View>
                </View>
                <Text style={styles.petMeta}>Giống: {item.breed || 'Chưa cập nhật'}</Text>
                <Text style={styles.petMeta}>Cân nặng: {item.weight} kg</Text>
                <Text style={styles.petMeta}>Màu lông: {item.color || 'Chưa cập nhật'}</Text>
                {item.notes ? <Text style={styles.petMeta}>Ghi chú: {item.notes}</Text> : null}
              </View>
              <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeletePet(item)}>
                <Trash2 size={16} color="#D14343" />
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      <Modal visible={showCreateModal} animationType="slide" transparent onRequestClose={() => setShowCreateModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Thêm thú cưng</Text>

            <TextInput style={styles.input} placeholder="Tên thú cưng" value={petName} onChangeText={setPetName} />
            <TextInput style={styles.input} placeholder="Giống thú cưng" value={petBreed} onChangeText={setPetBreed} />

            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[styles.toggleButton, petType === 'dog' && styles.toggleButtonActive]}
                onPress={() => setPetType('dog')}
              >
                <Text style={[styles.toggleText, petType === 'dog' && styles.toggleTextActive]}>Chó</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, petType === 'cat' && styles.toggleButtonActive]}
                onPress={() => setPetType('cat')}
              >
                <Text style={[styles.toggleText, petType === 'cat' && styles.toggleTextActive]}>Mèo</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Cân nặng (kg)"
              keyboardType="numeric"
              value={petWeight}
              onChangeText={setPetWeight}
            />
            <TextInput style={styles.input} placeholder="Màu lông" value={petColor} onChangeText={setPetColor} />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Ghi chú thú cưng"
              value={petNotes}
              onChangeText={setPetNotes}
              multiline
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.secondaryButton} onPress={() => setShowCreateModal(false)}>
                <Text style={styles.secondaryButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryButton} onPress={handleCreatePet} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Lưu</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.softPink,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: colors.secondary,
    fontSize: 18,
    fontWeight: '700',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  centerWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  helperText: {
    color: colors.text,
    fontSize: 13,
  },
  listContent: {
    padding: 16,
    gap: 12,
    flexGrow: 1,
  },
  emptyCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  emptyTitle: {
    marginTop: 10,
    color: colors.secondary,
    fontSize: 18,
    fontWeight: '700',
  },
  emptyText: {
    marginTop: 8,
    color: colors.text,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: 14,
    minHeight: 42,
    paddingHorizontal: 18,
    borderRadius: 999,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  petCard: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#fff',
  },
  petAvatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.softPink,
  },
  petInfo: {
    flex: 1,
    gap: 4,
  },
  petHeadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  petName: {
    color: colors.secondary,
    fontSize: 16,
    fontWeight: '700',
  },
  petTypeChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#FFF1F1',
  },
  petTypeText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  petMeta: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 18,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF5F5',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 18,
    gap: 10,
  },
  modalTitle: {
    color: colors.secondary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    color: colors.secondary,
    backgroundColor: '#fff',
  },
  textArea: {
    minHeight: 84,
    textAlignVertical: 'top',
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  toggleButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  toggleButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  toggleText: {
    color: colors.secondary,
    fontWeight: '700',
  },
  toggleTextActive: {
    color: '#fff',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  secondaryButtonText: {
    color: colors.primary,
    fontWeight: '700',
  },
  primaryButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
});

export default PetListScreen;
