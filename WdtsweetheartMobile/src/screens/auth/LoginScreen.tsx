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
import { Eye, EyeOff, Lock, Mail, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
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

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate('WelcomeChoice');
  };

  const redirectUri = AuthSession.makeRedirectUri();

  const handleSubmit = async () => {
    setError(null);

    if (!email.trim()) {
      setError('Vui lòng nhập email.');
      return;
    }

    if (!email.includes('@')) {
      setError('Email không đúng định dạng.');
      return;
    }

    if (!password.trim()) {
      setError('Vui lòng nhập mật khẩu.');
      return;
    }

    setLoading(true);
    try {
      const user = await login(email.trim(), password, false);
      if (!user) {
        setError('Đăng nhập thất bại.');
      } else {
        navigation.navigate('Home');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Đã có lỗi xảy ra. Vui lòng thử lại sau.';
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
      const result = await request.promptAsync(discovery);

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

      const { token } = await loginWithGoogleToken(accessToken ? { accessToken } : { authCode: authCode!, redirectUri });
      if (!token) {
        setError('Đăng nhập Google thất bại.');
        return;
      }
      const storedToken = await tokenStorage.get();
      if (!storedToken) {
        setError('Không lưu được phiên đăng nhập. Vui lòng thử lại.');
        return;
      }
      navigation.navigate('Home', { initialTab: 'home' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Đã có lỗi xảy ra. Vui lòng thử lại sau.';
      setError(message);
      console.warn('Google login error:', err);
    } finally {
      setSocialLoading(null);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.flex}>
            <View style={styles.header}>
              <TouchableOpacity onPress={handleBack} style={styles.backButton}>
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
              <LinearGradient
                colors={[colors.gradientPrimaryStart, colors.gradientPrimaryEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.heroWrap}
              >
                <View style={styles.heroGlow} />
                <View style={styles.heroBadge}>
                  <Sparkles size={14} color="#fff" />
                  <Text style={styles.heroBadgeText}>Teddy Pet</Text>
                </View>
                <Text style={styles.heroTitle}>Chào mừng trở lại</Text>
                <Text style={styles.heroSubtitle}>
                  Đăng nhập để quản lý đặt lịch, giỏ hàng và hồ sơ thú cưng trong cùng một không gian.
                </Text>
              </LinearGradient>

              <View style={styles.card}>
                <View style={styles.form}>
                  <View style={styles.inputWrap}>
                    <Text style={styles.inputLabel}>Email</Text>
                    <View style={styles.inputShell}>
                      <Mail size={18} color={colors.primaryDeep} />
                      <TextInput
                        placeholder="example@email.com"
                        placeholderTextColor={colors.textLight}
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
                      <Lock size={18} color={colors.primaryDeep} />
                      <TextInput
                        placeholder="Nhập mật khẩu"
                        placeholderTextColor={colors.textLight}
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
                        {showPassword ? <EyeOff size={18} color={colors.text} /> : <Eye size={18} color={colors.text} />}
                      </TouchableOpacity>
                    </View>
                  </View>

                  <TouchableOpacity style={styles.forgotWrap} onPress={() => navigation.navigate('ForgotPassword')}>
                    <Text style={styles.link}>Quên mật khẩu?</Text>
                  </TouchableOpacity>

                  {error ? <Text style={styles.error}>{error}</Text> : null}

                  <TouchableOpacity onPress={handleSubmit} disabled={loading} activeOpacity={0.92}>
                    <LinearGradient
                      colors={[colors.gradientPrimaryStart, colors.gradientPrimaryEnd]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
                    >
                      {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>Đăng nhập</Text>}
                    </LinearGradient>
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
                  style={[styles.socialButton, socialLoading && styles.socialButtonDisabled]}
                  disabled={!!socialLoading}
                  activeOpacity={0.9}
                >
                  <View style={styles.socialButtonContent}>
                    <GoogleLogo width={20} height={20} />
                    <Text style={styles.socialButtonText}>Tiếp tục với Google</Text>
                  </View>
                  {socialLoading === 'google' ? (
                    <ActivityIndicator size="small" color={colors.secondary} style={styles.socialButtonLoadingIndicator} />
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
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.background,
  },
  backButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: colors.secondary,
    fontSize: 18,
    fontWeight: '800',
  },
  headerSpacer: {
    width: 42,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
  },
  heroWrap: {
    borderRadius: 28,
    paddingVertical: 22,
    paddingHorizontal: 20,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOpacity: 0.16,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  heroGlow: {
    position: 'absolute',
    top: -24,
    right: -12,
    width: 130,
    height: 130,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    marginBottom: 14,
  },
  heroBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
  },
  heroSubtitle: {
    marginTop: 8,
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    lineHeight: 20,
    maxWidth: '94%',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 28,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
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
    fontWeight: '800',
    paddingLeft: 2,
  },
  inputShell: {
    minHeight: 54,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.backgroundSoft,
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
    color: colors.primaryDeep,
    fontSize: 12,
    fontWeight: '700',
  },
  error: {
    color: colors.danger,
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 18,
  },
  primaryBtn: {
    marginTop: 6,
    borderRadius: 999,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOpacity: 0.24,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  primaryBtnDisabled: {
    opacity: 0.78,
  },
  primaryText: {
    color: '#fff',
    fontWeight: '800',
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
    color: colors.primaryDeep,
    fontWeight: '800',
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
    backgroundColor: colors.cardBorder,
  },
  socialDividerText: {
    color: colors.textLight,
    fontSize: 12,
    fontWeight: '700',
  },
  socialButton: {
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.white,
    shadowColor: colors.shadow,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
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
    color: colors.secondary,
    fontSize: 14,
    fontWeight: '800',
  },
});

export default LoginScreen;
