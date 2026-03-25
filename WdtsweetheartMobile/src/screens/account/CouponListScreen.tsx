import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, TicketPercent } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusMessage } from '../../components/common';
import { colors } from '../../theme/colors';
import type { RootStackParamList } from '../../navigation/types';
import { getClientCoupons, type PublicCoupon } from '../../services/api/coupon';
import { formatPrice } from '../../utils';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'CouponList'>;

const CouponListScreen = () => {
  const navigation = useNavigation<Navigation>();
  const [coupons, setCoupons] = useState<PublicCoupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCoupons = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getClientCoupons();
      setCoupons(res.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải coupon');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color={colors.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mã giảm giá</Text>
        <View style={styles.backButton} />
      </View>

      {error ? <StatusMessage message={error} actionText="Thử lại" onAction={fetchCoupons} /> : null}

      {loading ? (
        <View style={styles.centerWrap}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={coupons}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<StatusMessage message="Chưa có coupon công khai nào" />}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.topRow}>
                <View style={styles.iconWrap}>
                  <TicketPercent size={16} color={colors.primary} />
                </View>
                <View style={styles.flex}>
                  <Text style={styles.codeText}>{item.code}</Text>
                  <Text style={styles.nameText}>{item.name}</Text>
                </View>
                <Text style={styles.valueBadge}>
                  {item.typeDiscount === 'percentage' ? `${item.value}%` : formatPrice(item.value)}
                </Text>
              </View>
              <Text style={styles.detailText}>
                Đơn tối thiểu: {item.minOrderValue ? formatPrice(item.minOrderValue) : 'Không yêu cầu'}
              </Text>
              <Text style={styles.detailText}>
                HSD: {item.endDateFormat || (item.endDate ? new Date(item.endDate).toLocaleDateString('vi-VN') : 'Không giới hạn')}
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
  centerWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { padding: 16, paddingBottom: 34 },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 14,
    gap: 8,
    marginBottom: 12,
    backgroundColor: '#fff7f7',
  },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: { flex: 1 },
  codeText: { color: colors.primary, fontSize: 13, fontWeight: '800' },
  nameText: { color: colors.secondary, fontSize: 14, fontWeight: '700', marginTop: 2 },
  valueBadge: {
    color: '#fff',
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '700',
  },
  detailText: { color: colors.text, fontSize: 13 },
});

export default CouponListScreen;
