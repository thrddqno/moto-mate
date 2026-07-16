import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  fullWidth?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  fullWidth = false,
}: ButtonProps) {
  const { colors, borderRadius } = useTheme();

  const bgColor = {
    primary: colors.amber,
    secondary: colors.surfaceElevated,
    ghost: colors.transparent,
    danger: colors.red,
  }[variant];

  const textColor = {
    primary: colors.black,
    secondary: colors.text,
    ghost: colors.amber,
    danger: colors.white,
  }[variant];

  const height = { sm: 36, md: 48, lg: 56 }[size];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        styles.base,
        {
          backgroundColor: disabled ? colors.surfaceHighlight : bgColor,
          borderRadius: borderRadius.md,
          height,
          opacity: disabled ? 0.5 : 1,
          borderWidth: variant === 'ghost' ? 1 : 0,
          borderColor: variant === 'ghost' ? colors.amber : colors.transparent,
        },
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <Text
          style={[
            styles.text,
            {
              color: textColor,
              fontSize: size === 'sm' ? 13 : size === 'lg' ? 16 : 14,
            },
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    fontFamily: 'Karla_700Bold',
    letterSpacing: 0.5,
  },
});
