import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusMessage } from '../../components/common';
import { colors } from '../../theme/colors';
import type { RootStackParamList } from '../../navigation/types';
import { getBreeds, type BreedItem } from '../../services/api/breed';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'BreedList'>;

const BreedListScreen = () => {
  const navigation = useNavigation<Navigation>();
  const [breeds, setBreeds] = useState<BreedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'dog' | 'cat'>('all');

  const fetchBreeds = async () => {
    setLoading(true);
    setError(null);
    try {
      setBreeds(filter === 'all' ? await getBreeds() : await getBreeds(filter));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách giống');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBreeds();
  }, [filter]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color={colors.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Giống thú cưng</Text>
        <View style={styles.backButton} />
      </View>

      <View style={styles.filterRow}>
        {(['all', 'dog', 'cat'] as const).map((item) => {
          const active = filter === item;
          return (
            <TouchableOpacity
              key={item}
              style={[styles.filterChip, active && styles.filterChipActive]}
              onPress={() => setFilter(item)}
            >
              <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                {item === 'all' ? 'Tất cả' : item === 'dog' ? 'Chó' : 'Mèo'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {error ? <StatusMessage message={error} actionText="Thử lại" onAction={fetchBreeds} /> : null}

      {loading ? (
        <View style={styles.centerWrap}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={breeds}
          keyExtractor={(item, index) => `${item._id || item.name}-${index}`}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<StatusMessage message="Chưa có dữ liệu giống thú cưng" />}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.nameText}>{item.name}</Text>
              <Text style={styles.metaText}>
                Loại: {item.type === 'dog' ? 'Chó' : item.type === 'cat' ? 'Mèo' : 'Khác'}
              </Text>
            </View>
          )}
        />
      )}
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
  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingTop: 16 },
  filterChip: {
    flex: 1,
    minHeight: 40,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  filterChipActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  filterChipText: { color: colors.text, fontWeight: '700' },
  filterChipTextActive: { color: '#fff' },
  centerWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { padding: 16, paddingBottom: 34 },
  card: { borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: 14, marginBottom: 12 },
  nameText: { color: colors.secondary, fontWeight: '700', fontSize: 14 },
  metaText: { color: colors.textLight, fontSize: 12, marginTop: 4 },
});

export default BreedListScreen;
