import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

export default function DashboardScreen({ navigation }: any) {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Moto Mate</Text>
      <Text style={styles.subtitle}>Welcome, {user?.displayName || user?.email || 'Rider'}</Text>
      <Text style={styles.placeholder}>Dashboard coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: Spacing.margin },
  heading: { ...Typography.displaySmall, color: Colors.onSurface, marginBottom: Spacing.space8 },
  subtitle: { ...Typography.bodyLarge, color: Colors.onSurfaceVariant, marginBottom: Spacing.space24 },
  placeholder: { ...Typography.bodyMedium, color: Colors.outline, textAlign: 'center', marginTop: Spacing.space32 },
});
