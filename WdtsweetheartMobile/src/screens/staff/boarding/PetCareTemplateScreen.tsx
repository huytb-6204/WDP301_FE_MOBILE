import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Bone, Cat, Dog, Flame, Layers3, Sparkles } from 'lucide-react-native';
import { useTheme } from '../../../context/ThemeContext';
import { getStaffThemeColors } from '../../../theme/staffTheme';
import { colors } from '../../../theme/colors';
import { getExerciseTemplates, getFoodTemplates } from '../../../services/api/petCareTemplate';
import { useNotifier } from '../../../context/NotifierContext';

type TemplateTab = 'food' | 'exercise';
type PetFilter = 'all' | 'dog' | 'cat';

const PET_FILTER_OPTIONS: Array<{ key: PetFilter; label: string; icon: any }> = [
  { key: 'all', label: 'Tất cả', icon: Layers3 },
  { key: 'dog', label: 'Chó', icon: Dog },
  { key: 'cat', label: 'Mèo', icon: Cat },
];

const TAB_OPTIONS: Array<{ key: TemplateTab; label: string; subtitle: string; icon: any }> = [
  { key: 'food', label: 'Thức ăn', subtitle: 'Khẩu phần và chế độ ăn', icon: Bone },
  { key: 'exercise', label: 'Vận động', subtitle: 'Lịch chơi và vận động', icon: Flame },
];

const FOOD_GROUP_LABELS: Record<string, string> = {
  'Thức Ăn Tươi': 'Thức ăn tươi',
  'Hạt Khô': 'Hạt khô',
  'Pate / Ướt': 'Pate và thức ăn ướt',
  Snack: 'Snack',
  'Đặc Biệt': 'Chế độ đặc biệt',
  'Tự Cung Cấp': 'Chủ mang theo',
};

const EXERCISE_INTENSITY_LABELS: Record<string, string> = {
  low: 'Cường độ nhẹ',
  medium: 'Cường độ vừa',
  high: 'Cường độ cao',
  intense: 'Cường độ cao',
};

const AGE_GROUP_LABELS: Record<string, string> = {
  puppy: 'Con',
  adult: 'Trưởng thành',
  senior: 'Lớn tuổi',
  all: 'Mọi lứa tuổi',
};

const PET_TYPE_LABELS: Record<string, string> = {
  all: 'Mọi loại thú cưng',
  dog: 'Dành cho chó',
  cat: 'Dành cho mèo',
};

const formatGroupLabel = (value?: string) => {
  const raw = String(value || '').trim();
  if (!raw) return 'Nhóm khác';
  return FOOD_GROUP_LABELS[raw] || raw;
};

const formatIntensityLabel = (value?: string) => {
  const raw = String(value || '').trim().toLowerCase();
  if (!raw) return 'Cường độ khác';
  return EXERCISE_INTENSITY_LABELS[raw] || value || 'Cường độ khác';
};

const formatAgeGroup = (value?: string) => {
  const raw = String(value || '').trim().toLowerCase();
  return AGE_GROUP_LABELS[raw] || value || 'Mọi lứa tuổi';
};

const formatPetType = (value?: string) => {
  const raw = String(value || '').trim().toLowerCase();
  return PET_TYPE_LABELS[raw] || value || 'Mọi loại thú cưng';
};

const getSectionAccent = (tab: TemplateTab) =>
  tab === 'food'
    ? { tint: '#0E9F6E', soft: '#E8FFF5', line: '#CDEEDF' }
    : { tint: '#C97A00', soft: '#FFF5D8', line: '#F4E2A5' };

