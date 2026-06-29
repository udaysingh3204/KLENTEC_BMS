import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { theme } from '../theme';
import { formatCurrency } from '../utils/finance';

const DISCREPANCY_THRESHOLD = 100;

type TransactionPopupProps = {
  visible: boolean;
  totalAmount: number;
  customerName: string;
  onClose: () => void;
  onConfirm: (amountPaid: number, discrepancy: number) => void;
};

export function TransactionPopup({
  visible,
  totalAmount,
  customerName,
  onClose,
  onConfirm,
}: TransactionPopupProps) {
  const [amountPaid, setAmountPaid] = React.useState(totalAmount.toString());

  React.useEffect(() => {
    if (visible) {
      setAmountPaid(totalAmount.toString());
    }
  }, [visible, totalAmount]);

  const handleConfirm = () => {
    const paid = parseFloat(amountPaid) || 0;
    const difference = totalAmount - paid;
    const discrepancy = difference < 0 ? Math.abs(difference) : difference;

    onConfirm(paid, discrepancy);
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
          </View>

          {/* Discrepancy Info */}
          {difference !== 0 && (
            <View style={[
              styles.discrepancyBox,
              difference < 0 ? styles.overpaidBox : styles.underpaidBox
            ]}>
              <Text style={styles.discrepancyLabel}>
                {difference < 0 ? 'Customer Overpaid' : 'Underpaid'}
              </Text>
              <Text style={[
                styles.discrepancyAmount,
                difference < 0 ? styles.overpaidAmount : styles.underpaidAmount
              ]}>
                {formatCurrency(discrepancyValue)}
              </Text>
              {shouldRecordAsDebit && (
                <Text style={styles.willRecordText}>
                  ⚠️ This will be recorded as a debit
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

          {/* Buttons */}
          <View style={styles.buttons}>
            <Pressable onPress={onClose} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
            <Pressable onPress={handleConfirm} style={styles.confirmButton}>
              <Text style={styles.confirmButtonText}>Confirm & Save</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

import React from 'react';

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
    maxWidth: 380,
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
