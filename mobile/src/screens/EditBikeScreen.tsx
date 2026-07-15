import React, { useState } from 'react';
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
import { Colors, Spacing, Typography } from '../constants/theme';
import api from '../services/api';
import { ApiResponse, Motorcycle } from '../types/api';

export default function EditBikeScreen({ route, navigation }: any) {
  const motorcycle: Motorcycle = route.params.motorcycle;
  const [name, setName] = useState(motorcycle.name);
  const [make, setMake] = useState(motorcycle.make || '');
  const [model, setModel] = useState(motorcycle.model || '');
  const [year, setYear] = useState(motorcycle.year?.toString() || '');
  const [licensePlate, setLicensePlate] = useState(motorcycle.licensePlate || '');
  const [vin, setVin] = useState(motorcycle.vin || '');
  const [notes, setNotes] = useState(motorcycle.notes || '');
  const [currentMileage, setCurrentMileage] = useState(motorcycle.currentMileage.toString());
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const canSave = name.trim().length > 0 && currentMileage.trim().length > 0 && !saving;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    setErrors({});
    try {
      await api.put<ApiResponse<any>>(`/motorcycles/${motorcycle.id}`, {
        name: name.trim(),
        make: make.trim() || null,
        model: model.trim() || null,
        year: year ? parseInt(year, 10) : null,
        licensePlate: licensePlate.trim() || null,
        vin: vin.trim() || null,
        notes: notes.trim() || null,
        currentMileage: parseInt(currentMileage, 10) || 0,
        isActive: motorcycle.isActive,
      });
      navigation.goBack();
    } catch (err: any) {
      const data = err.response?.data;
      if (data?.errors && Array.isArray(data.errors)) {
        const fieldErrors: Record<string, string> = {};
        data.errors.forEach((e: string) => {
          const match = e.match(/^(\w+):\s*(.+)$/);
          if (match) fieldErrors[match[1]] = match[2];
          else fieldErrors.general = e;
        });
        setErrors(fieldErrors);
      } else {
        Alert.alert('Error', data?.message || 'Failed to update motorcycle');
      }
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
        {errors.general && <Text style={styles.errorText}>{errors.general}</Text>}

        <Text style={styles.label}>Name *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={(t) => { setName(t); setErrors((p) => ({ ...p, name: '' })); }}
          placeholder="e.g. My Sport Bike"
          placeholderTextColor={Colors.outline}
        />
        {errors.name && <Text style={styles.fieldError}>{errors.name}</Text>}

        <Text style={styles.label}>Make</Text>
        <TextInput
          style={styles.input}
          value={make}
          onChangeText={setMake}
          placeholder="e.g. Honda"
          placeholderTextColor={Colors.outline}
        />

        <Text style={styles.label}>Model</Text>
        <TextInput
          style={styles.input}
          value={model}
          onChangeText={setModel}
          placeholder="e.g. CBR600RR"
          placeholderTextColor={Colors.outline}
        />

        <Text style={styles.label}>Year</Text>
        <TextInput
          style={styles.input}
          value={year}
          onChangeText={setYear}
          placeholder="e.g. 2024"
          placeholderTextColor={Colors.outline}
          keyboardType="numeric"
          maxLength={4}
        />

        <Text style={styles.label}>License Plate</Text>
        <TextInput
          style={styles.input}
          value={licensePlate}
          onChangeText={setLicensePlate}
          placeholder="e.g. ABC 1234"
          placeholderTextColor={Colors.outline}
        />

        <Text style={styles.label}>VIN</Text>
        <TextInput
          style={styles.input}
          value={vin}
          onChangeText={setVin}
          placeholder="Vehicle Identification Number"
          placeholderTextColor={Colors.outline}
        />

        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Any additional notes..."
          placeholderTextColor={Colors.outline}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        <Text style={styles.label}>Current Mileage (km) *</Text>
        <TextInput
          style={styles.input}
          value={currentMileage}
          onChangeText={(t) => { setCurrentMileage(t); setErrors((p) => ({ ...p, currentMileage: '' })); }}
          placeholder="0"
          placeholderTextColor={Colors.outline}
          keyboardType="numeric"
        />
        {errors.currentMileage && <Text style={styles.fieldError}>{errors.currentMileage}</Text>}

        <TouchableOpacity
          style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!canSave}
        >
          {saving ? (
            <ActivityIndicator size="small" color={Colors.onPrimary} />
          ) : (
            <Text style={styles.saveButtonText}>Update Motorcycle</Text>
          )}
        </TouchableOpacity>
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
  saveText: { ...Typography.labelLarge, color: Colors.primary },
  saveDisabled: { color: Colors.outline },
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.margin, paddingBottom: Spacing.space32 },
  label: { ...Typography.labelLarge, color: Colors.onSurfaceVariant, marginBottom: Spacing.space8 },
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
  textArea: {
    height: 96,
    paddingTop: Spacing.space12,
  },
  errorText: { ...Typography.bodyMedium, color: Colors.error, marginBottom: Spacing.space16 },
  fieldError: { ...Typography.bodySmall, color: Colors.error, marginTop: -Spacing.space8, marginBottom: Spacing.space16 },
  saveButton: {
    height: 48,
    backgroundColor: Colors.primary,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.space8,
  },
  saveButtonDisabled: { opacity: 0.5 },
  saveButtonText: { ...Typography.labelLarge, color: Colors.onPrimary },
});
