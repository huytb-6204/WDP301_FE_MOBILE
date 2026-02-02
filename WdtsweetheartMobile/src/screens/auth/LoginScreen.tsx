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
import { login } from '../../services/api/auth';
import BackArrow from '../../../assets/back-arrow-direction-down-right-left-up-svgrepo-com.svg';

const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

    if (!password.trim()) {
      setError('Vui lòng nhập mật khẩu!');
      return;
    }

    setLoading(true);
    try {
      const user = await login(email.trim(), password, false);
      if (!user) {
        setError('Đăng nhập thất bại!');
      } else {
        navigation.navigate('Home' as never);
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
        <Text style={styles.headerTitle}>Đăng nhập</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <View style={styles.form}>
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
              />
            </View>

            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword' as never)}>
              <Text style={styles.link}>Quên mật khẩu?</Text>
            </TouchableOpacity>

            {error ? <Text style={styles.error}>{error}</Text> : null}
          </View>
        </View>

        <TouchableOpacity onPress={handleSubmit} style={styles.primaryBtn} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>Đăng nhập</Text>}
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>Hoặc đăng nhập với</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.socialStack}>
          <TouchableOpacity style={styles.socialBtn}>
            <View style={[styles.socialIcon, { backgroundColor: '#DB4437' }]}>
              <Text style={styles.socialIconText}>G</Text>
            </View>
            <Text style={styles.socialText}>Tiếp tục với Google</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialBtn}>
            <View style={[styles.socialIcon, { backgroundColor: '#1877F2' }]}>
              <Text style={styles.socialIconText}>f</Text>
            </View>
            <Text style={styles.socialText}>Tiếp tục với Facebook</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialBtn}>
            <View style={[styles.socialIcon, { backgroundColor: '#111' }]}>
              <Text style={styles.socialIconText}></Text>
            </View>
            <Text style={styles.socialText}>Tiếp tục với Apple</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footerText}>
          Chưa có tài khoản?{' '}
          <Text style={styles.footerLink} onPress={() => navigation.navigate('Register' as never)}>
            Đăng ký
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
    borderRadius: 30,
    padding: 18,
    marginBottom: 18,
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
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e6e6e6',
    color: colors.secondary,
  },
  link: {
    color: colors.primary,
    fontSize: 12,
  },
  error: {
    color: colors.primary,
    textAlign: 'center',
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  primaryText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e8e8e8',
  },
  dividerText: {
    color: colors.text,
    fontSize: 12,
  },
  socialStack: {
    gap: 10,
    marginBottom: 16,
  },
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e6e6e6',
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  socialIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialIconText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  socialText: {
    color: colors.secondary,
    fontSize: 14,
    fontWeight: '500',
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

export default LoginScreen;
