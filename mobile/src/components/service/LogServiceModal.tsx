import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useBikeStore } from '../../stores/bikeStore';
import { useScheduleStore } from '../../stores/scheduleStore';
import { useDashboardStore } from '../../stores/dashboardStore';
import api from '../../services/api';
import type { ApiResponse, ServiceLog, CreateServiceLogRequest } from '../../types';

interface LogServiceModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function LogServiceModal({ visible, onClose }: LogServiceModalProps) {
  const { colors, borderRadius } = useTheme();
  const insets = useSafeAreaInsets();
  const { bikes, fetchBikes } = useBikeStore();
  const { scheduleMap, fetchSchedules } = useScheduleStore();
  const dashboardStore = useDashboardStore();
  const bikeStore = useBikeStore();

  const [step, setStep] = useState<'bike' | 'task' | 'form'>('bike');
  const [selectedBikeId, setSelectedBikeId] = useState<string | null>(null);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
  const [dateOfService, setDateOfService] = useState(new Date().toISOString().split('T')[0]);
  const [mileageAtService, setMileageAtService] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      if (bikes.length === 0) fetchBikes();
      setStep('bike');
      setSelectedBikeId(null);
      setSelectedScheduleId(null);
      setDateOfService(new Date().toISOString().split('T')[0]);
      setMileageAtService('');
      setNotes('');
    }
  }, [visible]);

  useEffect(() => {
    if (selectedBikeId && !scheduleMap[selectedBikeId]) {
      fetchSchedules(selectedBikeId);
    }
  }, [selectedBikeId]);

  const currentSchedules = selectedBikeId ? scheduleMap[selectedBikeId] || [] : [];
  const selectedBike = bikes.find((b) => b.id === selectedBikeId);
  const selectedSchedule = currentSchedules.find((s) => s.id === selectedScheduleId);

  async function handleSave() {
    if (!selectedScheduleId || !selectedBikeId) return;
    if (!mileageAtService) {
      Alert.alert('Required', 'Mileage at service is required');
      return;
    }

    const payload: CreateServiceLogRequest = {
      scheduleId: selectedScheduleId,
      dateOfService,
      mileageAtService: parseInt(mileageAtService, 10),
      notes: notes.trim() || undefined,
    };

    setSaving(true);
    try {
      const res = await api.post<ApiResponse<ServiceLog>>(
        `/motorcycles/${selectedBikeId}/logs`,
        payload,
      );
      if (res.data.success) {
        dashboardStore.invalidate();
        dashboardStore.fetchDashboard();
        bikeStore.invalidate();
        onClose();
      }
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to log service');
    } finally {
      setSaving(false);
    }
  }

  function renderBikeStep() {
    return (
      <View style={{ marginTop: 24 }}>
        <Text style={[styles.stepTitle, { color: colors.text }]}>Select a bike</Text>
        <Text style={[styles.stepSubtitle, { color: colors.textDim }]}>
          Choose which motorcycle you serviced
        </Text>
        <ScrollView style={{ maxHeight: 300 }} contentContainerStyle={{ gap: 8, marginTop: 16 }}>
          {bikes.map((bike) => (
            <TouchableOpacity
              key={bike.id}
              style={[
                styles.optionCard,
                {
                  backgroundColor: selectedBikeId === bike.id ? colors.amberDim : colors.surface,
                  borderColor: selectedBikeId === bike.id ? colors.amber : colors.border,
                  borderRadius: borderRadius.md,
                },
              ]}
              onPress={() => { setSelectedBikeId(bike.id); setStep('task'); }}
            >
              <Text style={[styles.bikeEmoji]}>🏍</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.optionName, { color: colors.text }]}>{bike.name}</Text>
                <Text style={[styles.optionMeta, { color: colors.textDim }]}>
                  {bike.make} {bike.model} · {bike.currentMileage.toLocaleString()} km
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textDim} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  }

  function renderTaskStep() {
    return (
      <View style={{ marginTop: 24 }}>
        <TouchableOpacity onPress={() => setStep('bike')} style={{ marginBottom: 16 }}>
          <Text style={[styles.backLink, { color: colors.amber }]}>
            ← {selectedBike?.name || 'Change bike'}
          </Text>
        </TouchableOpacity>
        <Text style={[styles.stepTitle, { color: colors.text }]}>Select a task</Text>
        <Text style={[styles.stepSubtitle, { color: colors.textDim }]}>
          Which service did you perform?
        </Text>
        <ScrollView style={{ maxHeight: 300 }} contentContainerStyle={{ gap: 8, marginTop: 16 }}>
          {currentSchedules.length === 0 ? (
            <Text style={[{ color: colors.textDim, textAlign: 'center', marginTop: 40, fontFamily: 'Karla_400Regular' }]}>
              No schedules for this bike yet.
            </Text>
          ) : (
            currentSchedules.map((s) => (
              <TouchableOpacity
                key={s.id}
                style={[
                  styles.optionCard,
                  {
                    backgroundColor: selectedScheduleId === s.id ? colors.amberDim : colors.surface,
                    borderColor: selectedScheduleId === s.id ? colors.amber : colors.border,
                    borderRadius: borderRadius.md,
                  },
                ]}
                onPress={() => { setSelectedScheduleId(s.id); setStep('form'); }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.optionName, { color: colors.text }]}>{s.templateName}</Text>
                  <Text style={[styles.optionMeta, { color: colors.textDim }]}>
                    {s.intervalType !== 'DATE' && s.nextDueMileage != null
                      ? `Due at ${s.nextDueMileage.toLocaleString()} km`
                      : ''}
                    {s.intervalType !== 'MILEAGE' && s.nextDueDate
                      ? `Due ${new Date(s.nextDueDate).toLocaleDateString()}`
                      : ''}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textDim} />
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    );
  }

  function renderFormStep() {
    return (
      <View style={{ marginTop: 24 }}>
        <TouchableOpacity onPress={() => setStep('task')} style={{ marginBottom: 16 }}>
          <Text style={[styles.backLink, { color: colors.amber }]}>
            ← {selectedSchedule?.templateName || 'Change task'}
          </Text>
        </TouchableOpacity>
        <Text style={[styles.stepTitle, { color: colors.text }]}>Log Service</Text>
        <Text style={[styles.stepSubtitle, { color: colors.textDim }]}>
          {selectedBike?.name} — {selectedSchedule?.templateName}
        </Text>

        <View style={{ marginTop: 24, gap: 16 }}>
          <Input
            label="Date of Service"
            value={dateOfService}
            onChangeText={setDateOfService}
            placeholder="YYYY-MM-DD"
          />
          <Input
            label="Mileage at Service (km)"
            value={mileageAtService}
            onChangeText={setMileageAtService}
            placeholder="e.g. 5000"
            keyboardType="number-pad"
          />
          <Input
            label="Notes (optional)"
            value={notes}
            onChangeText={setNotes}
            placeholder="What was done, what parts used..."
            multiline
            numberOfLines={3}
            style={{ minHeight: 80, textAlignVertical: 'top', paddingTop: 12 }}
          />
        </View>

        <Button
          title="Log Service"
          onPress={handleSave}
          loading={saving}
          fullWidth
          size="lg"
          style={{ marginTop: 24 }}
        />
      </View>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, justifyContent: 'flex-end' }}
        >
          <View
            style={[
              styles.sheet,
              {
                backgroundColor: colors.bg,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                paddingBottom: insets.bottom + 16,
                maxHeight: '85%',
              },
            ]}
          >
            <View style={[styles.handle, { backgroundColor: colors.surfaceHighlight }]} />
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: colors.text }]}>Log Service</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color={colors.textDim} />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.sheetContent}>
              {step === 'bike' && renderBikeStep()}
              {step === 'task' && renderTaskStep()}
              {step === 'form' && renderFormStep()}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  sheet: {
    paddingHorizontal: 20,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  sheetTitle: {
    fontFamily: 'Audiowide_400Regular',
    fontSize: 20,
    letterSpacing: 1,
  },
  sheetContent: {
    paddingBottom: 20,
  },
  stepTitle: {
    fontFamily: 'Karla_700Bold',
    fontSize: 18,
  },
  stepSubtitle: {
    fontFamily: 'Karla_400Regular',
    fontSize: 14,
    marginTop: 4,
  },
  backLink: {
    fontFamily: 'Karla_600SemiBold',
    fontSize: 14,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderWidth: 1,
    gap: 12,
  },
  bikeEmoji: {
    fontSize: 24,
  },
  optionName: {
    fontFamily: 'Karla_600SemiBold',
    fontSize: 15,
  },
  optionMeta: {
    fontFamily: 'Karla_400Regular',
    fontSize: 12,
    marginTop: 2,
  },
});
