import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
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
import { register as registerApi } from '../../services/api/auth';

const bannerImage = {
  uri: 'https://wdtsweetheart.wpengine.com/wp-content/uploads/2025/06/Pet-Daycare-img.jpg',
};

const phoneRegex = /^(0?)(3[2-9]|5[6|8|9]|7[0|6-9]|8[0|6-9]|9[0-4|6-9])[0-9]{7}$/;

const RegisterScreen = () => {
  const navigation = useNavigation();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Image source={bannerImage} style={styles.banner} />
          <Text style={styles.title}>Đăng ký</Text>
          <Text style={styles.subtitle}>Bạn chưa có tài khoản?</Text>

          <View style={styles.form}>
            <TextInput
              placeholder="Họ tên*"
              placeholderTextColor="#999"
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
            />
            <TextInput
              placeholder="Email*"
              placeholderTextColor="#999"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              placeholder="Số điện thoại*"
              placeholderTextColor="#999"
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            <TextInput
              placeholder="Mật khẩu*"
              placeholderTextColor="#999"
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TextInput
              placeholder="Xác nhận mật khẩu*"
              placeholderTextColor="#999"
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}
            {success ? <Text style={styles.success}>{success}</Text> : null}

            <TouchableOpacity onPress={handleSubmit} style={styles.submit} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Đăng ký</Text>}
            </TouchableOpacity>
          </View>

          <Text style={styles.footerText}>
            Bạn đã có tài khoản?{' '}
            <Text style={styles.footerLink} onPress={() => navigation.navigate('Login' as never)}>
              Đăng nhập
            </Text>
          </Text>
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
    backgroundColor: '#e67e20',
    borderRadius: 20,
    padding: 16,
  },
  banner: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  form: {
    gap: 12,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    color: colors.secondary,
  },
  error: {
    color: colors.secondary,
    textAlign: 'center',
  },
  success: {
    color: '#fff',
    textAlign: 'center',
  },
  submit: {
    marginTop: 10,
    backgroundColor: colors.secondary,
    paddingVertical: 14,
    borderRadius: 40,
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontWeight: '700',
  },
  footerText: {
    textAlign: 'center',
    color: '#fff',
    marginTop: 12,
  },
  footerLink: {
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});

export default RegisterScreen;
