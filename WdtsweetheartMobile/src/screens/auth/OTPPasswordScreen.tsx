import React, { useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { verifyOTP } from '../../services/api/auth';

const OTPPasswordScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const email = (route.params as { email?: string } | undefined)?.email || '';
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);

    if (!otp.trim()) {
      setError('Vui lòng nhập mã OTP!');
      return;
    }

    if (otp.trim().length !== 6) {
      setError('Mã OTP phải có 6 ký tự!');
      return;
    }

    setLoading(true);
    try {
      const res = await verifyOTP(email, otp.trim());
      if (res.success) {
        navigation.navigate('ResetPassword' as never);
      } else {
        setError(res.message || 'Xác nhận OTP thất bại!');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã có lỗi xảy ra!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.title}>Xác nhận mã OTP</Text>
          <Text style={styles.subtitle}>
            Một mã OTP đã được gửi đến email {email || 'của bạn'}. Vui lòng nhập mã để tiếp tục.
          </Text>

          <View style={styles.form}>
            <TextInput
              placeholder="Nhập 6 ký tự..."
              placeholderTextColor="#999"
              style={styles.input}
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity onPress={handleSubmit} style={styles.submit} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Xác nhận</Text>}
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.link}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.secondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: colors.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  form: {
    gap: 12,
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 40,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.secondary,
  },
  error: {
    color: colors.primary,
    textAlign: 'center',
  },
  submit: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 40,
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontWeight: '700',
  },
  link: {
    textAlign: 'center',
    color: colors.secondary,
    textDecorationLine: 'underline',
  },
});

export default OTPPasswordScreen;
