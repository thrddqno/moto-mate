import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useTemplateStore } from '../../stores/templateStore';
import { useScheduleStore } from '../../stores/scheduleStore';
import type {
  MaintenanceTemplate,
  MaintenanceCategory,
  IntervalType,
  Schedule,
} from '../../types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BikesStackParamList } from '../../navigation/BikesStack';

type Props = NativeStackScreenProps<BikesStackParamList, 'ScheduleForm'>;

const CATEGORIES: { key: MaintenanceCategory; label: string }[] = [
  { key: 'ENGINE', label: 'Engine' },
  { key: 'BRAKES', label: 'Brakes' },
  { key: 'TIRES', label: 'Tires' },
  { key: 'CHAIN', label: 'Chain' },
  { key: 'ELECTRICAL', label: 'Electrical' },
  { key: 'COOLING', label: 'Cooling' },
  { key: 'GENERAL', label: 'General' },
  { key: 'REGULATORY', label: 'Regulatory' },
];

const INTERVAL_TYPES: { key: IntervalType; label: string }[] = [
  { key: 'MILEAGE', label: 'Mileage' },
  { key: 'DATE', label: 'Days' },
  { key: 'BOTH', label: 'Both' },
];

export default function ScheduleFormScreen({ route, navigation }: Props) {
  const { bikeId, schedule: editSchedule } = route.params || {};
  const isEditing = !!editSchedule;

  const { colors, borderRadius } = useTheme();
  const insets = useSafeAreaInsets();
  const { templates, fetchTemplates } = useTemplateStore();
  const { createSchedule, updateSchedule, deleteSchedule } = useScheduleStore();

  const [activeCategory, setActiveCategory] = useState<MaintenanceCategory | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    editSchedule?.templateId || null,
  );
  const [intervalType, setIntervalType] = useState<IntervalType>(
    editSchedule?.intervalType || 'MILEAGE',
  );
  const [intervalMileage, setIntervalMileage] = useState(
    editSchedule?.intervalMileage?.toString() || '',
  );
  const [intervalDays, setIntervalDays] = useState(
    editSchedule?.intervalDays?.toString() || '',
  );
  const [isActive, setIsActive] = useState(editSchedule?.isActive ?? true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const filteredTemplates = activeCategory
    ? templates.filter((t) => t.category === activeCategory)
    : templates;

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);

  async function handleSave() {
    if (!selectedTemplateId) {
      Alert.alert('Required', 'Please select a maintenance task');
      return;
    }
    if (intervalType === 'MILEAGE' && !intervalMileage) {
      Alert.alert('Required', 'Please enter the mileage interval');
      return;
    }
    if (intervalType === 'DATE' && !intervalDays) {
      Alert.alert('Required', 'Please enter the day interval');
      return;
    }
    if (intervalType === 'BOTH' && (!intervalMileage || !intervalDays)) {
      Alert.alert('Required', 'Please enter both mileage and day intervals');
      return;
    }

    setSaving(true);
    try {
      const payload: any = {
        templateId: selectedTemplateId,
        intervalType,
        intervalMileage: intervalMileage ? parseInt(intervalMileage, 10) : undefined,
        intervalDays: intervalDays ? parseInt(intervalDays, 10) : undefined,
      };

      if (isEditing && editSchedule) {
        await updateSchedule(bikeId, editSchedule.id, {
          ...payload,
          isActive,
        });
      } else {
        await createSchedule(bikeId, payload);
      }
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to save schedule');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!editSchedule) return;
    Alert.alert('Delete Schedule', `Remove this schedule?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            await deleteSchedule(bikeId, editSchedule.id);
            navigation.goBack();
          } catch {
            Alert.alert('Error', 'Failed to delete schedule');
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>
          {isEditing ? 'EDIT SCHEDULE' : 'ADD SCHEDULE'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          {!selectedTemplateId ? (
            <>
              <Text style={[styles.sectionLabel, { color: colors.text }]}>
                SELECT TASK
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryRow}
                contentContainerStyle={{ gap: 8 }}
              >
                <TouchableOpacity
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: !activeCategory ? colors.amberDim : colors.surface,
                      borderColor: !activeCategory ? colors.amber : colors.border,
                      borderRadius: borderRadius.full,
                    },
                  ]}
                  onPress={() => setActiveCategory(null)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      { color: !activeCategory ? colors.amber : colors.textSecondary },
                    ]}
                  >
                    All
                  </Text>
                </TouchableOpacity>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.key}
                    style={[
                      styles.categoryChip,
                      {
                        backgroundColor: activeCategory === cat.key ? colors.amberDim : colors.surface,
                        borderColor: activeCategory === cat.key ? colors.amber : colors.border,
                        borderRadius: borderRadius.full,
                      },
                    ]}
                    onPress={() =>
                      setActiveCategory(cat.key === activeCategory ? null : cat.key)
                    }
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        {
                          color: activeCategory === cat.key ? colors.amber : colors.textSecondary,
                        },
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={{ gap: 8, marginTop: 8 }}>
                {filteredTemplates.map((tmpl) => (
                  <TouchableOpacity
                    key={tmpl.id}
                    style={[
                      styles.templateCard,
                      {
                        backgroundColor: colors.surface,
                        borderColor: selectedTemplateId === tmpl.id ? colors.amber : colors.border,
                        borderRadius: borderRadius.md,
                      },
                    ]}
                    onPress={() => {
                      setSelectedTemplateId(tmpl.id);
                      if (tmpl.defaultIntervalMileage) setIntervalMileage(tmpl.defaultIntervalMileage.toString());
                      if (tmpl.defaultIntervalDays) setIntervalDays(tmpl.defaultIntervalDays.toString());
                    }}
                  >
                    <Text style={[styles.templateName, { color: colors.text }]}>
                      {tmpl.name}
                    </Text>
                    <Text style={[styles.templateMeta, { color: colors.textDim }]}>
                      {tmpl.description}
                    </Text>
                    <View style={styles.templateDefaults}>
                      {tmpl.defaultIntervalMileage && (
                        <Text style={[styles.defaultBadge, { color: colors.amber }]}>
                          {tmpl.defaultIntervalMileage.toLocaleString()} km
                        </Text>
                      )}
                      {tmpl.defaultIntervalDays && (
                        <Text style={[styles.defaultBadge, { color: colors.blue }]}>
                          {tmpl.defaultIntervalDays} days
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          ) : (
            <>
              <TouchableOpacity
                onPress={() => setSelectedTemplateId(null)}
                style={{ marginBottom: 16 }}
              >
                <Text style={[styles.backLink, { color: colors.amber }]}>
                  ← {selectedTemplate?.name || 'Change task'}
                </Text>
              </TouchableOpacity>

              <Text style={[styles.sectionLabel, { color: colors.text }]}>
                INTERVAL TYPE
              </Text>
              <View style={styles.segmentedControl}>
                {INTERVAL_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.key}
                    style={[
                      styles.segment,
                      {
                        backgroundColor: intervalType === type.key ? colors.amber : colors.surface,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => setIntervalType(type.key)}
                  >
                    <Text
                      style={[
                        styles.segmentText,
                        {
                          color: intervalType === type.key ? colors.black : colors.text,
                        },
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={{ marginTop: 24, gap: 16 }}>
                {(intervalType === 'MILEAGE' || intervalType === 'BOTH') && (
                  <Input
                    label="Interval Mileage (km)"
                    value={intervalMileage}
                    onChangeText={setIntervalMileage}
                    placeholder="e.g. 3000"
                    keyboardType="number-pad"
                  />
                )}
                {(intervalType === 'DATE' || intervalType === 'BOTH') && (
                  <Input
                    label="Interval Days"
                    value={intervalDays}
                    onChangeText={setIntervalDays}
                    placeholder="e.g. 90"
                    keyboardType="number-pad"
                  />
                )}
              </View>

              {isEditing && (
                <TouchableOpacity
                  style={[
                    styles.toggleRow,
                    { borderTopColor: colors.border, marginTop: 24, paddingTop: 16 },
                  ]}
                  onPress={() => setIsActive(!isActive)}
                >
                  <Text style={[styles.toggleLabel, { color: colors.text }]}>
                    Active Schedule
                  </Text>
                  <View
                    style={[
                      styles.toggleSwitch,
                      {
                        backgroundColor: isActive ? colors.amber : colors.surfaceHighlight,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.toggleThumb,
                        {
                          backgroundColor: colors.white,
                          transform: [{ translateX: isActive ? 16 : 0 }],
                        },
                      ]}
                    />
                  </View>
                </TouchableOpacity>
              )}

              <Button
                title={isEditing ? 'Save Changes' : 'Add Schedule'}
                onPress={handleSave}
                loading={saving}
                fullWidth
                size="lg"
                style={{ marginTop: 32 }}
              />

              {isEditing && (
                <Button
                  title="Delete Schedule"
                  onPress={handleDelete}
                  loading={deleting}
                  variant="danger"
                  fullWidth
                  style={{ marginTop: 12 }}
                />
              )}
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
  title: { fontFamily: 'Audiowide_400Regular', fontSize: 16, letterSpacing: 2 },
  scroll: { paddingHorizontal: 16, paddingBottom: 48, paddingTop: 16 },
  sectionLabel: {
    fontFamily: 'Karla_700Bold',
    fontSize: 12,
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  categoryRow: { marginBottom: 16 },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
  },
  categoryChipText: {
    fontFamily: 'Karla_600SemiBold',
    fontSize: 13,
  },
  templateCard: {
    padding: 14,
    borderWidth: 1,
  },
  templateName: {
    fontFamily: 'Karla_600SemiBold',
    fontSize: 15,
  },
  templateMeta: {
    fontFamily: 'Karla_400Regular',
    fontSize: 12,
    marginTop: 4,
  },
  templateDefaults: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  defaultBadge: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 11,
  },
  backLink: {
    fontFamily: 'Karla_600SemiBold',
    fontSize: 14,
  },
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
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
  },
  toggleLabel: {
    fontFamily: 'Karla_600SemiBold',
    fontSize: 15,
  },
  toggleSwitch: {
    width: 40,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
});
