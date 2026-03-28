import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../../theme/colors';

const WelcomeSplashScreen = () => {
  const navigation = useNavigation();

  return (
    <LinearGradient colors={[colors.primary, '#FF9466']} style={styles.container}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <View style={styles.blobTop} />
      <View style={styles.blobBottom} />

      <SafeAreaView style={styles.safeContent} edges={['top', 'bottom']}>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../../assets/app_logo.png')}
              style={styles.splashLogo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.pillBadge}>
            <Text style={styles.pillText}>PREMIUM PET CARE</Text>
          </View>

          <Text style={styles.subtitle}>Kết nối yêu thương cùng thú cưng</Text>

          <TouchableOpacity
            onPress={() => navigation.navigate('WelcomeChoice' as never)}
            activeOpacity={0.9}
            style={styles.cta}
          >
            <Text style={styles.ctaText}>Bắt đầu trải nghiệm</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  blobTop: {
    position: 'absolute',
    top: -40,
    left: -40,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  blobBottom: {
    position: 'absolute',
    bottom: 50,
    right: -60,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  content: {
    width: '100%',
    alignItems: 'center',
    marginTop: -40, // Offset to visually center better
  },
  logoContainer: {
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashLogo: {
    width: 280,
    height: 120,
  },
  pillBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    marginBottom: 24,
  },
  pillText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 17,
    textAlign: 'center',
    marginBottom: 60,
    lineHeight: 24,
    fontWeight: '500',
    maxWidth: '80%',
  },
  cta: {
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 36,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  ctaText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '800',
  },
});

export default WelcomeSplashScreen;
