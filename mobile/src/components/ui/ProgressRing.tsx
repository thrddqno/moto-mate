import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
}

export function ProgressRing({
  progress,
  size = 48,
  strokeWidth = 3,
  color,
  label,
}: ProgressRingProps) {
  const { colors, typography } = useTheme();
  const clamped = Math.min(100, Math.max(0, progress));
  const ringColor = color || (clamped >= 100 ? colors.red : clamped > 70 ? colors.amber : colors.green);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: colors.surfaceHighlight,
          },
        ]}
      >
        <View
          style={[
            styles.fill,
            {
              width: size - strokeWidth * 2,
              height: size - strokeWidth * 2,
              borderRadius: (size - strokeWidth * 2) / 2,
              borderWidth: strokeWidth,
              borderColor: ringColor,
              borderLeftColor: colors.surfaceHighlight,
              borderBottomColor: colors.surfaceHighlight,
              transform: [{ rotate: `${-90 + (clamped / 100) * 360}deg` }],
            },
          ]}
        />
      </View>
      <View style={styles.center}>
        {label ? (
          <Text
            style={[
              {
                color: colors.textSecondary,
                fontSize: 9,
                fontFamily: 'Karla_700Bold',
                letterSpacing: 0.5,
              },
            ]}
          >
            {label}
          </Text>
        ) : (
          <Text
            style={[
              {
                color: ringColor,
                fontSize: 11,
                fontFamily: 'JetBrainsMono_700Bold',
              },
            ]}
          >
            {Math.round(clamped)}%
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ring: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fill: {
    position: 'absolute',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
