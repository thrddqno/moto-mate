import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  rightIcon?: React.ReactNode;
}

export function Input({
  label,
  error,
  containerStyle,
  rightIcon,
  style,
  ...props
}: InputProps) {
  const { colors, borderRadius, spacing } = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text
          style={[
            styles.label,
            {
              color: colors.textSecondary,
              marginBottom: spacing.sm,
            },
          ]}
        >
          {label.toUpperCase()}
        </Text>
      )}
      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: colors.surface,
            borderRadius: borderRadius.md,
            borderColor: error
              ? colors.red
              : focused
                ? colors.amber
                : colors.border,
            borderWidth: focused ? 2 : 1,
            flexDirection: 'row',
            alignItems: 'center',
          },
        ]}
      >
        <TextInput
          placeholderTextColor={colors.textDim}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[
            styles.input,
            {
              color: colors.text,
              fontFamily: 'Karla_400Regular',
              fontSize: 15,
              flex: 1,
            },
            style,
          ]}
          {...props}
        />
        {rightIcon && <View style={{ paddingRight: 4 }}>{rightIcon}</View>}
      </View>
      {error && (
        <Text
          style={[
            styles.error,
            {
              color: colors.red,
              marginTop: spacing.xs,
            },
          ]}
        >
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontFamily: 'Karla_700Bold',
    fontSize: 11,
    letterSpacing: 1.5,
  },
  inputWrapper: {
    paddingHorizontal: 14,
  },
  input: {
    height: 48,
    paddingVertical: 0,
  },
  error: {
    fontFamily: 'Karla_400Regular',
    fontSize: 12,
  },
});
