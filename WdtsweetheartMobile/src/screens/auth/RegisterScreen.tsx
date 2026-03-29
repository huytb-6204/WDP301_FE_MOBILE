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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Eye, EyeOff, Lock, Mail, Phone, ShieldCheck, Sparkles, User } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.flex}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <BackArrow width={18} height={18} color={colors.secondary} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Đăng ký</Text>
              <View style={styles.headerSpacer} />
            </View>

            <View style={styles.container}>
              <LinearGradient
                colors={[colors.gradientPrimaryStart, colors.gradientPrimaryEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.heroWrap}
              >
                <View style={styles.heroGlow} />
                <View style={styles.heroBadge}>
                  <Sparkles size={12} color="#fff" />
                  <Text style={styles.heroBadgeText}>Teddy Pet</Text>
                </View>
                <Text style={styles.heroTitle}>Tạo tài khoản</Text>
              </LinearGradient>

              <View style={styles.card}>
                <View style={styles.form}>
                  <View style={styles.inputWrap}>
                    <Text style={styles.inputLabel}>Họ và tên</Text>
                    <View style={styles.inputShell}>
                      <User size={16} color={colors.primaryDeep} />
                      <TextInput
                        placeholder="Nguyễn Văn A"
                        placeholderTextColor={colors.textLight}
                        style={styles.input}
                        value={fullName}
                        onChangeText={setFullName}
                        keyboardType="default"
                        autoCapitalize="words"
                        autoCorrect={true}
                        returnKeyType="next"
                      />
                    </View>
                  </View>

                  <View style={styles.inputWrap}>
                    <Text style={styles.inputLabel}>Email</Text>
                    <View style={styles.inputShell}>
                      <Mail size={16} color={colors.primaryDeep} />
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
                    <Text style={styles.inputLabel}>Số điện thoại</Text>
                    <View style={styles.inputShell}>
                      <Phone size={16} color={colors.primaryDeep} />
                      <TextInput
                        placeholder="0909 123 456"
                        placeholderTextColor={colors.textLight}
                        style={styles.input}
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
                        autoCorrect={false}
                        textContentType="telephoneNumber"
                        returnKeyType="next"
                      />
                    </View>
                  </View>

                  <View style={styles.inputWrap}>
                    <Text style={styles.inputLabel}>Mật khẩu</Text>
                    <View style={styles.inputShell}>
                      <Lock size={16} color={colors.primaryDeep} />
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
                        returnKeyType="next"
                      />
                      <TouchableOpacity
                        onPress={() => setShowPassword((prev) => !prev)}
                        style={styles.eyeButton}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        {showPassword ? <EyeOff size={16} color={colors.text} /> : <Eye size={16} color={colors.text} />}
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.inputWrap}>
                    <Text style={styles.inputLabel}>Xác nhận mật khẩu</Text>
                    <View style={styles.inputShell}>
                      <ShieldCheck size={16} color={colors.primaryDeep} />
                      <TextInput
                        placeholder="Nhập lại mật khẩu"
                        placeholderTextColor={colors.textLight}
                        style={styles.input}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showConfirmPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                        textContentType="password"
                        returnKeyType="done"
                        onSubmitEditing={handleSubmit}
                      />
                      <TouchableOpacity
                        onPress={() => setShowConfirmPassword((prev) => !prev)}
                        style={styles.eyeButton}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        {showConfirmPassword ? <EyeOff size={16} color={colors.text} /> : <Eye size={16} color={colors.text} />}
                      </TouchableOpacity>
                    </View>
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

              <TouchableOpacity onPress={handleSubmit} disabled={loading} activeOpacity={0.92}>
                <LinearGradient
                  colors={[colors.gradientPrimaryStart, colors.gradientPrimaryEnd]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
                >
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>Tạo tài khoản</Text>}
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.footerRow}>
                <Text style={styles.footerText}>Đã có tài khoản?</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
                  <Text style={styles.footerLink}>Đăng nhập ngay</Text>
                </TouchableOpacity>
              </View>
            </View>
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
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: colors.secondary,
    fontSize: 17,
    fontWeight: '800',
  },
  headerSpacer: {
    width: 38,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  heroWrap: {
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  heroGlow: {
    position: 'absolute',
    top: -24,
    right: -12,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 6,
  },
  heroBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
  },
  heroSubtitle: {
    marginTop: 4,
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    lineHeight: 16,
    maxWidth: '94%',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: colors.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  form: {
    gap: 8,
  },
  inputWrap: {
    gap: 4,
  },
  inputLabel: {
    color: colors.secondary,
    fontSize: 11,
    fontWeight: '800',
    paddingLeft: 2,
  },
  inputShell: {
    minHeight: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.backgroundSoft,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    color: colors.secondary,
    fontSize: 13,
    paddingVertical: 8,
  },
  eyeButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    color: colors.danger,
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 14,
    marginTop: 6,
  },
  success: {
    color: colors.success,
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 14,
    marginTop: 6,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    marginBottom: 2,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  checkboxChecked: {
    backgroundColor: colors.primaryDeep,
    borderColor: colors.primaryDeep,
  },
  checkboxIcon: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  checkboxText: {
    flex: 1,
    color: colors.text,
    fontSize: 11,
    lineHeight: 14,
  },
  checkboxLink: {
    color: colors.primaryDeep,
    fontWeight: '700',
  },
  primaryBtn: {
    marginTop: 8,
    borderRadius: 999,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  primaryBtnDisabled: {
    opacity: 0.78,
  },
  primaryText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },
  footerRow: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    color: colors.text,
    fontSize: 12,
  },
  footerLink: {
    color: colors.primaryDeep,
    fontWeight: '800',
    fontSize: 12,
  },
});

export default RegisterScreen;

