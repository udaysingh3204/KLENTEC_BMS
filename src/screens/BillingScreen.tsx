import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, Alert, Modal } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ScreenShell } from '../components/ScreenShell';
import { SectionCard } from '../components/SectionCard';
import { TransactionPopup } from '../components/TransactionPopup';
import { ProfessionalBillPreview } from '../components/ProfessionalBillPreview';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { theme } from '../theme';
import { PaymentMode } from '../types';
import { formatCurrency, parseWholeNumberInput } from '../utils/finance';

type Props = NativeStackScreenProps<RootStackParamList, 'Billing'>;

const paymentModes: PaymentMode[] = ['Cash', 'UPI', 'Credit'];

type DraftLine = { lineId: string; productId: string; quantity: string; actualPrice?: string };

const makeLineId = () => `l-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;

export function BillingScreen({ navigation }: Props) {
  const createInvoice = useAppStore((s) => s.createInvoice);
  const addCustomer = useAppStore((s) => s.addCustomer);
  const customers = useAppStore((s) => s.customers);
  const products = useAppStore((s) => s.products);
  const allInvoices = useAppStore((s) => s.invoices);

  // Customer creation/editing
  const [customerId, setCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerCreated, setCustomerCreated] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(false); // Allow editing customer details

  // Invoice fields
  const [draftLines, setDraftLines] = useState<DraftLine[]>([
    { lineId: makeLineId(), productId: products[0]?.id ?? '', quantity: '1' },
  ]);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('Cash');
  const [reference, setReference] = useState('');
  const [bhada, setBhada] = useState('');
  const [dala, setDala] = useState('');
  const [cashPaid, setCashPaid] = useState('');
  const [upiPaid, setUpiPaid] = useState('');
  const [influencerName, setInfluencerName] = useState('');
  const [influencerContact, setInfluencerContact] = useState('');
  const [amountPaidToInfluencer, setAmountPaidToInfluencer] = useState(''); // Admin tracks payment to influencer
  const [upiAccount, setUpiAccount] = useState<'Firm' | 'Personal'>('Firm');
  const [employeeName, setEmployeeName] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showTransactionPopup, setShowTransactionPopup] = useState(false);
  const [pendingInvoiceData, setPendingInvoiceData] = useState<any | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<any | null>(null);

  // Filter today's invoices
  const todayInvoices = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return allInvoices.filter((inv) => inv.createdAt.split('T')[0] === today);
  }, [allInvoices]);

  const previewTotal = useMemo(() => {
    const lineTotal = draftLines.reduce((sum, line) => {
      const product = products.find((p) => p.id === line.productId);
      const qty = parseWholeNumberInput(line.quantity);
      if (!product || !qty) return sum;
      const pricePerUnit = line.actualPrice ? parseWholeNumberInput(line.actualPrice) : product.price;
      return sum + (pricePerUnit || 0) * qty;
    }, 0);
    const bhadaAmount = parseWholeNumberInput(bhada);
    const dalaAmount = parseWholeNumberInput(dala);
    return lineTotal + (bhadaAmount || 0) + (dalaAmount || 0);
  }, [draftLines, products, bhada, dala]);

  const handleCreateCustomer = () => {
    setError('');
    if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim()) {
      setError('Please fill all customer fields');
      return;
    }

    // Validate mobile number: 10 digits, starts with 6-9
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(customerPhone.trim())) {
      setError('Invalid mobile number. Must be 10 digits starting with 6-9.');
      return;
    }

    const result = addCustomer({
      name: customerName.trim(),
      phone: customerPhone.trim(),
      address: customerAddress.trim(),
    });

    if (result.success) {
      const newCustomer = useAppStore.getState().customers.find((c) => c.name === customerName.trim());
      if (newCustomer) {
        setCustomerId(newCustomer.id);
        setCustomerCreated(true);
        setSuccess('Customer created! Ready to create invoice.');
        setTimeout(() => setSuccess(''), 3000);
      }
    } else {
      setError(result.message || 'Failed to create customer');
    }
  };

  const addLine = () => {
    setDraftLines((prev) => [
      ...prev,
      { lineId: makeLineId(), productId: products[0]?.id ?? '', quantity: '1' },
    ]);
  };

  const removeLine = (lineId: string) => {
    setDraftLines((prev) => prev.filter((l) => l.lineId !== lineId));
  };

  const handleCreateInvoice = () => {
    setError('');

    if (!customerId) {
      setError('Create customer first before creating invoice.');
      return;
    }

    const customer = customers.find((c) => c.id === customerId);
    if (!customer) {
      setError('Customer not found.');
      return;
    }

    const resolvedLines = draftLines
      .map((l) => ({
        productId: l.productId,
        quantity: parseWholeNumberInput(l.quantity) ?? 0,
      }))
      .filter((l) => l.quantity > 0);

    if (!resolvedLines.length) {
      setError('Add at least one item.');
      return;
    }

    setPendingInvoiceData({
      customerId,
      lines: resolvedLines,
      paymentMode,
      reference: reference || undefined,
      total: previewTotal,
      customerName: customer.name,
      bhada: parseWholeNumberInput(bhada) || undefined,
      dala: parseWholeNumberInput(dala) || undefined,
      cashPaid: parseWholeNumberInput(cashPaid) || undefined,
      upiPaid: parseWholeNumberInput(upiPaid) || undefined,
      influencerName: influencerName || undefined,
      influencerContact: influencerContact || undefined,
      amountPaidToInfluencer: parseWholeNumberInput(amountPaidToInfluencer) || undefined,
      upiAccount: paymentMode === 'UPI' ? upiAccount : undefined,
      employeeName: employeeName || undefined,
      invoiceNumber: invoiceNumber || undefined,
      notes: notes || undefined,
    });
    setShowTransactionPopup(true);
  };

  const handleTransactionConfirm = (amountPaid: number, _discrepancy: number, dalaValue: number = 0) => {
    if (!pendingInvoiceData) return;

    // Use dala value from popup if edited, otherwise use form value
    const finalDala = dalaValue > 0 ? dalaValue : pendingInvoiceData.dala;

    const result = createInvoice({
      customerId: pendingInvoiceData.customerId,
      lines: pendingInvoiceData.lines,
      paymentMode: pendingInvoiceData.paymentMode,
      reference: pendingInvoiceData.reference,
      bhada: pendingInvoiceData.bhada,
      dala: finalDala,
      amountPaid,
      cashPaid: pendingInvoiceData.cashPaid,
      upiPaid: pendingInvoiceData.upiPaid,
      influencerName: pendingInvoiceData.influencerName,
      influencerContact: pendingInvoiceData.influencerContact,
      amountPaidToInfluencer: pendingInvoiceData.amountPaidToInfluencer,
      upiAccount: pendingInvoiceData.upiAccount,
      employeeName: pendingInvoiceData.employeeName,
      invoiceNumber: pendingInvoiceData.invoiceNumber,
      notes: pendingInvoiceData.notes,
    });

    if (result.success) {
      setShowTransactionPopup(false);
      setDraftLines([{ lineId: makeLineId(), productId: products[0]?.id ?? '', quantity: '1' }]);
      setReference('');
      setBhada('');
      setDala('');
      setCashPaid('');
      setUpiPaid('');
      setInfluencerName('');
      setInfluencerContact('');
      setAmountPaidToInfluencer('');
      setUpiAccount('Firm');
      setEmployeeName('');
      setInvoiceNumber('');
      setNotes('');
      setPendingInvoiceData(null);
      setSuccess('Invoice created successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(result.message || 'Failed to create invoice');
    }
  };

  const selectedCustomer = customers.find((c) => c.id === customerId);
  const selectedProduct = (line: DraftLine) => products.find((p) => p.id === line.productId);

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
      <ScrollView showsVerticalScrollIndicator={false}>
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        {success && (
          <View style={styles.successBanner}>
            <Text style={styles.successText}>{success}</Text>
          </View>
        )}

        {/* NEW INVOICE HEADING */}
        <Text style={styles.heading}>New Invoice</Text>
        <Text style={styles.subheading}>Add one or more items, select customer and payment mode.</Text>

        {/* CUSTOMER SECTION - Simple Form */}
        <SectionCard title="Customer" description={customerCreated ? 'Customer created successfully' : 'Fill in customer details'}>
          {!customerCreated ? (
            <>
              <Text style={styles.formLabel}>Customer Name *</Text>
              <TextInput
                value={customerName}
                onChangeText={setCustomerName}
                placeholder="Enter customer name"
                placeholderTextColor={theme.colors.muted}
                style={styles.input}
                editable={!customerCreated}
              />

              <Text style={styles.formLabel}>Phone Number *</Text>
              <TextInput
                value={customerPhone}
                onChangeText={setCustomerPhone}
                placeholder="Enter phone number"
                placeholderTextColor={theme.colors.muted}
                keyboardType="phone-pad"
                style={styles.input}
                editable={!customerCreated}
              />

              <Text style={styles.formLabel}>Address *</Text>
              <TextInput
                value={customerAddress}
                onChangeText={setCustomerAddress}
                placeholder="Enter address"
                placeholderTextColor={theme.colors.muted}
                style={styles.input}
                editable={!customerCreated}
              />

              <Pressable
                onPress={handleCreateCustomer}
                style={styles.createCustomerButton}
              >
                <Text style={styles.createCustomerButtonText}>Create Customer</Text>
              </Pressable>
            </>
          ) : editingCustomer ? (
            // Editing customer details
            <>
              <Text style={styles.formLabel}>Customer Name *</Text>
              <TextInput
                value={customerName}
                onChangeText={setCustomerName}
                placeholder="Enter customer name"
                placeholderTextColor={theme.colors.muted}
                style={styles.input}
              />

              <Text style={styles.formLabel}>Phone Number *</Text>
              <TextInput
                value={customerPhone}
                onChangeText={setCustomerPhone}
                placeholder="Enter phone number"
                placeholderTextColor={theme.colors.muted}
                keyboardType="phone-pad"
                style={styles.input}
              />

              <Text style={styles.formLabel}>Address *</Text>
              <TextInput
                value={customerAddress}
                onChangeText={setCustomerAddress}
                placeholder="Enter address"
                placeholderTextColor={theme.colors.muted}
                style={styles.input}
              />

              <View style={styles.editButtonRow}>
                <Pressable onPress={() => setEditingCustomer(false)} style={[styles.button, { flex: 1, backgroundColor: theme.colors.panelRaised, borderWidth: 1, borderColor: theme.colors.border }]}>
                  <Text style={{ color: theme.colors.text }}>Cancel</Text>
                </Pressable>
                <Pressable onPress={() => setEditingCustomer(false)} style={[styles.button, { flex: 1, backgroundColor: theme.colors.primary, marginLeft: 8 }]}>
                  <Text style={{ color: '#FFF', fontWeight: '600' }}>Done Editing</Text>
                </Pressable>
              </View>
            </>
          ) : (
            <View style={styles.customerCreatedBox}>
              <Text style={styles.customerCreatedLabel}>✓ Customer Ready</Text>
              <Text style={styles.customerCreatedName}>{customerName}</Text>
              <Text style={styles.customerCreatedMeta}>{customerPhone} • {customerAddress}</Text>
              <Pressable onPress={() => setEditingCustomer(true)} style={[styles.button, { marginTop: 12, backgroundColor: theme.colors.accent }]}>
                <Text style={{ color: theme.colors.text, fontWeight: '600' }}>Edit Customer Details</Text>
              </Pressable>
            </View>
          )}
        </SectionCard>

        {/* ITEMS SECTION */}
        <SectionCard title="Items" description={`${draftLines.length} item${draftLines.length !== 1 ? 's' : ''}`}>
          {draftLines.map((line, idx) => {
            const product = selectedProduct(line);
            const qty = parseWholeNumberInput(line.quantity);
            const actualPriceValue = line.actualPrice ? parseWholeNumberInput(line.actualPrice) : null;
            const pricePerUnit = actualPriceValue !== null ? actualPriceValue : (product?.price ?? 0);
            const lineTotal = product && qty ? (pricePerUnit || 0) * qty : 0;

            return (
              <View key={line.lineId} style={styles.lineItem}>
                <Text style={styles.itemNumber}>Item {idx + 1}</Text>

                <Text style={styles.fieldLabel}>Product *</Text>
                <View style={styles.productSelector}>
                  {products.map((p) => (
                    <Pressable
                      key={p.id}
                      onPress={() =>
                        setDraftLines((prev) =>
                          prev.map((l) => (l.lineId === line.lineId ? { ...l, productId: p.id } : l))
                        )
                      }
                      style={[
                        styles.productTag,
                        line.productId === p.id && styles.productTagSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.productTagText,
                          line.productId === p.id && styles.productTagTextSelected,
                        ]}
                      >
                        {p.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                {/* Show Gaadi/Vehicle number for reference - NOT shown in final invoice */}
                {product?.gadiNumber && (
                  <Text style={[styles.fieldLabel, { color: theme.colors.muted, fontSize: 12, marginTop: 6 }]}>
                    📦 From Vehicle: {product.gadiNumber}
                  </Text>
                )}

                {/* Cost Price & Profit Display */}
                {product && (
                  <View style={{ marginTop: 12, backgroundColor: theme.colors.panelRaised, borderRadius: 8, padding: 10, gap: 6 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ color: theme.colors.muted, fontSize: 12 }}>💰 Cost Price:</Text>
                      <Text style={{ color: theme.colors.text, fontSize: 12, fontWeight: '600' }}>₹{product.costPrice || 0}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ color: theme.colors.muted, fontSize: 12 }}>📊 Selling Price:</Text>
                      <Text style={{ color: theme.colors.text, fontSize: 12, fontWeight: '600' }}>₹{product.price}</Text>
                    </View>
                    {qty && (
                      <>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: 6, marginTop: 4 }}>
                          <Text style={{ color: theme.colors.positive, fontSize: 12, fontWeight: '700' }}>✓ Profit/Unit:</Text>
                          <Text style={{ color: theme.colors.positive, fontSize: 12, fontWeight: '700' }}>₹{Math.max(0, (product.price - (product.costPrice || 0)))}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                          <Text style={{ color: theme.colors.positive, fontSize: 12, fontWeight: '700' }}>💵 Total Profit:</Text>
                          <Text style={{ color: theme.colors.positive, fontSize: 12, fontWeight: '700' }}>₹{Math.max(0, (product.price - (product.costPrice || 0)) * qty)}</Text>
                        </View>
                      </>
                    )}
                  </View>
                )}

                <View style={styles.qtyPriceRow}>
                  <View style={styles.qtyField}>
                    <Text style={styles.fieldLabel}>Qty</Text>
                    <TextInput
                      value={line.quantity}
                      onChangeText={(text) =>
                        setDraftLines((prev) =>
                          prev.map((l) =>
                            l.lineId === line.lineId ? { ...l, quantity: text } : l
                          )
                        )
                      }
                      keyboardType="numeric"
                      style={styles.qtyInput}
                    />
                  </View>

                  <View style={styles.priceField}>
                    <Text style={styles.fieldLabel}>Actual Price (₹)</Text>
                    <TextInput
                      value={line.actualPrice ?? ''}
                      onChangeText={(text) =>
                        setDraftLines((prev) =>
                          prev.map((l) =>
                            l.lineId === line.lineId ? { ...l, actualPrice: text } : l
                          )
                        )
                      }
                      placeholder={product?.price.toString()}
                      keyboardType="numeric"
                      style={styles.priceInput}
                    />
                  </View>
                </View>

                <Text style={styles.lineTotal}>
                  Line Total: <Text style={styles.lineTotalValue}>{formatCurrency(lineTotal)}</Text>
                </Text>

                {draftLines.length > 1 && (
                  <Pressable onPress={() => removeLine(line.lineId)} style={styles.removeButton}>
                    <Text style={styles.removeButtonText}>Remove Item</Text>
                  </Pressable>
                )}

                {idx < draftLines.length - 1 && <View style={styles.lineSeparator} />}
              </View>
            );
          })}

          <Pressable onPress={addLine} style={styles.addLineButton}>
            <Text style={styles.addLineButtonText}>+ Add Another Item</Text>
          </Pressable>
        </SectionCard>

        {/* CHARGES SECTION */}
        <SectionCard title="Additional Charges" description="Optional delivery and worker fees">
          <Text style={styles.fieldLabel}>Bhada (Delivery Fees) - ₹</Text>
          <TextInput
            value={bhada}
            onChangeText={setBhada}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={theme.colors.muted}
            style={styles.input}
          />

          <Text style={styles.fieldLabel}>Dala (Worker/Driver Payment) - ₹</Text>
          <TextInput
            value={dala}
            onChangeText={setDala}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={theme.colors.muted}
            style={styles.input}
          />
        </SectionCard>

        {/* INVOICE TOTAL PREVIEW - CRITICAL SECTION */}
        <View style={styles.totalPreviewBox}>
          <View style={styles.totalPreviewRow}>
            <Text style={styles.totalPreviewLabel}>Items Total</Text>
            <Text style={styles.totalPreviewValue}>
              {formatCurrency(
                draftLines.reduce((sum, line) => {
                  const product = products.find((p) => p.id === line.productId);
                  const qty = parseWholeNumberInput(line.quantity);
                  if (!product || !qty) return sum;
                  const pricePerUnit = line.actualPrice ? parseWholeNumberInput(line.actualPrice) : product.price;
                  return sum + (pricePerUnit || 0) * qty;
                }, 0)
              )}
            </Text>
          </View>

          {(parseWholeNumberInput(bhada) ?? 0) > 0 && (
            <View style={styles.totalPreviewRow}>
              <Text style={styles.totalPreviewLabel}>🚗 Bhada</Text>
              <Text style={styles.totalPreviewValue}>+ {formatCurrency(parseWholeNumberInput(bhada) ?? 0)}</Text>
            </View>
          )}

          {(parseWholeNumberInput(dala) ?? 0) > 0 && (
            <View style={styles.totalPreviewRow}>
              <Text style={styles.totalPreviewLabel}>👷 Dala</Text>
              <Text style={styles.totalPreviewValue}>+ {formatCurrency(parseWholeNumberInput(dala) ?? 0)}</Text>
            </View>
          )}

          <View style={styles.totalPreviewDivider} />

          <View style={styles.totalPreviewRow}>
            <Text style={styles.totalPreviewLabelBold}>💰 INVOICE TOTAL</Text>
            <Text style={styles.totalPreviewValueBold}>{formatCurrency(previewTotal)}</Text>
          </View>
        </View>

        {/* PAYMENT SECTION */}
        <SectionCard title="Payment Details" description="Mode, account, and split payment">
          <Text style={styles.fieldLabel}>Payment Mode *</Text>
          <View style={styles.chipWrap}>
            {paymentModes.map((mode) => (
              <Pressable
                key={mode}
                onPress={() => setPaymentMode(mode)}
                style={[styles.chip, mode === paymentMode && styles.chipActive]}
              >
                <Text style={[styles.chipText, mode === paymentMode && styles.chipTextActive]}>
                  {mode}
                </Text>
              </Pressable>
            ))}
          </View>

          {paymentMode === 'UPI' && (
            <>
              <Text style={styles.fieldLabel}>UPI Account</Text>
              <View style={styles.chipWrap}>
                {['Firm', 'Personal'].map((account) => (
                  <Pressable
                    key={account}
                    onPress={() => setUpiAccount(account as 'Firm' | 'Personal')}
                    style={[styles.chip, upiAccount === account && styles.chipActive]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        upiAccount === account && styles.chipTextActive,
                      ]}
                    >
                      {account}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.fieldLabel}>UPI Reference ID</Text>
              <TextInput
                value={reference}
                onChangeText={setReference}
                placeholder="Transaction ID"
                placeholderTextColor={theme.colors.muted}
                style={styles.input}
              />
            </>
          )}

          <Text style={styles.fieldLabel}>Split Payment (if both Cash & UPI)</Text>
          <View style={styles.splitRow}>
            <View style={styles.splitField}>
              <Text style={styles.fieldLabel}>Cash (₹)</Text>
              <TextInput
                value={cashPaid}
                onChangeText={setCashPaid}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={theme.colors.muted}
                style={styles.input}
              />
            </View>
            <View style={styles.splitField}>
              <Text style={styles.fieldLabel}>UPI (₹)</Text>
              <TextInput
                value={upiPaid}
                onChangeText={setUpiPaid}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={theme.colors.muted}
                style={styles.input}
              />
            </View>
          </View>
        </SectionCard>

        {/* OPTIONAL DETAILS SECTION */}
        <SectionCard title="Additional Information" description="Optional tracking fields">
          <Text style={styles.fieldLabel}>Influencer Name</Text>
          <TextInput
            value={influencerName}
            onChangeText={setInfluencerName}
            placeholder="Referrer name"
            placeholderTextColor={theme.colors.muted}
            style={styles.input}
          />

          <Text style={styles.fieldLabel}>Influencer Contact</Text>
          <TextInput
            value={influencerContact}
            onChangeText={setInfluencerContact}
            placeholder="Referrer contact"
            placeholderTextColor={theme.colors.muted}
            style={styles.input}
          />

          <Text style={styles.fieldLabel}>Employee Name</Text>
          <TextInput
            value={employeeName}
            onChangeText={setEmployeeName}
            placeholder="Who made the sale"
            placeholderTextColor={theme.colors.muted}
            style={styles.input}
          />

          <Text style={styles.fieldLabel}>Invoice Number</Text>
          <TextInput
            value={invoiceNumber}
            onChangeText={setInvoiceNumber}
            placeholder="Reference number"
            placeholderTextColor={theme.colors.muted}
            style={styles.input}
          />

          <Text style={styles.fieldLabel}>Notes</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Any comments or notes"
            placeholderTextColor={theme.colors.muted}
            style={[styles.input, { minHeight: 60, textAlignVertical: 'top' }]}
            multiline
          />
        </SectionCard>

        {/* TOTAL & CREATE */}
        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>Invoice Total</Text>
          <Text style={styles.totalValue}>{formatCurrency(previewTotal)}</Text>
          <Pressable
            onPress={handleCreateInvoice}
            style={styles.createButton}
          >
            <Text style={styles.createButtonText}>Create Invoice</Text>
          </Pressable>
        </View>

        {/* TODAY'S INVOICES SECTION */}
        {todayInvoices.length > 0 && (
          <SectionCard
            title="Today's Invoices"
            description={`${todayInvoices.length} invoice${todayInvoices.length !== 1 ? 's' : ''} created today`}
          >
            {todayInvoices.map((invoice) => (
              <Pressable
                key={invoice.id}
                onPress={() => setViewingInvoice(invoice)}
                style={styles.invoiceRow}
              >
                <View style={styles.invoiceLeft}>
                  <Text style={styles.invoiceCustomer}>{invoice.customerName}</Text>
                  <Text style={styles.invoiceTime}>
                    {new Date(invoice.createdAt).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
                <View style={styles.invoiceRight}>
                  <Text style={styles.invoiceTotal}>{formatCurrency(invoice.total)}</Text>
                  <Text style={styles.invoiceMode}>
                    {invoice.cashPaid && invoice.upiPaid ? '💵💳 Cash+UPI' : invoice.paymentMode}
                  </Text>
                </View>
              </Pressable>
            ))}
          </SectionCard>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Transaction Popup */}
      {selectedCustomer && (
        <TransactionPopup
          visible={showTransactionPopup}
          totalAmount={previewTotal}
          customerName={selectedCustomer.name}
          bhada={parseWholeNumberInput(bhada)}
          dala={parseWholeNumberInput(dala)}
          pastInvoices={allInvoices.filter(inv => inv.customerId === customerId).slice(0, 5)}
          onClose={() => setShowTransactionPopup(false)}
          onConfirm={handleTransactionConfirm}
        />
      )}

      {/* Professional Bill Preview Modal */}
      <Modal visible={!!viewingInvoice} animationType="slide" presentationStyle="fullScreen">
        {viewingInvoice ? (
          <ProfessionalBillPreview invoice={viewingInvoice} onClose={() => setViewingInvoice(null)} />
        ) : null}
      </Modal>

      {/* Legacy Modal Backup - Hidden */}
      <Modal visible={false} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Invoice Details</Text>
              <Pressable onPress={() => setViewingInvoice(null)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </Pressable>
            </View>

            <ScrollView style={styles.modalScroll}>
              {viewingInvoice && (
                <>
                  {/* CUSTOMER INFO */}
                  <View style={styles.customerCard}>
                    <Text style={styles.sectionHeading}>Customer Information</Text>
                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>Name</Text>
                      <Text style={styles.detailValue}>{viewingInvoice.customerName}</Text>
                    </View>
                    {viewingInvoice.customerPhone && (
                      <View style={styles.detailSection}>
                        <Text style={styles.detailLabel}>Phone</Text>
                        <Text style={styles.detailValue}>{viewingInvoice.customerPhone}</Text>
                      </View>
                    )}
                    {viewingInvoice.customerAddress && (
                      <View style={styles.detailSection}>
                        <Text style={styles.detailLabel}>Address</Text>
                        <Text style={styles.detailValue}>{viewingInvoice.customerAddress}</Text>
                      </View>
                    )}
                  </View>

                  {/* PAYMENT INFO */}
                  <View style={styles.paymentCard}>
                    <Text style={styles.sectionHeading}>Payment Information</Text>
                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>Total Amount</Text>
                      <Text style={styles.detailValue}>{formatCurrency(viewingInvoice.total)}</Text>
                    </View>

                    {viewingInvoice.amountPaid !== undefined ? (
                      <>
                        <View style={styles.detailSection}>
                          <Text style={styles.detailLabel}>Amount Paid</Text>
                          <Text style={styles.detailValue}>{formatCurrency(viewingInvoice.amountPaid)}</Text>
                        </View>
                        <View style={styles.detailSection}>
                          <Text style={styles.detailLabel}>Outstanding (Udhar)</Text>
                          <Text style={[styles.detailValue, { color: Math.max(0, viewingInvoice.total - (viewingInvoice.amountPaid || 0)) > 0 ? theme.colors.negative : theme.colors.positive }]}>
                            {formatCurrency(Math.max(0, viewingInvoice.total - (viewingInvoice.amountPaid || 0)))}
                          </Text>
                        </View>
                      </>
                    ) : (
                      <View style={styles.detailSection}>
                        <Text style={styles.detailLabel}>Outstanding (Udhar)</Text>
                        <Text style={[styles.detailValue, { color: theme.colors.negative }]}>
                          {formatCurrency(viewingInvoice.total)}
                        </Text>
                      </View>
                    )}

                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>Payment Mode</Text>
                      <Text style={styles.detailValue}>{viewingInvoice.paymentMode}</Text>
                    </View>

                    {viewingInvoice.cashPaid ? (
                      <View style={styles.detailSection}>
                        <Text style={styles.detailLabel}>Cash Paid</Text>
                        <Text style={styles.detailValue}>{formatCurrency(viewingInvoice.cashPaid)}</Text>
                      </View>
                    ) : null}

                    {viewingInvoice.upiPaid ? (
                      <View style={styles.detailSection}>
                        <Text style={styles.detailLabel}>UPI Paid ({viewingInvoice.upiAccount || 'Firm'})</Text>
                        <Text style={styles.detailValue}>{formatCurrency(viewingInvoice.upiPaid)}</Text>
                      </View>
                    ) : null}
                  </View>

                  {/* CHARGES */}
                  {(viewingInvoice.bhada || viewingInvoice.dala) && (
                    <View style={styles.chargesCard}>
                      <Text style={styles.sectionHeading}>Additional Charges</Text>
                      {viewingInvoice.bhada && (
                        <View style={styles.detailSection}>
                          <Text style={styles.detailLabel}>Bhada (Delivery)</Text>
                          <Text style={styles.detailValue}>{formatCurrency(viewingInvoice.bhada)}</Text>
                        </View>
                      )}
                      {viewingInvoice.dala && (
                        <View style={styles.detailSection}>
                          <Text style={styles.detailLabel}>Dala (Worker Payment)</Text>
                          <Text style={styles.detailValue}>{formatCurrency(viewingInvoice.dala)}</Text>
                        </View>
                      )}
                    </View>
                  )}

                  {/* ITEMS */}
                  <View style={styles.itemsList}>
                    <Text style={styles.sectionHeading}>Items ({viewingInvoice.lines?.length || 0})</Text>
                    {viewingInvoice.lines?.map((line: any, idx: number) => (
                      <View key={idx} style={styles.itemDetail}>
                        <Text style={styles.itemName}>{line.productName}</Text>
                        <Text style={styles.itemQty}>
                          {line.quantity} × {formatCurrency(line.unitPrice)} = {formatCurrency(line.lineTotal)}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* ADDITIONAL INFO */}
                  {(viewingInvoice.influencerName || viewingInvoice.employeeName || viewingInvoice.notes) && (
                    <View style={styles.additionalCard}>
                      <Text style={styles.sectionHeading}>Additional Details</Text>
                      {viewingInvoice.influencerName && (
                        <View style={styles.detailSection}>
                          <Text style={styles.detailLabel}>Referrer</Text>
                          <Text style={styles.detailValue}>{viewingInvoice.influencerName}</Text>
                        </View>
                      )}
                      {viewingInvoice.employeeName && (
                        <View style={styles.detailSection}>
                          <Text style={styles.detailLabel}>Employee</Text>
                          <Text style={styles.detailValue}>{viewingInvoice.employeeName}</Text>
                        </View>
                      )}
                      {viewingInvoice.invoiceNumber && (
                        <View style={styles.detailSection}>
                          <Text style={styles.detailLabel}>Invoice #</Text>
                          <Text style={styles.detailValue}>{viewingInvoice.invoiceNumber}</Text>
                        </View>
                      )}
                      {viewingInvoice.notes && (
                        <View style={styles.detailSection}>
                          <Text style={styles.detailLabel}>Notes</Text>
                          <Text style={styles.detailValue}>{viewingInvoice.notes}</Text>
                        </View>
                      )}
                    </View>
                  )}

                  {/* TIMESTAMP */}
                  <View style={styles.timestampCard}>
                    <Text style={styles.detailLabel}>Created</Text>
                    <Text style={styles.detailValue}>
                      {new Date(viewingInvoice.createdAt).toLocaleString('en-IN')}
                    </Text>
                  </View>
                </>
              )}
            </ScrollView>

            <Pressable
              onPress={() => setViewingInvoice(null)}
              style={styles.modalCloseButton}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  heading: {
    color: theme.colors.text,
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 6,
    paddingHorizontal: 16,
  },
  subheading: {
    color: theme.colors.muted,
    fontSize: 13,
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  errorBanner: {
    backgroundColor: theme.colors.negative + '20',
    borderRadius: 10,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.negative,
  },
  errorText: {
    color: theme.colors.negative,
    fontSize: 12,
    fontWeight: '600',
  },
  successBanner: {
    backgroundColor: theme.colors.positive + '20',
    borderRadius: 10,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.positive,
  },
  successText: {
    color: theme.colors.positive,
    fontSize: 12,
    fontWeight: '600',
  },
  customerButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  customerButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.panelRaised,
  },
  customerButtonSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '15',
  },
  customerButtonText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  customerButtonTextSelected: {
    color: theme.colors.primary,
  },
  addNewButton: {
    backgroundColor: theme.colors.primary + '20',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    paddingVertical: 10,
    alignItems: 'center',
  },
  addNewButtonText: {
    color: theme.colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  createCustomerButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 14,
  },
  createCustomerButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  customerCreatedBox: {
    backgroundColor: theme.colors.positive + '15',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1.5,
    borderColor: theme.colors.positive,
  },
  customerCreatedLabel: {
    color: theme.colors.positive,
    fontSize: 11,
    fontWeight: '700',
  },
  customerCreatedName: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 4,
  },
  customerCreatedMeta: {
    color: theme.colors.muted,
    fontSize: 12,
    marginTop: 4,
  },
  formLabel: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.panelRaised,
    color: theme.colors.text,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
  },
  formButtonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  formButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: theme.colors.panelRaised,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
  },
  cancelButtonText: {
    color: theme.colors.muted,
    fontWeight: '600',
    fontSize: 13,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  selectedCustomerInfo: {
    backgroundColor: theme.colors.positive + '10',
    borderRadius: 8,
    padding: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: theme.colors.positive + '30',
  },
  selectedLabel: {
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: '600',
  },
  selectedValue: {
    color: theme.colors.positive,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  selectedMeta: {
    color: theme.colors.muted,
    fontSize: 11,
    marginTop: 4,
  },
  lineItem: {
    backgroundColor: theme.colors.panelRaised,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  itemNumber: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
  },
  fieldLabel: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  productSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  productTag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  productTagSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '15',
  },
  productTagText: {
    color: theme.colors.text,
    fontSize: 11,
    fontWeight: '600',
  },
  productTagTextSelected: {
    color: theme.colors.primary,
  },
  qtyPriceRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  qtyField: {
    flex: 1,
  },
  priceField: {
    flex: 1,
  },
  qtyInput: {
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
    textAlign: 'center',
  },
  priceInput: {
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
    textAlign: 'center',
  },
  lineTotal: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 10,
  },
  lineTotalValue: {
    color: theme.colors.positive,
    fontSize: 13,
    fontWeight: '700',
  },
  removeButton: {
    backgroundColor: theme.colors.negative + '15',
    borderRadius: 6,
    paddingVertical: 6,
    alignItems: 'center',
  },
  removeButtonText: {
    color: theme.colors.negative,
    fontWeight: '600',
    fontSize: 12,
  },
  lineSeparator: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginTop: 12,
  },
  addLineButton: {
    backgroundColor: theme.colors.primary + '20',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  addLineButtonText: {
    color: theme.colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  chipWrap: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.panelRaised,
  },
  chipActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  chipText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  splitRow: {
    flexDirection: 'row',
    gap: 10,
  },
  splitField: {
    flex: 1,
  },
  totalSection: {
    marginHorizontal: 16,
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
  },
  totalLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.9,
  },
  totalValue: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 12,
  },
  createButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  createButtonText: {
    color: theme.colors.primary,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  backButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.panelRaised,
  },
  backButtonText: {
    color: theme.colors.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  invoiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.panelRaised,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  invoiceLeft: {
    flex: 1,
  },
  invoiceCustomer: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  invoiceTime: {
    color: theme.colors.muted,
    fontSize: 11,
    marginTop: 2,
  },
  invoiceRight: {
    alignItems: 'flex-end',
  },
  invoiceTotal: {
    color: theme.colors.positive,
    fontSize: 13,
    fontWeight: '700',
  },
  invoiceMode: {
    color: theme.colors.muted,
    fontSize: 11,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '90%',
    paddingTop: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  modalCloseText: {
    color: theme.colors.muted,
    fontSize: 24,
    fontWeight: '600',
  },
  modalScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  detailSection: {
    marginBottom: 14,
  },
  detailLabel: {
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: '700',
  },
  detailValue: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  itemsList: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  itemsTitle: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
  },
  itemDetail: {
    backgroundColor: theme.colors.panelRaised,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
  },
  itemName: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  itemQty: {
    color: theme.colors.muted,
    fontSize: 11,
    marginTop: 4,
  },
  modalCloseButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 20,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  sectionHeading: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
  },
  customerCard: {
    backgroundColor: theme.colors.primary + '10',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  paymentCard: {
    backgroundColor: theme.colors.positive + '10',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.positive,
  },
  chargesCard: {
    backgroundColor: theme.colors.warning + '10' || theme.colors.primary + '05',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  additionalCard: {
    backgroundColor: theme.colors.panelRaised,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  timestampCard: {
    backgroundColor: theme.colors.muted + '10',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  totalPreviewBox: {
    backgroundColor: theme.colors.primary + '15',
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderLeftWidth: 5,
    borderLeftColor: theme.colors.primary,
    borderTopWidth: 2,
    borderTopColor: theme.colors.primary,
  },
  totalPreviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  totalPreviewLabel: {
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  totalPreviewValue: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  totalPreviewLabelBold: {
    color: theme.colors.primary,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  totalPreviewValueBold: {
    color: theme.colors.primary,
    fontSize: 20,
    fontWeight: '900',
  },
  totalPreviewDivider: {
    height: 1,
    backgroundColor: theme.colors.primary + '40',
    marginVertical: 8,
  },
});
