import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ScreenShell } from '../components/ScreenShell';
import { SectionCard } from '../components/SectionCard';
import { roles } from '../data/mockData';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { theme } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({}: Props) {
  const signIn = useAppStore((state) => state.signIn);
  const [roleId, setRoleId] = useState<'admin' | 'employee' | 'delivery'>('admin');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    const result = signIn(roleId, pin);
    if (!result.success) {
      setError(result.message ?? 'Unable to sign in.');
      return;
    }

    setError('');
  };

  return (
    <ScreenShell
      title="KLENTEC BMS"
      subtitle="Offline Android workspace for stock, billing, customers, and deliveries. Use one of the demo role PINs to enter the app."
    >
      <SectionCard
        title="Choose role"
        description="Role-based access controls which screens are available after login."
      >
        <View style={styles.roleList}>
          {roles.map((role) => (
            <Pressable
              key={role.id}
              onPress={() => setRoleId(role.id)}
              style={[styles.roleCard, role.id === roleId ? styles.roleCardActive : null]}
            >
              <Text style={styles.roleTitle}>{role.label}</Text>
              <Text style={styles.roleSummary}>{role.summary}</Text>
            </Pressable>
          ))}
        </View>
      </SectionCard>

      <SectionCard title="PIN login" description="Demo PINs: Admin 1234, Employee 2222, Delivery 3333.">
        <TextInput
          value={pin}
          onChangeText={setPin}
          placeholder="Enter 4-digit PIN"
          placeholderTextColor={theme.colors.muted}
          keyboardType="number-pad"
          secureTextEntry
          maxLength={4}
          style={styles.input}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable onPress={handleLogin} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Unlock workspace</Text>
        </Pressable>
      </SectionCard>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  roleList: {
    gap: 12,
  },
  roleCard: {
    borderRadius: 18,
    padding: 14,
    backgroundColor: theme.colors.panelRaised,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  roleCardActive: {
    borderColor: theme.colors.accent,
    backgroundColor: '#204248',
  },
  roleTitle: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  roleSummary: {
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  input: {
    marginTop: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.panelRaised,
    color: theme.colors.text,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
  },
  error: {
    marginTop: 10,
    color: theme.colors.warning,
    fontSize: 13,
    fontWeight: '600',
  },
  primaryButton: {
    marginTop: 14,
    borderRadius: 16,
    backgroundColor: theme.colors.accent,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: theme.colors.background,
    fontSize: 15,
    fontWeight: '800',
  },
});