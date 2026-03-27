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
import { ArrowLeft, Lock, Save } from 'lucide-react-native';
import { changePassword } from '../../services/api/dashboard';
import { colors } from '../../theme/colors';

const ChangePasswordScreen = () => {
  const navigation = useNavigation<any>();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const validate = () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      return 'Vui lòng nhập đầy đủ thông tin.';
    }

    if (newPassword !== confirmPassword) {
      return 'Mật khẩu mới không khớp.';
    }

    if (newPassword.length < 8) {
      return 'Mật khẩu mới phải có ít nhất 8 ký tự.';
    }

    if (!/[A-Z]/.test(newPassword)) {
      return 'Mật khẩu mới phải có ít nhất một chữ hoa.';
    }

    if (!/[a-z]/.test(newPassword)) {
      return 'Mật khẩu mới phải có ít nhất một chữ thường.';
    }

    if (!/\d/.test(newPassword)) {
      return 'Mật khẩu mới phải có ít nhất một chữ số.';
    }

    if (!/[~!@#$%^&*]/.test(newPassword)) {
      return 'Mật khẩu mới phải có ít nhất một ký tự đặc biệt.';
    }

    return null;
  };

  const handleSave = async () => {
    const error = validate();

    if (error) {
      Alert.alert('Lỗi', error);
      return;
    }

    setSaving(true);
    try {
      await changePassword({
        newPassword: newPassword.trim(),
        confirmPassword: confirmPassword.trim(),
      });

      Alert.alert('Thành công', 'Đã đổi mật khẩu thành công.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (submitError) {
      Alert.alert('Lỗi', submitError instanceof Error ? submitError.message : 'Không thể đổi mật khẩu.');
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

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Lock size={40} color={colors.primary} />
            </View>
            <Text style={styles.helperText}>
              Mật khẩu của bạn nên bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt để tăng tính bảo mật.
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Mật khẩu hiện tại</Text>
              <TextInput
                style={styles.input}
                value={oldPassword}
                onChangeText={setOldPassword}
                secureTextEntry
                placeholder="Nhập mật khẩu hiện tại"
                placeholderTextColor="#A0A0A0"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Mật khẩu mới</Text>
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                placeholder="Nhập mật khẩu mới"
                placeholderTextColor="#A0A0A0"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Xác nhận mật khẩu mới</Text>
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
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
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
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.softPink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helperText: {
    textAlign: 'center',
    color: colors.textLight,
    fontSize: 13,
    paddingHorizontal: 40,
    lineHeight: 20,
  },
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
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  saveButtonDisabled: { opacity: 0.8 },
  saveButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});

export default ChangePasswordScreen;
