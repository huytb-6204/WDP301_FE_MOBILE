import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { ArrowLeft, CircleEllipsis } from 'lucide-react-native';
<<<<<<< HEAD
import { LinearGradient } from 'expo-linear-gradient';
=======
>>>>>>> main
import type { RootStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';

type Navigation = NativeStackNavigationProp<RootStackParamList>;
type ScreenRoute = RouteProp<RootStackParamList, 'AccountFeature'>;

const AccountFeatureScreen = () => {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<ScreenRoute>();
  const { title, description } = route.params;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color={colors.secondary} />
        </Pressable>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
<<<<<<< HEAD
        <LinearGradient
          colors={[colors.gradientSoftStart, colors.gradientSoftEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroGlow} />
          <View style={styles.iconWrap}>
            <CircleEllipsis size={28} color={colors.primaryDeep} />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>
            {description ||
              `${title} đã được tách riêng để hoàn thiện thành một trải nghiệm đầy đủ hơn. Phần này có thể tiếp tục bổ sung logic và dữ liệu chi tiết sau.`}
          </Text>

          <Pressable style={styles.primaryButton} onPress={() => navigation.goBack()}>
            <LinearGradient
              colors={[colors.gradientPrimaryStart, colors.gradientPrimaryEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryButtonGradient}
            >
              <Text style={styles.primaryButtonText}>Quay lại tài khoản</Text>
            </LinearGradient>
          </Pressable>
        </LinearGradient>
=======
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <CircleEllipsis size={26} color={colors.primary} />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>
            {description || `${title} đã được mở riêng trong ứng dụng. Phần nội dung chi tiết có thể tiếp tục hoàn thiện sau.`}
          </Text>
          <Pressable style={styles.primaryButton} onPress={() => navigation.goBack()}>
            <Text style={styles.primaryButtonText}>Quay lại tài khoản</Text>
          </Pressable>
        </View>
>>>>>>> main
      </View>
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
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
<<<<<<< HEAD
  heroCard: {
    borderRadius: 32,
    padding: 28,
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 22,
    elevation: 8,
  },
  heroGlow: {
    position: 'absolute',
    top: -22,
    right: -10,
    width: 130,
    height: 130,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    marginBottom: 18,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
=======
  card: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#fff',
    padding: 24,
    alignItems: 'center',
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.softPink,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
>>>>>>> main
    color: colors.secondary,
    marginBottom: 10,
  },
  description: {
    textAlign: 'center',
    color: colors.text,
    fontSize: 14,
<<<<<<< HEAD
    lineHeight: 23,
    marginBottom: 24,
  },
  primaryButton: {
    minWidth: 210,
  },
  primaryButtonGradient: {
    minHeight: 50,
    paddingHorizontal: 22,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
=======
    lineHeight: 22,
    marginBottom: 20,
  },
  primaryButton: {
    minWidth: 180,
    minHeight: 44,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
>>>>>>> main
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 14,
<<<<<<< HEAD
    fontWeight: '800',
=======
    fontWeight: '700',
>>>>>>> main
  },
});

export default AccountFeatureScreen;
