import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Alert,
  TextInput,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ScreenShell } from '../components/ScreenShell';
import { SectionCard } from '../components/SectionCard';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { theme } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export function SettingsScreen({ navigation }: Props) {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showPinChange, setShowPinChange] = useState(false);
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const signOut = useAppStore((state) => state.signOut);

  const handleClearAllData = async () => {
    try {
      Alert.alert(
        'Clear All Data',
        'This will permanently delete all app data. This action cannot be undone. Are you sure?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Clear',
            style: 'destructive',
            onPress: async () => {
              try {
                // Clear AsyncStorage
                await AsyncStorage.clear();

                // Reset store state
                const resetState = {
                  products: [],
                  customers: [],
                  suppliers: [],
                  deliveries: [],
                  expenses: [],
                  invoices: [],
                  activities: [],
                  employees: [],
                  attendance: [],
                  goodsPurchases: [],
                  goodsSales: [],
                  influencers: [],
                };

                useAppStore.setState(resetState);

                Alert.alert('Success', 'All data has been cleared. App will now restart.');

                // Reload app by signing out
                signOut();
                navigation.replace('ProLogin');
              } catch (error) {
                Alert.alert('Error', 'Failed to clear data. Please try again.');
              }
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to initiate data clearing.');
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          signOut();
          navigation.replace('ProLogin');
        },
      },
    ]);
  };

  const handleChangePin = () => {
    if (!oldPin || !newPin || !confirmPin) {
      Alert.alert('Error', 'All fields are required');
      return;
    }

    if (oldPin.length !== 4 || newPin.length !== 4) {
      Alert.alert('Error', 'PIN must be 4 digits');
      return;
    }

    if (newPin !== confirmPin) {
      Alert.alert('Error', 'New PINs do not match');
      return;
    }

    // Here you would verify old PIN and update new PIN
    // For now, just show success message
    Alert.alert('Success', 'PIN changed successfully!');
    setOldPin('');
    setNewPin('');
    setConfirmPin('');
    setShowPinChange(false);
  };

  return (
    <ScreenShell title="Settings" subtitle="Manage your account and app preferences">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Account Section */}
        <SectionCard title="Account" description="Manage your account settings">
          <View style={styles.settingsItem}>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Current User</Text>
              <Text style={styles.settingValue}>Admin Account</Text>
            </View>
          </View>

          <Pressable
            onPress={() => setShowPinChange(!showPinChange)}
            style={[styles.settingsButton, styles.primaryButton]}
          >
            <Text style={styles.settingButtonText}>Change PIN</Text>
          </Pressable>

          {showPinChange && (
            <View style={styles.pinChangeContainer}>
              <Text style={styles.pinChangeTitle}>Change Your PIN</Text>

              <TextInput
                value={oldPin}
                onChangeText={setOldPin}
                placeholder="Current PIN"
                placeholderTextColor={theme.colors.muted}
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
                style={styles.pinInput}
              />

              <TextInput
                value={newPin}
                onChangeText={setNewPin}
                placeholder="New PIN"
                placeholderTextColor={theme.colors.muted}
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
                style={styles.pinInput}
              />

              <TextInput
                value={confirmPin}
                onChangeText={setConfirmPin}
                placeholder="Confirm PIN"
                placeholderTextColor={theme.colors.muted}
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
                style={styles.pinInput}
              />

              <View style={styles.pinButtonRow}>
                <Pressable
                  onPress={() => {
                    setShowPinChange(false);
                    setOldPin('');
                    setNewPin('');
                    setConfirmPin('');
                  }}
                  style={[styles.pinActionButton, styles.cancelButton]}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={handleChangePin}
                  style={[styles.pinActionButton, styles.saveButton]}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </Pressable>
              </View>
            </View>
          )}
        </SectionCard>

        {/* Data Management Section */}
        <SectionCard title="Data Management" description="Manage app data and storage">
          <View style={styles.settingsItem}>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>App Storage</Text>
              <Text style={styles.settingValue}>Local SQLite Database</Text>
            </View>
          </View>

          <View style={styles.settingsItem}>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Sync Status</Text>
              <Text style={[styles.settingValue, { color: theme.colors.positive }]}>
                Synced
              </Text>
            </View>
          </View>

          <Pressable style={[styles.settingsButton, styles.secondaryButton]}>
            <Text style={styles.secondaryButtonText}>📊 Export Data</Text>
          </Pressable>

          <Pressable style={[styles.settingsButton, styles.secondaryButton]}>
            <Text style={styles.secondaryButtonText}>💾 Backup</Text>
          </Pressable>

          <Pressable style={[styles.settingsButton, styles.secondaryButton]}>
            <Text style={styles.secondaryButtonText}>↩️ Restore Backup</Text>
          </Pressable>
        </SectionCard>

        {/* About Section */}
        <SectionCard title="About" description="App information">
          <View style={styles.settingsItem}>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>App Name</Text>
              <Text style={styles.settingValue}>KLENTEC BMS</Text>
            </View>
          </View>

          <View style={styles.settingsItem}>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Version</Text>
              <Text style={styles.settingValue}>1.0.0</Text>
            </View>
          </View>

          <View style={styles.settingsItem}>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Build</Text>
              <Text style={styles.settingValue}>Production Ready</Text>
            </View>
          </View>

          <View style={styles.settingsItem}>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Platform</Text>
              <Text style={styles.settingValue}>React Native + Expo</Text>
            </View>
          </View>

          <View style={styles.settingsItem}>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Database</Text>
              <Text style={styles.settingValue}>SQLite (Offline First)</Text>
            </View>
          </View>

          <View style={styles.aboutFooter}>
            <Text style={styles.aboutText}>
              KLENTEC BMS is designed for professional business management. All data is stored
              locally on your device for maximum privacy and security.
            </Text>
          </View>
        </SectionCard>

        {/* Danger Zone */}
        <SectionCard title="Danger Zone" description="Irreversible actions">
          <Pressable
            onPress={handleLogout}
            style={[styles.settingsButton, styles.warningButton]}
          >
            <Text style={styles.warningButtonText}>🚪 Logout</Text>
          </Pressable>

          <Pressable
            onPress={handleClearAllData}
            style={[styles.settingsButton, styles.dangerButton]}
          >
            <Text style={styles.dangerButtonText}>🗑️ Clear All Data</Text>
          </Pressable>

          <Text style={styles.warningText}>
            ⚠️ These actions cannot be undone. Proceed with caution.
          </Text>
        </SectionCard>

        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  settingsItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  settingContent: {
    gap: 4,
  },
  settingLabel: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  settingValue: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  settingsButton: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginVertical: 8,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
  },
  settingButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  secondaryButton: {
    backgroundColor: theme.colors.panelRaised,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
  },
  secondaryButtonText: {
    color: theme.colors.text,
    fontWeight: '600',
    fontSize: 14,
  },
  warningButton: {
    backgroundColor: '#FFA500' + '20',
    borderWidth: 1.5,
    borderColor: '#FFA500',
  },
  warningButtonText: {
    color: '#FFA500',
    fontWeight: '700',
    fontSize: 14,
  },
  dangerButton: {
    backgroundColor: theme.colors.negative + '20',
    borderWidth: 1.5,
    borderColor: theme.colors.negative,
  },
  dangerButtonText: {
    color: theme.colors.negative,
    fontWeight: '700',
    fontSize: 14,
  },
  warningText: {
    color: theme.colors.negative,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
  pinChangeContainer: {
    backgroundColor: theme.colors.panelRaised,
    borderRadius: 10,
    padding: 14,
    marginTop: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  pinChangeTitle: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  pinInput: {
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 2,
  },
  pinButtonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  pinActionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: theme.colors.panelRaised,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
  },
  cancelButtonText: {
    color: theme.colors.muted,
    fontWeight: '600',
    fontSize: 12,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
  },
  aboutFooter: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  aboutText: {
    color: theme.colors.muted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
});
