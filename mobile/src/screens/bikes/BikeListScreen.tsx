import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  StatusBar,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Card } from '../../components/ui/Card';
import { MileageDisplay } from '../../components/ui/MileageDisplay';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import LogServiceModal from '../../components/service/LogServiceModal';
import MileageModal from '../../components/dashboard/MileageModal';
import { useFocusEffect } from '@react-navigation/native';
import { useBikeStore } from '../../stores/bikeStore';
import type { Motorcycle } from '../../types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BikesStackParamList } from '../../navigation/BikesStack';

type Props = NativeStackScreenProps<BikesStackParamList, 'BikeList'>;

export default function BikeListScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { bikes, loading, error, fetchBikes, deleteBike } = useBikeStore();
  const [refreshing, setRefreshing] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [logServiceVisible, setLogServiceVisible] = useState(false);
  const [mileageVisible, setMileageVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchBikes();
    }, [fetchBikes]),
  );

  function onRefresh() {
    setRefreshing(true);
    fetchBikes().finally(() => setRefreshing(false));
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

      <FlatList
        data={bikes}
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
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('BikeDetail', { bikeId: item.id })}
            onLongPress={() => handleDelete(item)}
          >
            <Card style={styles.bikeCard}>
              <View style={[styles.bikeIcon, { backgroundColor: colors.surface }]}>
                <Text style={styles.bikeEmoji}>🏍</Text>
              </View>
              <View style={styles.bikeInfo}>
                <Text style={[styles.bikeName, { color: colors.text }]}>{item.name}</Text>
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
      />
      <MileageModal
        visible={mileageVisible}
        onClose={() => setMileageVisible(false)}
      />
    </View>
  );
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
