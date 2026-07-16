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
import { useDashboardStore } from '../../stores/dashboardStore';
import api from '../../services/api';
import type { ApiResponse, Motorcycle } from '../../types';

interface MileageModalProps {
  visible: boolean;
  onClose: () => void;
  preselectedBikeId?: string;
}

export default function MileageModal({ visible, onClose, preselectedBikeId }: MileageModalProps) {
  const { colors, borderRadius } = useTheme();
  const insets = useSafeAreaInsets();
  const { bikes, fetchBikes } = useBikeStore();
  const dashboardStore = useDashboardStore();

  const [selectedBikeId, setSelectedBikeId] = useState<string | null>(null);
  const [mileage, setMileage] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);
  const [showPicker, setShowPicker] = useState(true);

  const selectedBike = bikes.find((b) => b.id === selectedBikeId);

  useEffect(() => {
    if (visible) {
      if (bikes.length === 0) fetchBikes();
      setMileage('');
      setDate(new Date().toISOString().split('T')[0]);
      if (preselectedBikeId) {
        setSelectedBikeId(preselectedBikeId);
        setShowPicker(false);
      } else {
        setSelectedBikeId(null);
        setShowPicker(true);
      }
    }
  }, [visible, preselectedBikeId]);

  async function handleSave() {
    if (!selectedBikeId) {
      Alert.alert('Required', 'Please select a bike');
      return;
    }
    if (!mileage) {
      Alert.alert('Required', 'Please enter mileage');
      return;
    }

    setSaving(true);
    try {
      const res = await api.patch<ApiResponse<Motorcycle>>(
        `/motorcycles/${selectedBikeId}/mileage`,
        { mileage: parseInt(mileage, 10) },
      );
      if (res.data.success) {
        dashboardStore.invalidate();
        dashboardStore.fetchDashboard();
        onClose();
      }
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to update mileage');
    } finally {
      setSaving(false);
    }
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
                maxHeight: '75%',
              },
            ]}
          >
            <View style={[styles.handle, { backgroundColor: colors.surfaceHighlight }]} />
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: colors.text }]}>Update Mileage</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color={colors.textDim} />
              </TouchableOpacity>
            </View>

            {showPicker ? (
              <View style={{ marginTop: 24 }}>
                <Text style={[styles.stepTitle, { color: colors.text }]}>Select a bike</Text>
                <ScrollView
                  style={{ maxHeight: 280 }}
                  contentContainerStyle={{ gap: 8, marginTop: 16 }}
                >
                  {bikes.map((bike) => (
                    <TouchableOpacity
                      key={bike.id}
                      style={[
                        styles.optionCard,
                        {
                          backgroundColor: colors.surface,
                          borderColor: colors.border,
                          borderRadius: borderRadius.md,
                        },
                      ]}
                      onPress={() => {
                        setSelectedBikeId(bike.id);
                        setMileage(bike.currentMileage.toString());
                        setShowPicker(false);
                      }}
                    >
                      <Text style={[styles.bikeEmoji]}>🏍</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.optionName, { color: colors.text }]}>
                          {bike.name}
                        </Text>
                        <Text style={[styles.optionMeta, { color: colors.textDim }]}>
                          {bike.make} {bike.model} · Current: {bike.currentMileage.toLocaleString()} km
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color={colors.textDim} />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            ) : (
              <ScrollView contentContainerStyle={{ marginTop: 24, gap: 16 }}>
                <TouchableOpacity onPress={() => setShowPicker(true)} style={{ marginBottom: 4 }}>
                  <Text style={[styles.backLink, { color: colors.amber }]}>
                    ← {selectedBike?.name || 'Change bike'}
                  </Text>
                </TouchableOpacity>

                <Input
                  label="Current Mileage (km)"
                  value={mileage}
                  onChangeText={setMileage}
                  placeholder="0"
                  keyboardType="number-pad"
                />
                <Input
                  label="Date"
                  value={date}
                  onChangeText={setDate}
                  placeholder="YYYY-MM-DD"
                />

                <Button
                  title="Update Mileage"
                  onPress={handleSave}
                  loading={saving}
                  fullWidth
                  size="lg"
                  style={{ marginTop: 8 }}
                />
              </ScrollView>
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1 },
  sheet: { paddingHorizontal: 20 },
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
  stepTitle: {
    fontFamily: 'Karla_700Bold',
    fontSize: 18,
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
  bikeEmoji: { fontSize: 24 },
  optionName: { fontFamily: 'Karla_600SemiBold', fontSize: 15 },
  optionMeta: { fontFamily: 'Karla_400Regular', fontSize: 12, marginTop: 2 },
});
