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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/AuthStack';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignIn'>;

export default function SignInScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  function validate() {
    const e: typeof errors = {};
    if (!email.trim()) e.email = 'Email is required';
    if (!password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSignIn() {
    if (!validate()) return;
    setLoading(true);
    try {
      await signIn(email.trim(), password);
    } catch (err: any) {
      const msg =
        err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password'
          ? 'Invalid email or password'
          : err.code === 'auth/invalid-email'
            ? 'Invalid email format'
            : 'Something went wrong. Please try again.';
      Alert.alert('Sign In Failed', msg);
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
        <Text style={[styles.title, { color: colors.text }]}>Welcome back</Text>
        <Text style={[styles.subtitle, { color: colors.textDim }]}>
          Sign in to your account
        </Text>

        <View style={styles.form}>
          <Input
            label="Email"
            value={email}
            onChangeText={(t: string) => { setEmail(t); setErrors((e) => ({ ...e, email: undefined })); }}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            error={errors.email}
          />
          <View style={{ height: 16 }} />
          <Input
            label="Password"
            value={password}
            onChangeText={(t: string) => { setPassword(t); setErrors((e) => ({ ...e, password: undefined })); }}
            placeholder="••••••••"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            error={errors.password}
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
        </View>

        <Button
          title="Sign In"
          onPress={handleSignIn}
          loading={loading}
          fullWidth
          size="lg"
          style={{ marginTop: 32 }}
        />

        <TouchableOpacity
          onPress={() => navigation.navigate('SignUp')}
          style={styles.linkContainer}
        >
          <Text style={[styles.linkText, { color: colors.textDim }]}>
            Don't have an account?{' '}
            <Text style={{ color: colors.amber }}>Sign Up</Text>
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 0,
    left: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontFamily: 'Audiowide_400Regular',
    fontSize: 28,
    letterSpacing: 1,
  },
  subtitle: {
    fontFamily: 'Karla_400Regular',
    fontSize: 15,
    marginTop: 8,
    marginBottom: 40,
  },
  form: {
    gap: 0,
  },
  linkContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  linkText: {
    fontFamily: 'Karla_400Regular',
    fontSize: 14,
  },
});
