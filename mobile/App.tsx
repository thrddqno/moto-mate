import React, { useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { setTokenProvider } from './src/services/api';
import AuthStack from './src/navigation/AuthStack';
import MainStackNavigator from './src/navigation/MainStackNavigator';
import { Colors } from './src/constants/theme';

function RootNavigator() {
  const { user, loading, getToken } = useAuth();

  useEffect(() => {
    setTokenProvider(getToken);
  }, [getToken]);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <MainStackNavigator /> : <AuthStack />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
});
