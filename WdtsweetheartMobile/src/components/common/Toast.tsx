import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';

type ToastProps = {
  visible: boolean;
  message: string;
};

const Toast = ({ visible, message }: ToastProps) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;
  const scale = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: visible ? 1 : 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: visible ? 0 : 10,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: visible ? 1 : 0.96,
        useNativeDriver: true,
        speed: 16,
        bounciness: 7,
      }),
    ]).start();
  }, [opacity, scale, translateY, visible]);

  if (!message) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.toast, { opacity, transform: [{ translateY }, { scale }] }]}
    >
      <LinearGradient
        colors={[colors.gradientPrimaryStart, colors.gradientPrimaryEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.toastInner}
      >
        <View style={styles.toastGlow} />
        <Text style={styles.toastText}>{message}</Text>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 24,
    zIndex: 20,
  },
  toastInner: {
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOpacity: 0.28,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  toastGlow: {
    position: 'absolute',
    top: -12,
    right: -8,
    width: 72,
    height: 72,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  toastText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default Toast;
