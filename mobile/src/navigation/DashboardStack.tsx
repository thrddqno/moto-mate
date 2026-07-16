import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import LogServiceScreen from '../screens/service/LogServiceScreen';

export type DashboardStackParamList = {
  Dashboard: undefined;
  LogService: { scheduleId?: string; motorcycleId?: string };
};

const Stack = createNativeStackNavigator<DashboardStackParamList>();

export default function DashboardStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0D0D0D' },
      }}
    >
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen
        name="LogService"
        component={LogServiceScreen}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
    </Stack.Navigator>
  );
}
