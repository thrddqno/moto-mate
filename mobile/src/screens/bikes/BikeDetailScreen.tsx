import React, { useEffect, useState } from 'react';
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
import { MileageDisplay } from '../../components/ui/MileageDisplay';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { useBikeStore } from '../../stores/bikeStore';
import { formatDate } from '../../utils/format';
import type { MotorcycleDetail, Schedule } from '../../types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BikesStackParamList } from '../../navigation/BikesStack';

type Props = NativeStackScreenProps<BikesStackParamList, 'BikeDetail'>;

export default function BikeDetailScreen({ route, navigation }: Props) {
  const { bikeId } = route.params;
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { getBikeDetail } = useBikeStore();
  const [bike, setBike] = useState<MotorcycleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchBike() {
    try {
      setError(null);
      const detail = await getBikeDetail(bikeId);
      if (detail) {
        setBike(detail);
      } else {
        setError('Failed to load bike details');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load bike details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchBike();
  }, [bikeId]);

  function onRefresh() {
    setRefreshing(true);
    fetchBike();
  }

  if (loading) return <LoadingState message="Loading bike..." />;
  if (error) return <ErrorState message={error} onRetry={fetchBike} />;
  if (!bike) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.amber} />
        }
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('EditBike', { bikeId })}>
            <Ionicons name="pencil" size={22} color={colors.textDim} />
          </TouchableOpacity>
        </View>

        <Card style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View>
              <Text style={[styles.heroName, { color: colors.text }]}>{bike.name}</Text>
              <Text style={[styles.heroMeta, { color: colors.textDim }]}>
                {bike.make} {bike.model} · {bike.year}
              </Text>
            </View>
          </View>
          <View style={styles.mileageRow}>
            <MileageDisplay mileage={bike.currentMileage} size="lg" color={colors.amber} />
            <Text style={[styles.odometerLabel, { color: colors.textDim }]}>CURRENT MILEAGE</Text>
          </View>
          {bike.licensePlate && (
            <Text style={[styles.plate, { color: colors.textSecondary }]}>{bike.licensePlate}</Text>
          )}
        </Card>

        <View style={styles.statsRow}>
          <StatBadge label="Overdue" value={bike.overdueCount} color={colors.red} colors={colors} />
          <StatBadge label="Due Soon" value={bike.dueSoonCount} color={colors.amber} colors={colors} />
          <StatBadge label="Upcoming" value={bike.upcomingCount} color={colors.green} colors={colors} />
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>SCHEDULES</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('ScheduleForm', { bikeId })}
            style={[styles.addBtn, { borderColor: colors.amber }]}
          >
            <Ionicons name="add" size={16} color={colors.amber} />
            <Text style={[styles.addBtnText, { color: colors.amber }]}>Add</Text>
          </TouchableOpacity>
        </View>

        {bike.schedules.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={[styles.emptyText, { color: colors.textDim }]}>
              No schedules yet. Add a maintenance schedule to start tracking.
            </Text>
          </Card>
        ) : (
          bike.schedules.map((schedule) => (
            <TouchableOpacity
              key={schedule.id}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('ScheduleForm', { bikeId, schedule })}
            >
              <ScheduleCard schedule={schedule} colors={colors} />
            </TouchableOpacity>
          ))
        )}

        {bike.recentServiceLogs.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>
              RECENT SERVICE
            </Text>
            {bike.recentServiceLogs.map((log) => (
              <View key={log.id} style={[styles.logRow, { borderBottomColor: colors.border }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.logName, { color: colors.text }]}>{log.templateName}</Text>
                  <Text style={[styles.logMeta, { color: colors.textDim }]}>
                    {formatDate(log.dateOfService)} · {log.mileageAtService.toLocaleString()} km
                  </Text>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
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

function ScheduleCard({ schedule, colors: c }: { schedule: Schedule; colors: any }) {
  return (
    <Card style={scheduleStyles.card}>
      <View style={scheduleStyles.top}>
        <Text style={[scheduleStyles.name, { color: c.text }]}>{schedule.templateName}</Text>
        <Ionicons name="chevron-forward" size={16} color={c.textDim} />
      </View>
      <View style={scheduleStyles.details}>
        {schedule.intervalType !== 'DATE' && schedule.nextDueMileage != null && (
          <Text style={[scheduleStyles.detail, { color: c.textDim }]}>
            Due at {schedule.nextDueMileage.toLocaleString()} km
          </Text>
        )}
        {schedule.intervalType !== 'MILEAGE' && schedule.nextDueDate && (
          <Text style={[scheduleStyles.detail, { color: c.textDim }]}>
            Due {formatDate(schedule.nextDueDate)}
          </Text>
        )}
        <Text style={[scheduleStyles.interval, { color: c.green }]}>
          Every {schedule.intervalMileage ? `${schedule.intervalMileage.toLocaleString()} km` : ''}
          {schedule.intervalMileage && schedule.intervalDays ? ' / ' : ''}
          {schedule.intervalDays ? `${schedule.intervalDays} days` : ''}
        </Text>
      </View>
    </Card>
  );
}

const scheduleStyles = StyleSheet.create({
  card: { marginBottom: 8, paddingVertical: 14 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontFamily: 'Karla_600SemiBold', fontSize: 15 },
  details: { marginTop: 6 },
  detail: { fontFamily: 'Karla_400Regular', fontSize: 13, marginTop: 2 },
  interval: { fontFamily: 'JetBrainsMono_500Medium', fontSize: 11, marginTop: 4 },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingBottom: 32 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    marginBottom: 16,
  },
  heroCard: { marginBottom: 16, paddingVertical: 20 },
  heroTop: { marginBottom: 16 },
  heroName: { fontFamily: 'Audiowide_400Regular', fontSize: 22, letterSpacing: 1 },
  heroMeta: { fontFamily: 'Karla_400Regular', fontSize: 14, marginTop: 4 },
  mileageRow: { alignItems: 'center', paddingVertical: 12 },
  odometerLabel: { fontFamily: 'Karla_700Bold', fontSize: 10, letterSpacing: 1.5, marginTop: 4 },
  plate: { fontFamily: 'JetBrainsMono_500Medium', fontSize: 14, marginTop: 8, textAlign: 'center' },
  statsRow: { flexDirection: 'row', marginBottom: 24 },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontFamily: 'Karla_700Bold', fontSize: 12, letterSpacing: 1.5 },
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
  emptyCard: { alignItems: 'center', paddingVertical: 24 },
  emptyText: { fontFamily: 'Karla_400Regular', fontSize: 14, textAlign: 'center' },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  logName: { fontFamily: 'Karla_600SemiBold', fontSize: 14 },
  logMeta: { fontFamily: 'Karla_400Regular', fontSize: 12, marginTop: 2 },
});
