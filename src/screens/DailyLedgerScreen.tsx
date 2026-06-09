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

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

export function DailyLedgerScreen() {
  const invoices = useAppStore((s) => s.invoices);
  const expenses = useAppStore((s) => s.expenses);

  const [currentDate, setCurrentDate] = useState(getTodayString());

  const ledger = useMemo(() => {
    return calculateDailyLedger(invoices, expenses, currentDate);
  }, [invoices, expenses, currentDate]);

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

  return (
    <ScreenShell
      title="Daily Ledger"
      subtitle="Complete daily financial summary with opening and closing balance."
      action={
        <Pressable onPress={() => handleToday()} style={styles.todayButton}>
          <Text style={styles.todayButtonText}>Today</Text>
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

            return (
              <View key={txn.id} style={styles.transactionRow}>
                <View style={styles.transactionLeft}>
                  <Text style={styles.transactionTime}>{txn.time}</Text>
                  <Text style={styles.transactionDesc}>{txn.description}</Text>
                  {txn.metadata?.paymentMode && (
                    <Text style={styles.transactionMeta}>{txn.metadata.paymentMode}</Text>
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
  todayButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: theme.colors.accent,
  },
  todayButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },

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
});
