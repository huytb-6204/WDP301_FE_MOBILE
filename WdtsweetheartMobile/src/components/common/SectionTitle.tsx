import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';

type Props = {
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  description?: string;
};

const SectionTitle = ({ title, subtitle, align = 'center', description }: Props) => {
  return (
    <View style={[styles.container, align === 'left' && styles.containerLeft]}>
      {subtitle ? (
        <Text style={[styles.subtitle, align === 'left' && styles.textLeft]}>{subtitle}</Text>
      ) : null}
      <Text style={[styles.title, align === 'left' && styles.textLeft]}>{title}</Text>
      {description ? (
        <Text style={[styles.description, align === 'left' && styles.textLeft]}>{description}</Text>
      ) : null}
      <View style={[styles.underline, align === 'left' && styles.underlineLeft]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 16,
  },
  containerLeft: {
    alignItems: 'flex-start',
  },
  subtitle: {
    color: colors.primary,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  title: {
    color: colors.secondary,
    fontSize: 22,
    fontWeight: '700',
  },
  description: {
    marginTop: 10,
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  textLeft: {
    textAlign: 'left',
  },
  underline: {
    marginTop: 8,
    width: 60,
    height: 3,
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  underlineLeft: {
    alignSelf: 'flex-start',
  },
});

export default SectionTitle;
