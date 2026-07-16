import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message }: LoadingStateProps) {
  const { colors, spacing } = useTheme();

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.amber} />
      {message && (
        <Text
          style={[
            styles.text,
            {
              color: colors.textSecondary,
              marginTop: spacing.md,
            },
          ]}
        >
          {message}
        </Text>
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
  text: {
    fontFamily: 'Karla_400Regular',
    fontSize: 14,
  },
});
