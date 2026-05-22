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
  const cashInHand = totalSales - totalExpenses;
  const isProfit = cashInHand >= 0;
  const lowStockProducts = products.filter((product) => product.stockLeft <= product.minimumStock);
  const deliveredCount = deliveries.filter((delivery) => delivery.status === 'Delivered').length;
  const paymentTotals = buildPaymentTotals(invoices);
  const date = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <ScreenShell
      title="Daily Reports"
      subtitle={`End-of-day summary · ${date}`}
      action={
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>
      }
    >
      <View style={[styles.cashInHandCard, isProfit ? styles.profitCard : styles.lossCard]}>
        <Text style={styles.cashInHandLabel}>Cash In Hand</Text>
        <Text style={[styles.cashInHandValue, { color: isProfit ? theme.colors.positive : theme.colors.negative }]}>
          {formatCurrency(cashInHand)}
        </Text>
        <Text style={styles.cashInHandSub}>
          Sales {formatCurrency(totalSales)} · Expenses {formatCurrency(totalExpenses)}
        </Text>
      </View>

      <SectionCard title="Summary" description="Core management snapshot for daily review.">
        <View style={styles.row}>
          <Text style={styles.label}>Total Sales</Text>
          <Text style={[styles.value, { color: theme.colors.positive }]}>{formatCurrency(totalSales)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Total Expenses</Text>
          <Text style={[styles.value, { color: theme.colors.negative }]}>{formatCurrency(totalExpenses)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Cash In Hand</Text>
          <Text style={[styles.value, { color: isProfit ? theme.colors.positive : theme.colors.negative }]}>
            {formatCurrency(cashInHand)}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Deliveries completed</Text>
          <Text style={styles.value}>{String(deliveredCount)}</Text>
        </View>
      </SectionCard>

      <SectionCard title="Payment Mode Breakup" description="Split across Cash, UPI, and Credit.">
        <View style={styles.row}>
          <Text style={styles.label}>Cash</Text>
          <Text style={[styles.value, { color: theme.colors.positive }]}>{formatCurrency(paymentTotals.Cash)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>UPI</Text>
          <Text style={[styles.value, { color: theme.colors.primary }]}>{formatCurrency(paymentTotals.UPI)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Credit</Text>
          <Text style={[styles.value, { color: theme.colors.negative }]}>{formatCurrency(paymentTotals.Credit)}</Text>
        </View>
      </SectionCard>

      <SectionCard title="Attention Items" description="Follow-up items before close of business.">
        <View style={styles.row}>
          <Text style={styles.label}>Low stock products</Text>
          <Text style={[styles.value, lowStockProducts.length > 0 ? { color: theme.colors.negative } : { color: theme.colors.positive }]}>
            {String(lowStockProducts.length)}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Customers on credit</Text>
          <Text style={[styles.value, { color: theme.colors.negative }]}>
            {String(customers.filter((c) => c.outstandingBalance > 0).length)}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Pending deliveries</Text>
          <Text style={[styles.value, { color: theme.colors.warning }]}>
            {String(deliveries.filter((d) => d.status !== 'Delivered').length)}
          </Text>
        </View>
      </SectionCard>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  backButton: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: theme.colors.panelRaised,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  backButtonText: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  cashInHandCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    alignItems: 'center',
    gap: 4,
  },
  profitCard: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  lossCard: {
    backgroundColor: '#FFF5F5',
    borderColor: '#FECACA',
  },
  cashInHandLabel: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cashInHandValue: {
    fontSize: 32,
    fontWeight: '800',
  },
  cashInHandSub: {
    color: theme.colors.muted,
    fontSize: 12,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  label: {
    color: theme.colors.muted,
    fontSize: 14,
    fontWeight: '500',
  },
  value: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
});
