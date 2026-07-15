import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius } from '../constants/theme';
import api from '../services/api';
import { DashboardResponse, DashboardItem, ApiResponse } from '../types/api';
import UpdateMileageModal from '../components/UpdateMileageModal';

type Section = {
  title: string;
  color: string;
  items: DashboardItem[];
  borderColor: string;
};

function formatRemaining(item: DashboardItem): string {
  const parts: string[] = [];
  if (item.milesRemaining !== null) {
    parts.push(`${item.milesRemaining} km remaining`);
  }
  if (item.daysRemaining !== null) {
    parts.push(`${item.daysRemaining} days remaining`);
  }
  return parts.join(' · ');
}

export default function DashboardScreen({ navigation }: any) {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mileageModalVisible, setMileageModalVisible] = useState(false);
  const [mileageModalBikeId, setMileageModalBikeId] = useState('');
  const [mileageModalCurrent, setMileageModalCurrent] = useState(0);

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      const res = await api.get<ApiResponse<DashboardResponse>>('/dashboard');
      setData(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const sections: Section[] = [
    {
      title: 'Overdue',
      color: Colors.error,
      items: data?.overdue ?? [],
      borderColor: Colors.overdue,
    },
    {
      title: 'Due Soon',
      color: Colors.secondary,
      items: data?.dueSoon ?? [],
      borderColor: Colors.dueSoon,
    },
    {
      title: 'Upcoming',
      color: Colors.upcoming,
      items: data?.upcoming ?? [],
      borderColor: Colors.upcoming,
    },
  ];

  const hasAnyItems = sections.some((s) => s.items.length > 0);
  const totalDueThisWeek =
    (data?.overdue?.length ?? 0) + (data?.dueSoon?.length ?? 0);

  const handleUpdateMileage = () => {
    const firstBikeId = data?.overdue?.[0]?.motorcycleId
      || data?.dueSoon?.[0]?.motorcycleId
      || data?.upcoming?.[0]?.motorcycleId;
    if (firstBikeId) {
      const item = (data?.overdue || data?.dueSoon || data?.upcoming || []).find(
        (i) => i.motorcycleId === firstBikeId
      );
      setMileageModalBikeId(firstBikeId);
      setMileageModalCurrent(item?.currentMileage ?? 0);
      setMileageModalVisible(true);
    }
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
        <TouchableOpacity style={styles.retryButton} onPress={() => fetchData()}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderSection = (section: Section) => {
    if (section.items.length === 0) return null;
    return (
      <View key={section.title} style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: section.color }]}>
            {section.title}
          </Text>
          <View style={[styles.badge, { backgroundColor: section.color }]}>
            <Text style={styles.badgeText}>{section.items.length}</Text>
          </View>
        </View>
        {section.items.map((item) => (
          <View
            key={item.scheduleId}
            style={[styles.itemCard, { borderLeftColor: section.borderColor }]}
          >
            <View style={styles.itemContent}>
              <Text style={styles.itemTitle}>{item.templateName}</Text>
              <Text style={styles.itemSubtitle}>
                {item.motorcycleName}
                {formatRemaining(item) ? ` — ${formatRemaining(item)}` : ''}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.logButton}
              onPress={() =>
                navigation.navigate('LogService', {
                  motorcycleId: item.motorcycleId,
                  scheduleId: item.scheduleId,
                })
              }
            >
              <Text style={styles.logButtonText}>Log</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.appBar}>
        <Text style={styles.appBarTitle}>Moto Mate</Text>
        <TouchableOpacity style={styles.bellButton}>
          <Ionicons name="notifications-outline" size={24} color={Colors.onSurface} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={[]}
        renderItem={null}
        keyExtractor={() => 'dummy'}
        ListHeaderComponent={
          <>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTotal}>
                Total: {data?.totalBikes ?? 0} bikes
              </Text>
              <Text
                style={[
                  styles.summaryDue,
                  totalDueThisWeek > 0
                    ? styles.summaryDueHighlighted
                    : styles.summaryDueNeutral,
                ]}
              >
                {totalDueThisWeek} tasks due this week
              </Text>
              <Text style={styles.summarySchedules}>
                {data?.totalActiveSchedules ?? 0} active schedules
              </Text>
            </View>

            {sections.map(renderSection)}

            {!hasAnyItems && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🏍️</Text>
                <Text style={styles.emptyText}>All caught up!</Text>
              </View>
            )}
          </>
        }
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchData(true)}
            tintColor={Colors.primary}
          />
        }
      />

      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={handleUpdateMileage}
      >
        <Ionicons name="speedometer-outline" size={24} color={Colors.onPrimary} />
        <Text style={styles.fabLabel}>Update Mileage</Text>
      </TouchableOpacity>

      <UpdateMileageModal
        visible={mileageModalVisible}
        motorcycleId={mileageModalBikeId}
        currentMileage={mileageModalCurrent}
        onClose={() => setMileageModalVisible(false)}
        onSaved={() => fetchData(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.margin,
  },
  appBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.margin,
    backgroundColor: Colors.surface,
  },
  appBarTitle: {
    ...Typography.titleLarge,
    color: Colors.onSurface,
  },
  bellButton: {
    padding: Spacing.space8,
  },
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.card,
    padding: Spacing.space12,
    marginHorizontal: Spacing.margin,
    marginTop: Spacing.space12,
    marginBottom: Spacing.space16,
  },
  summaryTotal: {
    ...Typography.bodyLarge,
    color: Colors.onSurface,
    marginBottom: Spacing.space4,
  },
  summaryDue: {
    ...Typography.bodyMedium,
    marginBottom: Spacing.space4,
  },
  summaryDueHighlighted: {
    color: Colors.secondary,
  },
  summaryDueNeutral: {
    color: Colors.onSurfaceVariant,
  },
  summarySchedules: {
    ...Typography.bodyMedium,
    color: Colors.onSurfaceVariant,
  },
  listContent: {
    paddingBottom: 100,
  },
  section: {
    marginBottom: Spacing.space16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.margin,
    marginBottom: Spacing.space8,
  },
  sectionTitle: {
    ...Typography.headlineSmall,
    marginRight: Spacing.space8,
  },
  badge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.space8,
  },
  badgeText: {
    ...Typography.labelSmall,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    height: 72,
    borderRadius: BorderRadius.card,
    borderLeftWidth: 3,
    marginHorizontal: Spacing.margin,
    marginBottom: Spacing.space8,
    padding: Spacing.space12,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    ...Typography.titleMedium,
    color: Colors.onSurface,
  },
  itemSubtitle: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceVariant,
  },
  logButton: {
    marginLeft: Spacing.space8,
  },
  logButtonText: {
    ...Typography.labelLarge,
    color: Colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: Spacing.space32,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: Spacing.space12,
  },
  emptyText: {
    ...Typography.headlineSmall,
    color: Colors.onSurfaceVariant,
  },
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
  retryText: {
    ...Typography.labelLarge,
    color: Colors.onPrimary,
  },
  fab: {
    position: 'absolute',
    bottom: Spacing.margin,
    right: Spacing.margin,
    height: 56,
    borderRadius: BorderRadius.fab,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.space16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabLabel: {
    ...Typography.labelLarge,
    color: Colors.onPrimary,
    marginLeft: Spacing.space8,
  },
});
