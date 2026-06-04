import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ScreenShell } from '../components/ScreenShell';
import { SectionCard } from '../components/SectionCard';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { theme } from '../theme';
import { PaymentMode } from '../types';
import { formatCurrency, parseWholeNumberInput } from '../utils/finance';

type Props = NativeStackScreenProps<RootStackParamList, 'Billing'>;

const paymentModes: PaymentMode[] = ['Cash', 'UPI', 'Credit'];

type DraftLine = { lineId: string; productId: string; quantity: string };

const makeLineId = () => `l-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;

export function BillingScreen({ navigation }: Props) {
  const createInvoice = useAppStore((s) => s.createInvoice);
  const editInvoice = useAppStore((s) => s.editInvoice);
  const deleteInvoice = useAppStore((s) => s.deleteInvoice);
  const customers = useAppStore((s) => s.customers);
  const invoices = useAppStore((s) => s.invoices);
  const products = useAppStore((s) => s.products);

  const [customerId, setCustomerId] = useState(customers[0]?.id ?? '');
  const [draftLines, setDraftLines] = useState<DraftLine[]>([
    { lineId: makeLineId(), productId: products[0]?.id ?? '', quantity: '1' },
  ]);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('Cash');
  const [reference, setReference] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Edit invoice
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPaymentMode, setEditPaymentMode] = useState<PaymentMode>('Cash');
  const [editReference, setEditReference] = useState('');

  const previewTotal = useMemo(() => {
    return draftLines.reduce((sum, line) => {
      const product = products.find((p) => p.id === line.productId);
      const qty = parseWholeNumberInput(line.quantity);
      if (!product || !qty) return sum;
      return sum + product.price * qty;
    }, 0);
  }, [draftLines, products]);

  const addLine = () => {
    setDraftLines((prev) => [
      ...prev,
      { lineId: makeLineId(), productId: products[0]?.id ?? '', quantity: '1' },
    ]);
  };

  const removeLine = (lineId: string) => {
    setDraftLines((prev) => prev.filter((l) => l.lineId !== lineId));
  };

  const updateLine = (lineId: string, field: 'productId' | 'quantity', value: string) => {
    setDraftLines((prev) =>
      prev.map((l) => (l.lineId === lineId ? { ...l, [field]: value } : l))
    );
  };

  const handleCreateInvoice = () => {
    setError('');
    setSuccess('');

    const resolvedLines = draftLines.map((l) => ({
      productId: l.productId,
      quantity: parseWholeNumberInput(l.quantity) ?? 0,
    }));

    const result = createInvoice({ customerId, lines: resolvedLines, paymentMode, reference: reference || undefined });

    if (!result.success) {
      setError(result.message ?? 'Unable to create invoice.');
      return;
    }

    setDraftLines([{ lineId: makeLineId(), productId: products[0]?.id ?? '', quantity: '1' }]);
    setReference('');
    setSuccess('Invoice created successfully.');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleEditOpen = (invoiceId: string) => {
    const invoice = invoices.find((inv) => inv.id === invoiceId);
    if (invoice) {
      setEditingId(invoiceId);
      setEditPaymentMode(invoice.paymentMode);
      setEditReference(invoice.reference ?? '');
    }
  };

  const handleEditSave = () => {
    if (!editingId) return;
    const result = editInvoice({
      invoiceId: editingId,
      paymentMode: editPaymentMode,
      reference: editReference || undefined,
    });
    if (result.success) {
      setEditingId(null);
      setSuccess('Invoice updated.');
      setTimeout(() => setSuccess(''), 2000);
    }
  };

  const handleDeleteInvoice = (invoiceId: string) => {
    const invoice = invoices.find((inv) => inv.id === invoiceId);
    if (invoice && confirm(`Delete invoice from ${invoice.customerName}? Stock will be restored.`)) {
      deleteInvoice(invoiceId);
      setSuccess('Invoice deleted and stock restored.');
      setTimeout(() => setSuccess(''), 2000);
    }
  };

  return (
    <ScreenShell
      title="Billing"
      subtitle="Create multi-item invoices, auto-deduct stock, and tag payment mode."
      action={
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>
      }
    >
      <SectionCard title="New Invoice" description="Add one or more items, select customer and payment mode.">

        {/* Customer */}
        <Text style={styles.groupLabel}>Customer</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipWrap}>
          {customers.map((c) => (
            <Pressable
              key={c.id}
              onPress={() => setCustomerId(c.id)}
              style={[styles.chip, c.id === customerId ? styles.chipActive : null]}
            >
              <Text style={[styles.chipText, c.id === customerId ? styles.chipTextActive : null]}>
                {c.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Invoice lines */}
        <Text style={styles.groupLabel}>Items</Text>
        {draftLines.map((line, idx) => {
          const selectedProduct = products.find((p) => p.id === line.productId);
          const qty = parseWholeNumberInput(line.quantity);
          const lineTotal = selectedProduct && qty ? selectedProduct.price * qty : 0;

          return (
            <View key={line.lineId} style={styles.lineCard}>
              <View style={styles.lineHeader}>
                <Text style={styles.lineNum}>Item {idx + 1}</Text>
                {draftLines.length > 1 ? (
                  <Pressable onPress={() => removeLine(line.lineId)}>
                    <Text style={styles.removeText}>Remove</Text>
                  </Pressable>
                ) : null}
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipWrap}>
                {products.map((p) => (
                  <Pressable
                    key={p.id}
                    onPress={() => updateLine(line.lineId, 'productId', p.id)}
                    style={[styles.chip, p.id === line.productId ? styles.chipActive : null]}
                  >
                    <Text style={[styles.chipText, p.id === line.productId ? styles.chipTextActive : null]}>
                      {p.name}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>

              <View style={styles.lineInputRow}>
                <TextInput
                  value={line.quantity}
                  onChangeText={(v) => updateLine(line.lineId, 'quantity', v)}
                  keyboardType="numeric"
                  placeholder="Qty"
                  placeholderTextColor={theme.colors.muted}
                  style={styles.qtyInput}
                />
                <View style={styles.lineTotalBox}>
                  {selectedProduct ? (
                    <Text style={styles.lineTotalHint}>
                      {formatCurrency(selectedProduct.price)} × {qty ?? 0}
                    </Text>
                  ) : null}
                  <Text style={styles.lineTotalValue}>{formatCurrency(lineTotal)}</Text>
                </View>
              </View>

              {selectedProduct ? (
                <Text style={styles.stockHint}>
                  Available stock: {selectedProduct.stockLeft} {selectedProduct.unit}
                </Text>
              ) : null}
            </View>
          );
        })}

        <Pressable onPress={addLine} style={styles.addLineButton}>
          <Text style={styles.addLineText}>+ Add Another Item</Text>
        </Pressable>

        {/* Payment mode */}
        <Text style={styles.groupLabel}>Payment Mode</Text>
        <View style={styles.chipWrap}>
          {paymentModes.map((mode) => (
            <Pressable
              key={mode}
              onPress={() => setPaymentMode(mode)}
              style={[styles.chip, mode === paymentMode ? styles.chipActive : null]}
            >
              <Text style={[styles.chipText, mode === paymentMode ? styles.chipTextActive : null]}>{mode}</Text>
            </Pressable>
          ))}
        </View>

        {paymentMode === 'UPI' ? (
          <TextInput
            value={reference}
            onChangeText={setReference}
            placeholder="UPI reference / transaction ID"
            placeholderTextColor={theme.colors.muted}
            style={styles.input}
          />
        ) : null}

        {/* Total preview */}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Invoice Total</Text>
          <Text style={styles.totalValue}>{formatCurrency(previewTotal)}</Text>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {success ? <Text style={styles.successText}>{success}</Text> : null}

        <Pressable onPress={handleCreateInvoice} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Create Invoice</Text>
        </Pressable>
      </SectionCard>

      {/* Edit invoice modal */}
      {editingId ? (
        <SectionCard title="Edit Invoice" description="Update payment details.">
          <Text style={styles.groupLabel}>Payment Mode</Text>
          <View style={styles.chipWrap}>
            {paymentModes.map((mode) => (
              <Pressable
                key={mode}
                onPress={() => setEditPaymentMode(mode)}
                style={[styles.chip, mode === editPaymentMode ? styles.chipActive : null]}
              >
                <Text style={[styles.chipText, mode === editPaymentMode ? styles.chipTextActive : null]}>{mode}</Text>
              </Pressable>
            ))}
          </View>

          {editPaymentMode === 'UPI' ? (
            <TextInput
              value={editReference}
              onChangeText={setEditReference}
              placeholder="UPI reference / transaction ID"
              placeholderTextColor={theme.colors.muted}
              style={styles.input}
            />
          ) : null}

          <View style={styles.modalButtonRow}>
            <Pressable onPress={() => setEditingId(null)} style={[styles.modalButton, { backgroundColor: theme.colors.panelRaised, borderWidth: 1.5, borderColor: theme.colors.border }]}>
              <Text style={[styles.modalButtonText, { color: theme.colors.text }]}>Cancel</Text>
            </Pressable>
            <Pressable onPress={handleEditSave} style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}>
              <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>Update Invoice</Text>
            </Pressable>
          </View>
        </SectionCard>
      ) : null}

      {/* Recent invoices */}
      <SectionCard title="Recent Invoices" description="Latest saved transactions with item and payment details.">
        {invoices.length === 0 ? (
          <Text style={styles.emptyText}>No invoices yet.</Text>
        ) : null}
        {invoices.slice(0, 8).map((invoice) => (
          <View key={invoice.id} style={styles.invoiceRowContainer}>
            <View style={styles.invoiceRow}>
              <View style={styles.invoiceCopy}>
                <Text style={styles.invoiceCustomer}>{invoice.customerName}</Text>
                <Text style={styles.invoiceMeta}>
                  {invoice.lines.map((l) => `${l.quantity} ${l.productName}`).join(', ')}
                </Text>
                <Text style={styles.invoiceDate}>
                  {new Date(invoice.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  {' · '}{invoice.paymentMode}
                </Text>
              </View>
              <Text style={styles.invoiceTotal}>{formatCurrency(invoice.total)}</Text>
            </View>
            <View style={styles.invoiceActions}>
              <Pressable onPress={() => handleEditOpen(invoice.id)} style={styles.invoiceActionBtn}>
                <Text style={styles.invoiceActionIcon}>✎</Text>
              </Pressable>
              <Pressable onPress={() => handleDeleteInvoice(invoice.id)} style={[styles.invoiceActionBtn, styles.invoiceActionBtnDelete]}>
                <Text style={[styles.invoiceActionIcon, { color: theme.colors.negative }]}>🗑</Text>
              </Pressable>
            </View>
          </View>
        ))}
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
  groupLabel: {
    marginTop: 14, marginBottom: 8, color: theme.colors.text,
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
  lineCard: {
    marginTop: 10, borderRadius: 12, borderWidth: 1.5,
    borderColor: theme.colors.border, backgroundColor: theme.colors.panelRaised, padding: 12, gap: 10,
  },
  lineHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  lineNum: { color: theme.colors.primary, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  removeText: { color: theme.colors.negative, fontSize: 13, fontWeight: '700' },
  lineInputRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  qtyInput: {
    flex: 1, borderRadius: 10, borderWidth: 1.5, borderColor: theme.colors.border,
    backgroundColor: theme.colors.panel, color: theme.colors.text,
    paddingHorizontal: 14, paddingVertical: 11, fontSize: 15,
  },
  lineTotalBox: { alignItems: 'flex-end' },
  lineTotalHint: { color: theme.colors.muted, fontSize: 11 },
  lineTotalValue: { color: theme.colors.text, fontSize: 16, fontWeight: '800' },
  stockHint: { color: theme.colors.muted, fontSize: 12, fontWeight: '500' },
  addLineButton: {
    marginTop: 10, borderRadius: 10, borderWidth: 1.5, borderColor: theme.colors.primary,
    borderStyle: 'dashed', paddingVertical: 12, alignItems: 'center',
  },
  addLineText: { color: theme.colors.primary, fontSize: 14, fontWeight: '700' },
  input: {
    marginTop: 10, borderRadius: 10, borderWidth: 1.5, borderColor: theme.colors.border,
    backgroundColor: theme.colors.panelRaised, color: theme.colors.text,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15,
  },
  totalRow: {
    marginTop: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: theme.colors.primaryLight, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 14,
  },
  totalLabel: { color: theme.colors.primary, fontSize: 14, fontWeight: '700' },
  totalValue: { color: theme.colors.primary, fontSize: 22, fontWeight: '800' },
  error: { marginTop: 10, color: theme.colors.negative, fontSize: 13, fontWeight: '600' },
  successText: { marginTop: 10, color: theme.colors.positive, fontSize: 13, fontWeight: '700' },
  primaryButton: {
    marginTop: 14, borderRadius: 12, backgroundColor: theme.colors.accent, paddingVertical: 15, alignItems: 'center',
  },
  primaryButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  emptyText: { color: theme.colors.muted, fontSize: 14, textAlign: 'center', paddingVertical: 12 },
  invoiceRowContainer: {
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.border, gap: 12,
  },
  invoiceRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12,
  },
  invoiceCopy: { flex: 1, gap: 3 },
  invoiceCustomer: { color: theme.colors.text, fontSize: 14, fontWeight: '700' },
  invoiceMeta: { color: theme.colors.muted, fontSize: 12 },
  invoiceDate: { color: theme.colors.muted, fontSize: 11 },
  invoiceTotal: { color: theme.colors.positive, fontSize: 15, fontWeight: '800' },
  invoiceActions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  invoiceActionBtn: { width: 36, height: 36, borderRadius: 6, backgroundColor: theme.colors.panelRaised, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'center' },
  invoiceActionBtnDelete: { borderColor: '#FECACA' },
  invoiceActionIcon: { fontSize: 16, color: theme.colors.primary },
  modalButtonRow: { flexDirection: 'row', gap: 12, marginTop: 14 },
  modalButton: { flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  modalButtonText: { fontSize: 15, fontWeight: '800' },
});
