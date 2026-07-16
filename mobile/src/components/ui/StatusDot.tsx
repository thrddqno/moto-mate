import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface StatusDotProps {
  status: 'overdue' | 'due-soon' | 'upcoming' | 'ok';
  size?: number;
  pulsing?: boolean;
}

const STATUS_COLORS = {
  overdue: '#FF3D00',
  'due-soon': '#FFB300',
  upcoming: '#00E676',
  ok: '#6B6B6B',
};

export function StatusDot({ status, size = 10, pulsing = false }: StatusDotProps) {
  const color = STATUS_COLORS[status];

  return (
    <View
      style={[
        styles.dot,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          shadowColor: color,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: pulsing ? 0.8 : 0.4,
          shadowRadius: pulsing ? 8 : 4,
          elevation: pulsing ? 6 : 2,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  dot: {},
});
