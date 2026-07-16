import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HistoryScreen from '../screens/service/HistoryScreen';
import { useTheme } from '../context/ThemeContext';

export type HistoryStackParamList = {
  History: undefined;
};

const Stack = createNativeStackNavigator<HistoryStackParamList>();

export default function HistoryStack() {
  const { colors } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen name="History" component={HistoryScreen} />
    </Stack.Navigator>
  );
}
