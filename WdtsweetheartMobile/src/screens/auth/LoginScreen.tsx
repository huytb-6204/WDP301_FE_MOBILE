import React, { useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { env } from '../../config';
import { login, loginWithGoogleToken } from '../../services/api/auth';
import { tokenStorage } from '../../services/auth/token';
import type { RootStackParamList } from '../../navigation/types';
import BackArrow from '../../../assets/back-arrow-direction-down-right-left-up-svgrepo-com.svg';
import GoogleLogo from '../../../assets/google-logo.svg';

WebBrowser.maybeCompleteAuthSession();

const LoginScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<null | 'google'>(null);
  const [error, setError] = useState<string | null>(null);

  const redirectUri = AuthSession.makeRedirectUri({
    useProxy: true,
    projectNameForProxy: '@huytran62044/wdtsweetheart-mobile',
  });

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
        navigation.navigate('Home');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Đã có lỗi xảy ra. Vui lòng thử lại sau!';
      setError(`${message} (API: ${env.apiBaseUrl})`);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);

    if (!env.googleClientId) {
      setError('Thiếu cấu hình GOOGLE_CLIENT_ID trong .env');
      return;
    }

    setSocialLoading('google');
    try {
      const request = new AuthSession.AuthRequest({
        clientId: env.googleClientId,
        redirectUri,
        responseType: AuthSession.ResponseType.Code,
        scopes: ['openid', 'email', 'profile'],
        usePKCE: false,
        extraParams: {
          prompt: 'consent',
        },
      });

      const discovery = { authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth' };
      const result = await request.promptAsync(discovery, {
        useProxy: true,
        projectNameForProxy: '@huytran62044/wdtsweetheart-mobile',
      });

      if (result.type !== 'success') {
        setError('Đăng nhập Google bị hủy hoặc chưa hoàn tất.');
        return;
      }

      const accessToken = result.params?.access_token;
      const authCode = result.params?.code;

      if (!accessToken && !authCode) {
        setError('Không lấy được Google token.');
        return;
      }

      const { token } = await loginWithGoogleToken(
        accessToken
          ? { accessToken }
          : { authCode: authCode!, redirectUri }
      );
      if (!token) {
        setError('Đăng nhập Google thất bại!');
        return;
      }
      const storedToken = await tokenStorage.get();
      if (!storedToken) {
        setError('Không lưu được phiên đăng nhập. Vui lòng thử lại.');
        return;
      }
      navigation.navigate('Home', { initialTab: 'home' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Đã có lỗi xảy ra. Vui lòng thử lại sau!';
      setError(message);
      console.warn('Google login error:', err);
    } finally {
      setSocialLoading(null);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.flex}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <BackArrow width={18} height={18} color={colors.secondary} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Đăng nhập</Text>
              <View style={styles.headerSpacer} />
            </View>

            <ScrollView
              contentContainerStyle={styles.container}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.heroWrap}>
                <View style={styles.heroGlow} />
                <Text style={styles.heroTitle}>Chào mừng trở lại</Text>
                <Text style={styles.heroSubtitle}>Đăng nhập để quản lý đặt lịch, giỏ hàng và hồ sơ thú cưng</Text>
              </View>

              <View style={styles.card}>
                <View style={styles.form}>
                  <View style={styles.inputWrap}>
                    <Text style={styles.inputLabel}>Email</Text>
                    <View style={styles.inputShell}>
                      <Mail size={18} color={colors.text} />
                      <TextInput
                        placeholder="example@email.com"
                        placeholderTextColor="#9aa0a6"
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        textContentType="emailAddress"
                        returnKeyType="next"
                      />
                    </View>
                  </View>

                  <View style={styles.inputWrap}>
                    <Text style={styles.inputLabel}>Mật khẩu</Text>
                    <View style={styles.inputShell}>
                      <Lock size={18} color={colors.text} />
                      <TextInput
                        placeholder="Nhập mật khẩu"
                        placeholderTextColor="#9aa0a6"
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                        textContentType="password"
                        returnKeyType="done"
                        onSubmitEditing={handleSubmit}
                      />
                      <TouchableOpacity
                        onPress={() => setShowPassword((prev) => !prev)}
                        style={styles.eyeButton}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        {showPassword ? (
                          <EyeOff size={18} color={colors.text} />
                        ) : (
                          <Eye size={18} color={colors.text} />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.forgotWrap}
                    onPress={() => navigation.navigate('ForgotPassword')}
                  >
                    <Text style={styles.link}>Quên mật khẩu?</Text>
                  </TouchableOpacity>

                  {error ? <Text style={styles.error}>{error}</Text> : null}

                  <TouchableOpacity
                    onPress={handleSubmit}
                    style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
                    disabled={loading}
                    activeOpacity={0.9}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.primaryText}>Đăng nhập</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.socialSection}>
                <View style={styles.socialDivider}>
                  <View style={styles.socialDividerLine} />
                  <Text style={styles.socialDividerText}>Hoặc đăng nhập bằng</Text>
                  <View style={styles.socialDividerLine} />
                </View>

                <TouchableOpacity
                  onPress={handleGoogleLogin}
                  style={[
                    styles.socialButton,
                    styles.socialButtonGoogle,
                    socialLoading && styles.socialButtonDisabled,
                  ]}
                  disabled={!!socialLoading}
                  activeOpacity={0.9}
                >
                  <View style={styles.socialButtonContent}>
                    <GoogleLogo width={20} height={20} />
                    <Text style={[styles.socialButtonText, styles.socialButtonTextDark]}>
                      Tiếp tục với Google
                    </Text>
                  </View>
                  {socialLoading === 'google' ? (
                    <ActivityIndicator
                      size="small"
                      color="#1f1f1f"
                      style={styles.socialButtonLoadingIndicator}
                    />
                  ) : null}
                </TouchableOpacity>
              </View>

              <View style={styles.footerRow}>
                <Text style={styles.footerText}>Chưa có tài khoản?</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                  <Text style={styles.footerLink}>Đăng ký ngay</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
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
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: colors.secondary,
    fontSize: 18,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 40,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
  },
  heroWrap: {
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 18,
    marginBottom: 14,
    backgroundColor: '#FFF7F7',
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    top: -20,
    right: -14,
    width: 120,
    height: 120,
    borderRadius: 999,
    backgroundColor: '#FFDCDC',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.secondary,
  },
  heroSubtitle: {
    marginTop: 6,
    color: colors.text,
    fontSize: 13,
    lineHeight: 20,
    maxWidth: '92%',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f1f1',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
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
    fontWeight: '700',
    paddingLeft: 2,
  },
  inputShell: {
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E7E7E7',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    flex: 1,
    color: colors.secondary,
    fontSize: 14,
    paddingVertical: 12,
  },
  eyeButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  forgotWrap: {
    alignSelf: 'flex-end',
    marginTop: 2,
  },
  link: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  error: {
    color: colors.primary,
    textAlign: 'center',
    fontSize: 12,
  },
  primaryBtn: {
    marginTop: 4,
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.26,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  primaryBtnDisabled: {
    opacity: 0.75,
  },
  primaryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  footerRow: {
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    color: colors.text,
    fontSize: 13,
  },
  footerLink: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  socialSection: {
    marginTop: 18,
    gap: 10,
  },
  socialDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  socialDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e7e7e7',
  },
  socialDividerText: {
    color: '#9a9a9a',
    fontSize: 12,
    fontWeight: '600',
  },
  socialButton: {
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  socialButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  socialButtonLoadingIndicator: {
    position: 'absolute',
    right: 16,
  },
  socialButtonDisabled: {
    opacity: 0.7,
  },
  socialButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  socialButtonTextDark: {
    color: '#1f1f1f',
  },
  socialButtonGoogle: {
    backgroundColor: '#fff',
    borderColor: '#e1e1e1',
  },
});

export default LoginScreen;
