import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import React from 'react';
import { theme } from '../theme';
import { formatCurrency } from '../utils/finance';

const DISCREPANCY_THRESHOLD = 100;

type TransactionPopupProps = {
  visible: boolean;
  totalAmount: number;
  customerName: string;
  bhada?: number;
  dala?: number;
  pastInvoices?: any[];
  onClose: () => void;
  onConfirm: (amountPaid: number, discrepancy: number, dalaValue: number) => void;
};

export function TransactionPopup({
  visible,
  totalAmount,
  customerName,
  bhada = 0,
  dala = 0,
  pastInvoices = [],
  onClose,
  onConfirm,
}: TransactionPopupProps) {
  const [amountPaid, setAmountPaid] = React.useState(totalAmount.toString());
  const [editableDala, setEditableDala] = React.useState(dala.toString());

  React.useEffect(() => {
    if (visible) {
      setAmountPaid(totalAmount.toString());
      setEditableDala(dala.toString());
    }
  }, [visible, totalAmount, dala]);

  const handleConfirm = () => {
    const paid = parseFloat(amountPaid) || 0;
    const dalaValue = parseFloat(editableDala) || 0;
    const difference = totalAmount - paid;
    const discrepancy = difference < 0 ? Math.abs(difference) : difference;

    onConfirm(paid, discrepancy, dalaValue);
    onClose();
  };

  const paid = parseFloat(amountPaid) || 0;
  const difference = totalAmount - paid;
  const discrepancyValue = Math.abs(difference);
  const shouldRecordAsDebit = discrepancyValue >= DISCREPANCY_THRESHOLD;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.popup}>
          <ScrollView showsVerticalScrollIndicator={false} style={{maxHeight: 600}}>
            <Text style={styles.title}>Transaction Summary</Text>
            <Text style={styles.subtitle}>{customerName}</Text>

            {/* Totals */}
            <View style={styles.section}>
              <View style={styles.row}>
                <Text style={styles.label}>Total Amount Due:</Text>
                <Text style={styles.value}>{formatCurrency(totalAmount)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Amount Paid by Customer:</Text>
                <TextInput
                  style={styles.amountInput}
                  value={amountPaid}
                  onChangeText={setAmountPaid}
                  keyboardType="decimal-pad"
                  placeholder="0"
                />
              </View>

              {/* Editable Dala Field */}
              <View style={styles.row}>
                <Text style={styles.label}>Dala (Worker/Driver Payment) *:</Text>
                <TextInput
                  style={styles.amountInput}
                  value={editableDala}
                  onChangeText={setEditableDala}
                  keyboardType="decimal-pad"
                  placeholder="0"
                />
              </View>
            </View>

            {/* Discrepancy Info */}
            {difference !== 0 && (
              <View style={[
                styles.discrepancyBox,
                difference < 0 ? styles.overpaidBox : styles.underpaidBox
              ]}>
                <Text style={styles.discrepancyLabel}>
                  {difference < 0 ? 'Customer Overpaid' : 'Underpaid (Udhar)'}
                </Text>
                <Text style={[
                  styles.discrepancyAmount,
                  difference < 0 ? styles.overpaidAmount : styles.underpaidAmount
                ]}>
                  {formatCurrency(discrepancyValue)}
                </Text>
                {shouldRecordAsDebit && (
                  <Text style={styles.willRecordText}>
                    ⚠️ This will be recorded as outstanding (Udhar)
                  </Text>
                )}
                {!shouldRecordAsDebit && (
                  <Text style={styles.willIgnoreText}>
                    ✓ Below ₹{DISCREPANCY_THRESHOLD} threshold — will be rounded off
                  </Text>
                )}
              </View>
            )}

            {/* Amount Received Note */}
            <View style={styles.receivedBox}>
              <Text style={styles.receivedLabel}>Shopkeeper Received:</Text>
              <Text style={styles.receivedAmount}>{formatCurrency(paid)}</Text>
            </View>

            {/* Past Invoices */}
            {pastInvoices && pastInvoices.length > 0 && (
              <View style={styles.pastInvoicesSection}>
                <Text style={styles.pastInvoicesTitle}>📋 Last Bills Paid ({pastInvoices.length})</Text>
                {pastInvoices.slice(0, 5).map((inv, idx) => (
                  <View key={inv.id} style={styles.pastInvoiceItem}>
                    <View style={styles.pastInvoiceLeft}>
                      <Text style={styles.pastInvoiceNumber}>INV #{(idx + 1).toString().padStart(3, '0')}</Text>
                      <Text style={styles.pastInvoiceDate}>{new Date(inv.createdAt).toLocaleDateString()}</Text>
                    </View>
                    <View style={styles.pastInvoiceRight}>
                      <Text style={styles.pastInvoiceAmount}>{formatCurrency(inv.total)}</Text>
                      <Text style={[styles.pastInvoiceStatus, inv.amountPaid === inv.total ? styles.paidStatus : styles.partialStatus]}>
                        {inv.amountPaid === inv.total ? '✓ Paid' : `Udhar: ${formatCurrency(inv.udhar || 0)}`}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          {/* Buttons */}
          <View style={styles.buttons}>
            <Pressable onPress={onClose} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
            <Pressable onPress={handleConfirm} style={styles.confirmButton}>
              <Text style={styles.confirmButtonText}>✓ Save Invoice</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  popup: {
    backgroundColor: theme.colors.background,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.muted,
    marginBottom: 16,
  },
  section: {
    backgroundColor: theme.colors.panelRaised,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  value: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  amountInput: {
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
    minWidth: 100,
    textAlign: 'right',
  },
  discrepancyBox: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    gap: 6,
  },
  overpaidBox: {
    backgroundColor: '#E0F2FE',
  },
  underpaidBox: {
    backgroundColor: '#FFF5F5',
  },
  discrepancyLabel: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  discrepancyAmount: {
    fontSize: 16,
    fontWeight: '800',
  },
  overpaidAmount: {
    color: theme.colors.positive,
  },
  underpaidAmount: {
    color: theme.colors.negative,
  },
  willRecordText: {
    fontSize: 11,
    color: theme.colors.negative,
    fontWeight: '600',
  },
  willIgnoreText: {
    fontSize: 11,
    color: theme.colors.positive,
    fontWeight: '600',
  },
  receivedBox: {
    backgroundColor: theme.colors.primaryLight,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    gap: 6,
    alignItems: 'center',
  },
  receivedLabel: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  receivedAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  pastInvoicesSection: {
    backgroundColor: theme.colors.panelRaised,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    gap: 10,
  },
  pastInvoicesTitle: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  pastInvoiceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  pastInvoiceLeft: {
    gap: 4,
  },
  pastInvoiceNumber: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  pastInvoiceDate: {
    color: theme.colors.muted,
    fontSize: 11,
  },
  pastInvoiceRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  pastInvoiceAmount: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  pastInvoiceStatus: {
    fontSize: 10,
    fontWeight: '600',
  },
  paidStatus: {
    color: theme.colors.positive,
  },
  partialStatus: {
    color: theme.colors.negative,
  },
  buttons: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: theme.colors.muted,
    fontSize: 14,
    fontWeight: '700',
  },
  confirmButton: {
    flex: 1,
    borderRadius: 10,
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
