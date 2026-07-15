import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Colors, Spacing, Typography, BorderRadius } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Profile</Text>
      <Text style={styles.email}>{user?.email}</Text>
      <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: Spacing.margin },
  heading: { ...Typography.titleLarge, color: Colors.onSurface, marginBottom: Spacing.space16 },
  email: { ...Typography.bodyMedium, color: Colors.onSurfaceVariant, marginBottom: Spacing.space32 },
  signOutButton: {
    backgroundColor: Colors.error,
    borderRadius: BorderRadius.button,
    paddingVertical: Spacing.space12,
    alignItems: 'center',
  },
  signOutText: { color: Colors.onError, ...Typography.labelLarge },
});
