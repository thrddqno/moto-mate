import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Colors, Spacing, Typography, BorderRadius } from '../constants/theme';
import api from '../services/api';
import { ApiResponse, Schedule, MotorcycleDetail } from '../types/api';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/MainStackNavigator';

type Props = NativeStackScreenProps<MainStackParamList, 'LogService'>;

function todayStr(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function LogServiceScreen({ route, navigation }: Props) {
  const { motorcycleId, scheduleId } = route.params;

  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(scheduleId ?? null);
  const [date, setDate] = useState(todayStr());
  const [mileage, setMileage] = useState('');
  const [cost, setCost] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(!scheduleId);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (scheduleId) {
      setLoading(true);
      api.get<ApiResponse<MotorcycleDetail>>(`/motorcycles/${motorcycleId}`).then((res) => {
        setMileage(String(res.data.data.currentMileage ?? ''));
      }).finally(() => setLoading(false));
    } else {
      api.get<ApiResponse<Schedule[]>>(`/motorcycles/${motorcycleId}/schedules`).then((res) => {
        setSchedules(res.data.data);
      }).finally(() => setLoading(false));
    }
  }, [motorcycleId, scheduleId]);

  const selectedSchedule = schedules.find((s) => s.id === selectedScheduleId) ?? null;

  const canSave = selectedScheduleId !== null && date.trim().length > 0 && mileage.trim().length > 0 && !saving;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      await api.post<ApiResponse<any>>(`/motorcycles/${motorcycleId}/logs`, {
        scheduleId: selectedScheduleId,
        dateOfService: date,
        mileageAtService: parseInt(mileage, 10),
        cost: cost ? parseFloat(cost) : null,
        notes: notes.trim() || null,
      });
      Alert.alert('Success', 'Service logged successfully');
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to log service');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} disabled={saving}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSave} disabled={!canSave}>
          {saving ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <Text style={[styles.saveText, !canSave && styles.saveDisabled]}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Log Service</Text>

        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
        ) : (
          <>
            <Text style={styles.label}>Task</Text>
            {scheduleId ? (
              <View style={styles.readOnlyField}>
                <Text style={styles.readOnlyText}>{selectedSchedule?.templateName ?? 'N/A'}</Text>
              </View>
            ) : (
              <View style={styles.scheduleList}>
                {schedules.map((s) => (
                  <TouchableOpacity
                    key={s.id}
                    style={[
                      styles.scheduleItem,
                      s.id === selectedScheduleId && styles.scheduleItemSelected,
                    ]}
                    onPress={() => setSelectedScheduleId(s.id)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.scheduleItemText,
                        s.id === selectedScheduleId && styles.scheduleItemTextSelected,
                      ]}
                    >
                      {s.templateName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={styles.label}>Date</Text>
            <TextInput
              style={styles.input}
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={Colors.outline}
            />

            <Text style={styles.label}>Mileage (km)</Text>
            <TextInput
              style={styles.input}
              value={mileage}
              onChangeText={setMileage}
              placeholder="0"
              placeholderTextColor={Colors.outline}
              keyboardType="numeric"
            />

            <Text style={styles.label}>Cost (optional)</Text>
            <TextInput
              style={styles.input}
              value={cost}
              onChangeText={setCost}
              placeholder="0.00"
              placeholderTextColor={Colors.outline}
              keyboardType="decimal-pad"
            />

            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={styles.textArea}
              value={notes}
              onChangeText={setNotes}
              placeholder="Notes..."
              placeholderTextColor={Colors.outline}
              multiline
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[styles.logButton, !canSave && styles.logButtonDisabled]}
              onPress={handleSave}
              disabled={!canSave}
            >
              {saving ? (
                <ActivityIndicator size="small" color={Colors.onPrimary} />
              ) : (
                <Text style={styles.logButtonText}>Log Service</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.margin,
    paddingVertical: Spacing.space12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.outlineVariant,
    backgroundColor: Colors.background,
  },
  cancelText: { ...Typography.labelLarge, color: Colors.primary },
  saveText: { ...Typography.labelLarge, color: Colors.primary, fontWeight: '700' as const },
  saveDisabled: { color: Colors.outline },
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.margin, paddingBottom: Spacing.space32 },
  title: { ...Typography.headlineSmall, color: Colors.onSurface, textAlign: 'center', marginBottom: Spacing.space24 },
  loader: { marginTop: Spacing.space32 },
  label: { ...Typography.labelLarge, color: Colors.onSurfaceVariant, marginBottom: Spacing.space8, marginTop: Spacing.space8 },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    borderRadius: BorderRadius.chip,
    paddingHorizontal: Spacing.space16,
    ...Typography.bodyLarge,
    color: Colors.onSurface,
    marginBottom: Spacing.space16,
  },
  readOnlyField: {
    height: 48,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    borderRadius: BorderRadius.chip,
    paddingHorizontal: Spacing.space16,
    justifyContent: 'center',
    backgroundColor: Colors.surfaceVariant,
    marginBottom: Spacing.space16,
  },
  readOnlyText: { ...Typography.bodyLarge, color: Colors.onSurface },
  scheduleList: { marginBottom: Spacing.space16 },
  scheduleItem: {
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: Spacing.space16,
    borderRadius: BorderRadius.chip,
    marginBottom: Spacing.space4,
  },
  scheduleItemSelected: { backgroundColor: Colors.primaryContainer },
  scheduleItemText: { ...Typography.bodyLarge, color: Colors.onSurface },
  scheduleItemTextSelected: { color: Colors.onPrimaryContainer },
  textArea: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    borderRadius: BorderRadius.chip,
    paddingHorizontal: Spacing.space16,
    paddingTop: Spacing.space12,
    paddingBottom: Spacing.space12,
    ...Typography.bodyLarge,
    color: Colors.onSurface,
    marginBottom: Spacing.space16,
  },
  logButton: {
    height: 48,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.button,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.space8,
  },
  logButtonDisabled: { opacity: 0.5 },
  logButtonText: { ...Typography.labelLarge, color: Colors.onPrimary },
});
