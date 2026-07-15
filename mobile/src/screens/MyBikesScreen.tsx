import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Spacing, Typography } from '../constants/theme';

export default function MyBikesScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>My Bikes</Text>
      <Text style={styles.placeholder}>Motorcycle list coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: Spacing.margin },
  heading: { ...Typography.titleLarge, color: Colors.onSurface, marginBottom: Spacing.space24 },
  placeholder: { ...Typography.bodyMedium, color: Colors.outline, textAlign: 'center', marginTop: Spacing.space32 },
});
