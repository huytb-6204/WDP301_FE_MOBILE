import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';

const WelcomeSplashScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={[colors.primary, '#FF9466']} style={styles.gradient}>
        <View style={styles.blobTop} />
        <View style={styles.blobBottom} />

        <View style={styles.content}>
          <View style={styles.logoBox}>
            <Text style={styles.logoIcon}>🐾</Text>
          </View>

          <Text style={styles.brand}>Teddy Pet</Text>

          <View style={styles.mascotWrap}>
            <View style={styles.mascotCard}>
              <Text style={styles.mascot}>🐕</Text>
            </View>
            <View style={styles.heartBadge}>
              <Text style={styles.heart}>❤️</Text>
            </View>
          </View>

          <Text style={styles.subtitle}>Kết nối yêu thương cùng thú cưng</Text>

          <TouchableOpacity
            onPress={() => navigation.navigate('WelcomeChoice' as never)}
            activeOpacity={0.9}
            style={styles.cta}
          >
            <Text style={styles.ctaText}>Bắt đầu</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    overflow: 'hidden',
  },
  blobTop: {
    position: 'absolute',
    top: 60,
    left: 24,
    width: 160,
    height: 160,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  blobBottom: {
    position: 'absolute',
    bottom: 120,
    right: 24,
    width: 190,
    height: 190,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  content: {
    width: '100%',
    alignItems: 'center',
  },
  logoBox: {
    width: 92,
    height: 92,
    borderRadius: 32,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
    marginBottom: 12,
  },
  logoIcon: {
    fontSize: 48,
  },
  brand: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 16,
  },
  mascotWrap: {
    marginVertical: 24,
  },
  mascotCard: {
    width: 180,
    height: 180,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascot: {
    fontSize: 80,
  },
  heartBadge: {
    position: 'absolute',
    right: -6,
    bottom: -6,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  heart: {
    fontSize: 26,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  cta: {
    backgroundColor: '#fff',
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 36,
    width: '100%',
    alignItems: 'center',
  },
  ctaText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '600',
  },
});

export default WelcomeSplashScreen;
