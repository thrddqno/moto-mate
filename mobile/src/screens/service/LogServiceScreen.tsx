import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/ui/LoadingState';
import api from '../../services/api';
import type {
  ApiResponse,
  Schedule,
  CreateServiceLogRequest,
  ServiceLog,
} from '../../types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { DashboardStackParamList } from '../../navigation/DashboardStack';

type Props = NativeStackScreenProps<DashboardStackParamList, 'LogService'>;

export default function LogServiceScreen({ route, navigation }: Props) {
  const { scheduleId: preSelectedScheduleId, motorcycleId } = route.params || {};
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState(preSelectedScheduleId || '');
  const [dateOfService, setDateOfService] = useState(new Date().toISOString().split('T')[0]);
  const [mileageAtService, setMileageAtService] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [loadingSchedules, setLoadingSchedules] = useState(true);

  useEffect(() => {
    if (!motorcycleId) {
      setLoadingSchedules(false);
      return;
    }
    (async () => {
      try {
        const res = await api.get<ApiResponse<Schedule[]>>(
          `/motorcycles/${motorcycleId}/schedules`,
        );
        if (res.data.success && res.data.data) {
          setSchedules(res.data.data);
          if (!preSelectedScheduleId && res.data.data.length > 0) {
            setSelectedScheduleId(res.data.data[0].id);
          }
        }
      } catch {
        // silent
      } finally {
        setLoadingSchedules(false);
      }
    })();
  }, [motorcycleId]);

  async function handleSave() {
    if (!selectedScheduleId) {
      Alert.alert('Required', 'Please select a task');
      return;
    }
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
        `/motorcycles/${motorcycleId}/logs`,
        payload,
      );
      if (res.data.success) {
        navigation.goBack();
      }
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to log service');
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>LOG SERVICE</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.form}>
          {loadingSchedules ? (
            <LoadingState message="Loading schedules..." />
          ) : (
            <>
              <Text style={[styles.label, { color: colors.textSecondary }]}>TASK</Text>
              <View style={styles.scheduleList}>
                {schedules.map((s) => (
                  <TouchableOpacity
                    key={s.id}
                    style={[
                      styles.scheduleOption,
                      {
                        backgroundColor:
                          selectedScheduleId === s.id
                            ? colors.amberDim
                            : colors.surface,
                        borderColor:
                          selectedScheduleId === s.id
                            ? colors.amber
                            : colors.border,
                      },
                    ]}
                    onPress={() => setSelectedScheduleId(s.id)}
                  >
                    <Text
                      style={[
                        styles.scheduleName,
                        {
                          color:
                            selectedScheduleId === s.id
                              ? colors.amber
                              : colors.text,
                        },
                      ]}
                    >
                      {s.templateName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={{ height: 20 }} />

              <Input
                label="Date of Service"
                value={dateOfService}
                onChangeText={setDateOfService}
                placeholder="YYYY-MM-DD"
              />
              <View style={{ height: 16 }} />
              <Input
                label="Mileage at Service (km)"
                value={mileageAtService}
                onChangeText={setMileageAtService}
                placeholder="e.g. 5000"
                keyboardType="number-pad"
              />
              <View style={{ height: 16 }} />
              <Input
                label="Notes (optional)"
                value={notes}
                onChangeText={setNotes}
                placeholder="What was done, what parts used..."
                multiline
                numberOfLines={3}
                style={{ minHeight: 80, textAlignVertical: 'top', paddingTop: 12 }}
              />

              <Button
                title="Log Service"
                onPress={handleSave}
                loading={saving}
                fullWidth
                size="lg"
                style={{ marginTop: 32, marginBottom: 48 }}
              />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
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
  form: { paddingHorizontal: 16, paddingTop: 24 },
  label: { fontFamily: 'Karla_700Bold', fontSize: 11, letterSpacing: 1.5, marginBottom: 8 },
  scheduleList: { gap: 8 },
  scheduleOption: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
  },
  scheduleName: { fontFamily: 'Karla_600SemiBold', fontSize: 14 },
});
