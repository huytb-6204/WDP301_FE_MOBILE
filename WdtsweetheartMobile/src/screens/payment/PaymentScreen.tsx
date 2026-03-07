import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, CreditCard, MapPin } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { formatPrice } from '../../utils';
import type { RootStackParamList } from '../../navigation/types';

const PaymentScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [cardNumber, setCardNumber] = useState('');

  const totalAmount = 195000; // placeholder

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.headerButton}>
          <ArrowLeft size={20} color={colors.secondary} />
        </Pressable>
        <Text style={styles.headerTitle}>Thanh toán</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionTitle}>Thông tin giao hàng</Text>
        <View style={styles.fieldGroup}>
          <TextInput
            style={styles.input}
            placeholder="Họ và tên"
            value={name}
            onChangeText={setName}
          />
          <View style={styles.inputWrapper}>
            <MapPin size={18} color={colors.text} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, styles.inputWithIcon]}
              placeholder="Địa chỉ"
              value={address}
              onChangeText={setAddress}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Thông tin thanh toán</Text>
        <View style={styles.fieldGroup}>
          <View style={styles.inputWrapper}>
            <CreditCard size={18} color={colors.text} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, styles.inputWithIcon]}
              placeholder="Số thẻ"
              value={cardNumber}
              onChangeText={setCardNumber}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.summary}>
          <Text style={styles.summaryLabel}>Tổng tiền</Text>
          <Text style={styles.summaryValue}>{formatPrice(totalAmount)}</Text>
        </View>

        <Pressable style={styles.payButton} onPress={() => { /* handle payment */ }}>
          <Text style={styles.payText}>Thanh toán</Text>
        </Pressable>
      </ScrollView>
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
  headerTitle: {
    color: colors.secondary,
    fontSize: 18,
    fontWeight: '700',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.softPink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: { padding: 20, paddingBottom: 80 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.secondary,
    marginTop: 20,
    marginBottom: 8,
  },
  fieldGroup: { gap: 12 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
  },
  inputWrapper: { position: 'relative' },
  inputIcon: { position: 'absolute', top: 12, left: 12 },
  inputWithIcon: { paddingLeft: 36 },
  summary: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: { fontSize: 14, color: colors.text },
  summaryValue: { fontSize: 18, fontWeight: '700', color: colors.secondary },
  payButton: {
    marginTop: 30,
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  payText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default PaymentScreen;