import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'highlight';
}

export function Card({ children, style, variant = 'default' }: CardProps) {
  const { colors, borderRadius } = useTheme();

  const bgColor = {
    default: colors.surface,
    elevated: colors.surfaceElevated,
    highlight: colors.surfaceHighlight,
  }[variant];

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: bgColor,
          borderRadius: borderRadius.lg,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    padding: 16,
  },
});
