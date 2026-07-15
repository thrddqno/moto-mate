import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography } from '../constants/theme';
import DashboardScreen from '../screens/DashboardScreen';
import MyBikesScreen from '../screens/MyBikesScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const TAB_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Dashboard: 'home',
  MyBikes: 'bicycle',
  History: 'time',
  Profile: 'person',
};

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={TAB_ICONS[route.name] || 'ellipse'} size={size} color={color} />
        ),
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.onSurfaceVariant,
        tabBarLabelStyle: Typography.labelMedium,
        tabBarStyle: { height: 64, paddingTop: 8 },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="MyBikes" component={MyBikesScreen} options={{ title: 'My Bikes' }} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
