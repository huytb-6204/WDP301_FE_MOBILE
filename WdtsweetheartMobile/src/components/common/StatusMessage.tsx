import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../theme/colors';

type Props = {
  message: string;
  actionText?: string;
  onAction?: () => void;
};

const StatusMessage = ({ message, actionText, onAction }: Props) => {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>
      {actionText && onAction ? (
        <TouchableOpacity onPress={onAction} style={styles.button}>
          <Text style={styles.buttonText}>{actionText}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  message: {
    color: colors.text,
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default StatusMessage;
