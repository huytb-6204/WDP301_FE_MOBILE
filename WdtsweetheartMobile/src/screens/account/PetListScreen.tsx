import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, PawPrint, Trash2 } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusMessage, Toast } from '../../components/common';
import { colors } from '../../theme/colors';
import type { RootStackParamList } from '../../navigation/types';
import { createPet, deleteMyPet, getMyPets } from '../../services/api/booking';
import type { Pet } from '../../types';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'PetList'>;

const PetListScreen = () => {
  const navigation = useNavigation<Navigation>();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<'dog' | 'cat'>('dog');
  const [weight, setWeight] = useState('');
  const [breed, setBreed] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 1600);
  };

  const fetchPets = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMyPets();
      setPets(res.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách thú cưng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPets();
  }, []);

  const handleCreate = async () => {
    const parsedWeight = Number(weight);
    if (!name.trim() || !Number.isFinite(parsedWeight) || parsedWeight <= 0) {
      showToast('Tên và cân nặng là bắt buộc');
      return;
    }

    try {
      setSubmitting(true);
      await createPet({
        name: name.trim(),
        type,
        weight: parsedWeight,
        breed: breed.trim() || undefined,
      });
      setName('');
      setWeight('');
      setBreed('');
      showToast('Đã thêm thú cưng');
      await fetchPets();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Không thể thêm thú cưng');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMyPet(id);
      showToast('Đã xóa thú cưng');
      await fetchPets();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Không thể xóa thú cưng');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color={colors.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thú cưng của tôi</Text>
        <View style={styles.backButton} />
      </View>

      {error ? <StatusMessage message={error} actionText="Thử lại" onAction={fetchPets} /> : null}

      <FlatList
        data={pets}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={
          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Thêm thú cưng</Text>
            <TextInput value={name} onChangeText={setName} placeholder="Tên thú cưng" style={styles.input} />
            <View style={styles.typeRow}>
              {(['dog', 'cat'] as const).map((item) => {
                const active = type === item;
                return (
                  <TouchableOpacity
                    key={item}
                    style={[styles.typeChip, active && styles.typeChipActive]}
                    onPress={() => setType(item)}
                  >
                    <Text style={[styles.typeChipText, active && styles.typeChipTextActive]}>
                      {item === 'dog' ? 'Chó' : 'Mèo'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TextInput value={weight} onChangeText={setWeight} placeholder="Cân nặng (kg)" style={styles.input} keyboardType="decimal-pad" />
            <TextInput value={breed} onChangeText={setBreed} placeholder="Giống (không bắt buộc)" style={styles.input} />
            <TouchableOpacity style={[styles.primaryBtn, submitting && styles.btnDisabled]} onPress={handleCreate} disabled={submitting}>
              {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Thêm thú cưng</Text>}
            </TouchableOpacity>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.centerWrap}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : (
            <StatusMessage message="Chưa có thú cưng nào" />
          )
        }
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.topRow}>
              <View style={styles.iconWrap}>
                <PawPrint size={16} color={colors.primary} />
              </View>
              <View style={styles.flex}>
                <Text style={styles.nameText}>{item.name}</Text>
                <Text style={styles.metaText}>
                  {(item.type || '').toUpperCase()} • {item.weight} kg
                </Text>
              </View>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item._id)}>
                <Trash2 size={14} color="#fff" />
              </TouchableOpacity>
            </View>
            <Text style={styles.detailText}>Giống: {item.breed || 'Chưa cập nhật'}</Text>
            <Text style={styles.detailText}>Tình trạng: {item.status || 'active'}</Text>
          </View>
        )}
      />

      <Toast visible={toastVisible} message={toastMessage} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: colors.secondary, fontSize: 18, fontWeight: '700' },
  listContent: { padding: 16, paddingBottom: 34 },
  formCard: { backgroundColor: colors.softPink, borderRadius: 18, padding: 14, gap: 10, marginBottom: 14 },
  sectionTitle: { color: colors.secondary, fontSize: 16, fontWeight: '700' },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.text,
  },
  typeRow: { flexDirection: 'row', gap: 8 },
  typeChip: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  typeChipActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  typeChipText: { color: colors.text, fontWeight: '700' },
  typeChipTextActive: { color: '#fff' },
  primaryBtn: {
    minHeight: 44,
    borderRadius: 999,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: { color: '#fff', fontWeight: '700' },
  btnDisabled: { opacity: 0.7 },
  centerWrap: { paddingVertical: 24, alignItems: 'center', justifyContent: 'center' },
  card: { borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: 14, gap: 8, marginBottom: 12 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.softPink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: { flex: 1 },
  nameText: { color: colors.secondary, fontWeight: '700', fontSize: 14 },
  metaText: { color: colors.textLight, fontSize: 12, marginTop: 2 },
  detailText: { color: colors.text, fontSize: 13 },
  deleteBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FF6B6B',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PetListScreen;
