import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ScreenShell } from '../components/ScreenShell';
import { SectionCard } from '../components/SectionCard';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { theme } from '../theme';
import { formatCurrency } from '../utils/finance';

type Props = NativeStackScreenProps<RootStackParamList, 'CustomerLedger'>;

export function CustomerLedgerScreen({ navigation }: Props) {
  const customers = useAppStore((s) => s.customers);
  const invoices = useAppStore((s) => s.invoices);
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id ?? '');

  const selectedCustomer = useMemo(() => {
    return customers.find((c) => c.id === selectedCustomerId) || customers[0];
  }, [selectedCustomerId, customers]);

  const customerInvoices = useMemo(() => {
    return invoices
      .filter((inv) => inv.customerId === selectedCustomerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [invoices, selectedCustomerId]);

  const openingBalance = useMemo(() => {
    // Get first invoice balance (for demo purposes)
    return customerInvoices.length > 0 ? 0 : 0;
  }, [customerInvoices]);

  const totalBilled = useMemo(() => {
    return customerInvoices.reduce((sum, inv) => sum + inv.total, 0);
  }, [customerInvoices]);

  return (
    <ScreenShell
      title="Customer Ledger"
      subtitle="View each customer's transaction history and outstanding balance."
      action={
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Home</Text>
        </Pressable>
      }
    >
      {/* Customer Selector */}
      <SectionCard title="Select Customer" description="Tap a customer to view their ledger.">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.customerScroll}>
          {customers.map((customer) => (
            <Pressable
              key={customer.id}
              onPress={() => setSelectedCustomerId(customer.id)}
              style={[
                styles.customerChip,
                customer.id === selectedCustomerId && styles.customerChipActive,
              ]}
            >
              <Text
                style={[
                  styles.customerChipText,
                  customer.id === selectedCustomerId && styles.customerChipTextActive,
                ]}
              >
                {customer.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </SectionCard>

      {/* Customer Info */}
      {selectedCustomer && (
        <SectionCard
          title="Customer Summary"
          description={`${selectedCustomer.name} · ${selectedCustomer.phone}`}
        >
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Billed</Text>
              <Text style={styles.summaryValue}>{formatCurrency(totalBilled)}</Text>
            </View>
            <View style={[
              styles.summaryItem,
              {
                backgroundColor:
                  selectedCustomer.outstandingBalance > 0 ? '#FFF5F5' : '#F0FDF4',
              },
            ]}>
              <Text style={styles.summaryLabel}>Outstanding</Text>
              <Text
                style={[
                  styles.summaryValue,
                  selectedCustomer.outstandingBalance > 0
                    ? styles.outstandingValue
                    : styles.clearValue,
                ]}
              >
                {formatCurrency(selectedCustomer.outstandingBalance)}
              </Text>
            </View>
          </View>

          {selectedCustomer.outstandingBalance > 0 && (
            <View style={styles.actionRow}>
              <Pressable style={styles.collectButton}>
                <Text style={styles.collectButtonText}>Collect Payment</Text>
              </Pressable>
            </View>
          )}
        </SectionCard>
      )}

      {/* Transaction History */}
      {customerInvoices.length === 0 ? (
        <SectionCard
          title="Transaction History"
          description="No invoices recorded for this customer."
        >
          <Text style={styles.emptyText}>Start by creating an invoice for this customer</Text>
        </SectionCard>
      ) : (
        <SectionCard
          title="Transaction History"
          description={`${customerInvoices.length} ${
            customerInvoices.length === 1 ? 'invoice' : 'invoices'
          } recorded`}
        >
          {customerInvoices.map((invoice, idx) => (
            <View key={invoice.id}>
              <View style={styles.transactionRow}>
                <View style={styles.transactionLeft}>
                  <Text style={styles.transactionDate}>
                    {new Date(invoice.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </Text>
                  <Text style={styles.transactionMeta}>
                    {invoice.lines.map((l) => `${l.quantity} ${l.productName}`).join(', ')}
                  </Text>
                  <Text style={styles.transactionMode}>{invoice.paymentMode}</Text>
                </View>
                <Text style={styles.transactionAmount}>{formatCurrency(invoice.total)}</Text>
              </View>
              {idx < customerInvoices.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </SectionCard>
      )}

      {/* Customer Contact Info */}
      {selectedCustomer && (
        <SectionCard title="Contact Details" description="Customer information">
          <View style={styles.contactRow}>
            <Text style={styles.contactLabel}>Phone</Text>
            <Text style={styles.contactValue}>{selectedCustomer.phone}</Text>
          </View>
          <View style={styles.contactRow}>
            <Text style={styles.contactLabel}>Address</Text>
            <Text style={styles.contactValue}>{selectedCustomer.address}</Text>
          </View>
        </SectionCard>
      )}
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

  customerScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  customerChip: {
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.panelRaised,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
  },
  customerChipActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  customerChipText: {
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  customerChipTextActive: {
    color: theme.colors.primary,
  },

  summaryRow: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryItem: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    backgroundColor: theme.colors.panelRaised,
    gap: 4,
  },
  summaryLabel: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  summaryValue: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  outstandingValue: { color: theme.colors.negative },
  clearValue: { color: theme.colors.positive },

  actionRow: {
    marginTop: 12,
  },
  collectButton: {
    backgroundColor: theme.colors.positive,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  collectButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

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
    gap: 12,
  },
  transactionLeft: {
    flex: 1,
    gap: 2,
  },
  transactionDate: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  transactionMeta: {
    color: theme.colors.muted,
    fontSize: 12,
  },
  transactionMode: {
    color: theme.colors.muted,
    fontSize: 11,
    marginTop: 2,
  },
  transactionAmount: {
    color: theme.colors.positive,
    fontSize: 14,
    fontWeight: '800',
  },

  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 8,
  },

  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  contactLabel: {
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  contactValue: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '500',
  },
});
