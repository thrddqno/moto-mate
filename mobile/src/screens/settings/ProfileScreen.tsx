import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { SettingsStackParamList } from '../../navigation/SettingsStack';

type Props = NativeStackScreenProps<SettingsStackParamList, 'Profile'>;

export default function ProfileScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { profile, signOut } = useAuth();

  async function handleSignOut() {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => signOut(),
      },
    ]);
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />

      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>SETTINGS</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Card style={styles.profileCard}>
          <View style={[styles.avatar, { backgroundColor: colors.amberDim }]}>
            <Text style={styles.avatarText}>
              {(profile?.displayName || 'R')[0].toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.displayName, { color: colors.text }]}>
            {profile?.displayName || 'Rider'}
          </Text>
          <Text style={[styles.email, { color: colors.textDim }]}>
            {profile?.email || ''}
          </Text>
        </Card>

        <TouchableOpacity
          style={[styles.menuRow, { borderBottomColor: colors.border }]}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <View style={[styles.menuIcon, { backgroundColor: colors.amberDim }]}>
            <Ionicons name="person" size={20} color={colors.amber} />
          </View>
          <View style={styles.menuContent}>
            <Text style={[styles.menuLabel, { color: colors.text }]}>Edit Profile</Text>
            <Text style={[styles.menuHint, { color: colors.textDim }]}>
              Name, unit preference
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textDim} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuRow, { borderBottomColor: colors.border }]}
          onPress={() => navigation.navigate('NotificationSettings')}
        >
          <View style={[styles.menuIcon, { backgroundColor: colors.blueDim }]}>
            <Ionicons name="notifications" size={20} color={colors.blue} />
          </View>
          <View style={styles.menuContent}>
            <Text style={[styles.menuLabel, { color: colors.text }]}>
              Notification Settings
            </Text>
            <Text style={[styles.menuHint, { color: colors.textDim }]}>
              Reminder thresholds and preferences
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textDim} />
        </TouchableOpacity>

        <View style={{ marginTop: 40 }}>
          <Button
            title="Sign Out"
            onPress={handleSignOut}
            variant="danger"
            fullWidth
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  title: { fontFamily: 'Audiowide_400Regular', fontSize: 22, letterSpacing: 2 },
  scroll: { paddingHorizontal: 16, paddingBottom: 48 },
  profileCard: { alignItems: 'center', paddingVertical: 24, marginBottom: 24 },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: { fontFamily: 'Audiowide_400Regular', fontSize: 24, color: '#FFB300' },
  displayName: { fontFamily: 'Karla_700Bold', fontSize: 18 },
  email: { fontFamily: 'Karla_400Regular', fontSize: 14, marginTop: 4 },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuContent: { flex: 1 },
  menuLabel: { fontFamily: 'Karla_600SemiBold', fontSize: 15 },
  menuHint: { fontFamily: 'Karla_400Regular', fontSize: 12, marginTop: 2 },
});
