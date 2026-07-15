import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../services/firebase';
import { Colors, Spacing, Typography, BorderRadius } from '../constants/theme';

export default function SignUpScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(credential.user, { displayName: name.trim() });
    } catch (err: any) {
      const msg =
        err.code === 'auth/email-already-in-use'
          ? 'An account with this email already exists'
          : err.message;
      Alert.alert('Sign Up Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backLink}>Back to Sign In</Text>
        </TouchableOpacity>

        <Text style={styles.heading}>Create Account</Text>

        <TextInput
          style={styles.input}
          placeholder="Display Name"
          placeholderTextColor={Colors.outline}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={Colors.outline}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        <TextInput
          style={styles.input}
          placeholder="Password (min 6 characters)"
          placeholderTextColor={Colors.outline}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSignUp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.onPrimary} />
          ) : (
            <Text style={styles.buttonText}>Sign Up</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  inner: { flex: 1, justifyContent: 'center', padding: Spacing.margin },
  backLink: { ...Typography.bodyMedium, color: Colors.primary, marginBottom: Spacing.space24 },
  heading: { ...Typography.headlineSmall, color: Colors.onSurface, marginBottom: Spacing.space24 },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    borderRadius: 4,
    paddingHorizontal: Spacing.space16,
    ...Typography.bodyLarge,
    color: Colors.onSurface,
    marginBottom: Spacing.space16,
  },
  button: {
    height: 48,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.button,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.space8,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: Colors.onPrimary, ...Typography.labelLarge },
});
