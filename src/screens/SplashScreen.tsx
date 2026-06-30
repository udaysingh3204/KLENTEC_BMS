import { useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { theme } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export function SplashScreen({ navigation }: Props) {
  const initialize = useAppStore((state) => state.initialize);
  const currentUser = useAppStore((state) => state.currentUser);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        await initialize();

        // Wait 1.5 seconds for visual effect
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Route based on auth status
        if (currentUser) {
          navigation.replace('Dashboard');
        } else {
          navigation.replace('ProLogin');
        }
      } catch (e) {
        console.error('Splash initialization error:', e);
        navigation.replace('ProLogin');
      }
    };

    bootstrap();
  }, [initialize, currentUser, navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>K</Text>
          </View>
        </View>

        {/* Brand Name */}
        <Text style={styles.brandName}>KLENTEC</Text>
        <Text style={styles.brandSubtitle}>Business Management System</Text>

        {/* Tagline */}
        <Text style={styles.tagline}>Professional Ledger & Inventory Management</Text>

        {/* Loading Section */}
        <View style={styles.loadingSection}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading your workspace...</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Offline First • Secure • Reliable</Text>
        <Text style={styles.versionText}>v1.0.0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 60,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  logoSection: {
    marginBottom: 20,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: 2,
  },
  brandName: {
    color: theme.colors.primary,
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 3,
    textAlign: 'center',
  },
  brandSubtitle: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 1,
  },
  tagline: {
    color: theme.colors.muted,
    fontSize: 12,
    textAlign: 'center',
    maxWidth: '80%',
    lineHeight: 18,
    fontStyle: 'italic',
  },
  loadingSection: {
    alignItems: 'center',
    gap: 16,
    marginTop: 40,
  },
  loadingText: {
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    color: theme.colors.muted,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  versionText: {
    color: theme.colors.muted,
    fontSize: 10,
    opacity: 0.6,
  },
});
