import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ScreenShell } from '../components/ScreenShell';
import { SectionCard } from '../components/SectionCard';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { theme } from '../theme';
import { formatCurrency } from '../utils/finance';

type Props = NativeStackScreenProps<RootStackParamList, 'Customers'>;

export function CustomersScreen({ navigation }: Props) {
  const addCustomer = useAppStore((state) => state.addCustomer);
  const customers = useAppStore((state) => state.customers);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');

  const handleSaveCustomer = () => {
    const result = addCustomer({ name, phone, address });
    if (!result.success) {
      setError(result.message ?? 'Unable to save customer.');
      return;
    }

    setName('');
    setPhone('');
    setAddress('');
    setError('');
  };

  return (
    <ScreenShell
      title="Customers"
      subtitle="Manage customer profiles, search-ready contact details, and outstanding balances."
      action={
        <Pressable onPress={() => navigation.goBack()} style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Back</Text>
        </Pressable>
      }
    >
      <SectionCard title="New customer" description="Capture customer details once so billing and credit tracking stay consistent.">
        <TextInput value={name} onChangeText={setName} placeholder="Customer name" placeholderTextColor={theme.colors.muted} style={styles.input} />
        <TextInput value={phone} onChangeText={setPhone} placeholder="Phone number" placeholderTextColor={theme.colors.muted} keyboardType="phone-pad" style={styles.input} />
        <TextInput value={address} onChangeText={setAddress} placeholder="Address" placeholderTextColor={theme.colors.muted} style={styles.input} />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable onPress={handleSaveCustomer} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Save customer</Text>
        </Pressable>
      </SectionCard>

      <SectionCard title="Customer ledger" description="Outstanding credit stays visible for follow-up and billing decisions.">
        {customers.map((customer) => (
          <View key={customer.id} style={styles.customerRow}>
            <View style={styles.customerCopy}>
              <Text style={styles.customerName}>{customer.name}</Text>
              <Text style={styles.customerMeta}>{customer.phone}</Text>
              <Text style={styles.customerMeta}>{customer.address}</Text>
            </View>
            <View style={styles.customerBalances}>
              <Text style={styles.balanceLabel}>Outstanding</Text>
              <Text style={styles.balanceValue}>{formatCurrency(customer.outstandingBalance)}</Text>
            </View>
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
  customerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  customerCopy: {
    flex: 1,
  },
  customerName: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  customerMeta: {
    marginTop: 4,
    color: theme.colors.muted,
    fontSize: 13,
  },
  customerBalances: {
    alignItems: 'flex-end',
  },
  balanceLabel: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  balanceValue: {
    marginTop: 4,
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
});