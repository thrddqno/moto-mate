import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Card } from '../../components/ui/Card';
import { StatusDot } from '../../components/ui/StatusDot';
import { MileageDisplay } from '../../components/ui/MileageDisplay';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import LogServiceModal from '../../components/service/LogServiceModal';
import MileageModal from '../../components/dashboard/MileageModal';
import { useFocusEffect } from '@react-navigation/native';
import { useBikeStore } from '../../stores/bikeStore';
import { formatDate } from '../../utils/format';
import type { MotorcycleDetail } from '../../types';
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
  const [showActions, setShowActions] = useState(false);
  const [logServiceVisible, setLogServiceVisible] = useState(false);
  const [mileageVisible, setMileageVisible] = useState(false);

  const fetchBike = useCallback(async () => {
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
            <Text style={[styles.heroName, { color: colors.text }]}>{bike.name}</Text>
            <Text style={[styles.heroMeta, { color: colors.textDim }]}>
              {bike.make} {bike.model} · {bike.year}
            </Text>
          </View>
          <View style={styles.mileageRow}>
            <MileageDisplay mileage={bike.currentMileage} size="md" color={colors.amber} />
          </View>
          {bike.licensePlate && (
            <Text style={[styles.plate, { color: colors.textSecondary }]}>{bike.licensePlate}</Text>
          )}
        </Card>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate('SchedulesList', { bikeId })}
          style={[styles.scheduleNav, { borderColor: colors.border }]}
        >
          <View style={styles.scheduleNavTop}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <StatusDot status={bike.overdueCount > 0 ? 'overdue' : bike.dueSoonCount > 0 ? 'due-soon' : 'upcoming'} size={8} />
              <Text style={[styles.scheduleNavTitle, { color: colors.text }]}>SCHEDULES</Text>
              <Text style={[styles.scheduleCount, { color: colors.textDim }]}>{bike.totalSchedules}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textDim} />
          </View>
          <View style={styles.statsRow}>
            <StatBadge label="Overdue" value={bike.overdueCount} color={colors.red} colors={colors} />
            <StatBadge label="Due Soon" value={bike.dueSoonCount} color={colors.amber} colors={colors} />
            <StatBadge label="Upcoming" value={bike.upcomingCount} color={colors.green} colors={colors} />
          </View>
        </TouchableOpacity>

        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>SERVICE HISTORY</Text>
        </View>

        {bike.recentServiceLogs.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={[styles.emptyIcon]}>🔧</Text>
            <Text style={[styles.emptyText, { color: colors.textDim }]}>
              No service logs yet
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              Record maintenance services to build your bike's history
            </Text>
          </Card>
        ) : (
          bike.recentServiceLogs.map((log) => (
            <View key={log.id} style={[styles.logRow, { borderBottomColor: colors.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.logName, { color: colors.text }]}>{log.templateName}</Text>
                <Text style={[styles.logMeta, { color: colors.textDim }]}>
                  {formatDate(log.dateOfService)} · {log.mileageAtService.toLocaleString()} km
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.amber, shadowColor: colors.amber }]}
        onPress={() => setShowActions(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color={colors.black} />
      </TouchableOpacity>

      <Modal visible={showActions} transparent animationType="fade">
        <TouchableOpacity
          style={styles.actionOverlay}
          activeOpacity={1}
          onPress={() => setShowActions(false)}
        >
          <View style={[styles.actionSheet, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.actionSheetTitle, { color: colors.text }]}>Quick Action</Text>

            <TouchableOpacity
              style={[styles.actionRow, { borderBottomColor: colors.border }]}
              onPress={() => { setShowActions(false); setMileageVisible(true); }}
            >
              <View style={[styles.actionIcon, { backgroundColor: colors.blueDim }]}>
                <Ionicons name="speedometer" size={22} color={colors.blue} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.actionLabel, { color: colors.text }]}>Log Mileage</Text>
                <Text style={[styles.actionHint, { color: colors.textDim }]}>
                  Update your bike's current mileage
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => { setShowActions(false); setLogServiceVisible(true); }}
            >
              <View style={[styles.actionIcon, { backgroundColor: colors.amberDim }]}>
                <Ionicons name="build" size={22} color={colors.amber} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.actionLabel, { color: colors.text }]}>Log Service</Text>
                <Text style={[styles.actionHint, { color: colors.textDim }]}>
                  Record a maintenance service
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <LogServiceModal
        visible={logServiceVisible}
        onClose={() => setLogServiceVisible(false)}
        preselectedBikeId={bikeId}
      />
      <MileageModal
        visible={mileageVisible}
        onClose={() => setMileageVisible(false)}
        preselectedBikeId={bikeId}
      />
    </View>
  );
}

