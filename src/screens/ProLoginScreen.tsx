import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ScreenShell } from '../components/ScreenShell';
import { SectionCard } from '../components/SectionCard';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { theme } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const DEMO_USERS = [
  { email: 'admin@klentec.com', password: 'Admin123', roleId: 'admin' as const, name: 'Admin User' },
  { email: 'employee@klentec.com', password: 'Employee123', roleId: 'employee' as const, name: 'Employee' },
  { email: 'delivery@klentec.com', password: 'Delivery123', roleId: 'delivery' as const, name: 'Delivery Staff' },
];

export function ProLoginScreen({ navigation }: Props) {
  const signIn = useAppStore((state) => state.signIn);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    setError('');

    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    // Find user
    const user = DEMO_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!user) {
      setError('Invalid email or password');
      return;
    }

    // Sign in with the found user's role
    const result = signIn(user.roleId, '1234'); // Using dummy PIN for now (kept for store compatibility)
    if (!result.success) {
      setError(result.message ?? 'Login failed');
      return;
    }

    // Clear form on success
    setEmail('');
    setPassword('');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>KLENTEC</Text>
        <Text style={styles.subtitle}>Sign In to Your Account</Text>
      </View>

      <SectionCard title="Login Details" description="Use your credentials to access the system.">
        {/* Demo Users Info */}
        <View style={styles.demoBox}>
          <Text style={styles.demoTitle}>Demo Credentials:</Text>
          <View style={styles.demoUser}>
            <Text style={styles.demoLabel}>👨‍💼 Admin:</Text>
            <Text style={styles.demoValue}>admin@klentec.com / Admin123</Text>
          </View>
          <View style={styles.demoUser}>
            <Text style={styles.demoLabel}>👤 Employee:</Text>
            <Text style={styles.demoValue}>employee@klentec.com / Employee123</Text>
          </View>
          <View style={styles.demoUser}>
            <Text style={styles.demoLabel}>🚚 Delivery:</Text>
            <Text style={styles.demoValue}>delivery@klentec.com / Delivery123</Text>
          </View>
        </View>

        {/* Email Input */}
        <Text style={styles.label}>Email Address</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          placeholderTextColor={theme.colors.muted}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
        />

        {/* Password Input */}
        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordBox}>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            placeholderTextColor={theme.colors.muted}
            secureTextEntry={!showPassword}
            style={styles.passwordInput}
          />
          <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.showButton}>
            <Text style={styles.showButtonText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
          </Pressable>
        </View>

        {/* Error */}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {/* Login Button */}
        <Pressable onPress={handleLogin} style={styles.loginButton}>
          <Text style={styles.loginButtonText}>Sign In</Text>
        </Pressable>

        {/* Register Link */}
        <Pressable onPress={() => navigation.navigate('Welcome')}>
          <Text style={styles.backLink}>← Back to Welcome</Text>
        </Pressable>
      </SectionCard>

      {/* Footer Info */}
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>About KLENTEC BMS</Text>
        <Text style={styles.infoText}>
          Professional offline Business Management System for retail operations. Manage inventory, billing,
          customers, and deliveries with ease.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  logo: {
    fontSize: 28,
    fontWeight: '900',
    color: theme.colors.primary,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.muted,
    marginTop: 8,
  },

  demoBox: {
    backgroundColor: theme.colors.panelRaised,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  demoTitle: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  demoUser: {
    gap: 2,
  },
  demoLabel: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  demoValue: {
    color: theme.colors.text,
    fontSize: 12,
    fontFamily: 'monospace',
  },

  label: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 14,
    marginBottom: 8,
  },

  input: {
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.panelRaised,
    color: theme.colors.text,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },

  passwordBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.panelRaised,
    paddingHorizontal: 14,
  },
  passwordInput: {
    flex: 1,
    color: theme.colors.text,
    paddingVertical: 12,
    fontSize: 15,
  },
  showButton: {
    padding: 8,
  },
  showButtonText: {
    fontSize: 16,
  },

  error: {
    marginTop: 10,
    color: theme.colors.negative,
    fontSize: 13,
    fontWeight: '600',
  },

  loginButton: {
    marginTop: 18,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  backLink: {
    marginTop: 12,
    textAlign: 'center',
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },

  infoBox: {
    marginHorizontal: 20,
    marginVertical: 20,
    padding: 14,
    borderRadius: 10,
    backgroundColor: theme.colors.panelRaised,
    gap: 8,
  },
  infoTitle: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  infoText: {
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
});
