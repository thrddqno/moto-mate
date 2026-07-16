import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Card } from '../../components/ui/Card';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';
import api from '../../services/api';
import { formatDate } from '../../utils/format';
import type { ApiResponse, PagedResponse, ServiceLog, Motorcycle } from '../../types';

export default function HistoryScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [logs, setLogs] = useState<ServiceLog[]>([]);
  const [bikes, setBikes] = useState<Motorcycle[]>([]);
  const [selectedBikeId, setSelectedBikeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchLogs = useCallback(
    async (pageNum: number = 0, append: boolean = false) => {
      if (!selectedBikeId) return;
      try {
        setError(null);
        const res = await api.get<ApiResponse<PagedResponse<ServiceLog>>>(
          `/motorcycles/${selectedBikeId}/logs/paginated`,
          { params: { page: pageNum, size: 20 } },
        );
        if (res.data.success && res.data.data) {
          const content = res.data.data.content;
          setLogs(append ? (prev) => [...prev, ...content] : content);
          setHasMore(!res.data.data.last);
          setPage(pageNum);
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to load history');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [selectedBikeId],
  );

  const fetchBikes = useCallback(async () => {
    try {
      const res = await api.get<ApiResponse<Motorcycle[]>>('/motorcycles');
      if (res.data.success && res.data.data) {
        setBikes(res.data.data);
        if (res.data.data.length > 0) {
          setSelectedBikeId(res.data.data[0].id);
        }
      }
    } catch {
      // silent
    }
  }, []);

  React.useEffect(() => {
    fetchBikes();
  }, [fetchBikes]);

  React.useEffect(() => {
    if (selectedBikeId) {
      setLoading(true);
      setLogs([]);
      fetchLogs(0);
    } else {
      setLoading(false);
    }
  }, [selectedBikeId, fetchLogs]);

  function onRefresh() {
    setRefreshing(true);
    fetchLogs(0);
  }

  function loadMore() {
    if (hasMore && !loading) {
      fetchLogs(page + 1, true);
    }
  }

  const selectedBike = bikes.find((b) => b.id === selectedBikeId);

  if (bikes.length === 0 && !loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
        <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
        <EmptyState
          icon="📋"
          title="No service history"
          description="Add a bike and log your first service to see history here"
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />

      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>HISTORY</Text>
      </View>

      {bikes.length > 1 && (
        <View style={styles.bikeFilter}>
          {bikes.map((bike) => (
            <TouchableOpacity
              key={bike.id}
              style={[
                styles.bikeChip,
                {
                  backgroundColor:
                    selectedBikeId === bike.id ? colors.amberDim : colors.surface,
                  borderColor:
                    selectedBikeId === bike.id ? colors.amber : colors.border,
                },
              ]}
              onPress={() => setSelectedBikeId(bike.id)}
            >
              <Text
                style={[
                  styles.bikeChipText,
                  {
                    color:
                      selectedBikeId === bike.id ? colors.amber : colors.textSecondary,
                  },
                ]}
              >
                {bike.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {loading && logs.length === 0 ? (
        <LoadingState message="Loading history..." />
      ) : error && logs.length === 0 ? (
        <ErrorState message={error} onRetry={() => fetchLogs(0)} />
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.amber}
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <EmptyState
              icon="🔧"
              title="No service logs yet"
              description={
                selectedBike
                  ? `Log your first service for ${selectedBike.name}`
                  : 'Select a bike to view its history'
              }
            />
          }
          ListHeaderComponent={
            logs.length > 0 ? (
              <Text style={[styles.count, { color: colors.textDim }]}>
                {logs.length} service{logs.length !== 1 ? 's' : ''} logged
              </Text>
            ) : null
          }
          renderItem={({ item }) => (
            <Card style={styles.logCard}>
              <View style={styles.logTop}>
                <Text style={[styles.logTask, { color: colors.text }]}>
                  {item.templateName}
                </Text>
                <Text style={[styles.logMileage, { color: colors.amber }]}>
                  {item.mileageAtService.toLocaleString()} km
                </Text>
              </View>
              <Text style={[styles.logDate, { color: colors.textDim }]}>
                {formatDate(item.dateOfService)}
              </Text>
              {item.notes && (
                <Text
                  style={[styles.logNotes, { color: colors.textSecondary }]}
                  numberOfLines={2}
                >
                  {item.notes}
                </Text>
              )}
            </Card>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: { fontFamily: 'Audiowide_400Regular', fontSize: 22, letterSpacing: 2 },
  bikeFilter: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  bikeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  bikeChipText: { fontFamily: 'Karla_600SemiBold', fontSize: 13 },
  list: { paddingHorizontal: 16, paddingBottom: 32 },
  count: { fontFamily: 'Karla_400Regular', fontSize: 13, marginBottom: 12 },
  logCard: { marginBottom: 8, paddingVertical: 14 },
  logTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logTask: { fontFamily: 'Karla_600SemiBold', fontSize: 15 },
  logMileage: { fontFamily: 'JetBrainsMono_700Bold', fontSize: 14 },
  logDate: { fontFamily: 'Karla_400Regular', fontSize: 13, marginTop: 4 },
  logNotes: { fontFamily: 'Karla_400Regular', fontSize: 13, marginTop: 6 },
});
