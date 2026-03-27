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
import { ArrowLeft, Wallet, TrendingUp, TrendingDown, Clock } from 'lucide-react-native';
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

  const renderItem = ({ item }: { item: any }) => {
    const isIncome = item.type === 'deposit' || item.type === 'refund';
    const amountColor = isIncome ? '#05A845' : '#FF4D4D';
    const Icon = isIncome ? TrendingUp : TrendingDown;

    return (
      <View style={styles.card}>
        <View style={[styles.iconWrap, { backgroundColor: isIncome ? '#E8F6EF' : '#FFEBEA' }]}>
          <Icon size={20} color={amountColor} />
        </View>
        <View style={styles.info}>
          <Text style={styles.title}>{item.description || 'Giao dịch hệ thống'}</Text>
          <View style={styles.timeBox}>
            <Clock size={12} color="#999" />
            <Text style={styles.time}>{formatDate(item.createdAt)}</Text>
          </View>
        </View>
        <View style={styles.amountBox}>
          <Text style={[styles.amount, { color: amountColor }]}>
            {isIncome ? '+' : '-'}{formatCurrency(item.amount)}
          </Text>
          <Text style={styles.status}>{item.status === 'completed' ? 'Thành công' : 'Đang xử lý'}</Text>
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
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  iconWrap: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, marginLeft: 16 },
  title: { fontSize: 15, fontWeight: '700', color: colors.secondary, marginBottom: 4 },
  timeBox: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  time: { fontSize: 12, color: '#999' },
  amountBox: { alignItems: 'flex-end' },
  amount: { fontSize: 16, fontWeight: '800' },
  status: { fontSize: 11, color: '#999', marginTop: 2, fontWeight: '600' },
  empty: { alignItems: 'center', justifyContent: 'center', marginTop: 150, gap: 16 },
  emptyText: { fontSize: 16, color: '#aaa', fontWeight: '500' },
});

export default TransactionHistoryScreen;
