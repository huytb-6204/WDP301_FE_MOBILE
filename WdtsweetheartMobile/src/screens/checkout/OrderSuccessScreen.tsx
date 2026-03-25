import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, CheckCircle2, House, Package, ReceiptText, UserRound } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import type { RootStackParamList } from '../../navigation/types';
import { getOrderSuccess, type OrderSuccessData } from '../../services/api/order';
import { formatPrice } from '../../utils';

type OrderSuccessRoute = RouteProp<RootStackParamList, 'OrderSuccess'>;

const OrderSuccessScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<OrderSuccessRoute>();
  const { orderCode, phone } = route.params;

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<OrderSuccessData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(20);

  const goHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    goHome();
  };

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getOrderSuccess(orderCode, phone);

        if (res.code === 'success' && res.order) {
          setOrder(res.order);
        } else {
          setError(res.message || '\u004b\u0068\u00f4\u006e\u0067\u0020\u0074\u00ec\u006d\u0020\u0074\u0068\u1ea5\u0079\u0020\u0111\u01a1\u006e\u0020\u0068\u00e0\u006e\u0067\u002e');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '\u004b\u0068\u00f4\u006e\u0067\u0020\u0074\u0068\u1ec3\u0020\u0074\u1ea3\u0069\u0020\u0074\u0068\u00f4\u006e\u0067\u0020\u0074\u0069\u006e\u0020\u0111\u01a1\u006e\u0020\u0068\u00e0\u006e\u0067\u002e');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderCode, phone]);

  useEffect(() => {
    if (loading || error || !order) return;

    setCountdown(20);

    const timeoutId = setTimeout(() => {
      goHome();
    }, 20000);

    const intervalId = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [loading, error, order]);

  const paymentLabel = useMemo(() => {
    if (!order?.paymentMethod) return '-';
    if (order.paymentMethod === 'money') return '\u0054\u0068\u0061\u006e\u0068\u0020\u0074\u006f\u00e1\u006e\u0020\u006b\u0068\u0069\u0020\u006e\u0068\u1ead\u006e\u0020\u0068\u00e0\u006e\u0067';
    return order.paymentMethod.toUpperCase();
  }, [order?.paymentMethod]);

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={['#F5FFF7', '#FFFFFF']} style={styles.hero}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.iconBtn}>
            <ArrowLeft size={20} color={colors.secondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{'\u0110\u1eb7\u0074\u0020\u0068\u00e0\u006e\u0067\u0020\u0074\u0068\u00e0\u006e\u0068\u0020\u0063\u00f4\u006e\u0067'}</Text>
          <View style={styles.iconSpacer} />
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.muted}>{'\u0110\u0061\u006e\u0067\u0020\u0074\u1ea3\u0069\u002e\u002e\u002e'}</Text>
        </View>
      ) : error || !order ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error || '\u004b\u0068\u00f4\u006e\u0067\u0020\u0063\u00f3\u0020\u0064\u1eef\u0020\u006c\u0069\u1ec7\u0075\u0020\u0111\u01a1\u006e\u0020\u0068\u00e0\u006e\u0067\u002e'}</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={goHome}>
            <House size={16} color="#fff" />
            <Text style={styles.primaryBtnText}>{'\u0056\u1ec1\u0020\u0074\u0072\u0061\u006e\u0067\u0020\u0063\u0068\u1ee7'}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.successCard}>
            <CheckCircle2 size={32} color="#22C55E" />
            <Text style={styles.successTitle}>{'\u0110\u1eb7\u0074\u0020\u0068\u00e0\u006e\u0067\u0020\u0074\u0068\u00e0\u006e\u0068\u0020\u0063\u00f4\u006e\u0067'}</Text>
            <Text style={styles.successText}>
              {'\u0043\u1ea3\u006d\u0020\u01a1\u006e\u0020\u0062\u1ea1\u006e\u002e\u0020\u0110\u01a1\u006e\u0020\u0068\u00e0\u006e\u0067\u0020\u0063\u1ee7\u0061\u0020\u0062\u1ea1\u006e\u0020\u0111\u00e3\u0020\u0111\u01b0\u1ee3\u0063\u0020\u0074\u0069\u1ebf\u0070\u0020\u006e\u0068\u1ead\u006e\u0020\u0076\u00e0\u0020\u0111\u0061\u006e\u0067\u0020\u0063\u0068\u1edd\u0020\u0078\u1eed\u0020\u006c\u00fd\u002e'}
            </Text>
            <Text style={styles.countdownText}>{`\u0054\u1ef1\u0020\u0111\u1ed9\u006e\u0067\u0020\u0076\u1ec1\u0020\u0074\u0072\u0061\u006e\u0067\u0020\u0063\u0068\u1ee7\u0020\u0073\u0061\u0075\u0020${countdown}\u0020\u0067\u0069\u00e2\u0079\u002e`}</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.sectionTitleRow}>
              <ReceiptText size={16} color={colors.primary} />
              <Text style={styles.sectionTitle}>{'\u0054\u0068\u00f4\u006e\u0067\u0020\u0074\u0069\u006e\u0020\u0111\u01a1\u006e\u0020\u0068\u00e0\u006e\u0067'}</Text>
            </View>
            <Text style={styles.rowText}>{`\u004d\u00e3\u0020\u0111\u01a1\u006e\u003a ${order.code}`}</Text>
            <Text style={styles.rowText}>{`\u004e\u0067\u00e0\u0079\u0020\u0074\u1ea1\u006f\u003a ${new Date(order.createdAt).toLocaleDateString('vi-VN')}`}</Text>
            <Text style={styles.rowText}>{`\u0050\u0068\u01b0\u01a1\u006e\u0067\u0020\u0074\u0068\u1ee9\u0063\u0020\u0074\u0068\u0061\u006e\u0068\u0020\u0074\u006f\u00e1\u006e\u003a ${paymentLabel}`}</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.sectionTitleRow}>
              <Package size={16} color={colors.primary} />
              <Text style={styles.sectionTitle}>{'\u0043\u0068\u0069\u0020\u0074\u0069\u1ebf\u0074\u0020\u0073\u1ea3\u006e\u0020\u0070\u0068\u1ea9\u006d'}</Text>
            </View>
            {order.items.map((item, index) => (
              <View key={`${item.productId}-${index}`} style={styles.summaryRow}>
                <Text style={styles.summaryName}>
                  {item.name} x{item.quantity}
                  {item.variant && item.variant.length > 0 ? ` - ${item.variant.join(', ')}` : ''}
                </Text>
                <Text style={styles.summaryValue}>{formatPrice(item.price * item.quantity)}</Text>
              </View>
            ))}
          </View>

          <View style={styles.card}>
            <View style={styles.sectionTitleRow}>
              <CheckCircle2 size={16} color={colors.primary} />
              <Text style={styles.sectionTitle}>{'\u0054\u0068\u0061\u006e\u0068\u0020\u0074\u006f\u00e1\u006e'}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.muted}>{'\u0054\u1ea1\u006d\u0020\u0074\u00ed\u006e\u0068'}</Text>
              <Text style={styles.summaryValue}>{formatPrice(order.subTotal || 0)}</Text>
            </View>
            {order.discount ? (
              <View style={styles.summaryRow}>
                <Text style={styles.muted}>{'\u0047\u0069\u1ea3\u006d\u0020\u0067\u0069\u00e1'}</Text>
                <Text style={styles.discountValue}>-{formatPrice(order.discount)}</Text>
              </View>
            ) : null}
            {order.pointDiscount ? (
              <View style={styles.summaryRow}>
                <Text style={styles.muted}>{'\u0047\u0069\u1ea3\u006d\u0020\u0074\u1eeb\u0020\u0111\u0069\u1ec3\u006d'}</Text>
                <Text style={styles.discountValue}>-{formatPrice(order.pointDiscount)}</Text>
              </View>
            ) : null}
            <View style={styles.summaryRow}>
              <Text style={styles.muted}>
                {'\u0050\u0068\u00ed\u0020\u0076\u1ead\u006e\u0020\u0063\u0068\u0075\u0079\u1ec3\u006e'}
                {order.shipping?.carrierName ? ` (${order.shipping.carrierName})` : ''}
              </Text>
              <Text style={styles.summaryValue}>{formatPrice(order.shipping?.fee || 0)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>{'\u0054\u1ed5\u006e\u0067\u0020\u0063\u1ed9\u006e\u0067'}</Text>
              <Text style={styles.totalValue}>{formatPrice(order.total || 0)}</Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.sectionTitleRow}>
              <UserRound size={16} color={colors.primary} />
              <Text style={styles.sectionTitle}>{'\u0054\u0068\u00f4\u006e\u0067\u0020\u0074\u0069\u006e\u0020\u006e\u0068\u1ead\u006e\u0020\u0068\u00e0\u006e\u0067'}</Text>
            </View>
            <Text style={styles.rowText}>{`\u0048\u1ecd\u0020\u0074\u00ea\u006e\u003a ${order.fullName}`}</Text>
            <Text style={styles.rowText}>{`\u0053\u1ed1\u0020\u0111\u0069\u1ec7\u006e\u0020\u0074\u0068\u006f\u1ea1\u0069\u003a ${order.phone}`}</Text>
            <Text style={styles.rowText}>{`\u0110\u1ecb\u0061\u0020\u0063\u0068\u1ec9\u003a ${order.address}`}</Text>
            {order.note ? <Text style={styles.noteText}>{`\u0047\u0068\u0069\u0020\u0063\u0068\u00fa\u003a "${order.note}"`}</Text> : null}
          </View>

          <TouchableOpacity style={styles.primaryBtn} onPress={goHome}>
            <House size={16} color="#fff" />
            <Text style={styles.primaryBtnText}>{'\u0056\u1ec1\u0020\u0074\u0072\u0061\u006e\u0067\u0020\u0063\u0068\u1ee7'}</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7FBF8' },
  hero: { paddingBottom: 8 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSpacer: { width: 36 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.secondary },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 24 },
  content: { padding: 16, gap: 14, paddingBottom: 30 },
  successCard: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 22,
    padding: 18,
    alignItems: 'center',
    gap: 4,
  },
  successTitle: { color: '#15803D', fontSize: 18, fontWeight: '700' },
  successText: { color: '#166534', fontSize: 13, textAlign: 'center', lineHeight: 19 },
  countdownText: { color: '#15803D', fontSize: 12, fontWeight: '600', marginTop: 4 },
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 16,
    gap: 10,
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { color: colors.secondary, fontSize: 15, fontWeight: '700' },
  rowText: { color: colors.text, fontSize: 13 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  summaryName: { flex: 1, color: colors.text, fontSize: 13 },
  summaryValue: { color: colors.secondary, fontSize: 13, fontWeight: '700' },
  discountValue: { color: '#16A34A', fontSize: 13, fontWeight: '700' },
  totalLabel: { color: colors.secondary, fontSize: 15, fontWeight: '700' },
  totalValue: { color: colors.primary, fontSize: 16, fontWeight: '700' },
  noteText: { color: '#6B7280', fontStyle: 'italic', marginTop: 4 },
  muted: { color: colors.text, fontSize: 13 },
  errorText: { color: '#EF4444', textAlign: 'center' },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    flexDirection: 'row',
    gap: 8,
  },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});

export default OrderSuccessScreen;
