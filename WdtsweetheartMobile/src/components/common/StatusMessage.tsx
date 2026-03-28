import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';

type Props = {
  message: string;
  actionText?: string;
  onAction?: () => void;
};

const StatusMessage = ({ message, actionText, onAction }: Props) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconDot} />
      <Text style={styles.message}>{message}</Text>
      {actionText && onAction ? (
        <TouchableOpacity onPress={onAction} style={styles.button}>
          <LinearGradient
            colors={[colors.gradientPrimaryStart, colors.gradientPrimaryEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>{actionText}</Text>
          </LinearGradient>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 22,
    paddingHorizontal: 18,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.white,
    shadowColor: colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  iconDot: {
    width: 12,
    height: 12,
    borderRadius: 999,
    marginBottom: 10,
    backgroundColor: colors.primary,
  },
  message: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 10,
    textAlign: 'center',
  },
  button: {
    borderRadius: 999,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
});

export default StatusMessage;
