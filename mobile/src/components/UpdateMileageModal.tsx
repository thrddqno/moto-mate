import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import api from '../services/api';
import { Colors, Spacing, Typography, BorderRadius } from '../constants/theme';
import { Motorcycle, ApiResponse } from '../types/api';

interface Props {
  visible: boolean;
  motorcycleId: string;
  currentMileage: number;
  onClose: () => void;
  onSaved: () => void;
}

export default function UpdateMileageModal({ visible, motorcycleId, currentMileage, onClose, onSaved }: Props) {
  const [mileage, setMileage] = useState(currentMileage.toString());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setMileage(currentMileage.toString());
    }
  }, [visible, currentMileage]);

  const handleSave = async () => {
    const value = parseInt(mileage, 10);
    if (isNaN(value) || value < 0) {
      Alert.alert('Error', 'Please enter a valid mileage');
      return;
    }
    setSaving(true);
    try {
      await api.patch(`/motorcycles/${motorcycleId}/mileage`, { mileage: value });
      onSaved();
      onClose();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={styles.dialog}>
          <Text style={styles.heading}>Update Mileage</Text>
          <Text style={styles.label}>Current: {currentMileage.toLocaleString()} km</Text>
          <TextInput
            style={styles.input}
            value={mileage}
            onChangeText={setMileage}
            keyboardType="numeric"
            autoFocus
            selectTextOnFocus
          />
          <Text style={styles.unit}>km</Text>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color={Colors.onPrimary} />
              ) : (
                <Text style={styles.saveText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialog: {
    width: '85%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.card,
    padding: Spacing.space24,
  },
  heading: { ...Typography.titleLarge, color: Colors.onSurface, marginBottom: Spacing.space8 },
  label: { ...Typography.bodyMedium, color: Colors.onSurfaceVariant, marginBottom: Spacing.space16 },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    borderRadius: 4,
    paddingHorizontal: Spacing.space16,
    ...Typography.titleLarge,
    color: Colors.onSurface,
    marginBottom: Spacing.space4,
  },
  unit: { ...Typography.bodySmall, color: Colors.onSurfaceVariant, marginBottom: Spacing.space24 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: Spacing.space16 },
  cancelBtn: { paddingVertical: Spacing.space8, paddingHorizontal: Spacing.space16 },
  cancelText: { ...Typography.labelLarge, color: Colors.onSurfaceVariant },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.button,
    paddingVertical: Spacing.space8,
    paddingHorizontal: Spacing.space24,
    minWidth: 80,
    alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveText: { ...Typography.labelLarge, color: Colors.onPrimary },
});
