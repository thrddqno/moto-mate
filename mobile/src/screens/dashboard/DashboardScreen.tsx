import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { StatusDot } from '../../components/ui/StatusDot';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';
import LogServiceModal from '../../components/service/LogServiceModal';
import MileageModal from '../../components/dashboard/MileageModal';
import { useDashboardStore } from '../../stores/dashboardStore';
import { formatDaysRemaining, formatMilesRemaining } from '../../utils/format';
import { getStatusColor } from '../../utils/calculation';
import type { DashboardItem } from '../../types';

function getGreeting(displayName?: string | null): string {
  const hour = new Date().getHours();
  let timeGreeting: string;
  if (hour >= 5 && hour < 12) timeGreeting = 'Good morning';
  else if (hour >= 12 && hour < 17) timeGreeting = 'Good afternoon';
  else if (hour >= 17 && hour < 22) timeGreeting = 'Good evening';
  else timeGreeting = 'Hey';

  if (displayName) return `${timeGreeting}, ${displayName}`;
  return 'Dashboard';
}

export default function DashboardScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const { data, loading, error, fetchDashboard, lastFetched } = useDashboardStore();
  const [refreshing, setRefreshing] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [logServiceVisible, setLogServiceVisible] = useState(false);
  const [mileageVisible, setMileageVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DashboardItem | null>(null);

  function handleCardTap(item: DashboardItem) {
    setSelectedItem(item);
    setLogServiceVisible(true);
  }

  useEffect(() => {
    if (!lastFetched) fetchDashboard();
  }, []);

  function onRefresh() {
    setRefreshing(true);
    fetchDashboard().finally(() => setRefreshing(false));
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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.amber} />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.textDim }]}>
              {getGreeting(profile?.displayName)}
            </Text>
            <Text style={[styles.headerTitle, { color: colors.text }]}>MOTO MATE</Text>
          </View>
          <TouchableOpacity
            style={[styles.profileBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Ionicons name="person" size={20} color={colors.amber} />
          </TouchableOpacity>
        </View>

        <Card style={styles.summaryCard}>
          <View style={styles.summaryGrid}>
            <SummaryItem label="Schedules" value={totalActiveSchedules.toString()} colors={colors} />
            <SummaryItem label="Overdue" value={overdueCount.toString()} color={colors.red} colors={colors} />
            <SummaryItem label="Due Soon" value={dueSoonCount.toString()} color={colors.amber} colors={colors} />
          </View>
        </Card>

        {data && totalBikes === 0 ? (
          <EmptyState
            icon="🏍"
            title="No bikes yet"
            description="Add your first motorcycle to start tracking maintenance"
            actionLabel="Add a Bike"
          />
        ) : (
          <>
            {renderSection('OVERDUE', data?.overdue ?? [], colors, handleCardTap)}
            {renderSection('DUE SOON', data?.dueSoon ?? [], colors, handleCardTap)}
            {renderSection('UPCOMING', data?.upcoming ?? [], colors, handleCardTap)}

            {overdueCount === 0 && dueSoonCount === 0 && upcomingCount === 0 && (
              <EmptyState icon="✅" title="All caught up!" description="No maintenance items due. You're on top of it." />
            )}
          </>
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
          style={[styles.actionOverlay, { backgroundColor: colors.overlay }]}
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

      <MileageModal visible={mileageVisible} onClose={() => setMileageVisible(false)} />
      <LogServiceModal
        visible={logServiceVisible}
        onClose={() => { setLogServiceVisible(false); setSelectedItem(null); }}
        preselectedBikeId={selectedItem?.motorcycleId}
        preselectedScheduleId={selectedItem?.scheduleId}
      />
    </View>
  );
}

function SummaryItem({ label, value, color, colors: c }: { label: string; value: string; color?: string; colors: any }) {
  return (
    <View style={summaryStyles.item}>
      <Text style={[summaryStyles.value, { color: color || c.text, fontFamily: 'JetBrainsMono_700Bold' }]}>
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

function renderSection(title: string, items: DashboardItem[], colors: any, onItemPress?: (item: DashboardItem) => void) {
  if (items.length === 0) return null;

  const status = title === 'OVERDUE' ? 'overdue' as const : title === 'DUE SOON' ? 'due-soon' as const : 'upcoming' as const;

  return (
    <View style={sectionStyles.section}>
      <View style={sectionStyles.header}>
        <StatusDot status={status} />
        <Text style={[sectionStyles.title, { color: colors.text, marginLeft: 8 }]}>{title}</Text>
        <Text style={[sectionStyles.count, { color: colors.textDim }]}>{items.length}</Text>
      </View>
      {items.map((item) => (
        <TouchableOpacity key={item.scheduleId} activeOpacity={0.7} onPress={() => onItemPress?.(item)}>
          <Card style={sectionStyles.card}>
            <View style={sectionStyles.cardLeft}>
              <StatusDot status={status} size={8} pulsing={status === 'overdue'} />
            </View>
            <View style={sectionStyles.cardContent}>
              <Text style={[sectionStyles.taskName, { color: colors.text }]}>{item.templateName}</Text>
              <Text style={[sectionStyles.bikeName, { color: colors.textDim }]}>{item.motorcycleName}</Text>
              {item.milesRemaining != null && (
                <Text style={[sectionStyles.dueText, { color: getStatusColor(item.status) }]}>
                  {formatMilesRemaining(item.milesRemaining)}
                </Text>
              )}
              {item.daysRemaining != null && (
                <Text style={[sectionStyles.dueText, { color: getStatusColor(item.status) }]}>
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
  count: { fontFamily: 'JetBrainsMono_700Bold', fontSize: 12, marginLeft: 8 },
  card: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, marginBottom: 8 },
  cardLeft: { width: 20, alignItems: 'center' },
  cardContent: { flex: 1, marginLeft: 8 },
  taskName: { fontFamily: 'Karla_600SemiBold', fontSize: 15 },
  bikeName: { fontFamily: 'Karla_400Regular', fontSize: 13, marginTop: 2 },
  dueText: { fontFamily: 'JetBrainsMono_500Medium', fontSize: 12, marginTop: 4 },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingBottom: 96 },
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
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  actionSheet: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
  },
  actionSheetTitle: {
    fontFamily: 'Audiowide_400Regular',
    fontSize: 18,
    letterSpacing: 1,
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 14,
    borderBottomWidth: 1,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: {
    fontFamily: 'Karla_600SemiBold',
    fontSize: 16,
  },
  actionHint: {
    fontFamily: 'Karla_400Regular',
    fontSize: 12,
    marginTop: 2,
  },
});
