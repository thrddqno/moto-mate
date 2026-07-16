import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components/ui/Button';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/AuthStack';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

export default function WelcomeScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />

      <View style={styles.topSection}>
        <View style={styles.logoContainer}>
          <View style={[styles.logoRing, { borderColor: colors.amber, shadowColor: colors.amber }]}>
            <Text style={[styles.logoIcon, { color: colors.amber }]}>🏍</Text>
          </View>
        </View>
        <Text style={[styles.title, { color: colors.text }]}>MOTO MATE</Text>
        <Text style={[styles.subtitle, { color: colors.textDim }]}>
          Never miss a maintenance again
        </Text>
      </View>

      <View style={styles.bottomSection}>
        <Button
          title="Sign In"
          onPress={() => navigation.navigate('SignIn')}
          fullWidth
          size="lg"
        />
        <View style={{ height: 12 }} />
        <Button
          title="Create Account"
          onPress={() => navigation.navigate('SignUp')}
          variant="secondary"
          fullWidth
          size="lg"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  topSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  logoIcon: {
    fontSize: 44,
  },
  title: {
    fontFamily: 'Audiowide_400Regular',
    fontSize: 36,
    letterSpacing: 4,
  },
  subtitle: {
    fontFamily: 'Karla_400Regular',
    fontSize: 16,
    marginTop: 8,
    letterSpacing: 1,
  },
  bottomSection: {
    paddingBottom: 48,
  },
});
