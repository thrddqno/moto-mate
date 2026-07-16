import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HistoryScreen from '../screens/service/HistoryScreen';

export type HistoryStackParamList = {
  History: undefined;
};

const Stack = createNativeStackNavigator<HistoryStackParamList>();

export default function HistoryStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0D0D0D' },
      }}
    >
      <Stack.Screen name="History" component={HistoryScreen} />
    </Stack.Navigator>
  );
}
