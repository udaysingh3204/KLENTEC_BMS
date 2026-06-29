import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ScreenShell } from '../components/ScreenShell';
import { SectionCard } from '../components/SectionCard';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { theme } from '../theme';
import { formatCurrency } from '../utils/finance';
import {
  calculateDailyLedger,
  getDateString,
  getFormattedDate,
  getNextDayString,
  getPreviousDayString,
  getTodayString,
} from '../utils/ledger';

type Props = NativeStackScreenProps<RootStackParamList, 'DailyLedger'>;

export function DailyLedgerScreen({ navigation }: Props) {
  const invoices = useAppStore((s) => s.invoices);
  const expenses = useAppStore((s) => s.expenses);

  const [currentDate, setCurrentDate] = useState(getTodayString());

  const ledger = useMemo(() => {
    return calculateDailyLedger(invoices, expenses, currentDate);
  }, [invoices, expenses, currentDate]);

  const expensesByCategory = useMemo(() => {
    const dailyExpenses = expenses.filter((e) => e.createdAt.split('T')[0] === currentDate);
    const byCategory: Record<string, number> = {};
    dailyExpenses.forEach((exp) => {
      byCategory[exp.category] = (byCategory[exp.category] || 0) + exp.amount;
    });
    return byCategory;
  }, [expenses, currentDate]);

  const paymentModeBreakdown = useMemo(() => {
    const dailyInvoices = invoices.filter((i) => i.createdAt.split('T')[0] === currentDate);
    const breakdown: Record<string, number> = {};
    dailyInvoices.forEach((inv) => {
      breakdown[inv.paymentMode] = (breakdown[inv.paymentMode] || 0) + inv.total;
    });
    return breakdown;
  }, [invoices, currentDate]);

  const handlePreviousDay = () => {
    setCurrentDate(getPreviousDayString(currentDate));
  };

  const handleNextDay = () => {
    const nextDate = getNextDayString(currentDate);
    const today = getTodayString();
    if (nextDate <= today) {
      setCurrentDate(nextDate);
    }
  };

  const handleToday = () => {
    setCurrentDate(getTodayString());
  };

  const isToday = currentDate === getTodayString();
  const canGoForward = getNextDayString(currentDate) <= getTodayString();

  const transactionCount = invoices.filter((i) => i.createdAt.split('T')[0] === currentDate).length +
    expenses.filter((e) => e.createdAt.split('T')[0] === currentDate).length;

  return (
    <ScreenShell
      title="Daily Ledger"
      subtitle={`${getFormattedDate(currentDate)} • ${transactionCount} transactions`}
      action={
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Home</Text>
        </Pressable>
      }
    >
      {/* Date Navigation */}
      <View style={styles.dateNav}>
        <Pressable onPress={handlePreviousDay} style={styles.navButton}>
          <Text style={styles.navButtonText}>← Previous</Text>
        </Pressable>
        <Text style={styles.dateDisplay}>{getFormattedDate(currentDate)}</Text>
        <Pressable
          onPress={handleNextDay}
          style={[styles.navButton, !canGoForward && styles.navButtonDisabled]}
          disabled={!canGoForward}
        >
          <Text style={[styles.navButtonText, !canGoForward && styles.navButtonTextDisabled]}>
            Next →
          </Text>
        </Pressable>
      </View>

      {/* Opening Balance */}
      <View style={styles.balanceHero}>
        <Text style={styles.balanceLabel}>Opening Balance</Text>
        <Text style={styles.balanceValue}>{formatCurrency(ledger.openingBalance)}</Text>
      </View>

      {/* Transactions List */}
      {ledger.transactions.length === 0 ? (
        <SectionCard title="Transactions" description={`No transactions recorded on ${getFormattedDate(currentDate)}.`}>
          <Text style={styles.emptyText}>No transactions yet</Text>
        </SectionCard>
      ) : (
        <SectionCard title="Transactions" description="Chronological list with running balance.">
          {ledger.transactions.map((txn, idx) => {
            const isIncome = txn.type === 'invoice';
            const isExpense = txn.type === 'expense';
            const invoice = isIncome ? invoices.find((i) => i.id === txn.id) : null;
            const materials = invoice?.lines.map((l) => l.productName).join(', ') || '';
            const priceVarianceColor = invoice?.priceVariance
              ? invoice.priceVariance > 0
                ? '#10B981'
                : '#EF4444'
              : null;

            return (
              <View key={txn.id} style={styles.transactionRow}>
                <View style={styles.transactionLeft}>
                  <Text style={styles.transactionTime}>{txn.time}</Text>
                  <Text style={styles.transactionDesc}>{txn.description}</Text>

                  {/* Customer Info - NEW */}
                  {invoice && invoice.customerName && (
                    <View style={styles.customerInfo}>
                      <Text style={styles.customerName}>👤 {invoice.customerName}</Text>
                      {invoice.customerAddress && (
                        <Text style={styles.customerAddress}>{invoice.customerAddress}</Text>
                      )}
                    </View>
                  )}

                  {/* Material Details - NEW */}
                  {materials && (
                    <Text style={styles.materialsText}>📦 {materials}</Text>
                  )}

                  {/* Payment & Amount Info - ENHANCED */}
                  <View style={styles.paymentRow}>
                    {txn.metadata?.paymentMode && (
                      <Text style={styles.transactionMeta}>{txn.metadata.paymentMode}</Text>
                    )}
                    {invoice?.amountPaid && invoice.amountPaid !== invoice.total && (
                      <Text style={styles.amountPaidText}>
                        • Paid: {formatCurrency(invoice.amountPaid)}
                      </Text>
                    )}
                  </View>

                  {/* Price Variance Indicator - NEW */}
                  {invoice?.priceVariance && priceVarianceColor && (
                    <Text style={[styles.priceVariance, { color: priceVarianceColor }]}>
                      {invoice.priceVariance > 0 ? '↑ Premium' : '↓ Discount'}: {invoice.priceVariance > 0 ? '+' : '−'}{formatCurrency(Math.abs(invoice.priceVariance))}
                    </Text>
                  )}
                </View>

                <View style={styles.transactionRight}>
                  <Text
                    style={[
                      styles.transactionAmount,
                      isIncome ? styles.amountIncome : styles.amountExpense,
                    ]}
                  >
                    {isIncome ? '+' : '−'}{formatCurrency(txn.amount)}
                  </Text>
                  <Text style={styles.runningBalance}>{formatCurrency(txn.runningBalance)}</Text>
                </View>

                {idx < ledger.transactions.length - 1 && <View style={styles.divider} />}
              </View>
            );
          })}
        </SectionCard>
      )}

      {/* Summary Cards */}
      <SectionCard title="Summary" description="Daily totals and calculations.">
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Sales</Text>
            <Text style={[styles.summaryValue, styles.valueIncome]}>
              +{formatCurrency(ledger.totalSales)}
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Expenses</Text>
            <Text style={[styles.summaryValue, styles.valueExpense]}>
              −{formatCurrency(ledger.totalExpenses)}
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Net Change</Text>
            <Text
              style={[
                styles.summaryValue,
                ledger.netChange >= 0 ? styles.valueIncome : styles.valueExpense,
              ]}
            >
              {ledger.netChange >= 0 ? '+' : '−'}{formatCurrency(Math.abs(ledger.netChange))}
            </Text>
          </View>
        </View>
      </SectionCard>

      {/* Payment Mode Breakdown */}
      {Object.keys(paymentModeBreakdown).length > 0 && (
        <SectionCard title="Payment Mode Breakdown" description="Sales by payment method.">
          {Object.entries(paymentModeBreakdown).map(([mode, amount]) => {
            const percentageNum = ledger.totalSales > 0 ? (amount / ledger.totalSales) * 100 : 0;
            const percentage = percentageNum.toFixed(0);
            return (
              <View key={mode} style={styles.breakdownRow}>
                <View style={styles.breakdownLeft}>
                  <Text style={styles.breakdownLabel}>{mode}</Text>
                  <View style={styles.barContainer}>
                    <View
                      style={[
                        styles.progressBar,
                        {
                          width: `${percentage}%` as any,
                          backgroundColor:
                            mode === 'Cash' ? '#10B981' : mode === 'UPI' ? '#3B82F6' : '#F59E0B',
                        },
                      ]}
                    />
                  </View>
                </View>
                <View style={styles.breakdownRight}>
                  <Text style={styles.breakdownAmount}>{formatCurrency(amount)}</Text>
                  <Text style={styles.breakdownPercent}>{percentage}%</Text>
                </View>
              </View>
            );
          })}
        </SectionCard>
      )}

      {/* Expense Category Breakdown */}
      {Object.keys(expensesByCategory).length > 0 && (
        <SectionCard title="Expense Categories" description="Breakdown by expense type.">
          {Object.entries(expensesByCategory).map(([category, amount]) => {
            const percentageNum = ledger.totalExpenses > 0 ? (amount / ledger.totalExpenses) * 100 : 0;
            const percentage = percentageNum.toFixed(0);
            const colors: Record<string, string> = {
              Shop: '#EF4444',
              Labour: '#F97316',
              Delivery: '#F59E0B',
              Purchase: '#FBBF24',
              Misc: '#6B7280',
            };
            return (
              <View key={category} style={styles.breakdownRow}>
                <View style={styles.breakdownLeft}>
                  <Text style={styles.breakdownLabel}>{category}</Text>
                  <View style={styles.barContainer}>
                    <View
                      style={[
                        styles.progressBar,
                        { width: `${percentage}%` as any, backgroundColor: colors[category] || '#6B7280' },
                      ]}
                    />
                  </View>
                </View>
                <View style={styles.breakdownRight}>
                  <Text style={styles.breakdownAmount}>{formatCurrency(amount)}</Text>
                  <Text style={styles.breakdownPercent}>{percentage}%</Text>
                </View>
              </View>
            );
          })}
        </SectionCard>
      )}

      {/* Closing Balance */}
      <View
        style={[
          styles.balanceHero,
          ledger.closingBalance >= ledger.openingBalance
            ? styles.balanceHeroPositive
            : styles.balanceHeroNegative,
        ]}
      >
        <Text style={styles.balanceLabel}>Closing Balance</Text>
        <Text
          style={[
            styles.balanceValue,
            ledger.closingBalance >= ledger.openingBalance
              ? styles.balanceValuePositive
              : styles.balanceValueNegative,
          ]}
        >
          {formatCurrency(ledger.closingBalance)}
        </Text>
        <Text style={styles.balanceStatus}>
          {ledger.closingBalance >= ledger.openingBalance
            ? '✅ Profit recorded'
            : '⚠️ Loss recorded'}
        </Text>
      </View>
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

  dateNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 16,
    backgroundColor: theme.colors.panelRaised,
    borderRadius: 12,
    marginBottom: 16,
  },
  navButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: theme.colors.primaryLight,
  },
  navButtonDisabled: {
    backgroundColor: theme.colors.panel,
  },
  navButtonText: { color: theme.colors.primary, fontSize: 12, fontWeight: '700' },
  navButtonTextDisabled: { color: theme.colors.muted },
  dateDisplay: { color: theme.colors.text, fontSize: 14, fontWeight: '700' },

  balanceHero: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: theme.colors.primaryLight,
    marginBottom: 16,
    alignItems: 'center',
    gap: 4,
  },
  balanceHeroPositive: { backgroundColor: '#F0FDF4' },
  balanceHeroNegative: { backgroundColor: '#FFF5F5' },

  balanceLabel: { color: theme.colors.muted, fontSize: 12, fontWeight: '600', textTransform: 'uppercase' },
  balanceValue: { color: theme.colors.primary, fontSize: 32, fontWeight: '800' },
  balanceValuePositive: { color: theme.colors.positive },
  balanceValueNegative: { color: theme.colors.negative },
  balanceStatus: { color: theme.colors.muted, fontSize: 12, marginTop: 4 },

  emptyText: { color: theme.colors.muted, fontSize: 14, textAlign: 'center', paddingVertical: 16 },

  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    gap: 12,
  },
  transactionLeft: { flex: 1, gap: 2 },
  transactionRight: { alignItems: 'flex-end', gap: 2 },

  transactionTime: { color: theme.colors.muted, fontSize: 12, fontWeight: '600' },
  transactionDesc: { color: theme.colors.text, fontSize: 14, fontWeight: '600' },
  transactionMeta: { color: theme.colors.muted, fontSize: 11 },

  customerInfo: { marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: theme.colors.border, gap: 1 },
  customerName: { color: theme.colors.text, fontSize: 12, fontWeight: '700' },
  customerAddress: { color: theme.colors.muted, fontSize: 11 },

  materialsText: { color: theme.colors.text, fontSize: 11, fontWeight: '600', marginTop: 4 },

  paymentRow: { flexDirection: 'row', gap: 6, alignItems: 'center', marginTop: 4, flexWrap: 'wrap' },
  amountPaidText: { color: theme.colors.positive, fontSize: 11, fontWeight: '600' },

  priceVariance: { fontSize: 11, fontWeight: '700', marginTop: 4 },

  transactionAmount: { fontSize: 14, fontWeight: '700' },
  amountIncome: { color: theme.colors.positive },
  amountExpense: { color: theme.colors.negative },

  runningBalance: { color: theme.colors.text, fontSize: 12, fontWeight: '700' },

  divider: { height: 1, backgroundColor: theme.colors.border, marginVertical: 8 },

  summaryGrid: { gap: 12 },
  summaryCard: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: theme.colors.panelRaised,
    gap: 4,
  },
  summaryLabel: { color: theme.colors.muted, fontSize: 12, fontWeight: '600' },
  summaryValue: { fontSize: 16, fontWeight: '800' },
  valueIncome: { color: theme.colors.positive },
  valueExpense: { color: theme.colors.negative },

  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  breakdownLeft: { flex: 1, gap: 6, marginRight: 12 },
  breakdownRight: { alignItems: 'flex-end', gap: 2 },
  breakdownLabel: { color: theme.colors.text, fontSize: 13, fontWeight: '700' },
  barContainer: {
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.panel,
    overflow: 'hidden',
  },
  progressBar: { height: '100%', borderRadius: 3 },
  breakdownAmount: { color: theme.colors.text, fontSize: 13, fontWeight: '700' },
  breakdownPercent: { color: theme.colors.muted, fontSize: 11, fontWeight: '600' },
});
