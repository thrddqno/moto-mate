import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius } from '../constants/theme';
import api from '../services/api';
import { Motorcycle, ApiResponse } from '../types/api';

const BIKE_COLORS = ['#1565C0', '#FF6D00', '#2E7D32', '#BA1A1A', '#7B1FA2', '#00838F'];

function getBikeColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return BIKE_COLORS[Math.abs(hash) % BIKE_COLORS.length];
}

function formatMileage(km: number): string {
  return km.toLocaleString('en-US') + ' km';
}

export default function MyBikesScreen({ navigation }: any) {
  const [bikes, setBikes] = useState<Motorcycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBikes = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      const res = await api.get<ApiResponse<Motorcycle[]>>('/motorcycles');
      setBikes(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load motorcycles');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchBikes();
    }, [fetchBikes])
  );

  const handleDelete = (bike: Motorcycle) => {
    Alert.alert('Delete Bike', `Remove "${bike.name}" from your garage?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/motorcycles/${bike.id}`);
            setBikes((prev) => prev.filter((b) => b.id !== bike.id));
          } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to delete');
          }
        },
      },
    ]);
  };

  const dueCount = useCallback(
    (bike: Motorcycle) => {
      return 0;
    },
    []
  );

  const renderBikeCard = ({ item }: { item: Motorcycle }) => {
    const color = getBikeColor(item.id);
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('BikeDetail', { motorcycleId: item.id })}
        onLongPress={() => handleDelete(item)}
      >
        <View style={[styles.avatar, { backgroundColor: color }]}>
          <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.bikeName}>{item.name}</Text>
          <Text style={styles.bikeDetail}>
            {[item.make, item.model, item.year].filter(Boolean).join(' · ') || 'No details'}
          </Text>
          <Text style={styles.bikeDetail}>{formatMileage(item.currentMileage)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => fetchBikes()}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>My Bikes</Text>
      <FlatList
        data={bikes}
        keyExtractor={(item) => item.id}
        renderItem={renderBikeCard}
        contentContainerStyle={bikes.length === 0 ? styles.emptyContainer : styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Add your first motorcycle</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate('AddBike')}
            >
              <Text style={styles.emptyButtonText}>Add Motorcycle</Text>
            </TouchableOpacity>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchBikes(true)} tintColor={Colors.primary} />
        }
      />
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('AddBike')}
      >
        <Ionicons name="add" size={28} color={Colors.onPrimary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: Spacing.margin },
  centered: { flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center', padding: Spacing.margin },
  heading: { ...Typography.titleLarge, color: Colors.onSurface, marginBottom: Spacing.space16 },
  listContent: { paddingBottom: 80 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    height: 144,
    borderRadius: BorderRadius.card,
    padding: Spacing.space16,
    marginBottom: Spacing.space12,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.space16,
  },
  avatarText: { ...Typography.titleMedium, color: Colors.onPrimary },
  cardInfo: { flex: 1 },
  bikeName: { ...Typography.titleMedium, color: Colors.onSurface, marginBottom: Spacing.space4 },
  bikeDetail: { ...Typography.bodyMedium, color: Colors.onSurfaceVariant },
  fab: {
    position: 'absolute',
    bottom: Spacing.margin,
    right: Spacing.margin,
    width: 56,
    height: 56,
    borderRadius: BorderRadius.fab,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyState: { alignItems: 'center' },
  emptyText: { ...Typography.bodyLarge, color: Colors.onSurfaceVariant, marginBottom: Spacing.space16 },
  emptyButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.space24,
    paddingVertical: Spacing.space12,
    borderRadius: BorderRadius.button,
  },
  emptyButtonText: { ...Typography.labelLarge, color: Colors.onPrimary },
  errorText: { ...Typography.bodyLarge, color: Colors.error, textAlign: 'center', marginBottom: Spacing.space16 },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.space24,
    paddingVertical: Spacing.space12,
    borderRadius: BorderRadius.button,
  },
  retryText: { ...Typography.labelLarge, color: Colors.onPrimary },
});
