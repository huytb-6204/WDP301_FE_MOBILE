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
import { register as registerApi } from '../../services/api/auth';
import BackArrow from '../../../assets/back-arrow-direction-down-right-left-up-svgrepo-com.svg';

const phoneRegex = /^(0?)(3[2-9]|5[6|8|9]|7[0|6-9]|8[0|6-9]|9[0-4|6-9])[0-9]{7}$/;

const RegisterScreen = () => {
  const navigation = useNavigation();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const validate = () => {
    if (!fullName.trim()) return 'Vui lòng nhập họ tên!';
    if (fullName.trim().length < 5) return 'Họ tên phải có ít nhất 5 ký tự!';
    if (fullName.trim().length > 50) return 'Họ tên không được vượt quá 50 ký tự!';
    if (!email.trim()) return 'Vui lòng nhập email!';
    if (!email.includes('@')) return 'Email không đúng định dạng!';
    if (!phone.trim()) return 'Vui lòng nhập số điện thoại!';
    if (!phoneRegex.test(phone.trim())) return 'Số điện thoại không đúng định dạng!';
    if (!password.trim()) return 'Vui lòng nhập mật khẩu!';
    if (password.length < 8) return 'Mật khẩu phải có ít nhất 8 ký tự!';
    if (!/[A-Z]/.test(password)) return 'Mật khẩu phải có ít nhất một chữ cái viết hoa!';
    if (!/[a-z]/.test(password)) return 'Mật khẩu phải có ít nhất một chữ cái viết thường!';
    if (!/\d/.test(password)) return 'Mật khẩu phải có ít nhất một chữ số!';
    if (!/[~!@#$%^&*]/.test(password)) return 'Mật khẩu phải có ít nhất một ký tự đặc biệt! (~!@#$%^&*)';
    if (!confirmPassword.trim()) return 'Vui lòng xác nhận mật khẩu!';
    if (password !== confirmPassword) return 'Mật khẩu xác nhận không khớp!';
    if (!agreed) return 'Vui lòng đồng ý với điều khoản!';
    return null;
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);
    const message = validate();
    if (message) {
      setError(message);
      return;
    }

    setLoading(true);
    try {
      const response = await registerApi({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
      });

      if (response.success) {
        setSuccess(response.message || 'Đăng ký thành công! Vui lòng đăng nhập.');
        navigation.navigate('Login' as never);
      } else {
        setError(response.message || 'Đăng ký thất bại!');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã có lỗi xảy ra. Vui lòng thử lại sau!');
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
        <Text style={styles.headerTitle}>Đăng ký</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="always">
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tạo tài khoản</Text>
          <Text style={styles.cardSubtitle}>Điền đầy đủ thông tin để đăng ký</Text>

          <View style={styles.form}>
            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>Họ và tên</Text>
              <TextInput
                placeholder="Nguyễn Văn A"
                placeholderTextColor="#9aa0a6"
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                keyboardType="default"
                autoCapitalize="words"
                autoCorrect={true}
              />
            </View>

            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                placeholder="example@email.com"
                placeholderTextColor="#9aa0a6"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>Số điện thoại</Text>
              <TextInput
                placeholder="0909 123 456"
                placeholderTextColor="#9aa0a6"
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>Mật khẩu</Text>
              <TextInput
                placeholder="Nhập mật khẩu"
                placeholderTextColor="#9aa0a6"
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                keyboardType="default"
              />
            </View>

            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>Xác nhận mật khẩu</Text>
              <TextInput
                placeholder="Nhập lại mật khẩu"
                placeholderTextColor="#9aa0a6"
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                keyboardType="default"
              />
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.checkboxRow} onPress={() => setAgreed((prev) => !prev)}>
          <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
            {agreed ? <Text style={styles.checkboxIcon}>✓</Text> : null}
          </View>
          <Text style={styles.checkboxText}>
            Tôi đồng ý với <Text style={styles.checkboxLink}>Điều khoản dịch vụ</Text> và{' '}
            <Text style={styles.checkboxLink}>Chính sách bảo mật</Text>
          </Text>
        </TouchableOpacity>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {success ? <Text style={styles.success}>{success}</Text> : null}

        <TouchableOpacity onPress={handleSubmit} style={styles.primaryBtn} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>Tạo tài khoản</Text>}
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Đã có tài khoản?{' '}
          <Text style={styles.footerLink} onPress={() => navigation.navigate('Login' as never)}>
            Đăng nhập
          </Text>
        </Text>
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
  card: {
    backgroundColor: colors.softPink,
    borderRadius: 28,
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.secondary,
    textAlign: 'center',
  },
  cardSubtitle: {
    color: colors.text,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 16,
  },
  form: {
    gap: 12,
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
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxIcon: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  checkboxText: {
    flex: 1,
    color: colors.text,
    fontSize: 12,
  },
  checkboxLink: {
    color: colors.primary,
    fontWeight: '600',
  },
  error: {
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 6,
  },
  success: {
    color: colors.secondary,
    textAlign: 'center',
    marginBottom: 6,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  primaryText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  footerText: {
    textAlign: 'center',
    color: colors.text,
    fontSize: 12,
  },
  footerLink: {
    color: colors.primary,
    fontWeight: '600',
  },
});

export default RegisterScreen;
