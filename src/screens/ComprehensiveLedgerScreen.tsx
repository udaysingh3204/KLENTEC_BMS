import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ScreenShell } from '../components/ScreenShell';
import { SectionCard } from '../components/SectionCard';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { theme } from '../theme';
import { formatCurrency } from '../utils/finance';
import { getTodayString, getFormattedDate } from '../utils/ledger';

type Props = NativeStackScreenProps<RootStackParamList, 'Reports'>;

export function ComprehensiveLedgerScreen({ navigation }: Props) {
  const invoices = useAppStore((s) => s.invoices);
  const expenses = useAppStore((s) => s.expenses);
  const customers = useAppStore((s) => s.customers);

  const [selectedDate, setSelectedDate] = useState(getTodayString());

  const dailyData = useMemo(() => {
    const dateStr = selectedDate.split('T')[0];
    const dailyInvoices = invoices.filter((i) => i.createdAt.split('T')[0] === dateStr);
    const dailyExpenses = expenses.filter((e) => e.createdAt.split('T')[0] === dateStr);

    // Cash Flow
    const cashIncome = dailyInvoices
      .filter((i) => i.paymentMode === 'Cash')
      .reduce((sum, i) => sum + i.total, 0);
    const cashExpenses = dailyExpenses
      .filter((e) => e.paymentMode === 'Cash')
      .reduce((sum, e) => sum + e.amount, 0);
    const cashFlow = cashIncome - cashExpenses;

    // UPI Flow (includes split payments)
    const upiIncome = dailyInvoices.reduce((sum, i) => {
      // Count invoices with paymentMode === 'UPI'
      if (i.paymentMode === 'UPI') return sum + i.total;
      // Also count split payments (upiPaid from Cash+UPI splits)
      if (i.upiPaid && i.upiPaid > 0) return sum + i.upiPaid;
      return sum;
    }, 0);
    const upiExpenses = dailyExpenses
      .filter((e) => e.paymentMode === 'UPI')
      .reduce((sum, e) => sum + e.amount, 0);
    const upiFlow = upiIncome - upiExpenses;

    // Credit Tracking
    const creditInvoices = dailyInvoices.filter((i) => i.paymentMode === 'Credit');
    const creditAmount = creditInvoices.reduce((sum, i) => sum + i.total, 0);
    const creditExpenses = dailyExpenses
      .filter((e) => e.paymentMode === 'Credit')
      .reduce((sum, e) => sum + e.amount, 0);

    // Customer-wise
    const customerMap: Record<
      string,
      { name: string; address: string; total: number; count: number }
    > = {};
    dailyInvoices.forEach((inv) => {
      if (!customerMap[inv.customerId]) {
        const cust = customers.find((c) => c.id === inv.customerId);
        customerMap[inv.customerId] = {
          name: cust?.name || inv.customerName,
          address: cust?.address || inv.customerAddress || '',
          total: 0,
          count: 0,
        };
      }
      customerMap[inv.customerId].total += inv.total;
      customerMap[inv.customerId].count += 1;
    });

    return {
      cashIncome,
      cashExpenses,
      cashFlow,
      upiIncome,
      upiExpenses,
      upiFlow,
      creditAmount,
      creditExpenses,
      totalIncome: cashIncome + upiIncome + creditAmount,
      totalExpenses: cashExpenses + upiExpenses + creditExpenses,
      netBalance: cashIncome + upiIncome + creditAmount - cashExpenses - upiExpenses - creditExpenses,
      customerData: Object.values(customerMap),
      expenseCategories: dailyExpenses.reduce(
        (acc, exp) => {
          acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
          return acc;
        },
        {} as Record<string, number>
      ),
    };
  }, [invoices, expenses, customers, selectedDate]);

  return (
    <ScreenShell
      title="Complete Hisaab"
      subtitle={`${getFormattedDate(selectedDate)} • Comprehensive Financial Ledger`}
      action={
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>
      }
    >
      {/* Cash Flow Section */}
      <SectionCard title="💵 Cash Flow" description="Cash in, out, and net flow.">
        <View style={styles.flowRow}>
          <View style={styles.flowCard}>
            <Text style={styles.flowLabel}>Incoming</Text>
            <Text style={[styles.flowValue, styles.positive]}>+{formatCurrency(dailyData.cashIncome)}</Text>
          </View>
          <View style={styles.flowCard}>
            <Text style={styles.flowLabel}>Outgoing</Text>
            <Text style={[styles.flowValue, styles.negative]}>−{formatCurrency(dailyData.cashExpenses)}</Text>
          </View>
          <View style={[styles.flowCard, styles.flowCardHighlight]}>
            <Text style={styles.flowLabel}>Net Flow</Text>
            <Text
              style={[
                styles.flowValue,
                dailyData.cashFlow >= 0 ? styles.positive : styles.negative,
              ]}
            >
              {dailyData.cashFlow >= 0 ? '+' : '−'}{formatCurrency(Math.abs(dailyData.cashFlow))}
            </Text>
          </View>
        </View>
      </SectionCard>

      {/* UPI Flow Section */}
      <SectionCard title="📱 UPI Flow" description="UPI transactions in and out.">
        <View style={styles.flowRow}>
          <View style={styles.flowCard}>
            <Text style={styles.flowLabel}>Incoming</Text>
            <Text style={[styles.flowValue, styles.positive]}>+{formatCurrency(dailyData.upiIncome)}</Text>
          </View>
          <View style={styles.flowCard}>
            <Text style={styles.flowLabel}>Outgoing</Text>
            <Text style={[styles.flowValue, styles.negative]}>−{formatCurrency(dailyData.upiExpenses)}</Text>
          </View>
          <View style={[styles.flowCard, styles.flowCardHighlight]}>
            <Text style={styles.flowLabel}>Net Flow</Text>
            <Text
              style={[
                styles.flowValue,
                dailyData.upiFlow >= 0 ? styles.positive : styles.negative,
              ]}
            >
              {dailyData.upiFlow >= 0 ? '+' : '−'}{formatCurrency(Math.abs(dailyData.upiFlow))}
            </Text>
          </View>
        </View>
      </SectionCard>

      {/* Credit Tracking */}
      <SectionCard title="💳 Credit Tracking" description="Credit and Udhaar transactions.">
        <View style={styles.creditRow}>
          <View style={styles.creditCard}>
            <Text style={styles.creditLabel}>Credit Given</Text>
            <Text style={[styles.creditValue, styles.positive]}>
              +{formatCurrency(dailyData.creditAmount)}
            </Text>
          </View>
          <View style={styles.creditCard}>
            <Text style={styles.creditLabel}>Credit Collected</Text>
            <Text style={[styles.creditValue, styles.negative]}>
              −{formatCurrency(dailyData.creditExpenses)}
            </Text>
          </View>
        </View>
      </SectionCard>

      {/* Expense Categories */}
      {Object.keys(dailyData.expenseCategories).length > 0 && (
        <SectionCard title="📊 Expense Breakdown" description="By category.">
          {Object.entries(dailyData.expenseCategories).map(([category, amount]) => (
            <View key={category} style={styles.categoryRow}>
              <Text style={styles.categoryName}>{category}</Text>
              <Text style={[styles.categoryAmount, styles.negative]}>
                −{formatCurrency(amount)}
              </Text>
            </View>
          ))}
        </SectionCard>
      )}

      {/* Customer-wise Ledger */}
      {dailyData.customerData.length > 0 && (
        <SectionCard title="👥 Customer-wise" description="Transactions per customer.">
          {dailyData.customerData.map((cust) => (
            <View key={cust.name} style={styles.custRow}>
              <View style={styles.custLeft}>
                <Text style={styles.custName}>{cust.name}</Text>
                {cust.address && <Text style={styles.custAddress}>{cust.address}</Text>}
                <Text style={styles.custMeta}>{cust.count} transaction(s)</Text>
              </View>
              <Text style={[styles.custTotal, styles.positive]}>{formatCurrency(cust.total)}</Text>
            </View>
          ))}
        </SectionCard>
      )}

      {/* Summary */}
      <SectionCard title="📈 Daily Summary" description="Complete financial overview.">
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Income</Text>
            <Text style={[styles.summaryValue, styles.positive]}>
              +{formatCurrency(dailyData.totalIncome)}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Expenses</Text>
            <Text style={[styles.summaryValue, styles.negative]}>
              −{formatCurrency(dailyData.totalExpenses)}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Net Balance</Text>
            <Text
              style={[
                styles.summaryValue,
                dailyData.netBalance >= 0 ? styles.positive : styles.negative,
              ]}
            >
              {dailyData.netBalance >= 0 ? '+' : '−'}{formatCurrency(Math.abs(dailyData.netBalance))}
            </Text>
          </View>
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
  backButtonText: { color: theme.colors.primary, fontSize: 13, fontWeight: '700' },

  flowRow: { flexDirection: 'row', gap: 10 },
  flowCard: {
    flex: 1,
    backgroundColor: theme.colors.panelRaised,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  flowCardHighlight: { backgroundColor: theme.colors.accent + '15', borderColor: theme.colors.accent },
  flowLabel: { color: theme.colors.muted, fontSize: 12, fontWeight: '600', marginBottom: 6 },
  flowValue: { fontSize: 16, fontWeight: '800' },
  positive: { color: theme.colors.positive },
  negative: { color: theme.colors.negative },

  creditRow: { flexDirection: 'row', gap: 10 },
  creditCard: {
    flex: 1,
    backgroundColor: theme.colors.panelRaised,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  creditLabel: { color: theme.colors.muted, fontSize: 12, fontWeight: '600', marginBottom: 6 },
  creditValue: { fontSize: 16, fontWeight: '800' },

  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  categoryName: { color: theme.colors.text, fontSize: 14, fontWeight: '600' },
  categoryAmount: { fontSize: 14, fontWeight: '700' },

  custRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  custLeft: { flex: 1 },
  custName: { color: theme.colors.text, fontSize: 14, fontWeight: '700', marginBottom: 2 },
  custAddress: { color: theme.colors.muted, fontSize: 12, marginBottom: 4 },
  custMeta: { color: theme.colors.muted, fontSize: 11 },
  custTotal: { fontSize: 15, fontWeight: '800' },

  summaryGrid: { gap: 12 },
  summaryCard: { backgroundColor: theme.colors.panelRaised, borderRadius: 12, padding: 14 },
  summaryLabel: { color: theme.colors.muted, fontSize: 12, fontWeight: '600', marginBottom: 6 },
  summaryValue: { fontSize: 18, fontWeight: '800' },
});
