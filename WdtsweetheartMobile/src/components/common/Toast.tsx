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
          bg: '#E7F5EF',
          border: '#007B55',
          icon: <CheckCircle2 size={20} color="#007B55" />,
          color: '#007B55'
        };
      case 'error':
        return {
          bg: '#FFE7E6',
          border: '#FF4842',
          icon: <XCircle size={20} color="#FF4842" />,
          color: '#B72136'
        };
      case 'warning':
        return {
          bg: '#FFF7CD',
          border: '#B78103',
          icon: <AlertCircle size={20} color="#B78103" />,
          color: '#7A4100'
        };
      case 'info':
      default:
        return {
          bg: '#E0F2FE',
          border: '#1890FF',
          icon: <Info size={20} color="#1890FF" />,
          color: '#04297A'
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
        <Text style={styles.toastText}>{message}</Text>
      </View>
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
    backgroundColor: colors.secondary,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
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
    fontWeight: '600',
    textAlign: 'center',
  },
  closeArea: {
    marginLeft: 8,
    opacity: 0.6
  }
});

export default Toast;
