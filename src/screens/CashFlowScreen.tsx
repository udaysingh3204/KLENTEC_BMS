import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ScreenShell } from '../components/ScreenShell';
import { SectionCard } from '../components/SectionCard';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { theme } from '../theme';
import { ExpenseCategory, PaymentMode } from '../types';
import { formatCurrency, parseWholeNumberInput, sumExpenseAmounts, sumInvoiceTotals } from '../utils/finance';

type Props = NativeStackScreenProps<RootStackParamList, 'CashFlow'>;

const categories: ExpenseCategory[] = ['Shop', 'Labour', 'Delivery', 'Purchase', 'Misc'];
const paymentModes: PaymentMode[] = ['Cash', 'UPI', 'Credit'];

export function CashFlowScreen({ navigation }: Props) {
  const addExpense = useAppStore((state) => state.addExpense);
  const expenses = useAppStore((state) => state.expenses);
  const invoices = useAppStore((state) => state.invoices);

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Shop');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('Cash');
  const [error, setError] = useState('');
  const parsedAmount = parseWholeNumberInput(amount);

  const totalIncome = useMemo(() => sumInvoiceTotals(invoices), [invoices]);
  const totalExpense = useMemo(() => sumExpenseAmounts(expenses), [expenses]);
  const netBalance = totalIncome - totalExpense;
  const isProfit = netBalance >= 0;

  const handleAddExpense = () => {
    if (!parsedAmount) {
      setError('Amount must be a whole number greater than zero.');
      return;
    }

    const result = addExpense({
      title,
      amount: parsedAmount,
      category,
      paymentMode,
    });

    if (!result.success) {
      setError(result.message ?? 'Unable to save expense.');
      return;
    }

    setTitle('');
    setAmount('');
    setCategory('Shop');
    setPaymentMode('Cash');
    setError('');
  };

  return (
    <ScreenShell
      title="Cash Flow"
      subtitle="Track income against expenses and keep the daily balance visible."
      action={
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>
      }
    >
      <View style={[styles.netBalanceCard, isProfit ? styles.netBalanceProfit : styles.netBalanceLoss]}>
        <Text style={styles.netBalanceLabel}>Net Balance</Text>
        <Text style={[styles.netBalanceValue, { color: isProfit ? theme.colors.positive : theme.colors.negative }]}>
          {formatCurrency(netBalance)}
        </Text>
        <Text style={styles.netBalanceSub}>
          Income {formatCurrency(totalIncome)} · Expenses {formatCurrency(totalExpense)}
        </Text>
      </View>

      <SectionCard title="Daily Summary" description="Income minus expenses gives the current net balance.">
        <View style={styles.row}>
          <Text style={styles.label}>Total Income</Text>
          <Text style={[styles.value, { color: theme.colors.positive }]}>{formatCurrency(totalIncome)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Total Expenses</Text>
          <Text style={[styles.value, { color: theme.colors.negative }]}>{formatCurrency(totalExpense)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Net Balance</Text>
          <Text style={[styles.value, { color: isProfit ? theme.colors.positive : theme.colors.negative }]}>
            {formatCurrency(netBalance)}
          </Text>
        </View>
      </SectionCard>

      <SectionCard title="Record Expense" description="Expense capture feeds directly into the cash flow ledger.">
        <TextInput value={title} onChangeText={setTitle} placeholder="Expense description" placeholderTextColor={theme.colors.muted} style={styles.input} />
        <TextInput value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder="Amount (₹)" placeholderTextColor={theme.colors.muted} style={styles.input} />
        <Text style={styles.helperText}>Enter whole rupee amounts to keep the daily ledger exact.</Text>

        <Text style={styles.groupLabel}>Category</Text>
        <View style={styles.chipWrap}>
          {categories.map((entry) => (
            <Pressable
              key={entry}
              onPress={() => setCategory(entry)}
              style={[styles.chip, category === entry ? styles.chipActive : null]}
            >
              <Text style={[styles.chipText, category === entry ? styles.chipTextActive : null]}>{entry}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.groupLabel}>Payment Mode</Text>
        <View style={styles.chipWrap}>
          {paymentModes.map((entry) => (
            <Pressable
              key={entry}
              onPress={() => setPaymentMode(entry)}
              style={[styles.chip, paymentMode === entry ? styles.chipActive : null]}
            >
              <Text style={[styles.chipText, paymentMode === entry ? styles.chipTextActive : null]}>{entry}</Text>
            </Pressable>
          ))}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable onPress={handleAddExpense} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Save Expense</Text>
        </Pressable>
      </SectionCard>

      <SectionCard title="Expense Ledger" description="Latest outgoing transactions across shop operations.">
        {expenses.slice(0, 8).map((expense) => (
          <View key={expense.id} style={styles.row}>
            <View style={styles.entryCopy}>
              <Text style={styles.value}>{expense.title}</Text>
              <Text style={styles.meta}>{expense.category} · {expense.paymentMode}</Text>
            </View>
            <Text style={[styles.value, { color: theme.colors.negative }]}>{formatCurrency(expense.amount)}</Text>
          </View>
        ))}
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
  netBalanceCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    alignItems: 'center',
    gap: 4,
  },
  netBalanceProfit: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  netBalanceLoss: {
    backgroundColor: '#FFF5F5',
    borderColor: '#FECACA',
  },
  netBalanceLabel: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  netBalanceValue: {
    fontSize: 32,
    fontWeight: '800',
  },
  netBalanceSub: {
    color: theme.colors.muted,
    fontSize: 12,
    marginTop: 4,
  },
  input: {
    marginTop: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.panelRaised,
    color: theme.colors.text,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  helperText: {
    marginTop: 6,
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '500',
  },
  groupLabel: {
    marginTop: 14,
    marginBottom: 8,
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.panelRaised,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  chipText: {
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: theme.colors.primary,
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
  meta: {
    marginTop: 3,
    color: theme.colors.muted,
    fontSize: 12,
  },
  entryCopy: {
    flex: 1,
  },
  error: {
    marginTop: 10,
    color: theme.colors.negative,
    fontSize: 13,
    fontWeight: '600',
  },
  primaryButton: {
    marginTop: 14,
    borderRadius: 12,
    backgroundColor: theme.colors.accent,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
