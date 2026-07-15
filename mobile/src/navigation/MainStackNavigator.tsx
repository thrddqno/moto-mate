import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTabNavigator from './MainTabNavigator';
import BikeDetailScreen from '../screens/BikeDetailScreen';
import AddBikeScreen from '../screens/AddBikeScreen';
import EditBikeScreen from '../screens/EditBikeScreen';
import AddScheduleScreen from '../screens/AddScheduleScreen';
import LogServiceScreen from '../screens/LogServiceScreen';
import EditScheduleScreen from '../screens/EditScheduleScreen';
import { Motorcycle } from '../types/api';

export type MainStackParamList = {
  MainTabs: undefined;
  BikeDetail: { motorcycleId: string };
  AddBike: undefined;
  EditBike: { motorcycle: Motorcycle };
  AddSchedule: { motorcycleId: string };
  LogService: { motorcycleId: string; scheduleId?: string };
  EditSchedule: { motorcycleId: string; scheduleId: string };
};

const Stack = createNativeStackNavigator<MainStackParamList>();

export default function MainStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      <Stack.Screen name="BikeDetail" component={BikeDetailScreen} />
      <Stack.Screen name="AddBike" component={AddBikeScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="EditBike" component={EditBikeScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="AddSchedule" component={AddScheduleScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="LogService" component={LogServiceScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="EditSchedule" component={EditScheduleScreen} options={{ presentation: 'modal' }} />
    </Stack.Navigator>
  );
}
