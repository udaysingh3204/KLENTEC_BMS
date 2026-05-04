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
      subtitle="Track income against expenses and keep the daily balance visible to the admin team."
      action={
        <Pressable onPress={() => navigation.goBack()} style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Back</Text>
        </Pressable>
      }
    >
      <SectionCard title="Daily summary" description="Income minus expenses gives the current net balance.">
        <View style={styles.row}>
          <Text style={styles.label}>Income</Text>
          <Text style={styles.value}>{formatCurrency(totalIncome)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Expenses</Text>
          <Text style={styles.value}>{formatCurrency(totalExpense)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Net balance</Text>
          <Text style={styles.value}>{formatCurrency(netBalance)}</Text>
        </View>
      </SectionCard>

      <SectionCard title="Record expense" description="Expense capture feeds directly into the cash flow ledger.">
        <TextInput value={title} onChangeText={setTitle} placeholder="Expense title" placeholderTextColor={theme.colors.muted} style={styles.input} />
        <TextInput value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder="Amount" placeholderTextColor={theme.colors.muted} style={styles.input} />
        <Text style={styles.helperText}>Use whole naira amounts to keep the daily ledger exact.</Text>

        <Text style={styles.groupLabel}>Category</Text>
        <View style={styles.chipWrap}>
          {categories.map((entry) => (
            <Pressable
              key={entry}
              onPress={() => setCategory(entry)}
              style={[styles.chip, category === entry ? styles.chipActive : null]}
            >
              <Text style={styles.chipText}>{entry}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.groupLabel}>Payment mode</Text>
        <View style={styles.chipWrap}>
          {paymentModes.map((entry) => (
            <Pressable
              key={entry}
              onPress={() => setPaymentMode(entry)}
              style={[styles.chip, paymentMode === entry ? styles.chipActive : null]}
            >
              <Text style={styles.chipText}>{entry}</Text>
            </Pressable>
          ))}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable onPress={handleAddExpense} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Save expense</Text>
        </Pressable>
      </SectionCard>

      <SectionCard title="Expense ledger" description="Latest outgoing transactions across shop operations.">
        {expenses.slice(0, 8).map((expense) => (
          <View key={expense.id} style={styles.row}>
            <View style={styles.entryCopy}>
              <Text style={styles.value}>{expense.title}</Text>
              <Text style={styles.meta}>{expense.category} • {expense.paymentMode}</Text>
            </View>
            <Text style={styles.value}>{formatCurrency(expense.amount)}</Text>
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
  input: {
    marginTop: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.panelRaised,
    color: theme.colors.text,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
  },
  helperText: {
    marginTop: 8,
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  groupLabel: {
    marginTop: 14,
    marginBottom: 8,
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.panelRaised,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  chipActive: {
    borderColor: theme.colors.accent,
    backgroundColor: '#204248',
  },
  chipText: {
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
  meta: {
    marginTop: 4,
    color: theme.colors.muted,
    fontSize: 13,
  },
  entryCopy: {
    flex: 1,
  },
  error: {
    marginTop: 10,
    color: theme.colors.warning,
    fontSize: 13,
    fontWeight: '600',
  },
  primaryButton: {
    marginTop: 14,
    borderRadius: 16,
    backgroundColor: theme.colors.accent,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: theme.colors.background,
    fontSize: 15,
    fontWeight: '800',
  },
});