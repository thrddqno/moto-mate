import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DashboardStack from './DashboardStack';
import BikesStack from './BikesStack';
import HistoryStack from './HistoryStack';
import SettingsStack from './SettingsStack';
import { useTheme } from '../context/ThemeContext';

export type MainTabParamList = {
  DashboardTab: undefined;
  BikesTab: undefined;
  HistoryTab: undefined;
  SettingsTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabs() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 56 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 6,
        },
        tabBarActiveTintColor: colors.amber,
        tabBarInactiveTintColor: colors.textDim,
        tabBarLabelStyle: {
          fontFamily: 'Karla_600SemiBold',
          fontSize: 11,
          letterSpacing: 0.5,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
        },
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardStack}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="speedometer" size={22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="BikesTab"
        component={BikesStack}
        options={{
          tabBarLabel: 'My Bikes',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bicycle" size={22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="HistoryTab"
        component={HistoryStack}
        options={{
          tabBarLabel: 'History',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time" size={22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsStack}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={22} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
