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
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(opacity, {
          toValue: 1,
          useNativeDriver: true,
          tension: 80,
          friction: 10
        }),
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 10
        }),
      ]).start();

      const timer = setTimeout(() => {
        if (onHide) onHide();
      }, 4000);

      return () => clearTimeout(timer);
    } else {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 10,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, opacity, translateY, onHide]);

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
      pointerEvents={visible ? 'auto' : 'none'}
      style={[
        styles.toast, 
        { 
          opacity, 
          transform: [{ translateY }],
          backgroundColor: config.bg,
          borderLeftColor: config.border,
        }
      ]}
    >
      <View style={styles.iconArea}>
        {config.icon}
      </View>
      <View style={styles.contentArea}>
        <Text style={[styles.toastText, { color: config.color }]}>{message}</Text>
      </View>
      {onHide && (
          <View style={styles.closeArea}>
            <X size={14} color={config.color} opacity={0.5} />
          </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 40,
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    // Elevation for Android
    elevation: 8,
  },
  iconArea: {
    marginRight: 12,
  },
  contentArea: {
    flex: 1,
  },
  toastText: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  closeArea: {
    marginLeft: 8,
    opacity: 0.6
  }
});

export default Toast;
