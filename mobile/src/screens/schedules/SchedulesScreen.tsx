import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Card } from '../../components/ui/Card';
import { StatusDot } from '../../components/ui/StatusDot';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import LogServiceModal from '../../components/service/LogServiceModal';
import { useFocusEffect } from '@react-navigation/native';
import { useBikeStore } from '../../stores/bikeStore';
import { formatDate } from '../../utils/format';
import type { MotorcycleDetail, Schedule } from '../../types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BikesStackParamList } from '../../navigation/BikesStack';

type Props = NativeStackScreenProps<BikesStackParamList, 'SchedulesList'>;

type ScheduleStatus = 'overdue' | 'due-soon' | 'upcoming';

function getScheduleStatus(schedule: Schedule, currentMileage: number, today: Date): ScheduleStatus {
  if (schedule.intervalType !== 'DATE' && schedule.nextDueMileage != null && currentMileage >= schedule.nextDueMileage) {
    return 'overdue';
  }
  if (schedule.intervalType !== 'MILEAGE' && schedule.nextDueDate != null && today >= new Date(schedule.nextDueDate)) {
    return 'overdue';
  }
  if (schedule.intervalType !== 'DATE' && schedule.nextDueMileage != null) {
    const milesRemaining = schedule.nextDueMileage - currentMileage;
    if (milesRemaining <= 1000) return 'due-soon';
  }
  if (schedule.intervalType !== 'MILEAGE' && schedule.nextDueDate != null) {
    const daysRemaining = Math.ceil(
      (new Date(schedule.nextDueDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (daysRemaining <= 7) return 'due-soon';
  }
  return 'upcoming';
}

interface StatusGroup {
  status: ScheduleStatus;
  label: string;
  schedules: Schedule[];
}

function groupSchedules(schedules: Schedule[], currentMileage: number): StatusGroup[] {
  const today = new Date();
  const overdue: Schedule[] = [];
  const dueSoon: Schedule[] = [];
  const upcoming: Schedule[] = [];

  for (const s of schedules) {
    const st = getScheduleStatus(s, currentMileage, today);
    if (st === 'overdue') overdue.push(s);
    else if (st === 'due-soon') dueSoon.push(s);
    else upcoming.push(s);
  }

  const groups: StatusGroup[] = [];
  if (overdue.length) groups.push({ status: 'overdue', label: 'OVERDUE', schedules: overdue });
  if (dueSoon.length) groups.push({ status: 'due-soon', label: 'DUE SOON', schedules: dueSoon });
  if (upcoming.length) groups.push({ status: 'upcoming', label: 'UPCOMING', schedules: upcoming });
  return groups;
}

export default function SchedulesScreen({ route, navigation }: Props) {
  const { bikeId } = route.params;
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { getBikeDetail } = useBikeStore();
  const [bike, setBike] = useState<MotorcycleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logServiceVisible, setLogServiceVisible] = useState(false);

  const fetchBike = useCallback(async () => {
    try {
      setError(null);
      const detail = await getBikeDetail(bikeId);
      if (detail) {
        setBike(detail);
      } else {
        setError('Failed to load schedules');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load schedules');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [bikeId, getBikeDetail]);

  useFocusEffect(
    useCallback(() => {
      fetchBike();
    }, [fetchBike]),
  );

  function onRefresh() {
    setRefreshing(true);
    fetchBike();
  }

  if (loading) return <LoadingState message="Loading schedules..." />;
  if (error) return <ErrorState message={error} onRetry={fetchBike} />;
  if (!bike) return null;

  const groups = groupSchedules(bike.schedules, bike.currentMileage);
  const overdueCount = groups.find((g) => g.status === 'overdue')?.schedules.length ?? 0;
  const dueSoonCount = groups.find((g) => g.status === 'due-soon')?.schedules.length ?? 0;
  const upcomingCount = groups.find((g) => g.status === 'upcoming')?.schedules.length ?? 0;
  const totalCount = bike.schedules.length;

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />

      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>SCHEDULES</Text>
          <Text style={[styles.count, { color: colors.textDim }]}>{totalCount}</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('ScheduleForm', { bikeId })}
          style={[styles.addBtn, { borderColor: colors.amber }]}
        >
          <Ionicons name="add" size={16} color={colors.amber} />
          <Text style={[styles.addBtnText, { color: colors.amber }]}>Add</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <StatBadge label="Overdue" value={overdueCount} color={colors.red} colors={colors} />
        <StatBadge label="Due Soon" value={dueSoonCount} color={colors.amber} colors={colors} />
        <StatBadge label="Upcoming" value={upcomingCount} color={colors.green} colors={colors} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.amber} />
        }
      >
        {groups.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={[styles.emptyText, { color: colors.textDim }]}>
              No schedules yet. Add a maintenance schedule to start tracking.
            </Text>
          </Card>
        ) : (
          groups.map((group) => (
            <View key={group.status} style={styles.groupSection}>
              <View style={styles.groupHeader}>
                <StatusDot status={group.status} size={8} pulsing={group.status === 'overdue'} />
                <Text style={[styles.groupTitle, { color: colors.text, marginLeft: 8 }]}>
                  {group.label}
                </Text>
                <Text style={[styles.groupCount, { color: colors.textDim }]}>
                  {group.schedules.length}
                </Text>
              </View>
              {group.schedules.map((schedule) => (
                <TouchableOpacity
                  key={schedule.id}
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate('ScheduleForm', { bikeId, schedule })}
                >
                  <Card style={scheduleItemStyles.card}>
                    <View style={scheduleItemStyles.left}>
                      <StatusDot status={group.status} size={8} />
                    </View>
                    <View style={scheduleItemStyles.content}>
                      <Text style={[scheduleItemStyles.name, { color: colors.text }]}>
                        {schedule.templateName}
                      </Text>
                      <View style={scheduleItemStyles.details}>
                        {schedule.intervalType !== 'DATE' && schedule.nextDueMileage != null && (
                          <Text style={[scheduleItemStyles.detail, { color: colors.textDim }]}>
                            Due at {schedule.nextDueMileage.toLocaleString()} km
                          </Text>
                        )}
                        {schedule.intervalType !== 'MILEAGE' && schedule.nextDueDate && (
                          <Text style={[scheduleItemStyles.detail, { color: colors.textDim }]}>
                            Due {formatDate(schedule.nextDueDate)}
                          </Text>
                        )}
                      </View>
                      <Text style={[scheduleItemStyles.interval, { color: colors.green }]}>
                        Every {schedule.intervalMileage ? `${schedule.intervalMileage.toLocaleString()} km` : ''}
                        {schedule.intervalMileage && schedule.intervalDays ? ' / ' : ''}
                        {schedule.intervalDays ? `${schedule.intervalDays} days` : ''}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={colors.textDim} />
                  </Card>
                </TouchableOpacity>
              ))}
            </View>
          ))
        )}
      </ScrollView>

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.amber }]}
        onPress={() => setLogServiceVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="build" size={24} color={colors.black} />
      </TouchableOpacity>

      <LogServiceModal
        visible={logServiceVisible}
        onClose={() => setLogServiceVisible(false)}
        preselectedBikeId={bikeId}
      />
    </View>
  );
}

