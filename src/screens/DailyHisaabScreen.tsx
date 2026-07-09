import { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View, Pressable, Share } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ScreenShell } from '../components/ScreenShell';
import { SectionCard } from '../components/SectionCard';
import { TransactionDetailsModal } from '../components/TransactionDetailsModal';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { Invoice } from '../types';
import { theme } from '../theme';
import { formatCurrency } from '../utils/finance';
import { getTodayString, getFormattedDate } from '../utils/ledger';
import { generateDailyLedgerCSV, generateDailyLedgerSummary, type ExcelExportData } from '../utils/excelExport';

type Props = NativeStackScreenProps<RootStackParamList, 'DailyLedger'>;

export function DailyHisaabScreen({ navigation }: Props) {
  const invoices = useAppStore((s) => s.invoices);
  const expenses = useAppStore((s) => s.expenses);
  const [exportError, setExportError] = useState('');

  const [currentDate, setCurrentDate] = useState(getTodayString());
  const [selectedTransaction, setSelectedTransaction] = useState<Invoice | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Get all transactions for the day
  const dailyData = useMemo(() => {
    const dateStr = currentDate.split('T')[0];

    // Invoices for the day
    const dayInvoices = invoices.filter((i) => i.createdAt.split('T')[0] === dateStr);

    // Expenses for the day
    const dayExpenses = expenses.filter((e) => e.createdAt.split('T')[0] === dateStr);

    // Prepare invoice rows
    const invoiceRows = dayInvoices.map((inv) => {
      // Calculate cash, upi, and udhar
      const amountPaid = inv.amountPaid || 0;
      const udhar = Math.max(0, inv.total - amountPaid);

      // Calculate cash and UPI for this invoice
      let cashAmount = 0;
      let upiAmount = 0;

      if (inv.paymentMode === 'Cash') {
        cashAmount = inv.total;
      } else if (inv.paymentMode === 'UPI') {
        upiAmount = inv.total;
      } else if (inv.paymentMode === 'Credit') {
        // Credit: no cash/upi payment yet
        cashAmount = 0;
        upiAmount = 0;
      }

      // Handle split payments
      if (inv.cashPaid) {
        cashAmount = inv.cashPaid;
      }
      if (inv.upiPaid) {
        upiAmount = inv.upiPaid;
      }

      // Determine payment display
      let paymentDisplay = inv.paymentMode;
      if (inv.cashPaid && inv.upiPaid) {
        paymentDisplay = 'Cash+UPI' as any;
      } else if (inv.upiAccount && inv.paymentMode === 'UPI') {
        paymentDisplay = `UPI (${inv.upiAccount})` as any;
      }

      return {
        id: inv.id,
        type: 'invoice' as const,
        time: inv.createdAt.split('T')[1]?.substring(0, 5) || '',
        amount: inv.total,
        mode: paymentDisplay,
        name: inv.customerName,
        address: inv.customerAddress || '',
        products: inv.lines.map((l) => l.productName).join(', '),
        cash: cashAmount,
        upi: upiAmount,
        udhar: udhar > 0 ? udhar : 0,
        bhada: inv.bhada || 0,
        dala: inv.dala || 0,
        influencer: inv.influencerName ? `${inv.influencerName}${inv.influencerContact ? ' (' + inv.influencerContact + ')' : ''}` : '',
        notes: '',
        invoiceData: inv,
      };
    });

    // Prepare expense rows
    // Also deduct dala from shop expense if any dala was paid
    const totalDalaPaid = dayInvoices.reduce((sum, inv) => sum + (inv.dala || 0), 0);
    const expenseRows = dayExpenses.map((exp) => ({
      id: exp.id,
      type: 'expense' as const,
      time: exp.createdAt.split('T')[1]?.substring(0, 5) || '',
      amount: -exp.amount,
      mode: exp.paymentMode,
      name: `[EXPENSE] ${exp.title}`,
      address: '',
      products: exp.category,
      credit: 0,
      bhada: 0,
      dala: exp.category === 'Shop' ? totalDalaPaid : 0,
      influencer: '',
      notes: exp.title,
    }));

    // Combine and sort by time
    const allRows = [...invoiceRows, ...expenseRows].sort((a, b) => a.time.localeCompare(b.time));

    // Calculate totals
    const totalIncome = dayInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalExpense = dayExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    // FIX: Calculate udhar (credit) = total - amountPaid for ALL invoices
    const totalUdhar = dayInvoices.reduce((sum, inv) => {
      const amountPaid = inv.amountPaid || 0;
      const udhar = Math.max(0, inv.total - amountPaid);
      return sum + udhar;
    }, 0);

    const totalCash = dayInvoices.reduce((sum, inv) => {
      if (inv.paymentMode === 'Cash') return sum + inv.total;
      if (inv.cashPaid) return sum + inv.cashPaid;
      return sum;
    }, 0);

    const totalUPI = dayInvoices.reduce((sum, inv) => {
      if (inv.paymentMode === 'UPI') return sum + inv.total;
      if (inv.upiPaid) return sum + inv.upiPaid;
      return sum;
    }, 0);

    const totalBhada = dayInvoices.reduce((sum, inv) => sum + (inv.bhada || 0), 0);
    const totalDala = dayInvoices.reduce((sum, inv) => sum + (inv.dala || 0), 0);

    return {
      rows: allRows,
      totalIncome,
      totalExpense,
      totalUdhar,
      totalCash,
      totalUPI,
      totalBhada,
      totalDala,
      netProfit: totalIncome - totalExpense,
      cashAvailable: totalCash + totalUPI - totalExpense - totalDala,
    };
  }, [invoices, expenses, currentDate]);

  const handleExportCSV = async () => {
    try {
      const csv = generateDailyLedgerCSV(dailyData as unknown as ExcelExportData);
      const summary = generateDailyLedgerSummary(dailyData as unknown as ExcelExportData);
      const content = summary + '\n\n' + csv;

      await Share.share({
        message: content,
        title: `Daily Ledger - ${currentDate.split('T')[0]}`,
      });
    } catch (error) {
      setExportError('Failed to export data');
      setTimeout(() => setExportError(''), 3000);
    }
  };

  return (
    <ScreenShell
      title="दैनिक हिसाब (Daily Hisaab)"
      subtitle={`${getFormattedDate(currentDate)} • Complete Daily Ledger`}
      action={
        <View style={styles.actionButtons}>
          <Pressable onPress={handleExportCSV} style={styles.exportButton}>
            <Text style={styles.exportButtonText}>📊 Export CSV</Text>
          </Pressable>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </Pressable>
        </View>
      }
    >
      {/* Summary Cards */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, styles.incomeCard]}>
          <Text style={styles.summaryLabel}>Total Income</Text>
          <Text style={styles.summaryValue}>{formatCurrency(dailyData.totalIncome)}</Text>
        </View>
        <View style={[styles.summaryCard, styles.expenseCard]}>
          <Text style={styles.summaryLabel}>Total Expense</Text>
          <Text style={styles.summaryValue}>{formatCurrency(dailyData.totalExpense)}</Text>
        </View>
        <View style={[styles.summaryCard, dailyData.netProfit >= 0 ? styles.profitCard : styles.lossCard]}>
          <Text style={styles.summaryLabel}>Net Profit</Text>
          <Text style={styles.summaryValue}>
            {dailyData.netProfit >= 0 ? '+' : '−'}{formatCurrency(Math.abs(dailyData.netProfit))}
          </Text>
        </View>
      </View>

      {/* Payment Mode Breakdown */}
      <SectionCard title="Payment Mode Summary" description="Breakdown by payment type">
        <View style={styles.breakdownRow}>
          <View style={styles.breakdownItem}>
            <Text style={styles.breakdownLabel}>💵 Cash</Text>
            <Text style={[styles.breakdownValue, { color: theme.colors.positive }]}>
              {formatCurrency(dailyData.totalCash)}
            </Text>
          </View>
          <View style={styles.breakdownItem}>
            <Text style={styles.breakdownLabel}>📱 UPI</Text>
            <Text style={[styles.breakdownValue, { color: theme.colors.positive }]}>
              {formatCurrency(dailyData.totalUPI)}
            </Text>
          </View>
          <View style={styles.breakdownItem}>
            <Text style={styles.breakdownLabel}>💸 Udhar</Text>
            <Text style={[styles.breakdownValue, { color: theme.colors.accent }]}>
              {formatCurrency(dailyData.totalUdhar)}
            </Text>
          </View>
          <View style={styles.breakdownItem}>
            <Text style={styles.breakdownLabel}>🚚 Bhada</Text>
            <Text style={styles.breakdownValue}>{formatCurrency(dailyData.totalBhada)}</Text>
          </View>
          <View style={styles.breakdownItem}>
            <Text style={styles.breakdownLabel}>👤 Dala</Text>
            <Text style={[styles.breakdownValue, { color: theme.colors.negative }]}>
              {formatCurrency(dailyData.totalDala)}
            </Text>
          </View>
        </View>
      </SectionCard>

      {/* Main Ledger Table */}
      <SectionCard title="Complete Daily Ledger (सभी लेनदेन)" description="All transactions in chronological order">
        {dailyData.rows.length === 0 ? (
          <Text style={styles.emptyText}>No transactions for this day</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.tableContainer}>
              {/* Header Row */}
              <View style={[styles.row, styles.headerRow]}>
                <Text style={[styles.cell, styles.timeCell, styles.headerCell]}>समय</Text>
                <Text style={[styles.cell, styles.amountCell, styles.headerCell]}>Amount</Text>
                <Text style={[styles.cell, styles.modeCell, styles.headerCell]}>Mode</Text>
                <Text style={[styles.cell, styles.nameCell, styles.headerCell]}>Name</Text>
                <Text style={[styles.cell, styles.productsCell, styles.headerCell]}>Products</Text>
                <Text style={[styles.cell, styles.addressCell, styles.headerCell]}>Address</Text>
                <Text style={[styles.cell, styles.cashCell, styles.headerCell]}>💵 Cash</Text>
                <Text style={[styles.cell, styles.upiCell, styles.headerCell]}>📱 UPI</Text>
                <Text style={[styles.cell, styles.udharCell, styles.headerCell]}>Udhar</Text>
                <Text style={[styles.cell, styles.bhadaCell, styles.headerCell]}>Bhada</Text>
                <Text style={[styles.cell, styles.dalaCell, styles.headerCell]}>Dala</Text>
                <Text style={[styles.cell, styles.influencerCell, styles.headerCell]}>Influencer</Text>
              </View>

              {/* Data Rows */}
              {dailyData.rows.map((row, idx) => (
                <Pressable
                  key={row.id}
                  onPress={() => {
                    if (row.type === 'invoice' && row.invoiceData) {
                      setSelectedTransaction(row.invoiceData);
                      setShowDetails(true);
                    }
                  }}
                  style={[styles.row, idx % 2 === 0 ? styles.rowEven : styles.rowOdd, styles.clickableRow]}
                >
                  <Text style={[styles.cell, styles.timeCell]}>{row.time}</Text>
                  <Text
                    style={[
                      styles.cell,
                      styles.amountCell,
                      { color: row.type === 'invoice' ? theme.colors.positive : theme.colors.negative },
                    ]}
                  >
                    {row.type === 'invoice' ? '+' : '−'}{formatCurrency(Math.abs(row.amount))}
                  </Text>
                  <Text style={[styles.cell, styles.modeCell]}>{row.mode}</Text>
                  <Text style={[styles.cell, styles.nameCell]}>{row.name}</Text>
                  <Text style={[styles.cell, styles.productsCell]}>{row.products}</Text>
                  <Text style={[styles.cell, styles.addressCell]}>{row.address}</Text>
                  <Text style={[styles.cell, styles.cashCell, { color: 'cash' in row && row.cash > 0 ? theme.colors.positive : theme.colors.muted }]}>
                    {'cash' in row && row.cash > 0 ? formatCurrency(row.cash) : '—'}
                  </Text>
                  <Text style={[styles.cell, styles.upiCell, { color: 'upi' in row && row.upi > 0 ? theme.colors.positive : theme.colors.muted }]}>
                    {'upi' in row && row.upi > 0 ? formatCurrency(row.upi) : '—'}
                  </Text>
                  <Text style={[styles.cell, styles.udharCell, { color: 'udhar' in row && row.udhar > 0 ? theme.colors.negative : theme.colors.muted }]}>
                    {'udhar' in row && row.udhar > 0 ? formatCurrency(row.udhar) : '—'}
                  </Text>
                  <Text style={[styles.cell, styles.bhadaCell]}>
                    {row.bhada > 0 ? formatCurrency(row.bhada) : '—'}
                  </Text>
                  <Text style={[styles.cell, styles.dalaCell]}>
                    {row.dala > 0 ? formatCurrency(row.dala) : '—'}
                  </Text>
                  <Text style={[styles.cell, styles.influencerCell]}>{row.influencer || '—'}</Text>
                </Pressable>
              ))}

              {/* Total Row */}
              {dailyData.rows.length > 0 && (
                <View style={[styles.row, styles.totalRow]}>
                  <Text style={[styles.cell, styles.timeCell, styles.totalCell]}>📊 TOTAL</Text>
                  <Text style={[styles.cell, styles.amountCell, styles.totalCell, { color: theme.colors.primary, fontWeight: '800' }]}>
                    {formatCurrency(dailyData.rows.reduce((sum, r) => sum + (r.type === 'invoice' ? r.amount : -r.amount), 0))}
                  </Text>
                  <Text style={[styles.cell, styles.modeCell, styles.totalCell]}>—</Text>
                  <Text style={[styles.cell, styles.nameCell, styles.totalCell]}>—</Text>
                  <Text style={[styles.cell, styles.productsCell, styles.totalCell]}>—</Text>
                  <Text style={[styles.cell, styles.addressCell, styles.totalCell]}>—</Text>
                  <Text style={[styles.cell, styles.cashCell, styles.totalCell, { color: theme.colors.positive, fontWeight: '800' }]}>
                    {formatCurrency(dailyData.rows.reduce((sum, r) => sum + ('cash' in r ? r.cash : 0), 0))}
                  </Text>
                  <Text style={[styles.cell, styles.upiCell, styles.totalCell, { color: '#3B82F6', fontWeight: '800' }]}>
                    {formatCurrency(dailyData.rows.reduce((sum, r) => sum + ('upi' in r ? r.upi : 0), 0))}
                  </Text>
                  <Text style={[styles.cell, styles.udharCell, styles.totalCell, { color: theme.colors.negative, fontWeight: '800' }]}>
                    {formatCurrency(dailyData.rows.reduce((sum, r) => sum + ('udhar' in r ? r.udhar : 0), 0))}
                  </Text>
                  <Text style={[styles.cell, styles.bhadaCell, styles.totalCell, { color: theme.colors.warning, fontWeight: '800' }]}>
                    {formatCurrency(dailyData.rows.reduce((sum, r) => sum + r.bhada, 0))}
                  </Text>
                  <Text style={[styles.cell, styles.dalaCell, styles.totalCell, { color: theme.colors.negative, fontWeight: '800' }]}>
                    {formatCurrency(dailyData.rows.reduce((sum, r) => sum + r.dala, 0))}
                  </Text>
                  <Text style={[styles.cell, styles.influencerCell, styles.totalCell]}>—</Text>
                </View>
              )}
            </View>
          </ScrollView>
        )}
      </SectionCard>

      {/* Cash in Hand Summary */}
      <SectionCard title="नकद हिसाब (Cash Summary)" description="Cash and UPI balance">
        <View style={styles.cashSummaryRow}>
          <View style={styles.cashSummaryItem}>
            <Text style={styles.cashSummaryLabel}>Cash Received</Text>
            <Text style={[styles.cashSummaryValue, { color: theme.colors.positive }]}>
              {formatCurrency(dailyData.totalCash)}
            </Text>
          </View>
          <View style={styles.cashSummaryItem}>
            <Text style={styles.cashSummaryLabel}>UPI Received</Text>
            <Text style={[styles.cashSummaryValue, { color: theme.colors.positive }]}>
              {formatCurrency(dailyData.totalUPI)}
            </Text>
          </View>
          <View style={styles.cashSummaryItem}>
            <Text style={styles.cashSummaryLabel}>Expenses Paid</Text>
            <Text style={[styles.cashSummaryValue, { color: theme.colors.negative }]}>
              {formatCurrency(dailyData.totalExpense)}
            </Text>
          </View>
          <View style={[styles.cashSummaryItem, styles.cashSummaryTotal]}>
            <Text style={styles.cashSummaryLabel}>Cash in Hand</Text>
            <Text
              style={[
                styles.cashSummaryValue,
                { color: dailyData.cashAvailable >= 0 ? theme.colors.positive : theme.colors.negative },
              ]}
            >
              {dailyData.cashAvailable >= 0 ? '+' : '−'}{formatCurrency(Math.abs(dailyData.cashAvailable))}
            </Text>
          </View>
        </View>
      </SectionCard>

      {/* Transaction Details Modal */}
      <TransactionDetailsModal
        visible={showDetails}
        transaction={selectedTransaction}
        onClose={() => {
          setShowDetails(false);
          setSelectedTransaction(null);
        }}
      />
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

  summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  summaryCard: {
    flex: 1,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    gap: 4,
  },
  incomeCard: { backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: '#DCFCE7' },
  expenseCard: { backgroundColor: '#FFF5F5', borderWidth: 1, borderColor: '#FECACA' },
  profitCard: { backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: '#DCFCE7' },
  lossCard: { backgroundColor: '#FFF5F5', borderWidth: 1, borderColor: '#FECACA' },
  summaryLabel: { color: theme.colors.muted, fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
  summaryValue: { color: theme.colors.text, fontSize: 16, fontWeight: '800' },

  breakdownRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  breakdownItem: {
    flex: 1,
    minWidth: 100,
    backgroundColor: theme.colors.panelRaised,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  breakdownLabel: { color: theme.colors.muted, fontSize: 12, fontWeight: '600' },
  breakdownValue: { color: theme.colors.text, fontSize: 15, fontWeight: '800' },

  emptyText: {
    color: theme.colors.muted,
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },

  tableContainer: { borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: theme.colors.border },
  row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  headerRow: { backgroundColor: theme.colors.primary },
  rowEven: { backgroundColor: theme.colors.background },
  rowOdd: { backgroundColor: theme.colors.panelRaised },
  clickableRow: { opacity: 1 },

  cell: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 12,
    color: theme.colors.text,
  },
  headerCell: {
    color: '#FFFFFF',
    fontWeight: '700',
    backgroundColor: theme.colors.primary,
  },

  timeCell: { width: 60, fontWeight: '600' },
  amountCell: { width: 80, fontWeight: '700' },
  modeCell: { width: 70 },
  nameCell: { width: 120 },
  productsCell: { width: 150 },
  addressCell: { width: 140 },
  cashCell: { width: 70, fontWeight: '600' },
  upiCell: { width: 70, fontWeight: '600' },
  udharCell: { width: 70, fontWeight: '600' },
  bhadaCell: { width: 70, fontWeight: '600' },
  dalaCell: { width: 70, fontWeight: '600' },
  influencerCell: { width: 140 },

  cashSummaryRow: { gap: 12 },
  cashSummaryItem: {
    backgroundColor: theme.colors.panelRaised,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cashSummaryTotal: {
    backgroundColor: theme.colors.primary + '15',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  cashSummaryLabel: { color: theme.colors.muted, fontSize: 13, fontWeight: '600' },
  cashSummaryValue: { fontSize: 16, fontWeight: '800' },

  totalRow: {
    backgroundColor: theme.colors.primary + '20',
    borderTopWidth: 3,
    borderTopColor: theme.colors.primary,
    borderBottomWidth: 3,
    borderBottomColor: theme.colors.primary,
  },
  totalCell: {
    fontWeight: '700',
    backgroundColor: theme.colors.primary + '10',
  },

  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  exportButton: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: theme.colors.accent + '20' || '#10B98120',
    borderWidth: 1,
    borderColor: theme.colors.accent || '#10B981',
  },
  exportButtonText: {
    color: theme.colors.accent || '#10B981',
    fontSize: 12,
    fontWeight: '700',
  },
});
