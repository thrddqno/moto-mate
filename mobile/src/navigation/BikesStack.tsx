import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BikeListScreen from '../screens/bikes/BikeListScreen';
import AddBikeScreen from '../screens/bikes/AddBikeScreen';
import EditBikeScreen from '../screens/bikes/EditBikeScreen';
import BikeDetailScreen from '../screens/bikes/BikeDetailScreen';
import SchedulesScreen from '../screens/schedules/SchedulesScreen';
import ScheduleFormScreen from '../screens/schedules/ScheduleFormScreen';
import type { Schedule } from '../types';

export type BikesStackParamList = {
  BikeList: undefined;
  AddBike: undefined;
  EditBike: { bikeId: string };
  BikeDetail: { bikeId: string };
  SchedulesList: { bikeId: string };
  ScheduleForm: { bikeId: string; schedule?: Schedule; customName?: string; customCategory?: string };
};

const Stack = createNativeStackNavigator<BikesStackParamList>();

export default function BikesStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0D0D0D' },
      }}
    >
      <Stack.Screen name="BikeList" component={BikeListScreen} />
      <Stack.Screen name="AddBike" component={AddBikeScreen} />
      <Stack.Screen name="EditBike" component={EditBikeScreen} />
      <Stack.Screen name="BikeDetail" component={BikeDetailScreen} />
      <Stack.Screen name="SchedulesList" component={SchedulesScreen} />
      <Stack.Screen
        name="ScheduleForm"
        component={ScheduleFormScreen}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
    </Stack.Navigator>
  );
}
