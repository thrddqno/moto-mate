import React, { useState } from 'react';
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
import api from '../../services/api';
import type { ApiResponse, Motorcycle, CreateMotorcycleRequest } from '../../types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BikesStackParamList } from '../../navigation/BikesStack';

type Props = NativeStackScreenProps<BikesStackParamList, 'AddBike'>;

export default function AddBikeScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [currentMileage, setCurrentMileage] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [vin, setVin] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!name.trim() || !make.trim() || !model.trim()) {
      Alert.alert('Required Fields', 'Name, make, and model are required.');
      return;
    }

    const payload: CreateMotorcycleRequest = {
      name: name.trim(),
      make: make.trim(),
      model: model.trim(),
      year: year ? parseInt(year, 10) : undefined,
      currentMileage: parseInt(currentMileage, 10) || 0,
      licensePlate: licensePlate.trim() || undefined,
      vin: vin.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    setLoading(true);
    try {
      const res = await api.post<ApiResponse<Motorcycle>>('/motorcycles', payload);
      if (res.data.success) {
        navigation.goBack();
      }
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to add bike');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>ADD BIKE</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.form}>
          <Input label="Name *" value={name} onChangeText={setName} placeholder="My Bike" />
          <View style={{ height: 16 }} />
          <Input label="Make *" value={make} onChangeText={setMake} placeholder="Honda" />
          <View style={{ height: 16 }} />
          <Input label="Model *" value={model} onChangeText={setModel} placeholder="CB650R" />
          <View style={{ height: 16 }} />
          <Input
            label="Year"
            value={year}
            onChangeText={setYear}
            placeholder="2024"
            keyboardType="number-pad"
          />
          <View style={{ height: 16 }} />
          <Input
            label="Current Mileage (km)"
            value={currentMileage}
            onChangeText={setCurrentMileage}
            placeholder="0"
            keyboardType="number-pad"
          />
          <View style={{ height: 16 }} />
          <Input
            label="License Plate"
            value={licensePlate}
            onChangeText={setLicensePlate}
            placeholder="ABC 1234"
            autoCapitalize="characters"
          />
          <View style={{ height: 16 }} />
          <Input label="VIN" value={vin} onChangeText={setVin} placeholder="Optional" />
          <View style={{ height: 16 }} />
          <Input
            label="Notes"
            value={notes}
            onChangeText={setNotes}
            placeholder="Any notes about this bike"
            multiline
            numberOfLines={3}
            style={{ minHeight: 80, textAlignVertical: 'top', paddingTop: 12 }}
          />

          <Button
            title="Save Bike"
            onPress={handleSave}
            loading={loading}
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
