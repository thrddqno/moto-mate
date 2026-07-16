import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
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
import type { UnitPreference } from '../../types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { SettingsStackParamList } from '../../navigation/SettingsStack';

type Props = NativeStackScreenProps<SettingsStackParamList, 'EditProfile'>;

export default function EditProfileScreen({ navigation }: Props) {
  const { colors, borderRadius } = useTheme();
  const insets = useSafeAreaInsets();
  const { profile, syncProfile } = useAuth();

  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [unitPref, setUnitPref] = useState<UnitPreference>(profile?.unitPreference || 'km');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await syncProfile({
        displayName: displayName.trim() || undefined,
        unitPreference: unitPref,
      });
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>EDIT PROFILE</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>DISPLAY NAME</Text>
          <View
            style={[
              styles.inputWrapper,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: borderRadius.md,
                borderWidth: 1,
              },
            ]}
          >
            <TextInput
              placeholderTextColor={colors.textDim}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Your name"
              style={[
                styles.input,
                { color: colors.text, fontFamily: 'Karla_400Regular', fontSize: 15 },
              ]}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>EMAIL</Text>
          <View
            style={[
              styles.inputWrapper,
              {
                backgroundColor: colors.surfaceHighlight,
                borderColor: colors.border,
                borderRadius: borderRadius.md,
                borderWidth: 1,
              },
            ]}
          >
            <Text
              style={[
                styles.input,
                { color: colors.textDim, fontFamily: 'Karla_400Regular', fontSize: 15 },
              ]}
            >
              {profile?.email || ''}
            </Text>
          </View>
          <Text style={[styles.hint, { color: colors.textDim }]}>
            Email is managed via Firebase authentication
          </Text>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>UNIT PREFERENCE</Text>
          <View style={[styles.segmentedControl, { borderColor: colors.border }]}>
            <TouchableOpacity
              style={[
                styles.segment,
                {
                  backgroundColor: unitPref === 'km' ? colors.amber : colors.surface,
                  borderRightColor: colors.border,
                },
              ]}
              onPress={() => setUnitPref('km')}
            >
              <Text
                style={[
                  styles.segmentText,
                  { color: unitPref === 'km' ? colors.black : colors.text },
                ]}
              >
                Kilometers (km)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.segment,
                {
                  backgroundColor: unitPref === 'mi' ? colors.amber : colors.surface,
                  borderRightColor: colors.border,
                },
              ]}
              onPress={() => setUnitPref('mi')}
            >
              <Text
                style={[
                  styles.segmentText,
                  { color: unitPref === 'mi' ? colors.black : colors.text },
                ]}
              >
                Miles (mi)
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <Button
          title="Save Changes"
          onPress={handleSave}
          loading={saving}
          fullWidth
          size="lg"
          style={{ marginTop: 32 }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: { fontFamily: 'Audiowide_400Regular', fontSize: 18, letterSpacing: 2 },
  scroll: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 48 },
  fieldGroup: { marginBottom: 24 },
  label: { fontFamily: 'Karla_700Bold', fontSize: 11, letterSpacing: 1.5, marginBottom: 8 },
  inputWrapper: { paddingLeft: 14, height: 48, justifyContent: 'center' },
  input: { height: 48, paddingVertical: 0 },
  hint: { fontFamily: 'Karla_400Regular', fontSize: 12, marginTop: 6 },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333333',
  },
  segment: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#333333',
  },
  segmentText: {
    fontFamily: 'Karla_600SemiBold',
    fontSize: 13,
  },
});
