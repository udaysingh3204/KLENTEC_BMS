import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Invoice } from '../types';
import { theme } from '../theme';
import { formatCurrency } from '../utils/finance';

type TransactionDetailsModalProps = {
  visible: boolean;
  transaction: Invoice | null;
  onClose: () => void;
  onUpdate?: (transaction: Invoice) => void;
};

export function TransactionDetailsModal({
  visible,
  transaction,
  onClose,
  onUpdate,
}: TransactionDetailsModalProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedNotes, setEditedNotes] = useState(transaction?.notes || '');

  if (!transaction) return null;

  const handleSave = () => {
    if (onUpdate) {
      onUpdate({
        ...transaction,
        notes: editedNotes,
      });
      setIsEditMode(false);
    }
  };

  const products = transaction.lines.map((l) => l.productName).join(', ');
  const time = transaction.createdAt.split('T')[1]?.substring(0, 5) || '';
  const date = transaction.createdAt.split('T')[0];

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Transaction Details</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </Pressable>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Transaction Summary */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Summary</Text>
              <View style={styles.row}>
                <Text style={styles.label}>Date & Time</Text>
                <Text style={styles.value}>
                  {date} at {time}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Invoice #</Text>
                <Text style={styles.value}>{transaction.invoiceNumber || '—'}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Status</Text>
                <Text style={[styles.value, { color: theme.colors.positive }]}>
                  {transaction.status || 'Completed'}
                </Text>
              </View>
              <View style={[styles.row, styles.borderTop]}>
                <Text style={styles.label}>Amount</Text>
                <Text style={[styles.value, styles.amountText]}>
                  {formatCurrency(transaction.total)}
                </Text>
              </View>
            </View>

            {/* Customer Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Customer Information</Text>
              <View style={styles.row}>
                <Text style={styles.label}>Name</Text>
                <Text style={styles.value}>{transaction.customerName}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Phone</Text>
                <Text style={styles.value}>{transaction.customerPhone || '—'}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Address</Text>
                <Text style={styles.value}>{transaction.customerAddress || '—'}</Text>
              </View>
            </View>

            {/* Products & Items */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Products</Text>
              <View style={styles.productsContainer}>
                {transaction.lines.map((line, idx) => (
                  <View key={idx} style={styles.productItem}>
                    <View style={styles.productLeft}>
                      <Text style={styles.productName}>{line.productName}</Text>
                      <Text style={styles.productMeta}>
                        Qty: {line.quantity} × {formatCurrency(line.unitPrice)}
                      </Text>
                    </View>
                    <Text style={styles.productTotal}>{formatCurrency(line.lineTotal)}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Payment Details */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Payment Details</Text>
              <View style={styles.row}>
                <Text style={styles.label}>Payment Mode</Text>
                <Text style={styles.value}>{transaction.paymentMode}</Text>
              </View>
              {transaction.paymentMode === 'UPI' && transaction.upiAccount && (
                <View style={styles.row}>
                  <Text style={styles.label}>UPI Account</Text>
                  <Text style={styles.value}>{transaction.upiAccount}</Text>
                </View>
              )}
              {transaction.paymentMode === 'UPI' && transaction.reference && (
                <View style={styles.row}>
                  <Text style={styles.label}>UPI Reference</Text>
                  <Text style={styles.value}>{transaction.reference}</Text>
                </View>
              )}
              {transaction.bhada ? (
                <View style={styles.row}>
                  <Text style={styles.label}>Bhada (Delivery)</Text>
                  <Text style={styles.value}>{formatCurrency(transaction.bhada)}</Text>
                </View>
              ) : null}
            </View>

            {/* Additional Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Additional Information</Text>
              {transaction.employeeName && (
                <View style={styles.row}>
                  <Text style={styles.label}>Employee</Text>
                  <Text style={styles.value}>{transaction.employeeName}</Text>
                </View>
              )}
              {transaction.influencerName && (
                <View style={styles.row}>
                  <Text style={styles.label}>Influencer</Text>
                  <Text style={styles.value}>
                    {transaction.influencerName}
                    {transaction.influencerContact ? ` (${transaction.influencerContact})` : ''}
                  </Text>
                </View>
              )}
              <View style={styles.row}>
                <Text style={styles.label}>Profit</Text>
                <Text style={[styles.value, { color: theme.colors.positive }]}>
                  {formatCurrency(transaction.profit || 0)}
                </Text>
              </View>
            </View>

            {/* Notes Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notes</Text>
              {isEditMode ? (
                <TextInput
                  value={editedNotes}
                  onChangeText={setEditedNotes}
                  placeholder="Add notes..."
                  placeholderTextColor={theme.colors.muted}
                  style={[styles.notesInput]}
                  multiline
                />
              ) : (
                <Text style={styles.notesText}>
                  {transaction.notes || 'No notes added'}
                </Text>
              )}
            </View>

            {/* Edit/Save Buttons */}
            <View style={styles.buttonContainer}>
              {isEditMode ? (
                <>
                  <Pressable
                    onPress={() => {
                      setIsEditMode(false);
                      setEditedNotes(transaction.notes || '');
                    }}
                    style={[styles.button, styles.cancelButton]}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </Pressable>
                  <Pressable onPress={handleSave} style={[styles.button, styles.saveButton]}>
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  </Pressable>
                </>
              ) : (
                <Pressable
                  onPress={() => setIsEditMode(true)}
                  style={[styles.button, styles.editButton]}
                >
                  <Text style={styles.editButtonText}>Edit Notes</Text>
                </Pressable>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.text,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.panelRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: theme.colors.muted,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  section: {
    marginBottom: 20,
    backgroundColor: theme.colors.panelRaised,
    borderRadius: 12,
    padding: 14,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    borderBottomWidth: 0,
  },
  label: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  value: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'right',
    maxWidth: '60%',
  },
  amountText: {
    fontSize: 15,
    color: theme.colors.positive,
  },
  productsContainer: {
    gap: 8,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  productLeft: {
    flex: 1,
    gap: 2,
  },
  productName: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  productMeta: {
    color: theme.colors.muted,
    fontSize: 11,
  },
  productTotal: {
    color: theme.colors.positive,
    fontSize: 12,
    fontWeight: '700',
  },
  notesText: {
    color: theme.colors.text,
    fontSize: 13,
    lineHeight: 20,
  },
  notesInput: {
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 13,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 40,
  },
  button: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: theme.colors.primary,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  cancelButton: {
    backgroundColor: theme.colors.panelRaised,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
  },
  cancelButtonText: {
    color: theme.colors.muted,
    fontSize: 14,
    fontWeight: '700',
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
