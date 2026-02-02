import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';

const WelcomeChoiceScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoLetter}>T</Text>
          </View>
          <Text style={styles.logoText}>Teddy Pet</Text>
        </View>

        <View style={styles.body}>
          <View style={styles.hero}>
            <View style={styles.heroRow}>
              <View style={[styles.heroCard, styles.heroCardPrimary]}>
                <Text style={styles.heroIcon}>🐈</Text>
              </View>
              <View style={[styles.heroCard, styles.heroCardSecondary]}>
                <Text style={styles.heroIcon}>🐕</Text>
              </View>
            </View>
            <View style={styles.heartBubble}>
              <Text style={styles.heartBubbleText}>💕</Text>
            </View>
          </View>

          <Text style={styles.title}>Chào mừng bạn</Text>
          <Text style={styles.subtitle}>Đăng nhập hoặc tạo tài khoản để tiếp tục</Text>

          <View style={styles.actions}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Login' as never)}
              activeOpacity={0.9}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryText}>Đăng nhập</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('Register' as never)}
              activeOpacity={0.9}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryText}>Đăng ký</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity onPress={() => navigation.navigate('Home' as never)}>
            <Text style={styles.guest}>Tiếp tục với khách</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.softPink,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  logoCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLetter: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
  logoText: {
    marginLeft: 8,
    color: colors.primary,
    fontSize: 22,
    fontWeight: '700',
  },
  body: {
    alignItems: 'center',
  },
  hero: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 26,
  },
  heroRow: {
    flexDirection: 'row',
    gap: 16,
  },
  heroCard: {
    width: 128,
    height: 128,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  heroCardPrimary: {
    backgroundColor: colors.primary,
  },
  heroCardSecondary: {
    backgroundColor: colors.secondary,
  },
  heroIcon: {
    fontSize: 48,
  },
  heartBubble: {
    position: 'absolute',
    top: -8,
    backgroundColor: '#fff',
    borderRadius: 999,
    padding: 7,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  heartBubbleText: {
    fontSize: 20,
  },
  title: {
    textAlign: 'center',
    color: colors.secondary,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 6,
  },
  subtitle: {
    textAlign: 'center',
    color: colors.text,
    fontSize: 14,
    marginBottom: 22,
  },
  actions: {
    gap: 12,
    width: '100%',
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: 'center',
  },
  primaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  secondaryText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    paddingBottom: 6,
    alignItems: 'center',
  },
  guest: {
    textAlign: 'center',
    color: colors.text,
    fontSize: 12,
  },
});

export default WelcomeChoiceScreen;
