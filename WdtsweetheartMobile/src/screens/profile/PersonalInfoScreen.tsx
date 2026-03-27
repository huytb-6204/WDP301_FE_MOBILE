import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
<<<<<<< HEAD
import { ArrowLeft, Save, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
=======
import { ArrowLeft, Save } from 'lucide-react-native';
>>>>>>> main
import { useAuth } from '../../context/AuthContext';
import type { RootStackParamList } from '../../navigation/types';
import { getProfile, updateProfile } from '../../services/api/dashboard';
import { colors } from '../../theme/colors';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'PersonalInfo'>;

const phoneRegex = /^(0?)(3[2-9]|5[6|8|9]|7[0|6-9]|8[0-6|8|9]|9[0-4|6-9])[0-9]{7}$/;

const PersonalInfoScreen = () => {
  const navigation = useNavigation<Navigation>();
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const profile = await getProfile();
        setFullName(profile.fullName || '');
        setEmail(profile.email || '');
        setPhone(profile.phone || '');
      } catch {
        setFullName(user?.fullName || '');
        setEmail(user?.email || '');
        setPhone(user?.phone || '');
      } finally {
        setLoading(false);
      }
    };

    void loadProfile();
  }, [user]);

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập họ và tên.');
      return;
    }

    if (fullName.trim().length < 5) {
      Alert.alert('Thiếu thông tin', 'Họ và tên phải có ít nhất 5 ký tự.');
      return;
    }

    if (phone.trim() && !phoneRegex.test(phone.trim())) {
      Alert.alert('Thiếu thông tin', 'Số điện thoại không hợp lệ.');
      return;
    }

    setSaving(true);
    try {
      const profile = await updateProfile({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
      });

      await updateUser({
        fullName: profile.fullName,
        email: profile.email,
        phone: profile.phone,
        avatar: profile.avatar,
      });

      Alert.alert('Thành công', 'Đã cập nhật thông tin cá nhân.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Lỗi', error instanceof Error ? error.message : 'Không thể cập nhật thông tin cá nhân.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color={colors.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông tin cá nhân</Text>
        <View style={styles.headerSpacer} />
      </View>

<<<<<<< HEAD
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
=======
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
>>>>>>> main
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {loading ? (
            <View style={styles.centerWrap}>
              <ActivityIndicator color={colors.primary} />
<<<<<<< HEAD
              <Text style={styles.helperText}>Đang tải hồ sơ của bạn...</Text>
            </View>
          ) : (
            <>
              <LinearGradient
                colors={[colors.gradientSoftStart, colors.gradientSoftEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.heroCard}
              >
                <View style={styles.heroGlow} />
                <View style={styles.heroBadge}>
                  <Sparkles size={14} color={colors.primaryDeep} />
                  <Text style={styles.heroBadgeText}>Hồ sơ của bạn</Text>
                </View>
                <Text style={styles.heroTitle}>Làm hồ sơ nổi bật và đáng tin hơn</Text>
                <Text style={styles.heroSubtitle}>
                  Cập nhật tên và số điện thoại để đặt dịch vụ, mua hàng và theo dõi đơn thuận tiện hơn.
                </Text>
              </LinearGradient>

              <View style={styles.card}>
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Họ và tên</Text>
                  <TextInput
                    style={styles.input}
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="Nhập họ và tên"
                    placeholderTextColor={colors.textLight}
                  />
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={[styles.input, styles.inputDisabled]}
                    value={email}
                    editable={false}
                    placeholder="Email"
                    placeholderTextColor={colors.textLight}
                  />
                  <Text style={styles.helperNote}>Email hiện được khóa chỉnh sửa trên mobile.</Text>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Số điện thoại</Text>
                  <TextInput
                    style={styles.input}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="Nhập số điện thoại"
                    placeholderTextColor={colors.textLight}
                    keyboardType="phone-pad"
                  />
                </View>

                <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
                  <LinearGradient
                    colors={[colors.gradientPrimaryStart, colors.gradientPrimaryEnd]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.saveButtonGradient, saving && styles.saveButtonDisabled]}
                  >
                    {saving ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <>
                        <Save size={16} color="#fff" />
                        <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </>
=======
              <Text style={styles.helperText}>Đang tải thông tin cá nhân...</Text>
            </View>
          ) : (
            <View style={styles.card}>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Họ và tên</Text>
                <TextInput
                  style={styles.input}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Nhập họ và tên"
                  placeholderTextColor="#A0A0A0"
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={[styles.input, styles.inputDisabled]}
                  value={email}
                  editable={false}
                  placeholder="Email"
                  placeholderTextColor="#A0A0A0"
                />
                <Text style={styles.helperNote}>Email hiện được khóa chỉnh sửa trên mobile.</Text>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Số điện thoại</Text>
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Nhập số điện thoại"
                  placeholderTextColor="#A0A0A0"
                  keyboardType="phone-pad"
                />
              </View>

              <TouchableOpacity
                style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Save size={16} color="#fff" />
                    <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
>>>>>>> main
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
<<<<<<< HEAD
    backgroundColor: colors.background,
=======
    backgroundColor: '#fff',
>>>>>>> main
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
<<<<<<< HEAD
    paddingVertical: 12,
    backgroundColor: colors.background,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.cardBorder,
=======
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.softPink,
>>>>>>> main
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: colors.secondary,
    fontSize: 18,
<<<<<<< HEAD
    fontWeight: '800',
  },
  headerSpacer: {
    width: 42,
=======
    fontWeight: '700',
  },
  headerSpacer: {
    width: 40,
>>>>>>> main
  },
  content: {
    flexGrow: 1,
    padding: 16,
<<<<<<< HEAD
    paddingBottom: 28,
=======
>>>>>>> main
  },
  centerWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
<<<<<<< HEAD
    paddingTop: 80,
=======
>>>>>>> main
  },
  helperText: {
    color: colors.text,
    fontSize: 13,
  },
<<<<<<< HEAD
  heroCard: {
    borderRadius: 28,
    padding: 22,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  heroGlow: {
    position: 'absolute',
    top: -28,
    right: -8,
    width: 120,
    height: 120,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    marginBottom: 14,
  },
  heroBadgeText: {
    color: colors.primaryDeep,
    fontSize: 12,
    fontWeight: '800',
  },
  heroTitle: {
    color: colors.secondary,
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 8,
  },
  heroSubtitle: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 21,
  },
  card: {
    borderRadius: 26,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.white,
    padding: 18,
    gap: 16,
    shadowColor: colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
=======
  card: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#fff',
    padding: 18,
    gap: 16,
>>>>>>> main
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    color: colors.secondary,
    fontSize: 13,
<<<<<<< HEAD
    fontWeight: '800',
  },
  input: {
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.backgroundSoft,
=======
    fontWeight: '700',
  },
  input: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#fff',
>>>>>>> main
    paddingHorizontal: 14,
    color: colors.secondary,
    fontSize: 14,
  },
  inputDisabled: {
<<<<<<< HEAD
    backgroundColor: '#F9EFEC',
=======
    backgroundColor: '#F8F8F8',
>>>>>>> main
    color: colors.textLight,
  },
  helperNote: {
    color: colors.textLight,
    fontSize: 12,
<<<<<<< HEAD
    lineHeight: 18,
  },
  saveButton: {
    marginTop: 8,
  },
  saveButtonGradient: {
    minHeight: 52,
    borderRadius: 999,
=======
  },
  saveButton: {
    marginTop: 8,
    minHeight: 48,
    borderRadius: 999,
    backgroundColor: colors.primary,
>>>>>>> main
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
<<<<<<< HEAD
    shadowColor: colors.shadow,
    shadowOpacity: 0.22,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  saveButtonDisabled: {
    opacity: 0.84,
=======
  },
  saveButtonDisabled: {
    opacity: 0.8,
>>>>>>> main
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 15,
<<<<<<< HEAD
    fontWeight: '800',
=======
    fontWeight: '700',
>>>>>>> main
  },
});

export default PersonalInfoScreen;
