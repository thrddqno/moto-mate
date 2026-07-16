import React, { useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { setTokenProvider } from '../services/api';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';

function RootNavigator() {
  const { user, loading, getToken } = useAuth();
  const { colors } = useTheme();

  useEffect(() => {
    setTokenProvider(getToken);
  }, [getToken]);

  if (loading) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.amber} />
      </View>
    );
  }

  return (
    <NavigationContainer
      theme={{
        dark: true,
        colors: {
          primary: colors.amber,
          background: colors.bg,
          card: colors.surface,
          text: colors.text,
          border: colors.border,
          notification: colors.red,
        },
        fonts: {
          regular: { fontFamily: 'Karla_400Regular', fontWeight: '400' },
          medium: { fontFamily: 'Karla_500Medium', fontWeight: '500' },
          bold: { fontFamily: 'Karla_700Bold', fontWeight: '700' },
          heavy: { fontFamily: 'Karla_700Bold', fontWeight: '700' },
        },
      }}
    >
      {user ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}

export default function AppNavigator() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
