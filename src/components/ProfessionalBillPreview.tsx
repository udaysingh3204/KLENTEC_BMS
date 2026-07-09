import { StyleSheet, Text, View, ScrollView, Pressable } from 'react-native';
import { formatCurrency } from '../utils/finance';
import { theme } from '../theme';
import { Invoice } from '../types';

interface Props {
  invoice: Invoice;
  onClose: () => void;
}

export function ProfessionalBillPreview({ invoice, onClose }: Props) {
  const subtotal = invoice.lines.reduce((sum, line) => sum + line.lineTotal, 0);
  const total = invoice.total;
  const bhadaAmount = invoice.bhada || 0;
  const dalaAmount = invoice.dala || 0;
  const amountPaid = invoice.amountPaid || 0;
  const outstanding = total - amountPaid;

  const createdDate = new Date(invoice.createdAt);
  const formattedDate = createdDate.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const formattedTime = createdDate.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.billTitle}>📄 PROFESSIONAL INVOICE</Text>
          <Text style={styles.billSubtitle}>Business Receipt</Text>
        </View>

        {/* Invoice Number & Date */}
        <View style={styles.metaSection}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Invoice #</Text>
            <Text style={styles.metaValue}>{invoice.invoiceNumber || invoice.id}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Date</Text>
            <Text style={styles.metaValue}>{formattedDate} {formattedTime}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Payment Mode</Text>
            <Text style={[styles.metaValue, { color: invoice.paymentMode === 'Cash' ? theme.colors.positive : invoice.paymentMode === 'UPI' ? '#3B82F6' : theme.colors.warning }]}>
              {invoice.paymentMode}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Customer Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Details</Text>
          <View style={styles.customerBox}>
            <Text style={styles.customerName}>{invoice.customerName}</Text>
            <Text style={styles.customerDetail}>📱 {invoice.customerPhone || 'N/A'}</Text>
            <Text style={styles.customerDetail}>📍 {invoice.customerAddress || 'N/A'}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Line Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items Purchased</Text>
          <View style={styles.lineItemsHeader}>
            <Text style={[styles.lineItemCol, { flex: 3 }]}>Product</Text>
            <Text style={[styles.lineItemCol, { flex: 1.5 }]}>Qty</Text>
            <Text style={[styles.lineItemCol, { flex: 1.5 }]}>Rate</Text>
            <Text style={[styles.lineItemCol, { flex: 2 }]}>Amount</Text>
          </View>
          <View style={styles.lineItemsDivider} />
          {invoice.lines.map((line, idx) => (
            <View key={idx} style={styles.lineItem}>
              <Text style={[styles.lineItemCol, { flex: 3 }]}>{line.productName}</Text>
              <Text style={[styles.lineItemCol, { flex: 1.5 }]}>{line.quantity}</Text>
              <Text style={[styles.lineItemCol, { flex: 1.5 }]}>{formatCurrency(line.unitPrice)}</Text>
              <Text style={[styles.lineItemCol, { flex: 2 }]}>{formatCurrency(line.lineTotal)}</Text>
            </View>
          ))}
          <View style={styles.lineItemsDivider} />
        </View>

        <View style={styles.divider} />

        {/* Charges & Totals */}
        <View style={styles.section}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>{formatCurrency(subtotal)}</Text>
          </View>

          {bhadaAmount > 0 && (
            <View style={styles.chargeRow}>
              <Text style={styles.chargeLabel}>🚗 Bhada (Delivery)</Text>
              <Text style={styles.chargeValue}>+ {formatCurrency(bhadaAmount)}</Text>
            </View>
          )}

          {dalaAmount > 0 && (
            <View style={styles.chargeRow}>
              <Text style={styles.chargeLabel}>👷 Dala (Labour)</Text>
              <Text style={styles.chargeValue}>+ {formatCurrency(dalaAmount)}</Text>
            </View>
          )}

          <View style={styles.divider} />

          {/* Grand Total - PROMINENT */}
          <View style={styles.grandTotalBox}>
            <Text style={styles.grandTotalLabel}>TOTAL AMOUNT DUE</Text>
            <Text style={styles.grandTotalValue}>{formatCurrency(total)}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Payment Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Status</Text>

          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Amount Paid</Text>
            <Text style={[styles.paymentValue, { color: theme.colors.positive }]}>{formatCurrency(amountPaid)}</Text>
          </View>

          {invoice.cashPaid && invoice.cashPaid > 0 && (
            <View style={styles.paymentDetailRow}>
              <Text style={styles.paymentDetailLabel}>💵 Cash</Text>
              <Text style={styles.paymentDetailValue}>{formatCurrency(invoice.cashPaid)}</Text>
            </View>
          )}

          {invoice.upiPaid && invoice.upiPaid > 0 && (
            <View style={styles.paymentDetailRow}>
              <Text style={styles.paymentDetailLabel}>📱 UPI</Text>
              <Text style={styles.paymentDetailValue}>{formatCurrency(invoice.upiPaid)}</Text>
            </View>
          )}

          <View style={styles.divider} />

          <View style={[styles.outstandingRow, outstanding > 0 ? styles.outstandingHighlight : styles.outstandingPaid]}>
            <Text style={styles.outstandingLabel}>{outstanding > 0 ? '⚠️ Outstanding' : '✅ Paid'}</Text>
            <Text style={[styles.outstandingValue, { color: outstanding > 0 ? theme.colors.negative : theme.colors.positive }]}>
              {formatCurrency(Math.max(0, outstanding))}
            </Text>
          </View>
        </View>

        {/* Additional Info */}
        {(invoice.employeeName || invoice.influencerName || invoice.notes) && (
          <>
            <View style={styles.divider} />
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Additional Information</Text>
              {invoice.employeeName && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Employee</Text>
                  <Text style={styles.infoValue}>{invoice.employeeName}</Text>
                </View>
              )}
              {invoice.influencerName && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Referrer</Text>
                  <Text style={styles.infoValue}>{invoice.influencerName}</Text>
                </View>
              )}
              {invoice.notes && (
                <View style={styles.notesBox}>
                  <Text style={styles.notesTitle}>Notes</Text>
                  <Text style={styles.notesText}>{invoice.notes}</Text>
                </View>
              )}
            </View>
          </>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Thank you for your business!</Text>
          <Text style={styles.footerSubtext}>Keep this receipt for your records</Text>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Close Button */}
      <Pressable onPress={onClose} style={styles.closeButton}>
        <Text style={styles.closeButtonText}>← Back</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
    marginBottom: 16,
  },
  billTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  billSubtitle: {
    fontSize: 12,
    color: theme.colors.muted,
    marginTop: 4,
  },
  metaSection: {
    backgroundColor: theme.colors.panelRaised,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  metaLabel: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  metaValue: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  customerBox: {
    backgroundColor: theme.colors.primaryLight,
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  customerDetail: {
    fontSize: 12,
    color: theme.colors.muted,
    marginTop: 4,
  },
  lineItemsHeader: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
  },
  lineItemCol: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.muted,
  },
  lineItemsDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 8,
  },
  lineItem: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  chargeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  chargeLabel: {
    fontSize: 13,
    color: theme.colors.muted,
  },
  chargeValue: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.warning || theme.colors.text,
  },
  grandTotalBox: {
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  grandTotalLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  grandTotalValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 6,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  paymentLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.text,
  },
  paymentValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  paymentDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingLeft: 16,
  },
  paymentDetailLabel: {
    fontSize: 12,
    color: theme.colors.muted,
  },
  paymentDetailValue: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
  },
  outstandingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 2,
    marginTop: 10,
  },
  outstandingHighlight: {
    backgroundColor: '#FEE2E2',
    borderColor: theme.colors.negative,
  },
  outstandingPaid: {
    backgroundColor: '#D1FAE5',
    borderColor: theme.colors.positive,
  },
  outstandingLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.text,
  },
  outstandingValue: {
    fontSize: 14,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.muted,
  },
  infoValue: {
    fontSize: 12,
    color: theme.colors.text,
  },
  notesBox: {
    backgroundColor: theme.colors.panelRaised,
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.accent,
  },
  notesTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.muted,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 12,
    color: theme.colors.text,
    lineHeight: 18,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  footerSubtext: {
    fontSize: 11,
    color: theme.colors.muted,
    marginTop: 4,
  },
  closeButton: {
    backgroundColor: theme.colors.panelRaised,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  closeButtonText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
});
