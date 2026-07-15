import React, { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Colors, Spacing, Typography, BorderRadius } from '../constants/theme';
import api from '../services/api';
import { ServiceLog, Motorcycle, PagedResponse, ApiResponse } from '../types/api';

const FILTER_OPTIONS = [
  'All',
  'Oil Change',
  'Chain',
  'Tires',
  'Brakes',
  'Engine',
  'General',
  'Regulatory',
  'Cooling',
  'Electrical',
];

const PAGE_SIZE = 20;

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatMileage(km: number): string {
  return km.toLocaleString('en-US') + ' km';
}

export default function HistoryScreen({ route }: any) {
  const routeMotorcycleId: string | undefined = route?.params?.motorcycleId;

  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([]);
  const [selectedBikeId, setSelectedBikeId] = useState<string | null>(routeMotorcycleId || null);
  const [logs, setLogs] = useState<ServiceLog[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState('All');

  useEffect(() => {
    if (routeMotorcycleId) {
      setSelectedBikeId(routeMotorcycleId);
    }
  }, [routeMotorcycleId]);

  const fetchBikes = useCallback(async () => {
    if (routeMotorcycleId) return;
    try {
      const res = await api.get<ApiResponse<Motorcycle[]>>('/motorcycles');
      setMotorcycles(res.data.data);
      if (res.data.data.length === 1) {
        setSelectedBikeId(res.data.data[0].id);
      }
    } catch {
      setError('Failed to load motorcycles');
    }
  }, [routeMotorcycleId]);

  const fetchLogs = useCallback(
    async (bikeId: string, pageNum: number, filter: string, isRefresh = false) => {
      try {
        if (isRefresh) setRefreshing(true);
        else if (pageNum === 0) setLoading(true);
        else setLoadingMore(true);
        setError(null);

        let url = `/motorcycles/${bikeId}/logs/paginated?page=${pageNum}&size=${PAGE_SIZE}`;
        if (filter !== 'All') {
          url += `&templateName=${encodeURIComponent(filter)}`;
        }

        const res = await api.get<ApiResponse<PagedResponse<ServiceLog>>>(url);
        const paged = res.data.data;

        if (pageNum === 0) {
          setLogs(paged.content);
        } else {
          setLogs((prev) => [...prev, ...paged.content]);
        }
        setTotalPages(paged.totalPages);
        setPage(pageNum);
      } catch {
        setError('Failed to load service history');
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    []
  );

  useFocusEffect(
    useCallback(() => {
      fetchBikes();
    }, [fetchBikes])
  );

  useFocusEffect(
    useCallback(() => {
      if (selectedBikeId) {
        fetchLogs(selectedBikeId, 0, selectedFilter);
      }
    }, [selectedBikeId, selectedFilter, fetchLogs])
  );

  const handleRefresh = () => {
    if (selectedBikeId) {
      fetchLogs(selectedBikeId, 0, selectedFilter, true);
    }
  };

  const handleEndReached = () => {
    if (!loadingMore && page + 1 < totalPages && selectedBikeId) {
      fetchLogs(selectedBikeId, page + 1, selectedFilter);
    }
  };

  const handleBikeSelect = (bikeId: string) => {
    setSelectedBikeId(bikeId);
    setLogs([]);
    setPage(0);
    setSelectedFilter('All');
  };

  const renderLogItem = ({ item }: { item: ServiceLog }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Text style={styles.templateName}>{item.templateName}</Text>
        {item.cost != null && (
          <View style={styles.costChip}>
            <Text style={styles.costText}>₱{item.cost.toLocaleString('en-US')}</Text>
          </View>
        )}
      </View>
      <Text style={styles.date}>{formatDate(item.dateOfService)}</Text>
      <Text style={styles.mileage}>{formatMileage(item.mileageAtService)}</Text>
      {item.notes ? (
        <Text style={styles.notes} numberOfLines={1}>
          {item.notes}
        </Text>
      ) : null}
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={Colors.primary} />
      </View>
    );
  };

  const showBikeSelector = !routeMotorcycleId;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>History</Text>

      {showBikeSelector && motorcycles.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.bikeSelector}
          contentContainerStyle={styles.chipRow}
        >
          {motorcycles.map((bike) => (
            <TouchableOpacity
              key={bike.id}
              style={[
                styles.chip,
                selectedBikeId === bike.id ? styles.chipSelected : styles.chipUnselected,
              ]}
              activeOpacity={0.7}
              onPress={() => handleBikeSelect(bike.id)}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedBikeId === bike.id ? styles.chipTextSelected : styles.chipTextUnselected,
                ]}
              >
                {bike.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {selectedBikeId && (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterRow}
            contentContainerStyle={styles.chipRow}
          >
            {FILTER_OPTIONS.map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterChip,
                  selectedFilter === filter ? styles.filterChipSelected : styles.filterChipUnselected,
                ]}
                activeOpacity={0.7}
                onPress={() => setSelectedFilter(filter)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedFilter === filter
                      ? styles.filterChipTextSelected
                      : styles.filterChipTextUnselected,
                  ]}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {!loading && logs.length > 0 && (
            <Text style={styles.summary}>{logs.length} service{logs.length !== 1 ? 's' : ''}</Text>
          )}
        </>
      )}

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : !selectedBikeId ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>Select a motorcycle to view history</Text>
        </View>
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item) => item.id}
          renderItem={renderLogItem}
          contentContainerStyle={logs.length === 0 ? styles.emptyList : styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No service history yet</Text>
          }
          ListFooterComponent={renderFooter}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.4}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.primary}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: Spacing.margin },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  heading: { ...Typography.titleLarge, color: Colors.onSurface, marginBottom: Spacing.space12 },
  bikeSelector: { marginBottom: Spacing.space8 },
  filterRow: { marginBottom: Spacing.space12 },
  chipRow: { gap: Spacing.space8 },
  chip: {
    height: 32,
    paddingHorizontal: Spacing.space12,
    borderRadius: BorderRadius.chip,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipSelected: { backgroundColor: Colors.primary },
  chipUnselected: { backgroundColor: Colors.surfaceVariant },
  chipText: { ...Typography.labelMedium },
  chipTextSelected: { color: Colors.onPrimary },
  chipTextUnselected: { color: Colors.onSurfaceVariant },
  filterChip: {
    height: 32,
    paddingHorizontal: Spacing.space12,
    borderRadius: BorderRadius.chip,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterChipSelected: { backgroundColor: Colors.primary },
  filterChipUnselected: { backgroundColor: Colors.surfaceVariant },
  filterChipText: { ...Typography.labelMedium },
  filterChipTextSelected: { color: Colors.onPrimary },
  filterChipTextUnselected: { color: Colors.onSurfaceVariant },
  summary: { ...Typography.bodyMedium, color: Colors.onSurfaceVariant, marginBottom: Spacing.space8 },
  listContent: { paddingBottom: Spacing.space32 },
  emptyList: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { ...Typography.bodyLarge, color: Colors.onSurfaceVariant, textAlign: 'center' },
  card: {
    backgroundColor: Colors.surface,
    height: 80,
    borderRadius: BorderRadius.card,
    padding: Spacing.space16,
    marginBottom: Spacing.space8,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    justifyContent: 'center',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.space4,
  },
  templateName: { ...Typography.titleMedium, color: Colors.onSurface, fontWeight: '600' },
  costChip: {
    backgroundColor: Colors.secondaryContainer,
    paddingHorizontal: Spacing.space8,
    paddingVertical: Spacing.space4,
    borderRadius: BorderRadius.chip,
  },
  costText: { ...Typography.labelMedium, color: Colors.secondary },
  date: { ...Typography.bodySmall, color: Colors.onSurfaceVariant, marginBottom: 2 },
  mileage: { ...Typography.bodyMedium, color: Colors.onSurface },
  notes: { ...Typography.bodySmall, color: Colors.onSurfaceVariant, marginTop: 2 },
  footer: { paddingVertical: Spacing.space16, alignItems: 'center' },
  errorText: {
    ...Typography.bodyLarge,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: Spacing.space16,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.space24,
    paddingVertical: Spacing.space12,
    borderRadius: BorderRadius.button,
  },
  retryText: { ...Typography.labelLarge, color: Colors.onPrimary },
});
