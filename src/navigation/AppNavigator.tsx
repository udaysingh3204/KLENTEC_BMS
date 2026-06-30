import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

import { SplashScreen } from '../screens/SplashScreen';
import { ProfessionalLoginScreen } from '../screens/ProfessionalLoginScreen';
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
import { SettingsScreen } from '../screens/SettingsScreen';
import { theme } from '../theme';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
        }}
        initialRouteName="Splash"
      >
        {/* Auth Screens */}
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="ProLogin" component={ProfessionalLoginScreen} />

        {/* App Screens */}
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
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