function StatBadge({ label, value, color, colors: c }: { label: string; value: number; color: string; colors: any }) {
  return (
    <View style={[statStyles.badge, { borderColor: color, backgroundColor: c.surfaceSubtle }]}>
      <Text style={[statStyles.value, { color, fontFamily: 'JetBrainsMono_700Bold' }]}>{value}</Text>
      <Text style={[statStyles.label, { color: c.textDim }]}>{label}</Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
  badge: { flex: 1, alignItems: 'center', paddingVertical: 8, borderWidth: 1, borderRadius: 8, marginHorizontal: 3, backgroundColor: 'rgba(255,255,255,0.03)' },
  value: { fontSize: 18, letterSpacing: -1 },
  label: { fontFamily: 'Karla_600SemiBold', fontSize: 9, letterSpacing: 0.8, marginTop: 2 },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingBottom: 96 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    marginBottom: 12,
  },
  heroCard: { marginBottom: 12, paddingVertical: 14 },
  heroTop: { marginBottom: 8 },
  heroName: { fontFamily: 'Audiowide_400Regular', fontSize: 20, letterSpacing: 1 },
  heroMeta: { fontFamily: 'Karla_400Regular', fontSize: 13, marginTop: 2 },
  mileageRow: { alignItems: 'center', paddingVertical: 8 },
  plate: { fontFamily: 'JetBrainsMono_500Medium', fontSize: 13, marginTop: 6, textAlign: 'center' },
  scheduleNav: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 20,
  },
  scheduleNavTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  scheduleNavTitle: { fontFamily: 'Karla_700Bold', fontSize: 13, letterSpacing: 1.5 },
  scheduleCount: { fontFamily: 'JetBrainsMono_700Bold', fontSize: 11 },
  statsRow: { flexDirection: 'row' },
  sectionHeaderRow: {
    marginBottom: 12,
  },
  sectionTitle: { fontFamily: 'Karla_700Bold', fontSize: 12, letterSpacing: 1.5 },
  emptyCard: { alignItems: 'center', paddingVertical: 28 },
  emptyIcon: { fontSize: 32, marginBottom: 12 },
  emptyText: { fontFamily: 'Karla_600SemiBold', fontSize: 15, textAlign: 'center' },
  emptySubtext: { fontFamily: 'Karla_400Regular', fontSize: 13, textAlign: 'center', marginTop: 6, maxWidth: 220 },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  logName: { fontFamily: 'Karla_600SemiBold', fontSize: 14 },
  logMeta: { fontFamily: 'Karla_400Regular', fontSize: 12, marginTop: 2 },
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
  actionOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 100,
    paddingHorizontal: 20,
  },
  actionSheet: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
  },
  actionSheetTitle: {
    fontFamily: 'Karla_700Bold',
    fontSize: 16,
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 14,
  },
  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: {
    fontFamily: 'Karla_600SemiBold',
    fontSize: 15,
  },
  actionHint: {
    fontFamily: 'Karla_400Regular',
    fontSize: 12,
    marginTop: 2,
  },
});