const PetCareTemplateScreen = () => {
  const navigation = useNavigation();
  const { isDarkMode } = useTheme();
  const staffTheme = getStaffThemeColors(isDarkMode);
  const { showAlert } = useNotifier();

  const [activeTab, setActiveTab] = useState<TemplateTab>('food');
  const [petFilter, setPetFilter] = useState<PetFilter>('all');
  const [foodTemplates, setFoodTemplates] = useState<any[]>([]);
  const [exerciseTemplates, setExerciseTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [foods, exercises] = await Promise.all([
        getFoodTemplates({ petType: petFilter === 'all' ? undefined : petFilter }),
        getExerciseTemplates({ petType: petFilter === 'all' ? undefined : petFilter }),
      ]);
      setFoodTemplates(Array.isArray(foods) ? foods : []);
      setExerciseTemplates(Array.isArray(exercises) ? exercises : []);
    } catch (error: any) {
      showAlert('Lỗi tải dữ liệu', error.message || 'Không thể tải mẫu chăm sóc.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [petFilter]);

  const groupedFood = useMemo(() => {
    return foodTemplates.reduce<Record<string, any[]>>((acc, item) => {
      const key = formatGroupLabel(item.group);
      acc[key] = acc[key] || [];
      acc[key].push(item);
      return acc;
    }, {});
  }, [foodTemplates]);

  const groupedExercise = useMemo(() => {
    return exerciseTemplates.reduce<Record<string, any[]>>((acc, item) => {
      const key = formatIntensityLabel(item.intensity);
      acc[key] = acc[key] || [];
      acc[key].push(item);
      return acc;
    }, {});
  }, [exerciseTemplates]);

  const totalVisibleItems = activeTab === 'food' ? foodTemplates.length : exerciseTemplates.length;
  const totalVisibleGroups = activeTab === 'food' ? Object.keys(groupedFood).length : Object.keys(groupedExercise).length;
  const sectionAccent = getSectionAccent(activeTab);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: staffTheme.screen }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      <View style={[styles.header, { backgroundColor: staffTheme.surface, borderBottomColor: staffTheme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.headerIcon, { backgroundColor: staffTheme.iconSurface }]}>
          <ArrowLeft size={20} color={staffTheme.textStrong} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: staffTheme.textStrong }]}>Mẫu chăm sóc</Text>
        <View style={styles.headerGhost} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.heroCard, { backgroundColor: staffTheme.surface, borderColor: staffTheme.border }]}>
          <View style={styles.heroTopRow}>
            <View style={[styles.heroIconWrap, { backgroundColor: sectionAccent.soft }]}>
              <Sparkles size={18} color={sectionAccent.tint} />
            </View>
            <View style={styles.heroTextWrap}>
              <Text style={[styles.heroTitle, { color: staffTheme.textStrong }]}>Bộ mẫu thao tác nhanh</Text>
              <Text style={[styles.heroSubtitle, { color: staffTheme.textMuted }]}>
                Tra cứu nhanh chế độ ăn và lịch vận động theo từng nhóm thú cưng.
              </Text>
            </View>
          </View>

          <View style={styles.heroStatsRow}>
            <View style={[styles.heroStatCard, { backgroundColor: isDarkMode ? staffTheme.iconSurface : '#FFF7F8' }]}>
              <Text style={[styles.heroStatValue, { color: staffTheme.textStrong }]}>{totalVisibleItems}</Text>
              <Text style={[styles.heroStatLabel, { color: staffTheme.textMuted }]}>Mẫu đang hiển thị</Text>
            </View>
            <View style={[styles.heroStatCard, { backgroundColor: isDarkMode ? staffTheme.iconSurface : '#F5FBFF' }]}>
              <Text style={[styles.heroStatValue, { color: staffTheme.textStrong }]}>{totalVisibleGroups}</Text>
              <Text style={[styles.heroStatLabel, { color: staffTheme.textMuted }]}>Nhóm nội dung</Text>
            </View>
          </View>
        </View>

        <View style={[styles.tabShell, { backgroundColor: staffTheme.surface, borderColor: staffTheme.border }]}>
          {TAB_OPTIONS.map((item) => {
            const active = activeTab === item.key;
            const Icon = item.icon;
            return (
              <TouchableOpacity
                key={item.key}
                onPress={() => setActiveTab(item.key)}
                style={[
                  styles.tabButton,
                  active && { backgroundColor: activeTab === 'food' ? colors.secondary : '#3B2A12' },
                ]}
                activeOpacity={0.9}
              >
                <View style={[styles.tabIconWrap, active && styles.tabIconWrapActive]}>
                  <Icon size={16} color={active ? '#FFFFFF' : staffTheme.textMuted} />
                </View>
                <View style={styles.tabTextWrap}>
                  <Text style={[styles.tabTitle, { color: active ? '#FFFFFF' : staffTheme.textStrong }]}>{item.label}</Text>
                  <Text style={[styles.tabSubtitle, { color: active ? 'rgba(255,255,255,0.76)' : staffTheme.textSoft }]}>
                    {item.subtitle}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.filterRow}>
          {PET_FILTER_OPTIONS.map((item) => {
            const active = petFilter === item.key;
            const Icon = item.icon;
            return (
              <TouchableOpacity
                key={item.key}
                onPress={() => setPetFilter(item.key)}
                style={[
                  styles.filterPill,
                  {
                    backgroundColor: active ? sectionAccent.tint : staffTheme.surface,
                    borderColor: active ? sectionAccent.tint : staffTheme.border,
                  },
                ]}
              >
                <Icon size={15} color={active ? '#FFFFFF' : staffTheme.textMuted} />
                <Text style={[styles.filterText, { color: active ? '#FFFFFF' : staffTheme.textMuted }]}>{item.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {loading ? (
          <View style={styles.centerWrap}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: staffTheme.textMuted }]}>Đang tải mẫu chăm sóc...</Text>
          </View>
        ) : totalVisibleItems === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: staffTheme.surface, borderColor: staffTheme.border }]}>
            <Text style={[styles.emptyTitle, { color: staffTheme.textStrong }]}>Chưa có dữ liệu phù hợp</Text>
            <Text style={[styles.emptyText, { color: staffTheme.textMuted }]}>
              Hãy đổi bộ lọc thú cưng hoặc kiểm tra lại dữ liệu mẫu từ hệ thống.
            </Text>
          </View>
        ) : (
          <>
            {activeTab === 'food' &&
              Object.entries(groupedFood).map(([group, items]) => (
                <View key={group} style={[styles.sectionCard, { backgroundColor: staffTheme.surface, borderColor: staffTheme.border }]}>
                  <View style={styles.sectionHeader}>
                    <View>
                      <Text style={[styles.sectionTitle, { color: staffTheme.textStrong }]}>{group}</Text>
                      <Text style={[styles.sectionSubtitle, { color: staffTheme.textMuted }]}>
                        {items.length} mẫu thức ăn
                      </Text>
                    </View>
                    <View style={[styles.sectionBadge, { backgroundColor: sectionAccent.soft, borderColor: sectionAccent.line }]}>
                      <Text style={[styles.sectionBadgeText, { color: sectionAccent.tint }]}>{items.length}</Text>
                    </View>
                  </View>

                  {items.map((item) => (
                    <View key={item._id} style={[styles.itemCard, { backgroundColor: isDarkMode ? staffTheme.iconSurface : '#FAFBFC' }]}>
                      <View style={[styles.itemIconWrap, { backgroundColor: '#E7F7F0' }]}>
                        <Bone size={18} color="#0E9F6E" />
                      </View>
                      <View style={styles.itemBody}>
                        <Text style={[styles.itemTitle, { color: staffTheme.textStrong }]}>{item.name}</Text>
                        <View style={styles.metaRow}>
                          <View style={[styles.metaChip, { backgroundColor: isDarkMode ? '#24323B' : '#EEF8F3' }]}>
                            <Text style={[styles.metaChipText, { color: staffTheme.textMuted }]}>{item.brand || 'Không thương hiệu'}</Text>
                          </View>
                          <View style={[styles.metaChip, { backgroundColor: isDarkMode ? '#2A2636' : '#F8EEF6' }]}>
                            <Text style={[styles.metaChipText, { color: staffTheme.textMuted }]}>{formatAgeGroup(item.ageGroup)}</Text>
                          </View>
                        </View>
                        {!!item.description && (
                          <Text style={[styles.itemDescription, { color: staffTheme.textSoft }]}>{item.description}</Text>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              ))}

            {activeTab === 'exercise' &&
              Object.entries(groupedExercise).map(([group, items]) => (
                <View key={group} style={[styles.sectionCard, { backgroundColor: staffTheme.surface, borderColor: staffTheme.border }]}>
                  <View style={styles.sectionHeader}>
                    <View>
                      <Text style={[styles.sectionTitle, { color: staffTheme.textStrong }]}>{group}</Text>
                      <Text style={[styles.sectionSubtitle, { color: staffTheme.textMuted }]}>
                        {items.length} mẫu vận động
                      </Text>
                    </View>
                    <View style={[styles.sectionBadge, { backgroundColor: sectionAccent.soft, borderColor: sectionAccent.line }]}>
                      <Text style={[styles.sectionBadgeText, { color: sectionAccent.tint }]}>{items.length}</Text>
                    </View>
                  </View>

                  {items.map((item) => (
                    <View key={item._id} style={[styles.itemCard, { backgroundColor: isDarkMode ? staffTheme.iconSurface : '#FAFBFC' }]}>
                      <View style={[styles.itemIconWrap, { backgroundColor: '#FFF4DE' }]}>
                        <Flame size={18} color="#C97A00" />
                      </View>
                      <View style={styles.itemBody}>
                        <Text style={[styles.itemTitle, { color: staffTheme.textStrong }]}>{item.name}</Text>
                        <View style={styles.metaRow}>
                          <View style={[styles.metaChip, { backgroundColor: isDarkMode ? '#3C3020' : '#FFF6E8' }]}>
                            <Text style={[styles.metaChipText, { color: staffTheme.textMuted }]}>
                              {item.durationMinutes || 0} phút
                            </Text>
                          </View>
                          <View style={[styles.metaChip, { backgroundColor: isDarkMode ? '#24323B' : '#EEF8F3' }]}>
                            <Text style={[styles.metaChipText, { color: staffTheme.textMuted }]}>{formatPetType(item.petType)}</Text>
                          </View>
                        </View>
                        {!!item.description && (
                          <Text style={[styles.itemDescription, { color: staffTheme.textSoft }]}>{item.description}</Text>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 22, fontWeight: '900' },
  headerGhost: { width: 44, height: 44 },
  scroll: { padding: 16, paddingBottom: 36 },
  heroCard: {
    borderWidth: 1,
    borderRadius: 28,
    padding: 18,
    marginBottom: 16,
  },
  heroTopRow: { flexDirection: 'row', alignItems: 'flex-start' },
  heroIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTextWrap: { flex: 1, marginLeft: 12 },
  heroTitle: { fontSize: 20, fontWeight: '900' },
  heroSubtitle: { marginTop: 6, fontSize: 13, lineHeight: 20, fontWeight: '600' },
  heroStatsRow: { flexDirection: 'row', gap: 12, marginTop: 18 },
  heroStatCard: {
    flex: 1,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 14,
  },
  heroStatValue: { fontSize: 22, fontWeight: '900' },
  heroStatLabel: { marginTop: 4, fontSize: 12, fontWeight: '700' },
  tabShell: {
    borderWidth: 1,
    borderRadius: 28,
    padding: 6,
    marginBottom: 14,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 6,
  },
  tabIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconWrapActive: {
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  tabTextWrap: { flex: 1, marginLeft: 12 },
  tabTitle: { fontSize: 15, fontWeight: '900' },
  tabSubtitle: { marginTop: 2, fontSize: 12, fontWeight: '600' },
  filterRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    height: 42,
    borderRadius: 999,
    borderWidth: 1,
  },
  filterText: { fontSize: 13, fontWeight: '800' },
  centerWrap: { paddingVertical: 52, alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 13, fontWeight: '700' },
  emptyCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  emptyTitle: { fontSize: 18, fontWeight: '900' },
  emptyText: { marginTop: 8, fontSize: 13, lineHeight: 20, textAlign: 'center', fontWeight: '600' },
  sectionCard: {
    borderWidth: 1,
    borderRadius: 28,
    padding: 14,
    marginBottom: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: { fontSize: 22, fontWeight: '900' },
  sectionSubtitle: { marginTop: 4, fontSize: 12, fontWeight: '700' },
  sectionBadge: {
    minWidth: 40,
    height: 40,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionBadgeText: { fontSize: 14, fontWeight: '900' },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 22,
    padding: 14,
    marginBottom: 10,
  },
  itemIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemBody: { flex: 1, marginLeft: 12 },
  itemTitle: { fontSize: 17, fontWeight: '900', lineHeight: 24 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  metaChip: {
    minHeight: 28,
    paddingHorizontal: 10,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaChipText: { fontSize: 11, fontWeight: '800' },
  itemDescription: { marginTop: 10, fontSize: 13, lineHeight: 20, fontWeight: '600' },
});

export default PetCareTemplateScreen;
