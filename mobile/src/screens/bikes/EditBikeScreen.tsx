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
import type { ApiResponse, Motorcycle, UpdateMotorcycleRequest } from '../../types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BikesStackParamList } from '../../navigation/BikesStack';

type Props = NativeStackScreenProps<BikesStackParamList, 'EditBike'>;

export default function EditBikeScreen({ route, navigation }: Props) {
  const { bikeId } = route.params;
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [currentMileage, setCurrentMileage] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [vin, setVin] = useState('');
  const [notes, setNotes] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<ApiResponse<Motorcycle>>(`/motorcycles/${bikeId}`);
        if (res.data.success && res.data.data) {
          const b = res.data.data;
          setName(b.name);
          setMake(b.make);
          setModel(b.model);
          setYear(b.year?.toString() || '');
          setCurrentMileage(b.currentMileage?.toString() || '0');
          setLicensePlate(b.licensePlate || '');
          setVin(b.vin || '');
          setNotes(b.notes || '');
          setIsActive(b.isActive);
        }
      } catch {
        Alert.alert('Error', 'Failed to load bike');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    })();
  }, [bikeId]);

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert('Required', 'Name is required');
      return;
    }

    const payload: UpdateMotorcycleRequest = {
      name: name.trim(),
      make: make.trim() || undefined,
      model: model.trim() || undefined,
      year: year ? parseInt(year, 10) : undefined,
      currentMileage: parseInt(currentMileage, 10) || 0,
      licensePlate: licensePlate.trim() || undefined,
      vin: vin.trim() || undefined,
      notes: notes.trim() || undefined,
      isActive,
    };

    setSaving(true);
    try {
      await api.put(`/motorcycles/${bikeId}`, payload);
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to update bike');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState message="Loading bike..." />;

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>EDIT BIKE</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.form}>
          <Input label="Name *" value={name} onChangeText={setName} />
          <View style={{ height: 16 }} />
          <Input label="Make" value={make} onChangeText={setMake} />
          <View style={{ height: 16 }} />
          <Input label="Model" value={model} onChangeText={setModel} />
          <View style={{ height: 16 }} />
          <Input label="Year" value={year} onChangeText={setYear} keyboardType="number-pad" />
          <View style={{ height: 16 }} />
          <Input
            label="Current Mileage (km)"
            value={currentMileage}
            onChangeText={setCurrentMileage}
            keyboardType="number-pad"
          />
          <View style={{ height: 16 }} />
          <Input
            label="License Plate"
            value={licensePlate}
            onChangeText={setLicensePlate}
            autoCapitalize="characters"
          />
          <View style={{ height: 16 }} />
          <Input label="VIN" value={vin} onChangeText={setVin} />
          <View style={{ height: 16 }} />
          <Input
            label="Notes"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            style={{ minHeight: 80, textAlignVertical: 'top', paddingTop: 12 }}
          />

          <Button
            title="Save Changes"
            onPress={handleSave}
            loading={saving}
            fullWidth
            size="lg"
            style={{ marginTop: 32, marginBottom: 48 }}
          />
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
});
