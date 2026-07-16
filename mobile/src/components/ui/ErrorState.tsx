import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Button } from './Button';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  const { colors, spacing } = useTheme();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: colors.redDim, borderColor: colors.red },
        ]}
      >
        <Text style={[styles.icon, { color: colors.red }]}>!</Text>
      </View>
      <Text
        style={[
          styles.message,
          {
            color: colors.text,
            marginTop: spacing.md,
          },
        ]}
      >
        {message}
      </Text>
      {onRetry && (
        <View style={{ marginTop: spacing.xl }}>
          <Button
            title="Try Again"
            onPress={onRetry}
            variant="secondary"
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    color: '#FF3D00',
    fontSize: 28,
    fontFamily: 'Karla_700Bold',
  },
  message: {
    fontFamily: 'Karla_400Regular',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
});
