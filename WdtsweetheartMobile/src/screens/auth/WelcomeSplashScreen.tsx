import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
          <View style={styles.logoContainer}>
            <Image
              source={require('../../../assets/app_logo.png')}
              style={styles.splashLogo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.mascotAndHeart}>
             <View style={styles.pillBadge}>
                <Text style={styles.pillText}>PREMIUM PET CARE</Text>
             </View>
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
  logoContainer: {
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashLogo: {
    width: 280,
    height: 120,
  },
  mascotAndHeart: {
    marginBottom: 30,
  },
  pillBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  pillText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 17,
    textAlign: 'center',
    marginBottom: 50,
    fontWeight: '500',
  },
  cta: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 36,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  ctaText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '700',
  },
});

export default WelcomeSplashScreen;
