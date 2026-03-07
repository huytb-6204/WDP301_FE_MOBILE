import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, CreditCard } from 'lucide-react-native';
import { colors } from '../../theme/colors';

const PaymentScreen = () => {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <ArrowLeft size={20} color={colors.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thanh toán</Text>
        <View style={styles.headerButton} />
      </View>

      <View style={styles.body}>
        <View style={styles.iconCircle}>
          <CreditCard size={32} color={colors.primary} />
        </View>
        <Text style={styles.title}>Màn hình thanh toán</Text>
        <Text style={styles.desc}>
          Bạn có thể tích hợp các phương thức thanh toán tại đây.
        </Text>
        <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.primaryButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F1F1',
    backgroundColor: '#fff',
  },
  headerTitle: { color: colors.secondary, fontSize: 18, fontWeight: '700' },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.softPink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.softPink,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: { color: colors.secondary, fontSize: 18, fontWeight: '700' },
  desc: {
    color: colors.text,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  primaryButton: {
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
});

export default PaymentScreen;
