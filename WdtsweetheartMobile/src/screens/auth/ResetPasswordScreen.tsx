import React, { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { resetPassword } from '../../services/api/auth';
import BackArrow from '../../../assets/back-arrow-direction-down-right-left-up-svgrepo-com.svg';

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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <BackArrow width={18} height={18} color={colors.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đặt lại mật khẩu</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.illustration}>
          <Text style={styles.illustrationIcon}>🔐</Text>
        </View>

        <Text style={styles.title}>Tạo mật khẩu mới</Text>
        <Text style={styles.subtitle}>Mật khẩu mới phải khác với mật khẩu cũ</Text>

        <View style={styles.card}>
          <View style={styles.inputWrap}>
            <Text style={styles.inputLabel}>Mật khẩu mới</Text>
            <TextInput
              placeholder="Nhập mật khẩu mới"
              placeholderTextColor="#9aa0a6"
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
          <View style={styles.inputWrap}>
            <Text style={styles.inputLabel}>Xác nhận mật khẩu</Text>
            <TextInput
              placeholder="Nhập lại mật khẩu mới"
              placeholderTextColor="#9aa0a6"
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>
        </View>

        <View style={styles.requirements}>
          <Text style={styles.requirementsTitle}>Mật khẩu phải có:</Text>
          <Text style={styles.requirementsItem}>• Ít nhất 8 ký tự</Text>
          <Text style={styles.requirementsItem}>• Chứa chữ hoa và chữ thường</Text>
          <Text style={styles.requirementsItem}>• Ít nhất 1 số hoặc ký tự đặc biệt</Text>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity onPress={handleSubmit} style={styles.primaryBtn} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>Cập nhật mật khẩu</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 6 : 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: colors.softPink,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: colors.secondary,
    fontSize: 18,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 36,
  },
  container: {
    flexGrow: 1,
    padding: 20,
  },
  illustration: {
    width: 120,
    height: 120,
    borderRadius: 28,
    backgroundColor: colors.softOrange,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  illustrationIcon: {
    fontSize: 48,
  },
  title: {
    textAlign: 'center',
    color: colors.secondary,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6,
  },
  subtitle: {
    textAlign: 'center',
    color: colors.text,
    marginBottom: 16,
  },
  card: {
    backgroundColor: colors.softPink,
    borderRadius: 28,
    padding: 20,
    gap: 12,
    marginBottom: 14,
  },
  inputWrap: {
    gap: 6,
  },
  inputLabel: {
    color: colors.secondary,
    fontSize: 12,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#eee',
    color: colors.secondary,
  },
  requirements: {
    marginBottom: 10,
  },
  requirementsTitle: {
    color: colors.text,
    fontSize: 12,
    marginBottom: 4,
  },
  requirementsItem: {
    color: colors.text,
    fontSize: 12,
  },
  error: {
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default ResetPasswordScreen;
