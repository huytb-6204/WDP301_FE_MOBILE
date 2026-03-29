import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ActivityIndicator, Image, Alert } from 'react-native';
import { ArrowLeft, Phone, Mail, Building2, LogOut, Moon, Sun } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { colors } from '../../../theme/colors';

const StaffProfileScreen = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode, theme } = useTheme();
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await logout();
              navigation.reset({
                index: 0,
                routes: [{ name: 'WelcomeChoice' } as any],
              });
            } catch (error) {
              console.error('Logout failed', error);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  if (!user) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const roleText = (user as any).roles?.[0]?.name || (user.userType === 'staff' ? 'Nhân viên' : 'Người dùng');
  const departmentName = (user as any).departmentId?.name || 'Chưa cập nhật';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Hồ sơ</Text>
        <TouchableOpacity
          onPress={toggleDarkMode}
          style={[styles.themeBtn, { backgroundColor: theme.iconBg, borderColor: theme.border }]}
          activeOpacity={0.8}
        >
          {isDarkMode ? <Sun size={20} color={theme.text} /> : <Moon size={20} color={theme.text} />}
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={[styles.profileCard, { backgroundColor: theme.card, shadowOpacity: isDarkMode ? 0 : 0.05 }]}>
          <Image
            source={{ uri: user.avatar || `https://api.dicebear.com/7.x/avataaars/png?seed=${user.fullName}` }}
            style={[styles.avatar, { backgroundColor: theme.iconBg }]}
          />
          <Text style={[styles.name, { color: theme.text }]}>{user.fullName}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{roleText}</Text>
          </View>
        </View>

        <View style={[styles.infoSection, { backgroundColor: theme.card, shadowOpacity: isDarkMode ? 0 : 0.05 }]}>
          <View style={styles.infoRow}>
            <View style={[styles.iconWrap, { backgroundColor: theme.iconBg }]}>
              <Mail size={20} color={theme.textMuted} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Email</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{user.email}</Text>
            </View>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={styles.infoRow}>
            <View style={[styles.iconWrap, { backgroundColor: theme.iconBg }]}>
              <Phone size={20} color={theme.textMuted} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Số điện thoại</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{user.phone || 'Chưa cập nhật'}</Text>
            </View>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={styles.infoRow}>
            <View style={[styles.iconWrap, { backgroundColor: theme.iconBg }]}>
              <Building2 size={20} color={theme.textMuted} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Phòng ban</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{departmentName}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FF4842" />
          ) : (
            <>
              <LogOut size={20} color="#FF4842" />
              <Text style={styles.logoutText}>Đăng xuất</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
  },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  themeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  content: { flex: 1, padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  profileCard: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowRadius: 5,
  },
  avatar: { width: 96, height: 96, borderRadius: 48, marginBottom: 16, backgroundColor: '#F4F6F8' },
  name: { fontSize: 20, fontWeight: '800', color: '#212B36', marginBottom: 8 },
  roleBadge: { backgroundColor: 'rgba(255, 107, 107, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  roleText: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  infoSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowRadius: 5,
    marginBottom: 24,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  iconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F4F6F8', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 13, color: '#919EAB', fontWeight: '500', marginBottom: 4 },
  infoValue: { fontSize: 15, color: '#212B36', fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#F4F6F8', marginLeft: 56 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFE7E6',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  logoutText: { color: '#FF4842', fontSize: 16, fontWeight: '700' },
});

export default StaffProfileScreen;
