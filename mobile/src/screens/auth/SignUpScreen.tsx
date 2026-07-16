import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
  StatusBar,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/AuthStack';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

export default function SignUpScreen({ navigation }: Props) {
  const { colors, borderRadius } = useTheme();
  const insets = useSafeAreaInsets();
  const { signUp } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!email.trim()) e.email = 'Email is required';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'At least 6 characters';
    if (password !== confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSignUp() {
    if (!validate()) return;
    setLoading(true);
    try {
      await signUp(email.trim(), password);
    } catch (err: any) {
      const msg =
        err.code === 'auth/email-already-in-use'
          ? 'This email is already registered'
          : err.code === 'auth/weak-password'
            ? 'Password is too weak'
            : 'Something went wrong. Please try again.';
      Alert.alert('Sign Up Failed', msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />

      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={[styles.backButton, { marginTop: insets.top + 8 }]}
      >
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
        <Text style={[styles.subtitle, { color: colors.textDim }]}>
          Start tracking your maintenance
        </Text>

        <View style={styles.form}>
          <InputField
            label="Email"
            value={email}
            onChangeText={(t: string) => { setEmail(t); setErrors((e: Record<string, string>) => ({ ...e, email: '' })); }}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            error={errors.email}
            colors={colors}
            borderRadius={borderRadius}
          />
          <View style={{ height: 16 }} />
          <InputField
            label="Password"
            value={password}
            onChangeText={(t: string) => { setPassword(t); setErrors((e: Record<string, string>) => ({ ...e, password: '' })); }}
            placeholder="••••••••"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            error={errors.password}
            colors={colors}
            borderRadius={borderRadius}
            rightIcon={
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color={colors.textDim}
                />
              </TouchableOpacity>
            }
          />
          <View style={{ height: 16 }} />
          <InputField
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={(t: string) => { setConfirmPassword(t); setErrors((e: Record<string, string>) => ({ ...e, confirmPassword: '' })); }}
            placeholder="••••••••"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            error={errors.confirmPassword}
            colors={colors}
            borderRadius={borderRadius}
          />
        </View>

        <Button
          title="Create Account"
          onPress={handleSignUp}
          loading={loading}
          fullWidth
          size="lg"
          style={{ marginTop: 32 }}
        />

        <TouchableOpacity
          onPress={() => navigation.navigate('SignIn')}
          style={styles.linkContainer}
        >
          <Text style={[styles.linkText, { color: colors.textDim }]}>
            Already have an account?{' '}
            <Text style={{ color: colors.amber }}>Sign In</Text>
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
}

function InputField({
  label,
  error,
  colors,
  borderRadius: br,
  rightIcon,
  ...props
}: any) {
  return (
    <View style={fieldStyles.container}>
      {label && (
        <Text style={[fieldStyles.label, { color: colors.textSecondary, marginBottom: 8 }]}>
          {label.toUpperCase()}
        </Text>
      )}
      <View
        style={[
          fieldStyles.wrapper,
          {
            backgroundColor: colors.surface,
            borderRadius: br.md,
            borderColor: error ? colors.red : colors.border,
            borderWidth: 1,
          },
        ]}
      >
        <TextInput
          placeholderTextColor={colors.textDim}
          style={[
            fieldStyles.input,
            { color: colors.text, fontFamily: 'Karla_400Regular', fontSize: 15, flex: 1 },
          ]}
          {...props}
        />
        {rightIcon && <View style={{ paddingRight: 14 }}>{rightIcon}</View>}
      </View>
      {error ? (
        <Text style={[fieldStyles.error, { color: colors.red, marginTop: 4 }]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  container: { width: '100%' },
  label: { fontFamily: 'Karla_700Bold', fontSize: 11, letterSpacing: 1.5 },
  wrapper: { paddingLeft: 14, flexDirection: 'row', alignItems: 'center', height: 48 },
  input: { height: 48, paddingVertical: 0 },
  error: { fontFamily: 'Karla_400Regular', fontSize: 12 },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  backButton: {
    position: 'absolute', top: 0, left: 16, zIndex: 10,
    width: 40, height: 40, justifyContent: 'center', alignItems: 'center',
  },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  title: { fontFamily: 'Audiowide_400Regular', fontSize: 28, letterSpacing: 1 },
  subtitle: { fontFamily: 'Karla_400Regular', fontSize: 15, marginTop: 8, marginBottom: 40 },
  form: {},
  linkContainer: { marginTop: 24, alignItems: 'center' },
  linkText: { fontFamily: 'Karla_400Regular', fontSize: 14 },
});
