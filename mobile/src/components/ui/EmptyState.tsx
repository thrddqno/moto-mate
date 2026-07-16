import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const { colors, spacing } = useTheme();

  return (
    <View style={styles.container}>
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <Text
        style={[
          styles.title,
          {
            color: colors.text,
            marginTop: icon ? spacing.md : 0,
          },
        ]}
      >
        {title}
      </Text>
      {description && (
        <Text
          style={[
            styles.description,
            {
              color: colors.textDim,
              marginTop: spacing.sm,
            },
          ]}
        >
          {description}
        </Text>
      )}
      {actionLabel && onAction && (
        <View style={{ marginTop: spacing.xl }}>
          <Button title={actionLabel} onPress={onAction} />
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
  icon: {
    fontSize: 48,
  },
  title: {
    fontFamily: 'Karla_700Bold',
    fontSize: 18,
    textAlign: 'center',
  },
  description: {
    fontFamily: 'Karla_400Regular',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 260,
  },
});
