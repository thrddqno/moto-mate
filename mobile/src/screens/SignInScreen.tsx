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
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';
import { Colors, Spacing, Typography, BorderRadius } from '../constants/theme';

export default function SignInScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err: any) {
      const msg =
        err.code === 'auth/user-not-found'
          ? 'No account found with this email'
          : err.code === 'auth/wrong-password'
          ? 'Incorrect password'
          : err.message;
      Alert.alert('Sign In Failed', msg);
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
        <Text style={styles.logo}>Moto Mate</Text>
        <Text style={styles.subtitle}>Track your motorcycle maintenance</Text>

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
          placeholder="Password"
          placeholderTextColor={Colors.outline}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSignIn}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.onPrimary} />
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.link}>
            Don't have an account? <Text style={styles.linkBold}>Sign Up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  inner: { flex: 1, justifyContent: 'center', padding: Spacing.margin },
  logo: { ...Typography.displaySmall, color: Colors.primary, textAlign: 'center', marginBottom: Spacing.space4 },
  subtitle: { ...Typography.bodyLarge, color: Colors.onSurfaceVariant, textAlign: 'center', marginBottom: Spacing.space32 },
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
    marginBottom: Spacing.space16,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: Colors.onPrimary, ...Typography.labelLarge },
  link: { ...Typography.bodyMedium, color: Colors.onSurfaceVariant, textAlign: 'center' },
  linkBold: { color: Colors.primary, fontWeight: '600' },
});
