import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ScreenShell } from '../components/ScreenShell';
import { SectionCard } from '../components/SectionCard';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { theme } from '../theme';
import { buildPaymentTotals, formatCurrency, sumExpenseAmounts, sumInvoiceTotals } from '../utils/finance';

type Props = NativeStackScreenProps<RootStackParamList, 'Reports'>;

export function ReportsScreen({ navigation }: Props) {
  const customers = useAppStore((state) => state.customers);
  const deliveries = useAppStore((state) => state.deliveries);
  const expenses = useAppStore((state) => state.expenses);
  const invoices = useAppStore((state) => state.invoices);
  const products = useAppStore((state) => state.products);

  const totalSales = sumInvoiceTotals(invoices);
  const totalExpenses = sumExpenseAmounts(expenses);
  const lowStockProducts = products.filter((product) => product.stockLeft <= product.minimumStock);
  const deliveredCount = deliveries.filter((delivery) => delivery.status === 'Delivered').length;
  const paymentTotals = buildPaymentTotals(invoices);

  return (
    <ScreenShell
      title="Daily Reports"
      subtitle="End-of-day operational summary across sales, expenses, stock movement, and payment modes."
      action={
        <Pressable onPress={() => navigation.goBack()} style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Back</Text>
        </Pressable>
      }
    >
      <SectionCard title="Summary" description="Core management snapshot for daily review and reprint.">
        <View style={styles.row}>
          <Text style={styles.label}>Sales</Text>
          <Text style={styles.value}>{formatCurrency(totalSales)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Expenses</Text>
          <Text style={styles.value}>{formatCurrency(totalExpenses)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Cash in hand</Text>
          <Text style={styles.value}>{formatCurrency(totalSales - totalExpenses)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Delivered jobs</Text>
          <Text style={styles.value}>{String(deliveredCount)}</Text>
        </View>
      </SectionCard>

      <SectionCard title="Payment mode breakup" description="Required split across Cash, UPI, and Credit.">
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

      <SectionCard title="Attention items" description="Operational items that still need follow-up before close of business.">
        <View style={styles.row}>
          <Text style={styles.label}>Low stock products</Text>
          <Text style={styles.value}>{String(lowStockProducts.length)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Customers on credit</Text>
          <Text style={styles.value}>{String(customers.filter((customer) => customer.outstandingBalance > 0).length)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Pending deliveries</Text>
          <Text style={styles.value}>{String(deliveries.filter((delivery) => delivery.status !== 'Delivered').length)}</Text>
        </View>
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
});