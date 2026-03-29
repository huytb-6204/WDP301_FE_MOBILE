import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Wallet, ShoppingBag, Scissors, Home, TrendingUp, TrendingDown, Clock, ChevronRight } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { getTransactionHistory } from '../../services/api/dashboard';
import { Toast } from '../../components/common';

const TransactionHistoryScreen = () => {
  const navigation = useNavigation<any>();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  };

  const fetchTransactions = async () => {
    try {
      const data = await getTransactionHistory();
      setTransactions(Array.isArray(data) ? data : []);
    } catch (error) {
      showToast('Không thể tải lịch sử giao dịch');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const formatCurrency = (value: number) => 
    `${(value || 0).toLocaleString('vi-VN')} đ`;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentMethodText = (method: string) => {
    const map: any = {
      "cod": "COD",
      "money": "Tiền mặt",
      "vnpay": "VNPay",
      "momo": "Momo",
      "zalopay": "ZaloPay",
      "paypal": "PayPal",
      "prepaid": "Trả trước",
      "pay_at_site": "Thanh toán tại quầy"
    };
    return map[method?.toLowerCase()] || method || "Tiền mặt";
  };

  const getStatusConfig = (status: string) => {
    if (status === 'completed' || status === 'paid') {
      return { text: 'Thành công', bg: '#E8F5E9', color: '#2E7D32' };
    }
    if (status === 'cancelled') {
      return { text: 'Đã hủy', bg: '#FFEBEE', color: '#C62828' };
    }
    return { text: 'Chưa thanh toán', bg: '#FFF3E0', color: '#EF6C00' };
  };

  const renderItem = ({ item }: { item: any }) => {
    const isIncome = item.type === 'deposit' || item.type === 'refund';
    
    let Icon = isIncome ? TrendingUp : TrendingDown;
    let iconBg = isIncome ? '#E8F6EF' : '#FFEBEA';
    
    if (item.type === 'order') {
      Icon = ShoppingBag;
      iconBg = '#EEF2FF';
    } else if (item.type === 'booking') {
      Icon = Scissors;
      iconBg = '#FFF7ED';
    } else if (item.type === 'boarding') {
      Icon = Home;
      iconBg = '#F5F3FF';
    }

    const iconColor = item.type === 'order' ? '#4F46E5' : 
                     item.type === 'booking' ? '#EA580C' : 
                     item.type === 'boarding' ? '#7C3AED' : (isIncome ? '#05A845' : '#FF4D4D');

    const handlePress = () => {
      if (item.type === 'order') {
        navigation.navigate('OrderDetail', { orderId: item._id });
      } else if (item.type === 'booking') {
        navigation.navigate('BookingDetail', { bookingId: item._id });
      } else if (item.type === 'boarding') {
        navigation.navigate('BoardingBookingDetail', { bookingId: item._id });
      }
    };

    const statusConfig = getStatusConfig(item.status);

    return (
      <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.7}>
        {/* Left Side: Icon */}
        <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
          <Icon size={20} color={iconColor} />
        </View>

        {/* Middle: Details */}
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>
            {item.description || 'Giao dịch hệ thống'}
          </Text>
          <Text style={styles.methodText}>
            HT: <Text style={{ fontStyle: 'italic' }}>{getPaymentMethodText(item.method)}</Text>
          </Text>
          <View style={styles.timeBox}>
            <Clock size={12} color="#999" />
            <Text style={styles.time}>{formatDate(item.createdAt)}</Text>
          </View>
        </View>

        {/* Right Side: Amounts & Status Badge */}
        <View style={styles.amountBox}>
          <Text style={[styles.amount, { color: isIncome ? '#05A845' : '#FF6B6B' }]}>
            {formatCurrency(item.amount)}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.text}
            </Text>
          </View>
        </View>

        {/* Arrow to detail */}
        <View style={styles.arrowWrap}>
          <ChevronRight size={18} color="#ccc" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color={colors.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch sử giao dịch</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchTransactions(); }} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Wallet size={70} color="#eee" />
              <Text style={styles.emptyText}>Chưa có giao dịch phát sinh</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  iconWrap: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, marginLeft: 14, marginRight: 8 },
  title: { fontSize: 14, fontWeight: '700', color: colors.secondary, marginBottom: 4, lineHeight: 20 },
  methodText: { fontSize: 13, color: '#888', marginBottom: 6 },
  timeBox: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  time: { fontSize: 12, color: '#999' },
  amountBox: { alignItems: 'flex-end', justifyContent: 'center' },
  amount: { fontSize: 15, fontWeight: '800', marginBottom: 6 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: '700' },
  arrowWrap: { marginLeft: 8, justifyContent: 'center', alignItems: 'center' },
  empty: { alignItems: 'center', justifyContent: 'center', marginTop: 150, gap: 16 },
  emptyText: { fontSize: 16, color: '#aaa', fontWeight: '500' },
});

export default TransactionHistoryScreen;
