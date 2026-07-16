import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { StatusDot } from '../../components/ui/StatusDot';
import { MileageDisplay } from '../../components/ui/MileageDisplay';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';
import api from '../../services/api';
import { formatDaysRemaining, formatMilesRemaining, formatDate } from '../../utils/format';
import { getStatusColor } from '../../utils/calculation';
import type { ApiResponse, DashboardResponse, DashboardItem } from '../../types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { DashboardStackParamList } from '../../navigation/DashboardStack';

type Props = NativeStackScreenProps<DashboardStackParamList, 'Dashboard'>;

export default function DashboardScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setError(null);
      const res = await api.get<ApiResponse<DashboardResponse>>('/dashboard');
      if (res.data.success && res.data.data) {
        setData(res.data.data);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  function onRefresh() {
    setRefreshing(true);
    fetchDashboard();
  }

  if (loading && !data) return <LoadingState message="Loading dashboard..." />;
  if (error && !data) return <ErrorState message={error} onRetry={fetchDashboard} />;

  const totalBikes = data?.totalBikes ?? 0;
  const totalActiveSchedules = data?.totalActiveSchedules ?? 0;
  const overdueCount = data?.overdue?.length ?? 0;
  const dueSoonCount = data?.dueSoon?.length ?? 0;
  const upcomingCount = data?.upcoming?.length ?? 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.amber}
          />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.textDim }]}>
              {profile?.displayName ? `Hey, ${profile.displayName}` : 'Dashboard'}
            </Text>
            <Text style={[styles.headerTitle, { color: colors.text }]}>MOTO MATE</Text>
          </View>
          <TouchableOpacity
            style={[styles.profileBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => navigation.getParent()?.navigate('SettingsTab')}
          >
            <Ionicons name="person" size={20} color={colors.amber} />
          </TouchableOpacity>
        </View>

        <Card style={styles.summaryCard}>
          <View style={styles.summaryGrid}>
            <SummaryItem
              label="Bikes"
              value={totalBikes.toString()}
              colors={colors}
            />
            <SummaryItem
              label="Schedules"
              value={totalActiveSchedules.toString()}
              colors={colors}
            />
            <SummaryItem
              label="Overdue"
              value={overdueCount.toString()}
              color={colors.red}
              colors={colors}
            />
            <SummaryItem
              label="Due Soon"
              value={dueSoonCount.toString()}
              color={colors.amber}
              colors={colors}
            />
          </View>
        </Card>

        {data && totalBikes === 0 ? (
          <EmptyState
            icon="🏍"
            title="No bikes yet"
            description="Add your first motorcycle to start tracking maintenance"
            actionLabel="Add a Bike"
            onAction={() => navigation.getParent()?.navigate('BikesTab', { screen: 'AddBike' })}
          />
        ) : (
          <>
            {renderSection('OVERDUE', data?.overdue ?? [], colors, navigation)}
            {renderSection('DUE SOON', data?.dueSoon ?? [], colors, navigation)}
            {renderSection('UPCOMING', data?.upcoming ?? [], colors, navigation)}

            {overdueCount === 0 && dueSoonCount === 0 && upcomingCount === 0 && (
              <EmptyState
                icon="✅"
                title="All caught up!"
                description="No maintenance items due. You're on top of it."
              />
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

function SummaryItem({
  label,
  value,
  color,
  colors: c,
}: {
  label: string;
  value: string;
  color?: string;
  colors: any;
}) {
  return (
    <View style={summaryStyles.item}>
      <Text
        style={[
          summaryStyles.value,
          { color: color || c.text, fontFamily: 'JetBrainsMono_700Bold' },
        ]}
      >
        {value}
      </Text>
      <Text style={[summaryStyles.label, { color: c.textDim }]}>{label}</Text>
    </View>
  );
}

const summaryStyles = StyleSheet.create({
  item: { alignItems: 'center', flex: 1 },
  value: { fontSize: 24, letterSpacing: -1 },
  label: { fontFamily: 'Karla_600SemiBold', fontSize: 11, letterSpacing: 1, marginTop: 2 },
});

function renderSection(
  title: string,
  items: DashboardItem[],
  colors: any,
  navigation: any,
) {
  if (items.length === 0) return null;

  const status = title === 'OVERDUE' ? 'overdue' : title === 'DUE SOON' ? 'due-soon' : 'upcoming';

  return (
    <View style={sectionStyles.section}>
      <View style={sectionStyles.header}>
        <StatusDot status={status} />
        <Text style={[sectionStyles.title, { color: colors.text, marginLeft: 8 }]}>
          {title}
        </Text>
        <Text style={[sectionStyles.count, { color: colors.textDim }]}>
          {items.length}
        </Text>
      </View>
      {items.map((item) => (
        <TouchableOpacity
          key={item.scheduleId}
          activeOpacity={0.7}
          onPress={() =>
            navigation.navigate('LogService', {
              scheduleId: item.scheduleId,
              motorcycleId: item.motorcycleId,
            })
          }
        >
          <Card style={sectionStyles.card}>
            <View style={sectionStyles.cardLeft}>
              <StatusDot status={status} size={8} pulsing={status === 'overdue'} />
            </View>
            <View style={sectionStyles.cardContent}>
              <Text style={[sectionStyles.taskName, { color: colors.text }]}>
                {item.templateName}
              </Text>
              <Text style={[sectionStyles.bikeName, { color: colors.textDim }]}>
                {item.motorcycleName}
              </Text>
              {item.milesRemaining != null && (
                <Text
                  style={[
                    sectionStyles.dueText,
                    { color: getStatusColor(item.status) },
                  ]}
                >
                  {formatMilesRemaining(item.milesRemaining)}
                </Text>
              )}
              {item.daysRemaining != null && (
                <Text
                  style={[
                    sectionStyles.dueText,
                    { color: getStatusColor(item.status) },
                  ]}
                >
                  {formatDaysRemaining(item.daysRemaining)}
                </Text>
              )}
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textDim} />
          </Card>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  section: { marginTop: 24 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, paddingHorizontal: 4 },
  title: { fontFamily: 'Karla_700Bold', fontSize: 14, letterSpacing: 1.5 },
  count: {
    fontFamily: 'JetBrainsMono_700Bold',
    fontSize: 12,
    marginLeft: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    marginBottom: 8,
  },
  cardLeft: { width: 20, alignItems: 'center' },
  cardContent: { flex: 1, marginLeft: 8 },
  taskName: { fontFamily: 'Karla_600SemiBold', fontSize: 15 },
  bikeName: { fontFamily: 'Karla_400Regular', fontSize: 13, marginTop: 2 },
  dueText: { fontFamily: 'JetBrainsMono_500Medium', fontSize: 12, marginTop: 4 },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingBottom: 32 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 16,
    marginBottom: 20,
  },
  greeting: { fontFamily: 'Karla_400Regular', fontSize: 14, marginBottom: 2 },
  headerTitle: { fontFamily: 'Audiowide_400Regular', fontSize: 22, letterSpacing: 2 },
  profileBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryCard: { marginBottom: 8 },
  summaryGrid: { flexDirection: 'row', justifyContent: 'space-between' },
});
