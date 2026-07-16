import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
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
import { Card } from '../../components/ui/Card';
import api from '../../services/api';
import type { ApiResponse, UserProfile } from '../../types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { SettingsStackParamList } from '../../navigation/SettingsStack';

type Props = NativeStackScreenProps<SettingsStackParamList, 'NotificationSettings'>;

export default function NotificationSettingsScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { profile, refreshProfile } = useAuth();

  const [thresholdDays, setThresholdDays] = useState(
    profile?.reminderThresholdDays?.toString() || '7',
  );
  const [thresholdPercent, setThresholdPercent] = useState(
    profile?.reminderThresholdPercent?.toString() || '10',
  );
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    const days = parseInt(thresholdDays, 10);
    const percent = parseInt(thresholdPercent, 10);

    if (isNaN(days) || days < 1 || days > 30) {
      Alert.alert('Invalid', 'Days must be between 1 and 30');
      return;
    }
    if (isNaN(percent) || percent < 1 || percent > 50) {
      Alert.alert('Invalid', 'Percent must be between 1 and 50');
      return;
    }

    setSaving(true);
    try {
      await api.put('/users/me/notification-settings', {
        reminderThresholdDays: days,
        reminderThresholdPercent: percent,
      });
      await refreshProfile();
      Alert.alert('Saved', 'Notification settings updated');
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to save');
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
        <Text style={[styles.title, { color: colors.text }]}>NOTIFICATIONS</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Card style={styles.infoCard}>
          <Ionicons name="timer" size={24} color={colors.amber} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            You'll receive a daily digest at{' '}
            <Text style={{ color: colors.amber }}>
              {profile?.reminderDigestTime || '08:00'}
            </Text>{' '}
            with all upcoming and overdue maintenance items.
          </Text>
        </Card>

        <Input
          label="Remind me X days before"
          value={thresholdDays}
          onChangeText={setThresholdDays}
          placeholder="7"
          keyboardType="number-pad"
        />
        <Text style={[styles.hint, { color: colors.textDim }]}>
          For date-based schedules. Default: 7 days.
        </Text>

        <View style={{ height: 24 }} />

        <Input
          label="Remind me when X% of interval remains"
          value={thresholdPercent}
          onChangeText={setThresholdPercent}
          placeholder="10"
          keyboardType="number-pad"
        />
        <Text style={[styles.hint, { color: colors.textDim }]}>
          For mileage-based schedules. Default: 10%.
        </Text>

        <Button
          title="Save Settings"
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
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 24,
    gap: 12,
  },
  infoText: { fontFamily: 'Karla_400Regular', fontSize: 13, flex: 1, lineHeight: 18 },
  hint: { fontFamily: 'Karla_400Regular', fontSize: 12, marginTop: 6 },
});
