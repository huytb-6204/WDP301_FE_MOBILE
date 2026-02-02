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
import { resetPassword } from '../../services/api/auth';

const ResetPasswordScreen = () => {
  const navigation = useNavigation();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = () => {
    if (!password.trim()) return 'Vui lòng nhập mật khẩu mới!';
    if (password.length < 8) return 'Mật khẩu phải có ít nhất 8 ký tự!';
    if (!/[A-Z]/.test(password)) return 'Mật khẩu phải có ít nhất một chữ cái viết hoa!';
    if (!/[a-z]/.test(password)) return 'Mật khẩu phải có ít nhất một chữ cái viết thường!';
    if (!/\d/.test(password)) return 'Mật khẩu phải có ít nhất một chữ số!';
    if (!/[~!@#$%^&*]/.test(password)) return 'Mật khẩu phải có ít nhất một ký tự đặc biệt! (~!@#$%^&*)';
    if (!confirmPassword.trim()) return 'Vui lòng xác nhận mật khẩu!';
    if (password !== confirmPassword) return 'Mật khẩu xác nhận không khớp!';
    return null;
  };

  const handleSubmit = async () => {
    setError(null);
    const message = validate();
    if (message) {
      setError(message);
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword(password);
      if (res.success) {
        navigation.navigate('Login' as never);
      } else {
        setError(res.message || 'Đổi mật khẩu thất bại!');
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
          <Text style={styles.title}>Đặt lại mật khẩu</Text>
          <Text style={styles.subtitle}>Nhập mật khẩu mới cho tài khoản của bạn.</Text>

          <View style={styles.form}>
            <TextInput
              placeholder="Mật khẩu mới"
              placeholderTextColor="#999"
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TextInput
              placeholder="Xác nhận mật khẩu"
              placeholderTextColor="#999"
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity onPress={handleSubmit} style={styles.submit} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Đổi mật khẩu</Text>}
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

export default ResetPasswordScreen;
