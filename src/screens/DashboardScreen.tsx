import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ModuleCard } from '../components/ModuleCard';
import { ScreenShell } from '../components/ScreenShell';
import { SectionCard } from '../components/SectionCard';
import { StatCard } from '../components/StatCard';
import { moduleDefinitions, roles } from '../data/mockData';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { theme } from '../theme';
import { DashboardStat } from '../types';
import { buildPaymentTotals, formatCurrency, sumExpenseAmounts, sumInvoiceTotals } from '../utils/finance';

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

const routeMap: Partial<Record<string, keyof RootStackParamList>> = {
  '01': 'Inventory',
  '02': 'CashFlow',
  '03': 'Billing',
  '04': 'Customers',
  '05': 'Suppliers',
  '06': 'CashFlow',
  '08': 'Deliveries',
  '09': 'Reports',
};

export function DashboardScreen({ navigation }: Props) {
  const activities = useAppStore((state) => state.activities);
  const currentUser = useAppStore((state) => state.currentUser);
  const customers = useAppStore((state) => state.customers);
  const deliveries = useAppStore((state) => state.deliveries);
  const expenses = useAppStore((state) => state.expenses);
  const invoices = useAppStore((state) => state.invoices);
  const products = useAppStore((state) => state.products);
  const signOut = useAppStore((state) => state.signOut);

  const role = roles.find((entry) => entry.id === currentUser?.roleId) ?? roles[0];
  const visibleModules = moduleDefinitions.filter(
    (entry) => entry.owner === 'All Users' || entry.owner.includes(role.label)
  );
  const todaySales = sumInvoiceTotals(invoices);
  const totalExpenses = sumExpenseAmounts(expenses);
  const outstandingCredit = customers.reduce((sum, customer) => sum + customer.outstandingBalance, 0);
  const lowStockCount = products.filter((product) => product.stockLeft <= product.minimumStock).length;
  const pendingDeliveries = deliveries.filter((delivery) => delivery.status !== 'Delivered').length;
  const paymentTotals = buildPaymentTotals(invoices);

  const stats: DashboardStat[] = [
    {
      id: 'sales',
      label: "Today's Sales",
      value: formatCurrency(todaySales),
      direction: 'up',
      caption: `${invoices.length} invoices recorded`,
    },
    {
      id: 'deliveries',
      label: 'Pending Deliveries',
      value: String(pendingDeliveries).padStart(2, '0'),
      direction: 'flat',
      caption: `${deliveries.length - pendingDeliveries} already completed`,
    },
    {
      id: 'credit',
      label: 'Outstanding Credit',
      value: formatCurrency(outstandingCredit),
      direction: 'up',
      caption: `${customers.filter((customer) => customer.outstandingBalance > 0).length} customers on credit`,
    },
    {
      id: 'cashflow',
      label: 'Net Cash Flow',
      value: formatCurrency(todaySales - totalExpenses),
      direction: todaySales - totalExpenses >= 0 ? 'up' : 'down',
      caption: `${expenses.length} expenses logged today`,
    },
  ];

  return (
    <ScreenShell
      title={`${role.label} dashboard`}
      subtitle="Operational summary with role-based access to the first implemented BMS workflows."
      action={
        <Pressable onPress={signOut} style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Sign out</Text>
        </Pressable>
      }
    >
      <View style={styles.statsGrid}>
        {stats.map((stat) => (
          <StatCard key={stat.id} stat={stat} />
        ))}
      </View>

      <SectionCard
        title="Available modules"
        description="Implemented modules open directly. Remaining modules stay visible as delivery scope but are not active yet."
      >
        <View style={styles.moduleGrid}>
          {visibleModules.map((moduleDefinition) => {
            const route = routeMap[moduleDefinition.id];

            return (
              <Pressable
                key={moduleDefinition.id}
                disabled={!route}
                onPress={() => {
                  if (route) {
                    navigation.navigate(route);
                  }
                }}
                style={!route ? styles.moduleDisabled : undefined}
              >
                <ModuleCard moduleDefinition={moduleDefinition} />
              </Pressable>
            );
          })}
        </View>
      </SectionCard>

      <SectionCard title="Payment mix" description="Current billed totals by payment mode.">
        <View style={styles.row}>
          <Text style={styles.label}>Cash</Text>
          <Text style={styles.value}>{formatCurrency(paymentTotals.Cash)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>UPI</Text>
          <Text style={styles.value}>{formatCurrency(paymentTotals.UPI)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Credit</Text>
          <Text style={styles.value}>{formatCurrency(paymentTotals.Credit)}</Text>
        </View>
      </SectionCard>

      <SectionCard title="Operations" description="Live operational checks across inventory and expenses.">
        <View style={styles.row}>
          <Text style={styles.label}>Low stock products</Text>
          <Text style={styles.value}>{String(lowStockCount)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Expenses total</Text>
          <Text style={styles.value}>{formatCurrency(totalExpenses)}</Text>
        </View>
      </SectionCard>

      <SectionCard title="Recent activity" description="Latest store, billing, and delivery events.">
        {activities.slice(0, 5).map((activity) => (
          <View key={activity.id} style={styles.activityRow}>
            <View style={styles.activityDot} />
            <View style={styles.activityCopy}>
              <Text style={styles.value}>{activity.title}</Text>
              <Text style={styles.activityNote}>{activity.note}</Text>
            </View>
            <Text style={styles.activityTime}>{activity.time}</Text>
          </View>
        ))}
      </SectionCard>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: theme.colors.panelRaised,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  actionButtonText: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  statsGrid: {
    gap: 12,
  },
  moduleGrid: {
    gap: 12,
  },
  moduleDisabled: {
    opacity: 0.55,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  label: {
    color: theme.colors.muted,
    fontSize: 14,
    fontWeight: '600',
  },
  value: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  activityDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: theme.colors.accent,
    marginTop: 5,
  },
  activityCopy: {
    flex: 1,
  },
  activityNote: {
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  activityTime: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '600',
  },
});