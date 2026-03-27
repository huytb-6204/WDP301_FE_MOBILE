import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Clipboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, ShoppingBag, Copy, Check } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { getClientCoupons, type PublicCoupon } from '../../services/api/coupon';
import { Toast } from '../../components/common';

const CouponListScreen = () => {
  const navigation = useNavigation<any>();
  const [coupons, setCoupons] = useState<PublicCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  };

  const fetchCoupons = async () => {
    try {
      const resp = await getClientCoupons();
      if (resp.success) {
        setCoupons(resp.data || []);
      } else {
        showToast(resp.message || 'Lỗi khi tải mã giảm giá');
      }
    } catch (error) {
       showToast('Không thể kết nối máy chủ');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCopy = (code: string) => {
    Clipboard.setString(code);
    setCopiedCode(code);
    showToast(`Đã sao chép mã: ${code}`);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  const formatCurrency = (value: number) => 
    `${(value || 0).toLocaleString('vi-VN')} đ`;

  const renderItem = ({ item }: { item: PublicCoupon }) => {
    const isCopied = copiedCode === item.code;
    const isPercentage = item.typeDiscount === 'percentage';

    return (
      <View style={styles.card}>
        <View style={styles.cardLeft}>
          <View style={styles.iconCircle}>
             <ShoppingBag size={24} color={colors.primary} />
          </View>
        </View>

        <View style={styles.cardInfo}>
          <Text style={styles.couponName}>{item.name}</Text>
          <Text style={styles.couponDesc}>
             Giảm {isPercentage ? `${item.value}%` : formatCurrency(item.value)}
             {item.minOrderValue ? ` cho đơn từ ${formatCurrency(item.minOrderValue)}` : ''}
          </Text>
          <Text style={styles.expiry}>Hạn dùng: {item.endDateFormat || 'Không giới hạn'}</Text>
          
          <View style={styles.codeRow}>
            <View style={styles.codeBox}>
               <Text style={styles.codeText}>{item.code}</Text>
            </View>
            <TouchableOpacity 
              style={[styles.copyBtn, isCopied && styles.copiedBtn]} 
              onPress={() => handleCopy(item.code)}
            >
              {isCopied ? <Check size={14} color="#fff" /> : <Copy size={14} color={colors.primary} />}
              <Text style={[styles.copyText, isCopied && styles.copiedText]}>
                {isCopied ? 'Đã chép' : 'Sao chép'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color={colors.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mã giảm giá</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={coupons}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchCoupons(); }} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={styles.emptyIconWrap}>
                 <ShoppingBag size={40} color={colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>Chưa có mã giảm giá</Text>
              <Text style={styles.emptyText}>Hiện tại không có chương trình khuyến mãi nào.</Text>
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    flexDirection: 'row',
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
  cardLeft: { 
    justifyContent: 'center', 
    marginRight: 16,
    borderRightWidth: 1,
    borderRightColor: '#f0f0f0',
    paddingRight: 16,
    borderStyle: 'dashed'
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFF5F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: { flex: 1 },
  couponName: { fontSize: 16, fontWeight: '800', color: colors.secondary, marginBottom: 4 },
  couponDesc: { fontSize: 13, color: '#4B5563', lineHeight: 18, marginBottom: 4 },
  expiry: { fontSize: 11, color: '#9CA3AF', marginBottom: 12 },
  codeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  codeBox: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed'
  },
  codeText: { fontSize: 14, fontWeight: '700', color: colors.secondary, textAlign: 'center' },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFF5F6',
    borderWidth: 1,
    borderColor: colors.softPink,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  copiedBtn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  copyText: { fontSize: 12, fontWeight: '700', color: colors.primary },
  copiedText: { color: '#fff' },
  empty: { alignItems: 'center', justifyContent: 'center', marginTop: 120, paddingHorizontal: 40 },
  emptyIconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFF5F6', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: colors.secondary, marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#7d7b7b', textAlign: 'center', lineHeight: 20 },
});

export default CouponListScreen;
