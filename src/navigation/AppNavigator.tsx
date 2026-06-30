import { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { DashboardScreen } from '../screens/DashboardScreen';
import { DailyHisaabScreen } from '../screens/DailyHisaabScreen';
import { CustomerLedgerScreen } from '../screens/CustomerLedgerScreen';
import { SalesReportScreen } from '../screens/SalesReportScreen';
import { BillingScreen } from '../screens/BillingScreen';
import { CashFlowScreen } from '../screens/CashFlowScreen';
import { CustomersScreen } from '../screens/CustomersScreen';
import { DeliveriesScreen } from '../screens/DeliveriesScreen';
import { EmployeeScreen } from '../screens/EmployeeScreen';
import { InventoryScreen } from '../screens/InventoryScreen';
import { ComprehensiveLedgerScreen } from '../screens/ComprehensiveLedgerScreen';
import { GoodsBatchScreen } from '../screens/GoodsBatchScreen';
import { SuppliersScreen } from '../screens/SuppliersScreen';
import { InfluencerScreen } from '../screens/InfluencerScreen';
import { useAppStore } from '../store/useAppStore';
import { theme } from '../theme';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const initialize = useAppStore((state) => state.initialize);
  const signIn = useAppStore((state) => state.signIn);
  const isReady = useAppStore((state) => state.isReady);

  useEffect(() => {
    void initialize().then(() => {
      signIn('admin', '1234');
    });
  }, [initialize, signIn]);

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
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="DailyLedger" component={DailyHisaabScreen} />
        <Stack.Screen name="CustomerLedger" component={CustomerLedgerScreen} />
        <Stack.Screen name="SalesReport" component={SalesReportScreen} />
        <Stack.Screen name="Inventory" component={InventoryScreen} />
        <Stack.Screen name="Billing" component={BillingScreen} />
        <Stack.Screen name="Customers" component={CustomersScreen} />
        <Stack.Screen name="Suppliers" component={SuppliersScreen} />
        <Stack.Screen name="Influencer" component={InfluencerScreen} />
        <Stack.Screen name="CashFlow" component={CashFlowScreen} />
        <Stack.Screen name="Reports" component={ComprehensiveLedgerScreen} />
        <Stack.Screen name="GoodsBatch" component={GoodsBatchScreen} />
        <Stack.Screen name="Deliveries" component={DeliveriesScreen} />
        <Stack.Screen name="Employees" component={EmployeeScreen} />
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
