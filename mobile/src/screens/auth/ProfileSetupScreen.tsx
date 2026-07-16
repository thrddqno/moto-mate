import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';

export default function ProfileSetupScreen() {
  const { colors, borderRadius } = useTheme();
  const insets = useSafeAreaInsets();
  const { syncProfile } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    try {
      await syncProfile({ displayName: displayName.trim() || undefined });
    } catch {
      // Error handled by context / interceptor
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <Text style={[styles.title, { color: colors.text }]}>Set up your profile</Text>
        <Text style={[styles.subtitle, { color: colors.textDim }]}>
          What should we call you?
        </Text>

        <View style={{ marginTop: 40 }}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            DISPLAY NAME
          </Text>
          <View
            style={[
              styles.inputWrapper,
              {
                backgroundColor: colors.surface,
                borderRadius: borderRadius.md,
                borderColor: colors.border,
                borderWidth: 1,
              },
            ]}
          >
            <TextInput
              placeholderTextColor={colors.textDim}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Rider"
              style={[
                styles.input,
                { color: colors.text, fontFamily: 'Karla_400Regular', fontSize: 15 },
              ]}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>
        </View>

        <Button
          title={displayName.trim() ? "Let's Go" : 'Skip'}
          onPress={handleSave}
          loading={loading}
          fullWidth
          size="lg"
          style={{ marginTop: 40 }}
        />
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  title: { fontFamily: 'Audiowide_400Regular', fontSize: 28, letterSpacing: 1 },
  subtitle: { fontFamily: 'Karla_400Regular', fontSize: 15, marginTop: 8 },
  label: { fontFamily: 'Karla_700Bold', fontSize: 11, letterSpacing: 1.5, marginBottom: 8 },
  inputWrapper: { paddingLeft: 14, height: 48 },
  input: { height: 48, paddingVertical: 0 },
});
