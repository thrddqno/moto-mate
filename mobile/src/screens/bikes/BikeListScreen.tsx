import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
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
import LogServiceModal from '../../components/service/LogServiceModal';
import { useBikeStore } from '../../stores/bikeStore';
import { useDashboardStore } from '../../stores/dashboardStore';
import type { Motorcycle } from '../../types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BikesStackParamList } from '../../navigation/BikesStack';

type Props = NativeStackScreenProps<BikesStackParamList, 'BikeList'>;

interface BikeSection {
  title: string;
  status: 'overdue' | 'due-soon' | 'upcoming' | 'ok';
  data: MotorcycleWithStatus[];
}

interface MotorcycleWithStatus extends Motorcycle {
  _status: 'overdue' | 'due-soon' | 'upcoming' | 'ok';
  _count: number;
}

export default function BikeListScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { bikes, loading, error, fetchBikes, deleteBike } = useBikeStore();
  const { data: dashboard, fetchDashboard } = useDashboardStore();
  const [refreshing, setRefreshing] = useState(false);
  const [logServiceVisible, setLogServiceVisible] = useState(false);

  useEffect(() => {
    fetchBikes();
    fetchDashboard();
  }, []);

  function onRefresh() {
    setRefreshing(true);
    Promise.all([fetchBikes(), fetchDashboard()]).finally(() => setRefreshing(false));
  }

  async function handleDelete(bike: Motorcycle) {
    Alert.alert('Delete Bike', `Remove ${bike.name}? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteBike(bike.id),
      },
    ]);
  }

  const sections = buildSections(bikes, dashboard);

  if (loading && bikes.length === 0) return <LoadingState message="Loading bikes..." />;
  if (error && bikes.length === 0) return <ErrorState message={error} onRetry={fetchBikes} />;

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />

      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>MY BIKES</Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity onPress={() => navigation.navigate('AddBike')}>
            <Ionicons name="add-circle" size={28} color={colors.amber} />
          </TouchableOpacity>
        </View>
      </View>

      <SectionList
        sections={sections}
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
        renderSectionHeader={({ section }) =>
          section.data.length === 0 ? null : (
            <View style={styles.sectionHeader}>
              <StatusDot status={section.status} size={8} />
              <Text style={[styles.sectionTitle, { color: colors.text, marginLeft: 8 }]}>
                {section.title}
              </Text>
              <Text style={[styles.sectionCount, { color: colors.textDim }]}>
                {section.data.length}
              </Text>
            </View>
          )
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
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={[styles.bikeName, { color: colors.text }]}>{item.name}</Text>
                  {item._count > 0 && (
                    <View
                      style={[
                        styles.badge,
                        {
                          backgroundColor:
                            item._status === 'overdue'
                              ? colors.redDim
                              : item._status === 'due-soon'
                                ? colors.amberDim
                                : colors.greenDim,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeText,
                          {
                            color:
                              item._status === 'overdue'
                                ? colors.red
                                : item._status === 'due-soon'
                                  ? colors.amber
                                  : colors.green,
                          },
                        ]}
                      >
                        {item._count}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.bikeMeta, { color: colors.textDim }]}>
                  {item.make} {item.model} · {item.year}
                </Text>
                <MileageDisplay mileage={item.currentMileage} size="sm" color={colors.amber} />
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textDim} />
            </Card>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.amber }]}
        onPress={() => setLogServiceVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="wrench" size={24} color={colors.black} />
      </TouchableOpacity>

      <LogServiceModal
        visible={logServiceVisible}
        onClose={() => setLogServiceVisible(false)}
      />
    </View>
  );
}

function buildSections(
  bikes: Motorcycle[],
  dashboard: any,
): BikeSection[] {
  if (!dashboard || bikes.length === 0) {
    return [{ title: 'All Bikes', status: 'ok', data: bikes.map((b) => ({ ...b, _status: 'ok' as const, _count: 0 })) }];
  }

  const bikeIdsWithStatus: Record<string, { status: 'overdue' | 'due-soon' | 'upcoming'; count: number }> = {};

  const addToMap = (items: any[], status: 'overdue' | 'due-soon' | 'upcoming') => {
    for (const item of items) {
      const id = item.motorcycleId;
      if (bikeIdsWithStatus[id]) {
        bikeIdsWithStatus[id].count++;
      } else {
        bikeIdsWithStatus[id] = { status, count: 1 };
      }
    }
  };

  addToMap(dashboard.overdue || [], 'overdue');
  addToMap(dashboard.dueSoon || [], 'due-soon');
  addToMap(dashboard.upcoming || [], 'upcoming');

  const overdue: MotorcycleWithStatus[] = [];
  const dueSoon: MotorcycleWithStatus[] = [];
  const upcoming: MotorcycleWithStatus[] = [];
  const onTrack: MotorcycleWithStatus[] = [];

  for (const bike of bikes) {
    const statusInfo = bikeIdsWithStatus[bike.id];
    if (statusInfo) {
      const mws: MotorcycleWithStatus = { ...bike, _status: statusInfo.status, _count: statusInfo.count };
      if (statusInfo.status === 'overdue') overdue.push(mws);
      else if (statusInfo.status === 'due-soon') dueSoon.push(mws);
      else upcoming.push(mws);
    } else {
      onTrack.push({ ...bike, _status: 'ok', _count: 0 });
    }
  }

  const sections: BikeSection[] = [];
  if (overdue.length) sections.push({ title: 'Overdue', status: 'overdue', data: overdue });
  if (dueSoon.length) sections.push({ title: 'Due Soon', status: 'due-soon', data: dueSoon });
  if (upcoming.length) sections.push({ title: 'Upcoming', status: 'upcoming', data: upcoming });
  if (onTrack.length) sections.push({ title: 'On Track', status: 'ok', data: onTrack });

  return sections;
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
  list: { paddingHorizontal: 16, paddingBottom: 96 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionTitle: { fontFamily: 'Karla_700Bold', fontSize: 14, letterSpacing: 1.5 },
  sectionCount: {
    fontFamily: 'JetBrainsMono_700Bold',
    fontSize: 12,
    marginLeft: 8,
  },
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
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: { fontFamily: 'JetBrainsMono_700Bold', fontSize: 10 },
  bikeMeta: { fontFamily: 'Karla_400Regular', fontSize: 13, marginTop: 2, marginBottom: 4 },
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
