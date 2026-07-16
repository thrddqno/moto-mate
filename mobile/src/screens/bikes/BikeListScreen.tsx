import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Card } from '../../components/ui/Card';
import { MileageDisplay } from '../../components/ui/MileageDisplay';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { StatusDot } from '../../components/ui/StatusDot';
import api from '../../services/api';
import type { ApiResponse, Motorcycle } from '../../types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BikesStackParamList } from '../../navigation/BikesStack';

type Props = NativeStackScreenProps<BikesStackParamList, 'BikeList'>;

export default function BikeListScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [bikes, setBikes] = useState<Motorcycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBikes = useCallback(async () => {
    try {
      setError(null);
      const res = await api.get<ApiResponse<Motorcycle[]>>('/motorcycles');
      if (res.data.success && res.data.data) {
        setBikes(res.data.data);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load bikes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    fetchBikes();
  }, [fetchBikes]);

  function onRefresh() {
    setRefreshing(true);
    fetchBikes();
  }

  async function handleDelete(bike: Motorcycle) {
    Alert.alert(
      'Delete Bike',
      `Remove ${bike.name}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/motorcycles/${bike.id}`);
              setBikes((prev) => prev.filter((b) => b.id !== bike.id));
            } catch {
              Alert.alert('Error', 'Failed to delete bike');
            }
          },
        },
      ],
    );
  }

  if (loading) return <LoadingState message="Loading bikes..." />;
  if (error) return <ErrorState message={error} onRetry={fetchBikes} />;

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />

      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>MY BIKES</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AddBike')}>
          <Ionicons name="add-circle" size={28} color={colors.amber} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={bikes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.amber} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="🏍"
            title="No bikes yet"
            description="Add your first motorcycle to get started"
            actionLabel="Add a Bike"
            onAction={() => navigation.navigate('AddBike')}
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('BikeDetail', { bikeId: item.id })}
            onLongPress={() => handleDelete(item)}
          >
            <Card style={styles.bikeCard}>
              <View style={styles.bikeIcon}>
                <Text style={styles.bikeEmoji}>🏍</Text>
              </View>
              <View style={styles.bikeInfo}>
                <Text style={[styles.bikeName, { color: colors.text }]}>
                  {item.name}
                </Text>
                <Text style={[styles.bikeMeta, { color: colors.textDim }]}>
                  {item.make} {item.model} · {item.year}
                </Text>
                <MileageDisplay
                  mileage={item.currentMileage}
                  size="sm"
                  color={colors.amber}
                />
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textDim} />
            </Card>
          </TouchableOpacity>
        )}
      />
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
  title: { fontFamily: 'Audiowide_400Regular', fontSize: 22, letterSpacing: 2 },
  list: { paddingHorizontal: 16, paddingBottom: 32 },
  bikeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 10,
  },
  bikeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bikeEmoji: { fontSize: 22 },
  bikeInfo: { flex: 1 },
  bikeName: { fontFamily: 'Karla_600SemiBold', fontSize: 16 },
  bikeMeta: { fontFamily: 'Karla_400Regular', fontSize: 13, marginTop: 2, marginBottom: 4 },
});
