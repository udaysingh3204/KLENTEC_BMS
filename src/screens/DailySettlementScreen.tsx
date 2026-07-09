import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable, Alert, TextInput } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ScreenShell } from '../components/ScreenShell';
import { SectionCard } from '../components/SectionCard';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { theme } from '../theme';
import { formatCurrency } from '../utils/finance';

type Props = NativeStackScreenProps<RootStackParamList, 'DailySettlement'>;

export function DailySettlementScreen({ navigation }: Props) {
  const invoices = useAppStore((s) => s.invoices);

  const [actualCash, setActualCash] = useState('');
  const [actualUPI, setActualUPI] = useState('');
  const [notes, setNotes] = useState('');
  const [settlementDone, setSettlementDone] = useState(false);

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  const dailyData = useMemo(() => {
    const dayInvoices = invoices.filter((i) => i.createdAt.split('T')[0] === today);

    const expectedCash = dayInvoices.reduce((sum, inv) => {
      if (inv.paymentMode === 'Cash') return sum + inv.total;
      if (inv.cashPaid) return sum + inv.cashPaid;
      return sum;
    }, 0);

    const expectedUPI = dayInvoices.reduce((sum, inv) => {
      if (inv.paymentMode === 'UPI') return sum + inv.total;
      if (inv.upiPaid) return sum + inv.upiPaid;
      return sum;
    }, 0);

    return {
      invoiceCount: dayInvoices.length,
      expectedCash,
      expectedUPI,
      totalExpected: expectedCash + expectedUPI,
    };
  }, [invoices, today]);

  const handleSettle = () => {
    if (!actualCash && !actualUPI) {
      Alert.alert('Error', 'Please enter actual cash or UPI amount');
      return;
    }

    const actualCashNum = parseFloat(actualCash) || 0;
    const actualUPINum = parseFloat(actualUPI) || 0;

    const cashDiff = actualCashNum - dailyData.expectedCash;
    const upiDiff = actualUPINum - dailyData.expectedUPI;

    let status = '✓ MATCHED';
    let alertTitle = 'Settlement Complete';
    let alertMsg = 'All amounts match perfectly!\n';

    if (cashDiff !== 0) {
      status = '⚠️ DISCREPANCY';
      alertMsg += `Cash: ${cashDiff > 0 ? '+' : ''}${formatCurrency(cashDiff)}\n`;
    }

    if (upiDiff !== 0) {
      status = '⚠️ DISCREPANCY';
      alertMsg += `UPI: ${upiDiff > 0 ? '+' : ''}${formatCurrency(upiDiff)}\n`;
    }

    alertMsg += `\nNote: ${notes || 'No notes'}`;

    Alert.alert(alertTitle, alertMsg, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm Settlement',
        onPress: () => {
          setSettlementDone(true);
          Alert.alert(
            'Settlement Locked',
            'Daily settlement has been locked and recorded. This cannot be modified.'
          );
        },
      },
    ]);
  };

  const actualCashNum = parseFloat(actualCash) || 0;
  const actualUPINum = parseFloat(actualUPI) || 0;
  const cashDiff = actualCashNum - dailyData.expectedCash;
  const upiDiff = actualUPINum - dailyData.expectedUPI;
  const totalDiff = cashDiff + upiDiff;

  return (
    <ScreenShell
      title="Daily Settlement"
      subtitle="Reconcile actual cash/UPI with app records"
      action={
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>
      }
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {settlementDone && (
          <View style={styles.lockedBanner}>
            <Text style={styles.lockedText}>🔒 Settlement Locked</Text>
            <Text style={styles.lockedSubtext}>Today's settlement has been recorded and cannot be modified</Text>
          </View>
        )}

        {/* Today's Summary */}
        <SectionCard title="Today's Summary" description={`${dailyData.invoiceCount} invoices recorded`}>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Expected Cash</Text>
              <Text style={[styles.summaryValue, { color: theme.colors.positive }]}>
                {formatCurrency(dailyData.expectedCash)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Expected UPI</Text>
              <Text style={[styles.summaryValue, { color: theme.colors.positive }]}>
                {formatCurrency(dailyData.expectedUPI)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Expected</Text>
              <Text style={[styles.summaryValue, { fontWeight: '800' }]}>
                {formatCurrency(dailyData.totalExpected)}
              </Text>
            </View>
          </View>
        </SectionCard>

        {/* Actual Amounts */}
        <SectionCard
          title="Actual Amounts"
          description="Enter the physical cash & UPI you have/received"
        >
          <View>
            <Text style={styles.fieldLabel}>Actual Cash (₹)</Text>
            <TextInput
              value={actualCash}
              onChangeText={setActualCash}
              placeholder="Enter actual cash on hand"
              keyboardType="decimal-pad"
              placeholderTextColor={theme.colors.muted}
              style={styles.input}
              editable={!settlementDone}
            />

            <Text style={styles.fieldLabel}>Actual UPI (₹)</Text>
            <TextInput
              value={actualUPI}
              onChangeText={setActualUPI}
              placeholder="Enter UPI received in bank"
              keyboardType="decimal-pad"
              placeholderTextColor={theme.colors.muted}
              style={styles.input}
              editable={!settlementDone}
            />
          </View>
        </SectionCard>

        {/* Discrepancy Analysis */}
        {(actualCash || actualUPI) && (
          <SectionCard title="Reconciliation Status" description="Difference between actual and expected">
            <View style={styles.discrepancyGrid}>
              <View
                style={[
                  styles.discrepancyItem,
                  cashDiff === 0 ? styles.matched : styles.discrepancy,
                ]}
              >
                <Text style={styles.discrepancyLabel}>Cash Difference</Text>
                <Text
                  style={[
                    styles.discrepancyValue,
                    {
                      color:
                        cashDiff === 0
                          ? theme.colors.positive
                          : cashDiff > 0
                            ? theme.colors.warning
                            : theme.colors.negative,
                    },
                  ]}
                >
                  {cashDiff === 0 ? '✓ Matched' : `${cashDiff > 0 ? '+' : ''}${formatCurrency(cashDiff)}`}
                </Text>
              </View>

              <View
                style={[
                  styles.discrepancyItem,
                  upiDiff === 0 ? styles.matched : styles.discrepancy,
                ]}
              >
                <Text style={styles.discrepancyLabel}>UPI Difference</Text>
                <Text
                  style={[
                    styles.discrepancyValue,
                    {
                      color:
                        upiDiff === 0
                          ? theme.colors.positive
                          : upiDiff > 0
                            ? theme.colors.warning
                            : theme.colors.negative,
                    },
                  ]}
                >
                  {upiDiff === 0 ? '✓ Matched' : `${upiDiff > 0 ? '+' : ''}${formatCurrency(upiDiff)}`}
                </Text>
              </View>

              <View
                style={[
                  styles.discrepancyItem,
                  totalDiff === 0 ? styles.matched : styles.discrepancy,
                ]}
              >
                <Text style={styles.discrepancyLabel}>Total Difference</Text>
                <Text
                  style={[
                    styles.discrepancyValue,
                    {
                      color:
                        totalDiff === 0
                          ? theme.colors.positive
                          : totalDiff > 0
                            ? theme.colors.warning
                            : theme.colors.negative,
                    },
                  ]}
                >
                  {totalDiff === 0 ? '✓ Matched' : `${totalDiff > 0 ? '+' : ''}${formatCurrency(totalDiff)}`}
                </Text>
              </View>
            </View>

            {totalDiff !== 0 && (
              <View style={styles.warningBox}>
                <Text style={styles.warningTitle}>⚠️ Discrepancy Found</Text>
                <Text style={styles.warningText}>
                  {totalDiff > 0
                    ? `You have ${formatCurrency(Math.abs(totalDiff))} more than expected.`
                    : `You have ${formatCurrency(Math.abs(totalDiff))} less than expected.`}
                </Text>
                <Text style={styles.warningSubtext}>Check your records or note the difference below.</Text>
              </View>
            )}
          </SectionCard>
        )}

        {/* Notes */}
        <SectionCard title="Settlement Notes" description="Why there's a difference (optional)">
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="e.g., ₹500 damaged/lost, pending deposit, etc."
            placeholderTextColor={theme.colors.muted}
            style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]}
            multiline
            editable={!settlementDone}
          />
        </SectionCard>

        {/* Locked Settlement */}
        {settlementDone && (
          <SectionCard title="Settlement Record" description="Locked - Cannot be modified">
            <View style={styles.lockedRecord}>
              <View style={styles.recordRow}>
                <Text style={styles.recordLabel}>Settled Cash:</Text>
                <Text style={styles.recordValue}>{formatCurrency(actualCashNum)}</Text>
              </View>
              <View style={styles.recordRow}>
                <Text style={styles.recordLabel}>Settled UPI:</Text>
                <Text style={styles.recordValue}>{formatCurrency(actualUPINum)}</Text>
              </View>
              <View style={styles.recordRow}>
                <Text style={styles.recordLabel}>Time:</Text>
                <Text style={styles.recordValue}>
                  {new Date().toLocaleString('en-IN')}
                </Text>
              </View>
              {notes && (
                <View style={styles.recordRow}>
                  <Text style={styles.recordLabel}>Notes:</Text>
                  <Text style={styles.recordValue}>{notes}</Text>
                </View>
              )}
            </View>
          </SectionCard>
        )}

        {/* Settlement Button */}
        {!settlementDone && (
          <View style={styles.buttonSection}>
            <Pressable
              onPress={handleSettle}
              disabled={!actualCash && !actualUPI}
              style={[styles.settleButton, (!actualCash && !actualUPI) && styles.settleButtonDisabled]}
            >
              <Text style={styles.settleButtonText}>Complete Settlement</Text>
            </Pressable>
            <Text style={styles.settleNote}>
              ⚠️ Once settled, this record is locked. Make sure all numbers match before confirming.
            </Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
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

  lockedBanner: {
    backgroundColor: theme.colors.primary + '20',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  lockedText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  lockedSubtext: {
    color: theme.colors.primary + 'CC',
    fontSize: 12,
    marginTop: 4,
  },

  summaryGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryItem: {
    flex: 1,
    backgroundColor: theme.colors.panelRaised,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  summaryLabel: {
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: '600',
  },
  summaryValue: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '800',
  },

  fieldLabel: {
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
    fontSize: 14,
  },

  discrepancyGrid: {
    gap: 12,
  },
  discrepancyItem: {
    backgroundColor: theme.colors.panelRaised,
    borderRadius: 10,
    padding: 12,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  matched: {
    borderColor: theme.colors.positive,
    backgroundColor: theme.colors.positive + '10',
  },
  discrepancy: {
    borderColor: theme.colors.warning || theme.colors.negative,
  },
  discrepancyLabel: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  discrepancyValue: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
  },

  warningBox: {
    backgroundColor: (theme.colors.warning || theme.colors.negative) + '15',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.warning || theme.colors.negative,
  },
  warningTitle: {
    color: theme.colors.warning || theme.colors.negative,
    fontSize: 13,
    fontWeight: '700',
  },
  warningText: {
    color: theme.colors.text,
    fontSize: 12,
    marginTop: 4,
  },
  warningSubtext: {
    color: theme.colors.muted,
    fontSize: 11,
    marginTop: 4,
  },

  lockedRecord: {
    backgroundColor: theme.colors.panelRaised,
    borderRadius: 10,
    padding: 12,
    gap: 10,
  },
  recordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  recordLabel: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  recordValue: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '700',
  },

  buttonSection: {
    marginHorizontal: 16,
    gap: 12,
    marginBottom: 20,
  },
  settleButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  settleButtonDisabled: {
    opacity: 0.5,
  },
  settleButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  settleNote: {
    color: theme.colors.negative,
    fontSize: 11,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
