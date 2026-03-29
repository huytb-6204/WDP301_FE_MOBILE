import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View, Dimensions } from 'react-native';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react-native';
import { colors } from '../../theme/colors';

const { width } = Dimensions.get('window');

export type ToastType = 'success' | 'error' | 'info' | 'warning';

type ToastProps = {
  visible: boolean;
  message: string;
  type?: ToastType;
  onHide?: () => void;
};

const Toast = ({ visible, message, type = 'info', onHide }: ToastProps) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;

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
    ]).start();
  }, [opacity, translateY, visible]);

  if (!message && !visible) return null;

  const getConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle2 size={20} color={colors.success} />,
          color: colors.success
        };
      case 'error':
        return {
          icon: <XCircle size={20} color={colors.danger} />,
          color: colors.danger
        };
      case 'warning':
        return {
          icon: <AlertCircle size={20} color={colors.warning} />,
          color: colors.warning
        };
      case 'info':
      default:
        return {
          icon: <Info size={20} color="#38BDF8" />, // A nice light blue for info
          color: '#38BDF8'
        };
    }
  };

  const config = getConfig();

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.toast, { opacity, transform: [{ translateY }] }]}
    >
      <View style={styles.toastInner}>
        {config.icon}
        <Text style={styles.toastText}>{message}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  toastInner: {
    backgroundColor: 'rgba(33, 43, 54, 0.92)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    maxWidth: width * 0.85,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  toastText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default Toast;
