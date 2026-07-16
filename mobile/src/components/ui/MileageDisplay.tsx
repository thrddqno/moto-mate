import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface MileageDisplayProps {
  mileage: number;
  unit?: 'km' | 'mi';
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export function MileageDisplay({
  mileage,
  unit = 'km',
  size = 'md',
  color,
}: MileageDisplayProps) {
  const { colors } = useTheme();
  const textColor = color || colors.text;

  const fontSize = { sm: 18, md: 28, lg: 40 }[size];
  const unitSize = { sm: 11, md: 14, lg: 18 }[size];
  const lineHeight = { sm: 24, md: 36, lg: 48 }[size];

  const formatted = mileage.toLocaleString();

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.number,
          {
            color: textColor,
            fontSize,
            lineHeight,
          },
        ]}
      >
        {formatted}
      </Text>
      <Text
        style={[
          styles.unit,
          {
            color: colors.textDim,
            fontSize: unitSize,
          },
        ]}
      >
        {unit}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  number: {
    fontFamily: 'JetBrainsMono_700Bold',
    letterSpacing: -1,
  },
  unit: {
    fontFamily: 'Karla_700Bold',
    letterSpacing: 0.5,
  },
});
