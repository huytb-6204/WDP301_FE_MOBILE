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
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { forgotPassword } from '../../services/api/auth';

const ForgotPasswordScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);

    if (!email.trim()) {
      setError('Vui lòng nhập email!');
      return;
    }

    if (!email.includes('@')) {
      setError('Email không đúng định dạng!');
      return;
    }

    setLoading(true);
    try {
      const res = await forgotPassword(email.trim());
      if (res.success) {
        navigation.navigate('OTPPassword' as never, { email: email.trim() } as never);
      } else {
        setError(res.message || 'Đã có lỗi xảy ra!');
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
          <Text style={styles.title}>Quên mật khẩu</Text>
          <Text style={styles.subtitle}>
            Quên mật khẩu? Vui lòng nhập email để nhận mã OTP.
          </Text>

          <View style={styles.form}>
            <TextInput
              placeholder="username@gmail.com"
              placeholderTextColor="#999"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity onPress={handleSubmit} style={styles.submit} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Gửi mã OTP</Text>}
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.link}>Quay lại đăng nhập</Text>
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

export default ForgotPasswordScreen;
