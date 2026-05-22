import { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { DashboardScreen } from '../screens/DashboardScreen';
import { BillingScreen } from '../screens/BillingScreen';
import { CashFlowScreen } from '../screens/CashFlowScreen';
import { CustomersScreen } from '../screens/CustomersScreen';
import { DeliveriesScreen } from '../screens/DeliveriesScreen';
import { EmployeeScreen } from '../screens/EmployeeScreen';
import { InventoryScreen } from '../screens/InventoryScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { ReportsScreen } from '../screens/ReportsScreen';
import { SuppliersScreen } from '../screens/SuppliersScreen';
import { useAppStore } from '../store/useAppStore';
import { theme } from '../theme';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const currentUser = useAppStore((state) => state.currentUser);
  const initialize = useAppStore((state) => state.initialize);
  const isReady = useAppStore((state) => state.isReady);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  if (!isReady) {
    return (
      <View style={styles.loadingScreen}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingTitle}>KLENTEC BMS</Text>
        <Text style={styles.loadingCopy}>Loading your offline workspace…</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      >
        {currentUser ? (
          <>
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="Inventory" component={InventoryScreen} />
            <Stack.Screen name="Billing" component={BillingScreen} />
            <Stack.Screen name="Customers" component={CustomersScreen} />
            <Stack.Screen name="Suppliers" component={SuppliersScreen} />
            <Stack.Screen name="CashFlow" component={CashFlowScreen} />
            <Stack.Screen name="Reports" component={ReportsScreen} />
            <Stack.Screen name="Deliveries" component={DeliveriesScreen} />
            <Stack.Screen name="Employees" component={EmployeeScreen} />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 24,
    backgroundColor: theme.colors.background,
  },
  loadingTitle: {
    color: theme.colors.primary,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  loadingCopy: {
    color: theme.colors.muted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
