import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../navigation/types';
import { theme } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

export function WelcomeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>KLENTEC</Text>
        <Text style={styles.logoSubtitle}>Business Management System</Text>
      </View>

      {/* Hero Content */}
      <View style={styles.hero}>
        <View style={styles.iconBox}>
          <Text style={styles.icon}>📊</Text>
        </View>
        <Text style={styles.heroTitle}>Offline-First BMS</Text>
        <Text style={styles.heroSubtitle}>
          Manage stock, billing, customers, and deliveries. Works completely offline. Professional, fast, and reliable.
        </Text>
      </View>

      {/* Features */}
      <View style={styles.features}>
        <View style={styles.feature}>
          <Text style={styles.featureIcon}>✓</Text>
          <Text style={styles.featureText}>Daily Balance Ledger</Text>
        </View>
        <View style={styles.feature}>
          <Text style={styles.featureIcon}>✓</Text>
          <Text style={styles.featureText}>Customer Credit Tracking</Text>
        </View>
        <View style={styles.feature}>
          <Text style={styles.featureIcon}>✓</Text>
          <Text style={styles.featureText}>Inventory Management</Text>
        </View>
        <View style={styles.feature}>
          <Text style={styles.featureIcon}>✓</Text>
          <Text style={styles.featureText}>Works Offline Always</Text>
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.buttons}>
        <Pressable
          onPress={() => navigation.navigate('Login')}
          style={styles.loginButton}
        >
          <Text style={styles.loginButtonText}>Sign In</Text>
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate('Login')}
          style={styles.registerButton}
        >
          <Text style={styles.registerButtonText}>Demo Credentials</Text>
        </Pressable>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Version 2.0 • June 2026</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  logo: {
    fontSize: 32,
    fontWeight: '900',
    color: theme.colors.primary,
    letterSpacing: 2,
  },
  logoSubtitle: {
    fontSize: 13,
    color: theme.colors.muted,
    marginTop: 4,
    fontWeight: '600',
  },

  hero: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  iconBox: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 40,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.text,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 15,
    color: theme.colors.muted,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },

  features: {
    gap: 12,
    marginBottom: 40,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: theme.colors.panelRaised,
    borderRadius: 10,
  },
  featureIcon: {
    fontSize: 18,
    color: theme.colors.positive,
    fontWeight: '700',
  },
  featureText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '600',
  },

  buttons: {
    gap: 12,
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  registerButton: {
    backgroundColor: theme.colors.panelRaised,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  registerButtonText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '800',
  },

  footer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  footerText: {
    color: theme.colors.muted,
    fontSize: 12,
  },
});
