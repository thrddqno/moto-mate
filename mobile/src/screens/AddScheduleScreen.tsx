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
import { ApiResponse, MaintenanceTemplate, MaintenanceCategory, IntervalType } from '../types/api';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/MainStackNavigator';

type Props = NativeStackScreenProps<MainStackParamList, 'AddSchedule'>;

const CATEGORIES: MaintenanceCategory[] = [
  'ENGINE', 'BRAKES', 'TIRES', 'CHAIN', 'ELECTRICAL', 'COOLING', 'GENERAL', 'REGULATORY',
];

const CATEGORY_LABELS: Record<MaintenanceCategory, string> = {
  ENGINE: 'Engine',
  BRAKES: 'Brakes',
  TIRES: 'Tires',
  CHAIN: 'Chain',
  ELECTRICAL: 'Electrical',
  COOLING: 'Cooling',
  GENERAL: 'General',
  REGULATORY: 'Regulatory',
};

export default function AddScheduleScreen({ route, navigation }: Props) {
  const { motorcycleId } = route.params;

  const [templates, setTemplates] = useState<MaintenanceTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<MaintenanceTemplate | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<MaintenanceCategory | null>(null);
  const [intervalType, setIntervalType] = useState<IntervalType>('MILEAGE');
  const [intervalMileage, setIntervalMileage] = useState('');
  const [intervalDays, setIntervalDays] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get<ApiResponse<MaintenanceTemplate[]>>('/templates').then((res) => {
      setTemplates(res.data.data);
    }).finally(() => setLoading(false));
  }, []);

  const filteredTemplates = selectedCategory
    ? templates.filter((t) => t.category === selectedCategory)
    : templates;

  useEffect(() => {
    if (selectedTemplate) {
      if (selectedTemplate.defaultIntervalMileage) {
        setIntervalMileage(String(selectedTemplate.defaultIntervalMileage));
      }
      if (selectedTemplate.defaultIntervalDays) {
        setIntervalDays(String(selectedTemplate.defaultIntervalDays));
      }
    }
  }, [selectedTemplate]);

  const canSave =
    selectedTemplate !== null &&
    !saving &&
    ((intervalType === 'MILEAGE' && intervalMileage.trim().length > 0) ||
      (intervalType === 'DATE' && intervalDays.trim().length > 0) ||
      (intervalType === 'BOTH' && intervalMileage.trim().length > 0 && intervalDays.trim().length > 0));

  const handleSave = async () => {
    if (!canSave || !selectedTemplate) return;
    setSaving(true);
    try {
      await api.post<ApiResponse<any>>(`/motorcycles/${motorcycleId}/schedules`, {
        templateId: selectedTemplate.id,
        intervalType,
        intervalMileage: intervalType !== 'DATE' ? parseInt(intervalMileage, 10) : null,
        intervalDays: intervalType !== 'MILEAGE' ? parseInt(intervalDays, 10) : null,
      });
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to save schedule');
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
        <Text style={styles.title}>Set Up Maintenance</Text>

        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
        ) : (
          <>
            <Text style={styles.label}>Select Template</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow} contentContainerStyle={styles.chipContent}>
              <TouchableOpacity
                style={[styles.filterChip, !selectedCategory && styles.filterChipActive]}
                onPress={() => setSelectedCategory(null)}
              >
                <Text style={[styles.filterChipText, !selectedCategory && styles.filterChipTextActive]}>All</Text>
              </TouchableOpacity>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.filterChip, selectedCategory === cat && styles.filterChipActive]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text style={[styles.filterChipText, selectedCategory === cat && styles.filterChipTextActive]}>
                    {CATEGORY_LABELS[cat]}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.templateList}>
              {filteredTemplates.map((t) => (
                <TouchableOpacity
                  key={t.id}
                  style={[
                    styles.templateItem,
                    selectedTemplate?.id === t.id && styles.templateItemSelected,
                  ]}
                  onPress={() => setSelectedTemplate(t)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.templateIcon}>{t.icon || '🔧'}</Text>
                  <View style={styles.templateInfo}>
                    <Text style={styles.templateName}>{t.name}</Text>
                    <Text style={styles.templateCategory}>{CATEGORY_LABELS[t.category]}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Interval Type</Text>
            <View style={styles.intervalRow}>
              {(['MILEAGE', 'DATE', 'BOTH'] as IntervalType[]).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.intervalChip, intervalType === type && styles.intervalChipActive]}
                  onPress={() => setIntervalType(type)}
                >
                  <Text style={[styles.intervalChipText, intervalType === type && styles.intervalChipTextActive]}>
                    {type === 'BOTH' ? 'Both' : type === 'MILEAGE' ? 'Mileage' : 'Date'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {(intervalType === 'MILEAGE' || intervalType === 'BOTH') && (
              <>
                <Text style={styles.label}>Interval (km)</Text>
                <TextInput
                  style={styles.input}
                  value={intervalMileage}
                  onChangeText={setIntervalMileage}
                  placeholder={selectedTemplate?.defaultIntervalMileage ? String(selectedTemplate.defaultIntervalMileage) : '3000'}
                  placeholderTextColor={Colors.outline}
                  keyboardType="numeric"
                />
              </>
            )}

            {(intervalType === 'DATE' || intervalType === 'BOTH') && (
              <>
                <Text style={styles.label}>Interval (days)</Text>
                <TextInput
                  style={styles.input}
                  value={intervalDays}
                  onChangeText={setIntervalDays}
                  placeholder={selectedTemplate?.defaultIntervalDays ? String(selectedTemplate.defaultIntervalDays) : '365'}
                  placeholderTextColor={Colors.outline}
                  keyboardType="numeric"
                />
              </>
            )}

            <TouchableOpacity
              style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={!canSave}
            >
              {saving ? (
                <ActivityIndicator size="small" color={Colors.onPrimary} />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
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
  chipRow: { marginBottom: Spacing.space12 },
  chipContent: { gap: Spacing.space8 },
  filterChip: {
    paddingHorizontal: Spacing.space16,
    paddingVertical: Spacing.space8,
    borderRadius: BorderRadius.chip,
    backgroundColor: Colors.surfaceVariant,
  },
  filterChipActive: { backgroundColor: Colors.primary },
  filterChipText: { ...Typography.labelLarge, color: Colors.onSurface },
  filterChipTextActive: { color: Colors.onPrimary },
  templateList: { marginBottom: Spacing.space16 },
  templateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: Spacing.space16,
    borderRadius: BorderRadius.chip,
    marginBottom: Spacing.space4,
  },
  templateItemSelected: { backgroundColor: Colors.primaryContainer },
  templateIcon: { fontSize: 24, marginRight: Spacing.space12 },
  templateInfo: { flex: 1 },
  templateName: { ...Typography.titleMedium, color: Colors.onSurface },
  templateCategory: { ...Typography.bodySmall, color: Colors.onSurfaceVariant },
  intervalRow: {
    flexDirection: 'row',
    gap: Spacing.space8,
    marginBottom: Spacing.space16,
  },
  intervalChip: {
    flex: 1,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BorderRadius.chip,
    backgroundColor: Colors.surfaceVariant,
  },
  intervalChipActive: { backgroundColor: Colors.primary },
  intervalChipText: { ...Typography.labelLarge, color: Colors.onSurface },
  intervalChipTextActive: { color: Colors.onPrimary },
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
  saveButton: {
    height: 48,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.button,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.space8,
  },
  saveButtonDisabled: { opacity: 0.5 },
  saveButtonText: { ...Typography.labelLarge, color: Colors.onPrimary },
});