function StatBadge({ label, value, color, colors: c }: { label: string; value: number; color: string; colors: any }) {
  return (
    <View style={[statStyles.badge, { borderColor: color, backgroundColor: c.surface, borderRadius: 12, borderWidth: 1 }]}>
      <Text style={[statStyles.value, { color, fontFamily: 'JetBrainsMono_700Bold' }]}>{value}</Text>
      <Text style={[statStyles.label, { color: c.textDim }]}>{label}</Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
  badge: { flex: 1, alignItems: 'center', paddingVertical: 12, marginHorizontal: 4 },
  value: { fontSize: 22, letterSpacing: -1 },
  label: { fontFamily: 'Karla_600SemiBold', fontSize: 10, letterSpacing: 1, marginTop: 4 },
});

const scheduleItemStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    marginBottom: 8,
  },
  left: { width: 20, alignItems: 'center' },
  content: { flex: 1, marginLeft: 8 },
  name: { fontFamily: 'Karla_600SemiBold', fontSize: 15 },
  details: { marginTop: 4 },
  detail: { fontFamily: 'Karla_400Regular', fontSize: 13, marginTop: 2 },
  interval: { fontFamily: 'JetBrainsMono_500Medium', fontSize: 11, marginTop: 4 },
});

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
  count: { fontFamily: 'JetBrainsMono_700Bold', fontSize: 13 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 4,
  },
  addBtnText: { fontFamily: 'Karla_600SemiBold', fontSize: 12 },
  statsRow: { flexDirection: 'row', paddingHorizontal: 12, marginBottom: 8, marginTop: 4 },
  scroll: { paddingHorizontal: 16, paddingBottom: 96 },
  groupSection: { marginTop: 16 },
  groupHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, paddingHorizontal: 4 },
  groupTitle: { fontFamily: 'Karla_700Bold', fontSize: 14, letterSpacing: 1.5 },
  groupCount: { fontFamily: 'JetBrainsMono_700Bold', fontSize: 12, marginLeft: 8 },
  emptyCard: { alignItems: 'center', paddingVertical: 24, marginTop: 16 },
  emptyText: { fontFamily: 'Karla_400Regular', fontSize: 14, textAlign: 'center' },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFB300',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
});
