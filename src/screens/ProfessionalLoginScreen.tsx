import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Alert,
  SafeAreaView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { theme } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ProLogin'>;

type RoleId = 'admin' | 'employee' | 'delivery';

const ROLES: { id: RoleId; label: string; description: string }[] = [
  { id: 'admin', label: 'Admin', description: 'Full access' },
  { id: 'employee', label: 'Employee', description: 'Sales & inventory' },
  { id: 'delivery', label: 'Delivery', description: 'Deliveries only' },
];

export function ProfessionalLoginScreen({ navigation }: Props) {
  const [selectedRole, setSelectedRole] = useState<RoleId>('admin');
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const signIn = useAppStore((state) => state.signIn);

  const handlePinPress = (digit: string) => {
    if (pin.length < 4) {
      setPin(pin + digit);
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
  };

  const handleClear = () => {
    setPin('');
  };

  const handleLogin = async () => {
    if (pin.length !== 4) {
      Alert.alert('Error', 'PIN must be 4 digits');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate network delay for realism
      await new Promise((resolve) => setTimeout(resolve, 500));

      const result = signIn(selectedRole, pin);

      if (result.success) {
        // Navigation will happen via store state change
        navigation.replace('Dashboard');
      } else {
        Alert.alert('Login Failed', result.message || 'Invalid credentials');
        setPin('');
      }
    } catch (error) {
      Alert.alert('Error', 'Login failed. Please try again.');
      setPin('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.logoSmall}>
            <Text style={styles.logoTextSmall}>K</Text>
          </View>
          <Text style={styles.appName}>KLENTEC</Text>
          <Text style={styles.appSubtitle}>Business Management System</Text>
        </View>

        {/* Role Selection */}
        <View style={styles.roleSection}>
          <Text style={styles.sectionTitle}>Select Your Role</Text>
          <View style={styles.roleButtonsContainer}>
            {ROLES.map((role) => (
              <Pressable
                key={role.id}
                onPress={() => setSelectedRole(role.id)}
                style={[
                  styles.roleButton,
                  selectedRole === role.id && styles.roleButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.roleButtonLabel,
                    selectedRole === role.id && styles.roleButtonLabelActive,
                  ]}
                >
                  {role.label}
                </Text>
                <Text
                  style={[
                    styles.roleButtonDescription,
                    selectedRole === role.id &&
                      styles.roleButtonDescriptionActive,
                  ]}
                >
                  {role.description}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* PIN Entry Section */}
        <View style={styles.pinSection}>
          <Text style={styles.sectionTitle}>Enter PIN</Text>

          {/* PIN Display */}
          <View style={styles.pinDisplay}>
            {[0, 1, 2, 3].map((index) => (
              <View key={index} style={styles.pinDigitBox}>
                <Text style={styles.pinDigitText}>
                  {pin[index] ? '●' : ''}
                </Text>
              </View>
            ))}
          </View>

          {/* PIN Pad */}
          <View style={styles.pinPad}>
            {/* Row 1 */}
            <View style={styles.pinRow}>
              {['1', '2', '3'].map((digit) => (
                <Pressable
                  key={digit}
                  onPress={() => handlePinPress(digit)}
                  style={styles.pinButton}
                  disabled={isLoading || pin.length >= 4}
                >
                  <Text style={styles.pinButtonText}>{digit}</Text>
                </Pressable>
              ))}
            </View>

            {/* Row 2 */}
            <View style={styles.pinRow}>
              {['4', '5', '6'].map((digit) => (
                <Pressable
                  key={digit}
                  onPress={() => handlePinPress(digit)}
                  style={styles.pinButton}
                  disabled={isLoading || pin.length >= 4}
                >
                  <Text style={styles.pinButtonText}>{digit}</Text>
                </Pressable>
              ))}
            </View>

            {/* Row 3 */}
            <View style={styles.pinRow}>
              {['7', '8', '9'].map((digit) => (
                <Pressable
                  key={digit}
                  onPress={() => handlePinPress(digit)}
                  style={styles.pinButton}
                  disabled={isLoading || pin.length >= 4}
                >
                  <Text style={styles.pinButtonText}>{digit}</Text>
                </Pressable>
              ))}
            </View>

            {/* Row 4 - Special Buttons */}
            <View style={styles.pinRow}>
              <Pressable
                onPress={handleClear}
                style={[styles.pinButton, styles.clearButton]}
                disabled={isLoading}
              >
                <Text style={styles.clearButtonText}>Clear</Text>
              </Pressable>

              <Pressable
                onPress={() => handlePinPress('0')}
                style={styles.pinButton}
                disabled={isLoading || pin.length >= 4}
              >
                <Text style={styles.pinButtonText}>0</Text>
              </Pressable>

              <Pressable
                onPress={handleBackspace}
                style={[styles.pinButton, styles.backspaceButton]}
                disabled={isLoading || pin.length === 0}
              >
                <Text style={styles.backspaceButtonText}>⌫</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Demo PIN Info */}
        <View style={styles.demoInfo}>
          <Text style={styles.demoLabel}>Demo PIN: 1234</Text>
        </View>

        {/* Remember Me */}
        <Pressable
          onPress={() => setRememberMe(!rememberMe)}
          style={styles.rememberContainer}
        >
          <View
            style={[
              styles.checkbox,
              rememberMe && styles.checkboxChecked,
            ]}
          >
            {rememberMe && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.rememberText}>Remember me on this device</Text>
        </Pressable>
      </View>

      {/* Login Button */}
      <View style={styles.footer}>
        <Pressable
          onPress={handleLogin}
          style={[
            styles.loginButton,
            (isLoading || pin.length !== 4) && styles.loginButtonDisabled,
          ]}
          disabled={isLoading || pin.length !== 4}
        >
          <Text style={styles.loginButtonText}>
            {isLoading ? 'Logging in...' : 'Login'}
          </Text>
        </Pressable>

        <Text style={styles.helpText}>
          For support, contact your system administrator
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 30,
    gap: 8,
  },
  logoSmall: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  logoTextSmall: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '900',
  },
  appName: {
    color: theme.colors.primary,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 2,
  },
  appSubtitle: {
    color: theme.colors.muted,
    fontSize: 12,
    letterSpacing: 0.5,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  roleSection: {
    marginBottom: 28,
  },
  roleButtonsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  roleButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.panelRaised,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    gap: 4,
  },
  roleButtonActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '15',
  },
  roleButtonLabel: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  roleButtonLabelActive: {
    color: theme.colors.primary,
  },
  roleButtonDescription: {
    color: theme.colors.muted,
    fontSize: 10,
  },
  roleButtonDescriptionActive: {
    color: theme.colors.primary,
  },
  pinSection: {
    marginBottom: 20,
  },
  pinDisplay: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
  },
  pinDigitBox: {
    width: 50,
    height: 50,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.panelRaised,
  },
  pinDigitText: {
    color: theme.colors.primary,
    fontSize: 24,
    fontWeight: '700',
  },
  pinPad: {
    gap: 10,
  },
  pinRow: {
    flexDirection: 'row',
    gap: 10,
  },
  pinButton: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: theme.colors.panelRaised,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  pinButtonText: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  clearButton: {
    backgroundColor: theme.colors.negative + '15',
    borderColor: theme.colors.negative,
  },
  clearButtonText: {
    color: theme.colors.negative,
    fontSize: 12,
    fontWeight: '700',
  },
  backspaceButton: {
    backgroundColor: theme.colors.primary + '15',
    borderColor: theme.colors.primary,
  },
  backspaceButtonText: {
    color: theme.colors.primary,
    fontSize: 18,
  },
  demoInfo: {
    backgroundColor: theme.colors.primary + '10',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.primary + '30',
  },
  demoLabel: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  rememberText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  loginButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  loginButtonDisabled: {
    opacity: 0.5,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
  helpText: {
    color: theme.colors.muted,
    fontSize: 11,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
