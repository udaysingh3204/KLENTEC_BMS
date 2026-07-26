import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ScreenShell } from '../components/ScreenShell';
import { SectionCard } from '../components/SectionCard';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { theme } from '../theme';
import { formatCurrency } from '../utils/finance';

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

type SortField = 'date' | 'amount' | 'profit' | 'margin' | 'quantity';
type SortOrder = 'asc' | 'desc';

export function TransactionLedgerScreen({ navigation }: Props) {
  const invoices = useAppStore((s) => s.invoices);
  const products = useAppStore((s) => s.products);
  const customers = useAppStore((s) => s.customers);

  // Filters
  const [filterCustomer, setFilterCustomer] = useState('');
  const [filterProduct, setFilterProduct] = useState('');
  const [filterVehicle, setFilterVehicle] = useState('');
  const [filterFromDate, setFilterFromDate] = useState('');
  const [filterToDate, setFilterToDate] = useState('');

  // Sorting
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Flatten invoice lines with metadata
  const transactionList = useMemo(() => {
    const transactions: any[] = [];

    invoices.forEach((invoice) => {
      const customer = customers.find((c) => c.id === invoice.customerId);

      invoice.lines.forEach((line) => {
        const product = products.find((p) => p.id === line.productId);
        transactions.push({
          id: `${invoice.id}-${line.productId}`,
          invoiceId: invoice.id,
          invoiceDate: invoice.createdAt,
          customerName: customer?.name || 'Unknown',
          customerId: invoice.customerId,
          productName: line.productName,
          productId: line.productId,
          gadiNumber: product?.gadiNumber || 'N/A',
          quantity: line.quantity,
          costPrice: line.costPrice || 0,
          sellingPrice: line.unitPrice,
          lineTotal: line.lineTotal,
          profit: line.profit || 0,
          profitMargin: line.profitMargin || 0,
          paymentMode: invoice.paymentMode,
          amountPaid: invoice.amountPaid || 0,
          udhar: invoice.udhar || 0,
        });
      });
    });

    return transactions;
  }, [invoices, products, customers]);

  // Apply filters
  const filtered = useMemo(() => {
    return transactionList.filter((t) => {
      if (filterCustomer && !t.customerName.toLowerCase().includes(filterCustomer.toLowerCase())) return false;
      if (filterProduct && !t.productName.toLowerCase().includes(filterProduct.toLowerCase())) return false;
      if (filterVehicle && t.gadiNumber !== filterVehicle) return false;
      if (filterFromDate && new Date(t.invoiceDate) < new Date(filterFromDate)) return false;
      if (filterToDate && new Date(t.invoiceDate) > new Date(filterToDate)) return false;
      return true;
    });
  }, [transactionList, filterCustomer, filterProduct, filterVehicle, filterFromDate, filterToDate]);

  // Apply sorting
  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (sortField === 'date') {
        aVal = new Date(a.invoiceDate);
        bVal = new Date(b.invoiceDate);
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return copy;
  }, [filtered, sortField, sortOrder]);

  // Calculate totals
  const totals = useMemo(() => {
    return {
      quantity: sorted.reduce((sum, t) => sum + t.quantity, 0),
      costValue: sorted.reduce((sum, t) => sum + (t.costPrice * t.quantity), 0),
      revenue: sorted.reduce((sum, t) => sum + t.lineTotal, 0),
      totalProfit: sorted.reduce((sum, t) => sum + t.profit, 0),
      avgMargin: sorted.length > 0 ? (sorted.reduce((sum, t) => sum + t.profitMargin, 0) / sorted.length).toFixed(1) : '0',
    };
  }, [sorted]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <ScreenShell title="📊 Transaction Ledger" subtitle="Complete transaction history with cost & profit analysis">
      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {/* Totals Summary */}
        <SectionCard title="Summary" description={`${sorted.length} transactions`}>
          <View style={{ gap: 8 }}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Quantity:</Text>
              <Text style={styles.summaryValue}>{totals.quantity} units</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Cost Value:</Text>
              <Text style={styles.summaryValue}>{formatCurrency(totals.costValue)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Revenue:</Text>
              <Text style={styles.summaryValue}>{formatCurrency(totals.revenue)}</Text>
            </View>
            <View style={[styles.summaryRow, { borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTopMargin: 8, marginTopMargin: 8 }]}>
              <Text style={[styles.summaryLabel, { fontWeight: '700', color: theme.colors.positive }]}>Total Profit:</Text>
              <Text style={[styles.summaryValue, { color: theme.colors.positive, fontSize: 16, fontWeight: '800' }]}>{formatCurrency(totals.totalProfit)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Avg Margin:</Text>
              <Text style={styles.summaryValue}>{totals.avgMargin}%</Text>
            </View>
          </View>
        </SectionCard>

        {/* Filters */}
        <SectionCard title="Filters" description="Search and filter transactions">
          <View style={{ gap: 10 }}>
            <TextInput
              placeholder="🔍 Filter by Customer"
              value={filterCustomer}
              onChangeText={setFilterCustomer}
              placeholderTextColor={theme.colors.muted}
              style={styles.filterInput}
            />
            <TextInput
              placeholder="🔍 Filter by Product"
              value={filterProduct}
              onChangeText={setFilterProduct}
              placeholderTextColor={theme.colors.muted}
              style={styles.filterInput}
            />
            <TextInput
              placeholder="🔍 Filter by Vehicle"
              value={filterVehicle}
              onChangeText={setFilterVehicle}
              placeholderTextColor={theme.colors.muted}
              style={styles.filterInput}
            />
            {(filterCustomer || filterProduct || filterVehicle || filterFromDate || filterToDate) && (
              <Pressable
                onPress={() => {
                  setFilterCustomer('');
                  setFilterProduct('');
                  setFilterVehicle('');
                  setFilterFromDate('');
                  setFilterToDate('');
                }}
                style={{ backgroundColor: theme.colors.accent, borderRadius: 8, padding: 10, alignItems: 'center' }}
              >
                <Text style={{ color: theme.colors.text, fontWeight: '600' }}>Clear Filters</Text>
              </Pressable>
            )}
          </View>
        </SectionCard>

        {/* Sorting Controls */}
        <SectionCard title="Sort By" description="Click to change sort order">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {(['date', 'amount', 'profit', 'margin', 'quantity'] as SortField[]).map((field) => (
              <Pressable
                key={field}
                onPress={() => toggleSort(field)}
                style={[
                  styles.sortButton,
                  sortField === field && { backgroundColor: theme.colors.primary },
                ]}
              >
                <Text
                  style={[
                    styles.sortButtonText,
                    sortField === field && { color: '#FFF', fontWeight: '700' },
                  ]}
                >
                  {field === 'amount' ? '💰' : field === 'profit' ? '✓' : field === 'margin' ? '%' : field === 'quantity' ? '📦' : '📅'} {field}
                  {sortField === field && (sortOrder === 'desc' ? ' ↓' : ' ↑')}
                </Text>
              </Pressable>
            ))}
          </View>
        </SectionCard>

        {/* Transaction List */}
        <SectionCard title="Transactions" description={`${sorted.length} records found`}>
          {sorted.length === 0 ? (
            <Text style={{ color: theme.colors.muted, fontSize: 14, textAlign: 'center', paddingVertical: 20 }}>
              No transactions found
            </Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ minWidth: '100%' }}>
                {/* Table Header */}
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <Text style={[styles.tableCell, styles.tableCellSmall]}>Date</Text>
                  <Text style={[styles.tableCell, styles.tableCellMedium]}>Customer</Text>
                  <Text style={[styles.tableCell, styles.tableCellMedium]}>Product</Text>
                  <Text style={[styles.tableCell, styles.tableCellSmall]}>Vehicle</Text>
                  <Text style={[styles.tableCell, styles.tableCellSmall]}>Qty</Text>
                  <Text style={[styles.tableCell, styles.tableCellSmall]}>Cost</Text>
                  <Text style={[styles.tableCell, styles.tableCellSmall]}>Price</Text>
                  <Text style={[styles.tableCell, styles.tableCellSmall]}>Profit</Text>
                  <Text style={[styles.tableCell, styles.tableCellSmall]}>%</Text>
                </View>

                {/* Table Rows */}
                {sorted.map((t, idx) => (
                  <View key={t.id} style={[styles.tableRow, idx % 2 === 0 && { backgroundColor: theme.colors.panelRaised }]}>
                    <Text style={[styles.tableCell, styles.tableCellSmall, styles.textMuted]}>
                      {new Date(t.invoiceDate).toLocaleDateString()}
                    </Text>
                    <Text style={[styles.tableCell, styles.tableCellMedium, styles.textBold]}>{t.customerName}</Text>
                    <Text style={[styles.tableCell, styles.tableCellMedium]}>{t.productName}</Text>
                    <Text style={[styles.tableCell, styles.tableCellSmall, styles.textMuted]}>{t.gadiNumber}</Text>
                    <Text style={[styles.tableCell, styles.tableCellSmall, styles.textCenter]}>{t.quantity}</Text>
                    <Text style={[styles.tableCell, styles.tableCellSmall, styles.textMuted]}>₹{t.costPrice}</Text>
                    <Text style={[styles.tableCell, styles.tableCellSmall, styles.textBold]}>₹{t.sellingPrice}</Text>
                    <Text style={[styles.tableCell, styles.tableCellSmall, { color: theme.colors.positive, fontWeight: '700' }]}>
                      ₹{t.profit}
                    </Text>
                    <Text style={[styles.tableCell, styles.tableCellSmall, { color: theme.colors.positive, fontWeight: '700' }]}>
                      {t.profitMargin.toFixed(1)}%
                    </Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          )}
        </SectionCard>

        <View style={{ height: 20 }} />
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  summaryValue: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  filterInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: theme.colors.text,
  },
  sortButton: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: theme.colors.panelRaised,
  },
  sortButtonText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingVertical: 10,
  },
  tableHeader: {
    backgroundColor: theme.colors.primary,
  },
  tableCell: {
    fontSize: 12,
    color: theme.colors.text,
    paddingHorizontal: 8,
  },
  tableCellSmall: {
    width: 60,
  },
  tableCellMedium: {
    width: 100,
  },
  textMuted: {
    color: theme.colors.muted,
  },
  textBold: {
    fontWeight: '700',
  },
  textCenter: {
    textAlign: 'center',
  },
});
