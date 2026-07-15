import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import api from '../services/api';
import { Colors, Spacing, Typography, BorderRadius } from '../constants/theme';
import { Schedule, ApiResponse } from '../types/api';

type IntervalType = 'MILEAGE' | 'DATE' | 'BOTH';

export default function EditScheduleScreen({ route, navigation }: any) {
  const { motorcycleId, scheduleId } = route.params;
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [intervalType, setIntervalType] = useState<IntervalType>('MILEAGE');
  const [mileage, setMileage] = useState('');
  const [days, setDays] = useState('');

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const res = await api.get<ApiResponse<Schedule>>(
        `/motorcycles/${motorcycleId}/schedules/${scheduleId}`
      );
      if (res.data.success && res.data.data) {
        const s = res.data.data;
        setSchedule(s);
        setIntervalType(s.intervalType);
        setMileage(s.intervalMileage?.toString() || '');
        setDays(s.intervalDays?.toString() || '');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to load schedule');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (intervalType === 'MILEAGE' || intervalType === 'BOTH') {
      if (!mileage.trim()) {
        Alert.alert('Error', 'Mileage interval is required');
        return;
      }
    }
    if (intervalType === 'DATE' || intervalType === 'BOTH') {
      if (!days.trim()) {
        Alert.alert('Error', 'Days interval is required');
        return;
      }
    }
    setSaving(true);
    try {
      const body: any = { intervalType };
      if (intervalType === 'MILEAGE' || intervalType === 'BOTH') {
        body.intervalMileage = parseInt(mileage, 10);
      }
      if (intervalType === 'DATE' || intervalType === 'BOTH') {
        body.intervalDays = parseInt(days, 10);
      }
      await api.put(`/motorcycles/${motorcycleId}/schedules/${scheduleId}`, body);
      navigation.goBack();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message;
      Alert.alert('Error', msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Schedule', 'Are you sure? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            await api.delete(`/motorcycles/${motorcycleId}/schedules/${scheduleId}`);
            navigation.goBack();
          } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || err.message);
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const intervalTypes: { key: IntervalType; label: string }[] = [
    { key: 'MILEAGE', label: 'Mileage' },
    { key: 'DATE', label: 'Date' },
    { key: 'BOTH', label: 'Both' },
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <Text style={styles.saveText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Edit Schedule</Text>
        {schedule && (
          <Text style={styles.templateName}>{schedule.templateName}</Text>
        )}

        <Text style={styles.label}>Interval Type</Text>
        <View style={styles.chipRow}>
          {intervalTypes.map((t) => (
            <TouchableOpacity
              key={t.key}
              style={[
                styles.chip,
                intervalType === t.key ? styles.chipSelected : styles.chipUnselected,
              ]}
              onPress={() => setIntervalType(t.key)}
            >
              <Text
                style={[
                  styles.chipText,
                  intervalType === t.key ? styles.chipTextSelected : styles.chipTextUnselected,
                ]}
              >
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {(intervalType === 'MILEAGE' || intervalType === 'BOTH') && (
          <View style={styles.field}>
            <Text style={styles.label}>Interval (km)</Text>
            <TextInput
              style={styles.input}
              value={mileage}
              onChangeText={setMileage}
              keyboardType="numeric"
              placeholder="e.g. 3000"
              placeholderTextColor={Colors.outline}
            />
          </View>
        )}

        {(intervalType === 'DATE' || intervalType === 'BOTH') && (
          <View style={styles.field}>
            <Text style={styles.label}>Interval (days)</Text>
            <TextInput
              style={styles.input}
              value={days}
              onChangeText={setDays}
              keyboardType="numeric"
              placeholder="e.g. 90"
              placeholderTextColor={Colors.outline}
            />
          </View>
        )}

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          disabled={deleting}
        >
          {deleting ? (
            <ActivityIndicator size="small" color={Colors.error} />
          ) : (
            <Text style={styles.deleteText}>Delete Schedule</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.margin,
    paddingTop: Spacing.space12,
    paddingBottom: Spacing.space8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.outlineVariant,
  },
  cancelText: { ...Typography.bodyLarge, color: Colors.primary },
  saveText: { ...Typography.labelLarge, color: Colors.primary, fontWeight: '700' },
  content: { padding: Spacing.margin },
  heading: { ...Typography.headlineSmall, color: Colors.onSurface, marginBottom: Spacing.space4 },
  templateName: { ...Typography.bodyLarge, color: Colors.onSurfaceVariant, marginBottom: Spacing.space24 },
  label: { ...Typography.labelLarge, color: Colors.onSurfaceVariant, marginBottom: Spacing.space8, marginTop: Spacing.space16 },
  chipRow: { flexDirection: 'row', gap: Spacing.space8 },
  chip: {
    paddingHorizontal: Spacing.space16,
    paddingVertical: Spacing.space8,
    borderRadius: BorderRadius.chip,
  },
  chipSelected: { backgroundColor: Colors.primary },
  chipUnselected: { backgroundColor: Colors.surfaceVariant },
  chipText: { ...Typography.labelLarge },
  chipTextSelected: { color: Colors.onPrimary },
  chipTextUnselected: { color: Colors.onSurfaceVariant },
  field: { marginTop: Spacing.space8 },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    borderRadius: 4,
    paddingHorizontal: Spacing.space16,
    ...Typography.bodyLarge,
    color: Colors.onSurface,
  },
  deleteButton: {
    marginTop: Spacing.space32,
    height: 48,
    borderRadius: BorderRadius.button,
    borderWidth: 1,
    borderColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteText: { ...Typography.labelLarge, color: Colors.error },
});
