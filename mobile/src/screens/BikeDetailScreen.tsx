import React, { useState, useCallback, useRef, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SectionList,
  ActivityIndicator,
  Alert,
  Animated,
  PanResponder,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { differenceInDays } from 'date-fns';
import { Colors, Spacing, Typography, BorderRadius } from '../constants/theme';
import api from '../services/api';
import type { MotorcycleDetail, Schedule, ApiResponse } from '../types/api';
import type { MainStackParamList } from '../navigation/MainStackNavigator';

type Navigation = NativeStackNavigationProp<MainStackParamList>;

const SWIPE_WIDTH = 160;
const DUE_SOON_DAYS = 30;
const DUE_SOON_KM = 500;

interface EnrichedSchedule extends Schedule {
  status: 'OVERDUE' | 'DUE_SOON' | 'UPCOMING';
  daysRemaining: number | null;
  kmRemaining: number | null;
}

interface ScheduleSection {
  title: string;
  borderColor: string;
  data: EnrichedSchedule[];
}

function formatMileage(km: number): string {
  return km.toLocaleString();
}

function enrichSchedule(schedule: Schedule, currentMileage: number): EnrichedSchedule {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let daysRemaining: number | null = null;
  let kmRemaining: number | null = null;

  if (schedule.nextDueDate) {
    daysRemaining = differenceInDays(new Date(schedule.nextDueDate), today);
  }
  if (schedule.nextDueMileage != null) {
    kmRemaining = schedule.nextDueMileage - currentMileage;
  }

  const overdue =
    (daysRemaining !== null && daysRemaining < 0) ||
    (kmRemaining !== null && kmRemaining < 0);

  const dueSoon =
    !overdue &&
    ((daysRemaining != null && daysRemaining >= 0 && daysRemaining <= DUE_SOON_DAYS) ||
      (kmRemaining != null && kmRemaining >= 0 && kmRemaining <= DUE_SOON_KM));

  const status: EnrichedSchedule['status'] = overdue
    ? 'OVERDUE'
    : dueSoon
    ? 'DUE_SOON'
    : 'UPCOMING';

  return { ...schedule, status, daysRemaining, kmRemaining };
}

function buildSections(schedules: EnrichedSchedule[]): ScheduleSection[] {
  const groups: Record<string, EnrichedSchedule[]> = {
    OVERDUE: [],
    DUE_SOON: [],
    UPCOMING: [],
  };
  for (const s of schedules) {
    groups[s.status].push(s);
  }

  const result: ScheduleSection[] = [];
  if (groups.OVERDUE.length > 0) {
    result.push({ title: 'Overdue', borderColor: Colors.error, data: groups.OVERDUE });
  }
  if (groups.DUE_SOON.length > 0) {
    result.push({ title: 'Due Soon', borderColor: Colors.dueSoon, data: groups.DUE_SOON });
  }
  if (groups.UPCOMING.length > 0) {
    result.push({ title: 'Upcoming', borderColor: Colors.upcoming, data: groups.UPCOMING });
  }
  return result;
}

function formatInterval(schedule: Schedule): string {
  const parts: string[] = [];
  if (schedule.intervalMileage != null) {
    parts.push(`Every ${formatMileage(schedule.intervalMileage)} km`);
  }
  if (schedule.intervalDays != null) {
    parts.push(`Every ${schedule.intervalDays} days`);
  }
  return parts.join(' / ') || 'Custom interval';
}

function formatRemaining(schedule: EnrichedSchedule): string {
  const parts: string[] = [];
  if (schedule.daysRemaining != null) {
    const d = Math.abs(schedule.daysRemaining);
    parts.push(`${d} ${d === 1 ? 'day' : 'days'}`);
  }
  if (schedule.kmRemaining != null) {
    parts.push(`${formatMileage(Math.abs(schedule.kmRemaining))} km`);
  }
  return parts.join(' / ') || 'N/A';
}

function statusBorderColor(status: EnrichedSchedule['status']): string {
  switch (status) {
    case 'OVERDUE':
      return Colors.error;
    case 'DUE_SOON':
      return Colors.dueSoon;
    case 'UPCOMING':
      return Colors.upcoming;
  }
}

const SwipeableRow: React.FC<{
  children: React.ReactNode;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ children, onEdit, onDelete }) => {
  const translateX = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dx) > 15 && Math.abs(gs.dy) < Math.abs(gs.dx) * 0.5,
      onPanResponderMove: (_, gs) => {
        translateX.setValue(Math.min(0, Math.max(-SWIPE_WIDTH, gs.dx)));
      },
      onPanResponderRelease: (_, gs) => {
        const toValue = gs.dx < -SWIPE_WIDTH * 0.4 ? -SWIPE_WIDTH : 0;
        Animated.spring(translateX, { toValue, useNativeDriver: true }).start();
      },
    })
  ).current;

  const close = useCallback(() => {
    Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
  }, [translateX]);

  return (
    <View style={styles.swipeableRow}>
      <View style={styles.swipeActions}>
        <TouchableOpacity
          style={[styles.swipeAction, { backgroundColor: Colors.primary }]}
          activeOpacity={0.7}
          onPress={() => {
            close();
            onEdit();
          }}
        >
          <Ionicons name="pencil" size={20} color={Colors.onPrimary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.swipeAction, { backgroundColor: Colors.error }]}
          activeOpacity={0.7}
          onPress={() => {
            close();
            onDelete();
          }}
        >
          <Ionicons name="trash" size={20} color={Colors.onError} />
        </TouchableOpacity>
      </View>
      <Animated.View
        style={[styles.swipeableContent, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
};

export default function BikeDetailScreen({ route }: any) {
  const navigation = useNavigation<Navigation>();
  const { motorcycleId } = route.params;

  const [detail, setDetail] = useState<MotorcycleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/motorcycles/${motorcycleId}/detail`);
      const body: ApiResponse<MotorcycleDetail> = res.data;
      if (body.success) {
        setDetail(body.data);
      } else {
        setError(body.errors?.join(', ') || body.message || 'Failed to load');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }, [motorcycleId]);

  useFocusEffect(
    useCallback(() => {
      fetchDetail();
    }, [fetchDetail])
  );

  const enrichedSchedules = useMemo(() => {
    if (!detail) return [];
    return detail.schedules.map((s) => enrichSchedule(s, detail.currentMileage));
  }, [detail]);

  const sections = useMemo(() => buildSections(enrichedSchedules), [enrichedSchedules]);

  const handleDeleteSchedule = useCallback(
    (schedule: EnrichedSchedule) => {
      Alert.alert('Delete Schedule', `Delete "${schedule.templateName}"?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/schedules/${schedule.id}`);
              fetchDetail();
            } catch (err: any) {
              Alert.alert('Error', err.response?.data?.message || 'Failed to delete');
            }
          },
        },
      ]);
    },
    [fetchDetail]
  );

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
        <Ionicons name="alert-circle" size={48} color={Colors.error} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchDetail}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!detail) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bike Detail</Text>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.navigate('EditBike', { motorcycle: detail })}
        >
          <Ionicons name="pencil" size={22} color={Colors.onSurface} />
        </TouchableOpacity>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <View style={styles.heroCard}>
              <Text style={styles.heroName}>{detail.name}</Text>
              <Text style={styles.heroSubtitle}>
                {[detail.make, detail.model, detail.year].filter(Boolean).join(' · ')}
              </Text>
              <Text style={styles.heroMileage}>{formatMileage(detail.currentMileage)} km</Text>
            </View>

            <View style={styles.summaryRow}>
              <View style={styles.summaryChip}>
                <Text style={styles.summaryLabel}>Due Now</Text>
                <Text style={[styles.summaryCount, { color: Colors.error }]}>
                  {detail.overdueCount}
                </Text>
              </View>
              <View style={styles.summaryChip}>
                <Text style={styles.summaryLabel}>Due Soon</Text>
                <Text style={[styles.summaryCount, { color: Colors.dueSoon }]}>
                  {detail.dueSoonCount}
                </Text>
              </View>
              <View style={styles.summaryChip}>
                <Text style={styles.summaryLabel}>Upcoming</Text>
                <Text style={[styles.summaryCount, { color: Colors.upcoming }]}>
                  {detail.upcomingCount}
                </Text>
              </View>
            </View>
          </>
        }
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionDot, { backgroundColor: section.borderColor }]} />
            <Text style={styles.sectionTitle}>{section.title}</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <SwipeableRow
            onEdit={() =>
              navigation.navigate('EditSchedule', {
                motorcycleId: detail.id,
                scheduleId: item.id,
              })
            }
            onDelete={() => handleDeleteSchedule(item)}
          >
            <TouchableOpacity
              style={[styles.scheduleItem, { borderLeftColor: statusBorderColor(item.status) }]}
              activeOpacity={0.7}
              onPress={() =>
                navigation.navigate('LogService', {
                  motorcycleId: detail.id,
                  scheduleId: item.id,
                })
              }
            >
              <View style={styles.scheduleItemContent}>
                <Text style={styles.scheduleItemTitle}>{item.templateName}</Text>
                <Text style={styles.scheduleItemInterval}>{formatInterval(item)}</Text>
                <Text style={styles.scheduleItemMeta}>{detail.name}</Text>
              </View>
              <Text style={styles.scheduleItemRemaining}>{formatRemaining(item)}</Text>
            </TouchableOpacity>
          </SwipeableRow>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No service schedules yet</Text>}
      />

      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('LogService', { motorcycleId: detail.id })}
      >
        <Ionicons name="add" size={28} color={Colors.onPrimary} />
      </TouchableOpacity>
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
    padding: Spacing.space24,
  },
  errorText: {
    ...Typography.bodyLarge,
    color: Colors.error,
    textAlign: 'center',
    marginTop: Spacing.space16,
    marginBottom: Spacing.space24,
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.margin,
    paddingTop: 48,
    paddingBottom: Spacing.space12,
    backgroundColor: Colors.background,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...Typography.titleLarge,
    color: Colors.onSurface,
  },
  heroCard: {
    backgroundColor: Colors.primaryContainer,
    borderRadius: BorderRadius.card,
    padding: Spacing.space24,
    marginHorizontal: Spacing.margin,
    marginTop: Spacing.space8,
    marginBottom: Spacing.space16,
  },
  heroName: {
    ...Typography.headlineSmall,
    color: Colors.onPrimaryContainer,
    marginBottom: Spacing.space4,
  },
  heroSubtitle: {
    ...Typography.bodyLarge,
    color: Colors.onPrimaryContainer,
    opacity: 0.8,
    marginBottom: Spacing.space12,
  },
  heroMileage: {
    ...Typography.displaySmall,
    color: Colors.primary,
  },
  summaryRow: {
    flexDirection: 'row',
    marginHorizontal: Spacing.margin,
    marginBottom: Spacing.space16,
    gap: Spacing.space8,
  },
  summaryChip: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.chip,
    paddingVertical: Spacing.space12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  summaryLabel: {
    ...Typography.labelSmall,
    color: Colors.onSurfaceVariant,
    marginBottom: Spacing.space4,
  },
  summaryCount: {
    ...Typography.titleLarge,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.margin,
    paddingTop: Spacing.space16,
    paddingBottom: Spacing.space8,
  },
  sectionDot: {
    width: 4,
    height: 16,
    borderRadius: 2,
    marginRight: Spacing.space8,
  },
  sectionTitle: {
    ...Typography.titleSmall,
    color: Colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  swipeableRow: {
    marginHorizontal: Spacing.margin,
    marginBottom: Spacing.space8,
    borderRadius: BorderRadius.chip,
    overflow: 'hidden',
  },
  swipeActions: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
  },
  swipeAction: {
    width: SWIPE_WIDTH / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  swipeableContent: {
    backgroundColor: Colors.surface,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 72,
    backgroundColor: Colors.surface,
    borderLeftWidth: 3,
    borderRadius: BorderRadius.chip,
  },
  scheduleItemContent: {
    flex: 1,
    paddingHorizontal: Spacing.space12,
    paddingVertical: Spacing.space8,
  },
  scheduleItemTitle: {
    ...Typography.titleMedium,
    color: Colors.onSurface,
  },
  scheduleItemInterval: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceVariant,
  },
  scheduleItemMeta: {
    ...Typography.bodySmall,
    color: Colors.outline,
  },
  scheduleItemRemaining: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceVariant,
    paddingRight: Spacing.space12,
  },
  emptyText: {
    ...Typography.bodyMedium,
    color: Colors.outline,
    textAlign: 'center',
    marginTop: Spacing.space32,
  },
  fab: {
    position: 'absolute',
    bottom: Spacing.space24,
    right: Spacing.space24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
