import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Spacing, Typography } from '../constants/theme';

export default function HistoryScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>History</Text>
      <Text style={styles.placeholder}>Service history coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: Spacing.margin },
  heading: { ...Typography.titleLarge, color: Colors.onSurface, marginBottom: Spacing.space24 },
  placeholder: { ...Typography.bodyMedium, color: Colors.outline, textAlign: 'center', marginTop: Spacing.space32 },
});
