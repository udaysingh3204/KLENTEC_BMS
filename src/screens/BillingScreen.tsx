import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ScreenShell } from '../components/ScreenShell';
import { SectionCard } from '../components/SectionCard';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { theme } from '../theme';
import { PaymentMode } from '../types';
import { calculateInvoiceTotal, formatCurrency, parseWholeNumberInput } from '../utils/finance';

type Props = NativeStackScreenProps<RootStackParamList, 'Billing'>;

const paymentModes: PaymentMode[] = ['Cash', 'UPI', 'Credit'];

export function BillingScreen({ navigation }: Props) {
  const createInvoice = useAppStore((state) => state.createInvoice);
  const customers = useAppStore((state) => state.customers);
  const invoices = useAppStore((state) => state.invoices);
  const products = useAppStore((state) => state.products);

  const [customerId, setCustomerId] = useState(customers[0]?.id ?? '');
  const [productId, setProductId] = useState(products[0]?.id ?? '');
  const [quantity, setQuantity] = useState('1');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('Cash');
  const [reference, setReference] = useState('');
  const [error, setError] = useState('');

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === productId) ?? null,
    [productId, products]
  );
  const parsedQuantity = parseWholeNumberInput(quantity);
  const previewTotal = selectedProduct && parsedQuantity ? calculateInvoiceTotal(selectedProduct.price, parsedQuantity) : 0;

  const handleCreateInvoice = () => {
    if (!parsedQuantity) {
      setError('Quantity must be a whole number greater than zero.');
      return;
    }

    const result = createInvoice({
      customerId,
      productId,
      quantity: parsedQuantity,
      paymentMode,
      reference: reference || undefined,
    });

    if (!result.success) {
      setError(result.message ?? 'Unable to create invoice.');
      return;
    }

    setQuantity('1');
    setReference('');
    setError('');
  };

  return (
    <ScreenShell
      title="Billing"
      subtitle="Create invoices, adjust stock automatically, and tag payment modes for reporting."
      action={
        <Pressable onPress={() => navigation.goBack()} style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Back</Text>
        </Pressable>
      }
    >
      <SectionCard title="New invoice" description="Single-line billing flow for the first interactive build.">
        <Text style={styles.groupLabel}>Customer</Text>
        <View style={styles.chipWrap}>
          {customers.map((customer) => (
            <Pressable
              key={customer.id}
              onPress={() => setCustomerId(customer.id)}
              style={[styles.chip, customer.id === customerId ? styles.chipActive : null]}
            >
              <Text style={styles.chipText}>{customer.name}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.groupLabel}>Product</Text>
        <View style={styles.chipWrap}>
          {products.map((product) => (
            <Pressable
              key={product.id}
              onPress={() => setProductId(product.id)}
              style={[styles.chip, product.id === productId ? styles.chipActive : null]}
            >
              <Text style={styles.chipText}>{product.name}</Text>
            </Pressable>
          ))}
        </View>

        <TextInput
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="numeric"
          placeholder="Quantity"
          placeholderTextColor={theme.colors.muted}
          style={styles.input}
        />
        {selectedProduct ? (
          <Text style={styles.helperText}>Available stock: {selectedProduct.stockLeft} units</Text>
        ) : null}

        <Text style={styles.groupLabel}>Payment mode</Text>
        <View style={styles.chipWrap}>
          {paymentModes.map((mode) => (
            <Pressable
              key={mode}
              onPress={() => setPaymentMode(mode)}
              style={[styles.chip, mode === paymentMode ? styles.chipActive : null]}
            >
              <Text style={styles.chipText}>{mode}</Text>
            </Pressable>
          ))}
        </View>

        {paymentMode === 'UPI' ? (
          <TextInput
            value={reference}
            onChangeText={setReference}
            placeholder="UPI reference"
            placeholderTextColor={theme.colors.muted}
            style={styles.input}
          />
        ) : null}

        <View style={styles.previewRow}>
          <Text style={styles.previewLabel}>Invoice total</Text>
          <Text style={styles.previewValue}>{formatCurrency(previewTotal)}</Text>
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable onPress={handleCreateInvoice} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Create invoice</Text>
        </Pressable>
      </SectionCard>

      <SectionCard title="Recent invoices" description="Latest saved transactions with payment tags.">
        {invoices.slice(0, 6).map((invoice) => (
          <View key={invoice.id} style={styles.invoiceRow}>
            <View style={styles.invoiceCopy}>
              <Text style={styles.invoiceTitle}>{invoice.customerName}</Text>
              <Text style={styles.invoiceMeta}>
                {invoice.lines[0]?.productName} • Qty {invoice.lines[0]?.quantity} • {invoice.paymentMode}
              </Text>
            </View>
            <Text style={styles.invoiceValue}>{formatCurrency(invoice.total)}</Text>
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
  groupLabel: {
    marginTop: 6,
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
  input: {
    marginTop: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.panelRaised,
    color: theme.colors.text,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
  },
  previewRow: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  helperText: {
    marginTop: 8,
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  previewLabel: {
    color: theme.colors.muted,
    fontSize: 14,
    fontWeight: '600',
  },
  previewValue: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '800',
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
  invoiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  invoiceCopy: {
    flex: 1,
  },
  invoiceTitle: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  invoiceMeta: {
    marginTop: 4,
    color: theme.colors.muted,
    fontSize: 13,
  },
  invoiceValue: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
});