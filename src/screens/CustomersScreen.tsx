import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ScreenShell } from '../components/ScreenShell';
import { SectionCard } from '../components/SectionCard';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { theme } from '../theme';
import { PaymentMode } from '../types';
import { formatCurrency, parseWholeNumberInput } from '../utils/finance';

type Props = NativeStackScreenProps<RootStackParamList, 'Customers'>;

const paymentModes: PaymentMode[] = ['Cash', 'UPI'];

export function CustomersScreen({ navigation }: Props) {
  const addCustomer = useAppStore((s) => s.addCustomer);
  const customers = useAppStore((s) => s.customers);
  const invoices = useAppStore((s) => s.invoices);
  const receivePayment = useAppStore((s) => s.receivePayment);

  // Add customer form
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [addError, setAddError] = useState('');

  // Receive payment form
  const [payCustomerId, setPayCustomerId] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [payMode, setPayMode] = useState<PaymentMode>('Cash');
  const [payError, setPayError] = useState('');
  const [paySuccess, setPaySuccess] = useState('');

  // Search
  const [search, setSearch] = useState('');

  const creditCustomers = useMemo(
    () => customers.filter((c) => c.outstandingBalance > 0),
    [customers]
  );
  const totalOutstanding = useMemo(
    () => customers.reduce((sum, c) => sum + c.outstandingBalance, 0),
    [customers]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.address.toLowerCase().includes(q)
    );
  }, [customers, search]);

  const selectedPayCustomer = customers.find((c) => c.id === payCustomerId);

  const handleSaveCustomer = () => {
    const result = addCustomer({ name, phone, address });
    if (!result.success) { setAddError(result.message ?? 'Unable to save.'); return; }
    setName(''); setPhone(''); setAddress(''); setAddError('');
  };

  const handleReceivePayment = () => {
    setPayError(''); setPaySuccess('');
    if (!payCustomerId) { setPayError('Select a customer.'); return; }
    const amt = parseWholeNumberInput(payAmount);
    if (!amt) { setPayError('Enter a valid amount.'); return; }
    const result = receivePayment({ customerId: payCustomerId, amount: amt, paymentMode: payMode });
    if (!result.success) { setPayError(result.message ?? 'Failed.'); return; }
    setPayAmount('');
    setPaySuccess(`Payment of ${formatCurrency(amt)} recorded.`);
    setTimeout(() => setPaySuccess(''), 3000);
  };

  const getCustomerInvoices = (customerId: string) =>
    invoices.filter((inv) => inv.customerId === customerId).slice(0, 3);

  return (
    <ScreenShell
      title="Customers"
      subtitle="Manage customer profiles, balances, and collect outstanding payments."
      action={
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>
      }
    >
      {/* Summary */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total</Text>
          <Text style={styles.summaryValue}>{customers.length}</Text>
        </View>
        <View style={[styles.summaryCard, { borderColor: '#FECACA', backgroundColor: '#FFF5F5' }]}>
          <Text style={styles.summaryLabel}>On credit</Text>
          <Text style={[styles.summaryValue, { color: theme.colors.negative }]}>{creditCustomers.length}</Text>
          <Text style={styles.summarySubValue}>{formatCurrency(totalOutstanding)}</Text>
        </View>
      </View>

      {/* Collect payment */}
      {creditCustomers.length > 0 ? (
        <SectionCard title="Collect Payment" description="Record a payment from a customer to reduce their outstanding balance.">
          <Text style={styles.groupLabel}>Customer</Text>
          <View style={styles.chipWrap}>
            {creditCustomers.map((c) => (
              <Pressable
                key={c.id}
                onPress={() => setPayCustomerId(c.id)}
                style={[styles.chip, c.id === payCustomerId ? styles.chipActive : null]}
              >
                <Text style={[styles.chipText, c.id === payCustomerId ? styles.chipTextActive : null]}>
                  {c.name}
                </Text>
              </Pressable>
            ))}
          </View>

          {selectedPayCustomer ? (
            <View style={styles.balanceHintRow}>
              <Text style={styles.balanceHint}>Outstanding:</Text>
              <Text style={styles.balanceHintValue}>{formatCurrency(selectedPayCustomer.outstandingBalance)}</Text>
            </View>
          ) : null}

          <TextInput
            value={payAmount}
            onChangeText={setPayAmount}
            keyboardType="numeric"
            placeholder="Amount received (₹)"
            placeholderTextColor={theme.colors.muted}
            style={styles.input}
          />

          <Text style={styles.groupLabel}>Mode</Text>
          <View style={styles.chipWrap}>
            {paymentModes.map((m) => (
              <Pressable
                key={m}
                onPress={() => setPayMode(m)}
                style={[styles.chip, m === payMode ? styles.chipActive : null]}
              >
                <Text style={[styles.chipText, m === payMode ? styles.chipTextActive : null]}>{m}</Text>
              </Pressable>
            ))}
          </View>

          {payError ? <Text style={styles.error}>{payError}</Text> : null}
          {paySuccess ? <Text style={styles.successText}>{paySuccess}</Text> : null}

          <Pressable onPress={handleReceivePayment} style={styles.collectButton}>
            <Text style={styles.collectButtonText}>Collect Payment</Text>
          </Pressable>
        </SectionCard>
      ) : null}

      {/* Add customer */}
      <SectionCard title="New Customer" description="Add a customer for billing and credit tracking.">
        <TextInput value={name} onChangeText={setName} placeholder="Customer name" placeholderTextColor={theme.colors.muted} style={styles.input} />
        <TextInput value={phone} onChangeText={setPhone} placeholder="Mobile number" placeholderTextColor={theme.colors.muted} keyboardType="phone-pad" style={styles.input} />
        <TextInput value={address} onChangeText={setAddress} placeholder="Address / site location" placeholderTextColor={theme.colors.muted} style={styles.input} />
        {addError ? <Text style={styles.error}>{addError}</Text> : null}
        <Pressable onPress={handleSaveCustomer} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Save Customer</Text>
        </Pressable>
      </SectionCard>

      {/* Customer ledger with search */}
      <SectionCard title="Customer Ledger" description="Search by name, phone, or address.">
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search customers…"
          placeholderTextColor={theme.colors.muted}
          style={styles.searchInput}
        />
        {filtered.length === 0 ? (
          <Text style={styles.emptyText}>No customers match your search.</Text>
        ) : null}
        {filtered.map((customer) => {
          const hasBalance = customer.outstandingBalance > 0;
          const custInvoices = getCustomerInvoices(customer.id);

          return (
            <View key={customer.id} style={styles.customerCard}>
              <View style={styles.customerHeader}>
                <View style={styles.customerCopy}>
                  <Text style={styles.customerName}>{customer.name}</Text>
                  <Text style={styles.customerMeta}>{customer.phone} · {customer.address}</Text>
                </View>
                <View style={styles.balanceBlock}>
                  <Text style={[styles.balanceValue, hasBalance ? styles.balanceRed : styles.balanceGreen]}>
                    {formatCurrency(customer.outstandingBalance)}
                  </Text>
                  <View style={hasBalance ? styles.creditBadge : styles.clearBadge}>
                    <Text style={hasBalance ? styles.creditBadgeText : styles.clearBadgeText}>
                      {hasBalance ? 'Credit' : 'Clear'}
                    </Text>
                  </View>
                </View>
              </View>
              {custInvoices.length > 0 ? (
                <View style={styles.invoiceHistory}>
                  {custInvoices.map((inv) => (
                    <View key={inv.id} style={styles.historyRow}>
                      <Text style={styles.historyDate}>
                        {new Date(inv.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </Text>
                      <Text style={styles.historyItems}>
                        {inv.lines.map((l) => `${l.quantity} ${l.productName}`).join(', ')}
                      </Text>
                      <Text style={styles.historyAmount}>{formatCurrency(inv.total)}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          );
        })}
      </SectionCard>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  backButton: {
    paddingHorizontal: 12, paddingVertical: 9, borderRadius: 10,
    backgroundColor: theme.colors.panelRaised, borderWidth: 1, borderColor: theme.colors.border,
  },
  backButtonText: { color: theme.colors.primary, fontSize: 13, fontWeight: '700' },
  summaryRow: { flexDirection: 'row', gap: 10 },
  summaryCard: {
    flex: 1, padding: 16, borderRadius: 14, backgroundColor: theme.colors.panel,
    borderWidth: 1, borderColor: theme.colors.border, gap: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  summaryLabel: { color: theme.colors.muted, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  summaryValue: { color: theme.colors.text, fontSize: 26, fontWeight: '800' },
  summarySubValue: { color: theme.colors.negative, fontSize: 13, fontWeight: '700' },
  groupLabel: {
    marginTop: 12, marginBottom: 8, color: theme.colors.text,
    fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5,
  },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderRadius: 8, borderWidth: 1.5, borderColor: theme.colors.border,
    backgroundColor: theme.colors.panelRaised, paddingHorizontal: 12, paddingVertical: 8,
  },
  chipActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primaryLight },
  chipText: { color: theme.colors.muted, fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: theme.colors.primary },
  balanceHintRow: { flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 10 },
  balanceHint: { color: theme.colors.muted, fontSize: 13, fontWeight: '600' },
  balanceHintValue: { color: theme.colors.negative, fontSize: 14, fontWeight: '800' },
  input: {
    marginTop: 10, borderRadius: 10, borderWidth: 1.5, borderColor: theme.colors.border,
    backgroundColor: theme.colors.panelRaised, color: theme.colors.text,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15,
  },
  error: { marginTop: 10, color: theme.colors.negative, fontSize: 13, fontWeight: '600' },
  successText: { marginTop: 10, color: theme.colors.positive, fontSize: 13, fontWeight: '700' },
  collectButton: {
    marginTop: 14, borderRadius: 12, backgroundColor: theme.colors.positive, paddingVertical: 14, alignItems: 'center',
  },
  collectButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  primaryButton: {
    marginTop: 14, borderRadius: 12, backgroundColor: theme.colors.accent, paddingVertical: 14, alignItems: 'center',
  },
  primaryButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  searchInput: {
    borderRadius: 10, borderWidth: 1.5, borderColor: theme.colors.border,
    backgroundColor: theme.colors.panelRaised, color: theme.colors.text,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, marginBottom: 4,
  },
  emptyText: { color: theme.colors.muted, fontSize: 14, textAlign: 'center', paddingVertical: 16 },
  customerCard: {
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.border, gap: 8,
  },
  customerHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  customerCopy: { flex: 1, gap: 3 },
  customerName: { color: theme.colors.text, fontSize: 15, fontWeight: '700' },
  customerMeta: { color: theme.colors.muted, fontSize: 13 },
  balanceBlock: { alignItems: 'flex-end', gap: 4 },
  balanceValue: { fontSize: 14, fontWeight: '800' },
  balanceRed: { color: theme.colors.negative },
  balanceGreen: { color: theme.colors.positive },
  creditBadge: { backgroundColor: '#FEE2E2', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  creditBadgeText: { color: theme.colors.negative, fontSize: 11, fontWeight: '700' },
  clearBadge: { backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  clearBadgeText: { color: theme.colors.positive, fontSize: 11, fontWeight: '700' },
  invoiceHistory: {
    backgroundColor: theme.colors.panelRaised, borderRadius: 8, padding: 8, gap: 4,
  },
  historyRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  historyDate: { color: theme.colors.muted, fontSize: 11, width: 52 },
  historyItems: { flex: 1, color: theme.colors.text, fontSize: 12 },
  historyAmount: { color: theme.colors.positive, fontSize: 12, fontWeight: '700' },
});
