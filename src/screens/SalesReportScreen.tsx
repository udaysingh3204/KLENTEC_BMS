import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ScreenShell } from '../components/ScreenShell';
import { SectionCard } from '../components/SectionCard';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { theme } from '../theme';
import { formatCurrency } from '../utils/finance';

type Props = NativeStackScreenProps<RootStackParamList, 'SalesReport'>;

export function SalesReportScreen({ navigation }: Props) {
  const invoices = useAppStore((s) => s.invoices);
  const customers = useAppStore((s) => s.customers);

  const [filterMinAmount, setFilterMinAmount] = useState('');
  const [filterMaxAmount, setFilterMaxAmount] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  const minAmount = filterMinAmount ? parseInt(filterMinAmount, 10) : 0;
  const maxAmount = filterMaxAmount ? parseInt(filterMaxAmount, 10) : Infinity;

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesCustomer = !selectedCustomerId || inv.customerId === selectedCustomerId;
      const matchesAmount = inv.total >= minAmount && inv.total <= maxAmount;
      return matchesCustomer && matchesAmount;
    });
  }, [invoices, selectedCustomerId, minAmount, maxAmount]);

  const totalSalesVolume = useMemo(() => {
    return filteredInvoices.reduce((sum, inv) => {
      return sum + inv.lines.reduce((lineSum, line) => lineSum + line.quantity, 0);
    }, 0);
  }, [filteredInvoices]);

  const totalSalesAmount = useMemo(() => {
    return filteredInvoices.reduce((sum, inv) => sum + inv.total, 0);
  }, [filteredInvoices]);

  const averageSaleValue = useMemo(() => {
    return filteredInvoices.length > 0 ? totalSalesAmount / filteredInvoices.length : 0;
  }, [filteredInvoices, totalSalesAmount]);

  const profitByPaymentMode = useMemo(() => {
    const modes: Record<string, { count: number; total: number }> = {};
    filteredInvoices.forEach((inv) => {
      if (!modes[inv.paymentMode]) {
        modes[inv.paymentMode] = { count: 0, total: 0 };
      }
      modes[inv.paymentMode].count += 1;
      modes[inv.paymentMode].total += inv.total;
    });
    return modes;
  }, [filteredInvoices]);

  return (
    <ScreenShell
      title="Sales Report"
      subtitle="Track sales by volume and amount with detailed filters."
      action={
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Home</Text>
        </Pressable>
      }
    >
      {/* Filters */}
      <SectionCard title="Filters" description="Filter sales by amount and customer.">
        <Text style={styles.filterLabel}>Customer</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipWrap}>
          <Pressable
            onPress={() => setSelectedCustomerId(null)}
            style={[styles.chip, !selectedCustomerId && styles.chipActive]}
          >
            <Text style={[styles.chipText, !selectedCustomerId && styles.chipTextActive]}>All</Text>
          </Pressable>
          {customers.map((customer) => (
            <Pressable
              key={customer.id}
              onPress={() => setSelectedCustomerId(customer.id)}
              style={[styles.chip, customer.id === selectedCustomerId && styles.chipActive]}
            >
              <Text style={[styles.chipText, customer.id === selectedCustomerId && styles.chipTextActive]}>
                {customer.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.amountFilterRow}>
          <View style={styles.amountFilterInput}>
            <Text style={styles.filterLabelSmall}>Min Amount (₹)</Text>
            <TextInput
              value={filterMinAmount}
              onChangeText={setFilterMinAmount}
              placeholder="0"
              keyboardType="numeric"
              placeholderTextColor={theme.colors.muted}
              style={styles.input}
            />
          </View>
          <View style={styles.amountFilterInput}>
            <Text style={styles.filterLabelSmall}>Max Amount (₹)</Text>
            <TextInput
              value={filterMaxAmount}
              onChangeText={setFilterMaxAmount}
              placeholder="No limit"
              keyboardType="numeric"
              placeholderTextColor={theme.colors.muted}
              style={styles.input}
            />
          </View>
        </View>
      </SectionCard>

      {/* Summary Cards */}
      <View style={styles.summaryGrid}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Transactions</Text>
          <Text style={styles.summaryValue}>{filteredInvoices.length}</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Volume</Text>
          <Text style={styles.summaryValue}>{totalSalesVolume}</Text>
          <Text style={styles.summarySubtitle}>items</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Amount</Text>
          <Text style={[styles.summaryValue, styles.summaryValueGreen]}>
            {formatCurrency(totalSalesAmount)}
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Average Sale</Text>
          <Text style={styles.summaryValue}>{formatCurrency(averageSaleValue)}</Text>
        </View>
      </View>

      {/* Payment Mode Breakdown */}
      <SectionCard title="Sales by Payment Mode" description="Breakdown by payment method.">
        {Object.entries(profitByPaymentMode).map(([mode, data]) => (
          <View key={mode} style={styles.modeRow}>
            <View style={styles.modeLeft}>
              <Text style={styles.modeLabel}>{mode}</Text>
              <Text style={styles.modeCount}>{data.count} transaction{data.count !== 1 ? 's' : ''}</Text>
            </View>
            <Text style={styles.modeAmount}>{formatCurrency(data.total)}</Text>
          </View>
        ))}
      </SectionCard>

      {/* Detailed Transaction List */}
      <SectionCard
        title="Filtered Transactions"
        description={`${filteredInvoices.length} transaction${filteredInvoices.length !== 1 ? 's' : ''} match your filters`}
      >
        {filteredInvoices.length === 0 ? (
          <Text style={styles.emptyText}>No transactions match your filters.</Text>
        ) : (
          filteredInvoices.map((invoice) => {
            const itemCount = invoice.lines.reduce((sum, line) => sum + line.quantity, 0);
            return (
              <View key={invoice.id} style={styles.transactionRow}>
                <View style={styles.transactionLeft}>
                  <Text style={styles.transactionCustomer}>{invoice.customerName}</Text>
                  <Text style={styles.transactionItems}>
                    {itemCount} item{itemCount !== 1 ? 's' : ''} • {invoice.paymentMode}
                  </Text>
                  <Text style={styles.transactionDate}>
                    {new Date(invoice.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: '2-digit',
                    })}
                  </Text>
                </View>
                <Text style={styles.transactionAmount}>{formatCurrency(invoice.total)}</Text>
              </View>
            );
          })
        )}
      </SectionCard>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  backButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: theme.colors.panelRaised,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
  },
  backButtonText: { color: theme.colors.primary, fontSize: 12, fontWeight: '700' },

  filterLabel: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 8,
  },
  filterLabelSmall: {
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
  },
  chipWrap: { flexDirection: 'row', gap: 8, marginBottom: 16, paddingHorizontal: 0 },
  chip: {
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.panelRaised,
    paddingHorizontal: 14,
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

  amountFilterRow: {
    flexDirection: 'row',
    gap: 12,
  },
  amountFilterInput: {
    flex: 1,
  },
  input: {
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.panelRaised,
    color: theme.colors.text,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },

  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: theme.colors.panelRaised,
    borderRadius: 12,
    padding: 14,
    gap: 4,
  },
  summaryLabel: {
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryValue: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  summaryValueGreen: { color: theme.colors.positive },
  summarySubtitle: {
    color: theme.colors.muted,
    fontSize: 10,
    fontWeight: '600',
  },

  modeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modeLeft: { gap: 2 },
  modeLabel: { color: theme.colors.text, fontSize: 13, fontWeight: '700' },
  modeCount: { color: theme.colors.muted, fontSize: 12, fontWeight: '600' },
  modeAmount: { color: theme.colors.positive, fontSize: 14, fontWeight: '800' },

  emptyText: {
    color: theme.colors.muted,
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 16,
  },

  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  transactionLeft: { flex: 1, gap: 2 },
  transactionCustomer: { color: theme.colors.text, fontSize: 13, fontWeight: '700' },
  transactionItems: { color: theme.colors.muted, fontSize: 12 },
  transactionDate: { color: theme.colors.muted, fontSize: 11, marginTop: 2 },
  transactionAmount: { color: theme.colors.positive, fontSize: 14, fontWeight: '800' },
});
