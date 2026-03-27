import React, { useState } from 'react';
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
<<<<<<< HEAD
import { ArrowLeft, Lock, Save, ShieldCheck } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
=======
import { ArrowLeft, Lock, Save } from 'lucide-react-native';
>>>>>>> main
import { changePassword } from '../../services/api/dashboard';
import { colors } from '../../theme/colors';

const ChangePasswordScreen = () => {
  const navigation = useNavigation<any>();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu mới không khớp.');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    setSaving(true);
    try {
      await changePassword({ oldPassword, newPassword });
      Alert.alert('Thành công', 'Đã đổi mật khẩu thành công.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Lỗi', error instanceof Error ? error.message : 'Không thể đổi mật khẩu.');
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
        <Text style={styles.headerTitle}>Đổi mật khẩu</Text>
        <View style={styles.headerSpacer} />
      </View>

<<<<<<< HEAD
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <LinearGradient
            colors={[colors.gradientSoftStart, colors.gradientSoftEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.heroHeader}>
              <View style={styles.iconCircle}>
                <ShieldCheck size={24} color={colors.primaryDeep} />
              </View>
              <View style={styles.heroTextWrap}>
                <Text style={styles.heroTitle}>Bảo vệ tài khoản của bạn</Text>
                <Text style={styles.heroSubtitle}>
                  Hãy dùng mật khẩu đủ mạnh, có cả chữ và số để tăng độ an toàn cho phiên đăng nhập.
                </Text>
              </View>
            </View>
          </LinearGradient>
=======
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
                <Lock size={40} color={colors.primary} />
            </View>
            <Text style={styles.helperText}>Mật khẩu của bạn nên bao gồm cả chữ và số để tăng tính bảo mật.</Text>
          </View>
>>>>>>> main

          <View style={styles.card}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Mật khẩu hiện tại</Text>
<<<<<<< HEAD
              <View style={styles.inputShell}>
                <Lock size={18} color={colors.primaryDeep} />
                <TextInput
                  style={styles.input}
                  value={oldPassword}
                  onChangeText={setOldPassword}
                  secureTextEntry
                  placeholder="Nhập mật khẩu hiện tại"
                  placeholderTextColor={colors.textLight}
                />
              </View>
=======
              <TextInput
                style={styles.input}
                value={oldPassword}
                onChangeText={setOldPassword}
                secureTextEntry
                placeholder="Nhập mật khẩu hiện tại"
                placeholderTextColor="#A0A0A0"
              />
>>>>>>> main
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Mật khẩu mới</Text>
<<<<<<< HEAD
              <View style={styles.inputShell}>
                <Lock size={18} color={colors.primaryDeep} />
                <TextInput
                  style={styles.input}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  placeholder="Nhập mật khẩu mới"
                  placeholderTextColor={colors.textLight}
                />
              </View>
=======
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                placeholder="Nhập mật khẩu mới"
                placeholderTextColor="#A0A0A0"
              />
>>>>>>> main
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Xác nhận mật khẩu mới</Text>
<<<<<<< HEAD
              <View style={styles.inputShell}>
                <Lock size={18} color={colors.primaryDeep} />
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  placeholder="Xác nhận mật khẩu mới"
                  placeholderTextColor={colors.textLight}
                />
              </View>
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
                    <Text style={styles.saveButtonText}>Cập nhật mật khẩu</Text>
                  </>
                )}
              </LinearGradient>
=======
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                placeholder="Xác nhận mật khẩu mới"
                placeholderTextColor="#A0A0A0"
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
                  <Text style={styles.saveButtonText}>Cập nhật mật khẩu</Text>
                </>
              )}
>>>>>>> main
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
<<<<<<< HEAD
  safe: { flex: 1, backgroundColor: colors.background },
=======
  safe: { flex: 1, backgroundColor: '#fff' },
>>>>>>> main
  flex: { flex: 1 },
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
  },
  headerTitle: { flex: 1, textAlign: 'center', color: colors.secondary, fontSize: 18, fontWeight: '800' },
  headerSpacer: { width: 42 },
  content: { flexGrow: 1, padding: 16, paddingBottom: 28 },
  heroCard: {
    borderRadius: 28,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 20,
  },
  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTextWrap: {
    flex: 1,
    gap: 6,
  },
  heroTitle: {
    color: colors.secondary,
    fontSize: 22,
    fontWeight: '900',
  },
  heroSubtitle: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 20,
  },
  card: {
    borderRadius: 26,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.white,
    padding: 18,
    gap: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
  fieldGroup: { gap: 8 },
  label: { color: colors.secondary, fontSize: 13, fontWeight: '800' },
  inputShell: {
    minHeight: 52,
    borderRadius: 16,
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
  },
  saveButton: { marginTop: 8 },
  saveButtonGradient: {
    minHeight: 52,
    borderRadius: 999,
=======
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.softPink,
  },
  headerTitle: { flex: 1, textAlign: 'center', color: colors.secondary, fontSize: 18, fontWeight: '700' },
  headerSpacer: { width: 40 },
  content: { flexGrow: 1, padding: 16 },
  iconContainer: { alignItems: 'center', marginVertical: 30, gap: 16 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.softPink, alignItems: 'center', justifyContent: 'center' },
  helperText: { textAlign: 'center', color: colors.textLight, fontSize: 13, paddingHorizontal: 40, lineHeight: 20 },
  card: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    backgroundColor: '#fff',
    padding: 18,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  fieldGroup: { gap: 8 },
  label: { color: colors.secondary, fontSize: 13, fontWeight: '700' },
  input: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    color: colors.secondary,
    fontSize: 14,
  },
  saveButton: {
    marginTop: 8,
    minHeight: 52,
    borderRadius: 999,
    backgroundColor: colors.primary,
>>>>>>> main
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
<<<<<<< HEAD
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 4,
  },
  saveButtonDisabled: { opacity: 0.84 },
  saveButtonText: { color: '#fff', fontSize: 15, fontWeight: '800' },
=======
  },
  saveButtonDisabled: { opacity: 0.8 },
  saveButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
>>>>>>> main
});

export default ChangePasswordScreen;
