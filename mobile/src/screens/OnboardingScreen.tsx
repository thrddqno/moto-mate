import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { updateProfile } from 'firebase/auth';
import { auth } from '../services/firebase';
import { Colors, Spacing, Typography, BorderRadius } from '../constants/theme';

export default function OnboardingScreen() {
  const [displayName, setDisplayName] = useState(auth.currentUser?.displayName || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!displayName.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    setLoading(true);
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: displayName.trim() });
      }
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Welcome to Moto Mate</Text>
      <Text style={styles.subtitle}>Let's set up your profile</Text>

      <TextInput
        style={styles.input}
        placeholder="Your display name"
        placeholderTextColor={Colors.outline}
        value={displayName}
        onChangeText={setDisplayName}
        autoCapitalize="words"
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSave}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={Colors.onPrimary} />
        ) : (
          <Text style={styles.buttonText}>Get Started</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: Spacing.margin, justifyContent: 'center' },
  heading: { ...Typography.headlineMedium, color: Colors.onSurface, textAlign: 'center', marginBottom: Spacing.space8 },
  subtitle: { ...Typography.bodyLarge, color: Colors.onSurfaceVariant, textAlign: 'center', marginBottom: Spacing.space32 },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    borderRadius: 4,
    paddingHorizontal: Spacing.space16,
    ...Typography.bodyLarge,
    color: Colors.onSurface,
    marginBottom: Spacing.space24,
  },
  button: {
    height: 48,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: Colors.onPrimary, ...Typography.labelLarge },
});
