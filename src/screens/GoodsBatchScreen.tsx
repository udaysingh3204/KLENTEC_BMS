import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ScreenShell } from '../components/ScreenShell';
import { SectionCard } from '../components/SectionCard';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { theme } from '../theme';
import { formatCurrency } from '../utils/finance';

type Props = NativeStackScreenProps<RootStackParamList, 'GoodsBatch'>;

export function GoodsBatchScreen({ navigation }: Props) {
  const goodsPurchases = useAppStore((s) => s.goodsPurchases);
  const goodsSales = useAppStore((s) => s.goodsSales);
  const addGoodsPurchase = useAppStore((s) => s.addGoodsPurchase);
  const addGoodsSale = useAppStore((s) => s.addGoodsSale);

  const [tab, setTab] = useState<'purchase' | 'sale' | 'ledger'>('purchase');
  const [error, setError] = useState('');

  // Purchase Form
  const [purchaseItemName, setPurchaseItemName] = useState('');
  const [purchaseDesc, setPurchaseDesc] = useState('');
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [purchaseNotes, setPurchaseNotes] = useState('');

  // Sale Form
  const [selectedPurchaseId, setSelectedPurchaseId] = useState(goodsPurchases[0]?.id || '');
  const [saleAmount, setSaleAmount] = useState('');
  const [saleStatus, setSaleStatus] = useState<'Partial' | 'Full'>('Partial');
  const [saleNotes, setSaleNotes] = useState('');

  // Batch Summary
  const batchSummary = useMemo(() => {
    const summary: Record<
      string,
      {
        itemName: string;
        purchaseAmount: number;
        totalSaleAmount: number;
        status: string;
        profit: number;
      }
    > = {};

    goodsPurchases.forEach((purchase) => {
      summary[purchase.id] = {
        itemName: purchase.itemName,
        purchaseAmount: purchase.purchaseAmount,
        totalSaleAmount: 0,
        status: 'Pending',
        profit: 0,
      };
    });

    goodsSales.forEach((sale) => {
      if (summary[sale.purchaseId]) {
        summary[sale.purchaseId].totalSaleAmount += sale.saleAmount;
        summary[sale.purchaseId].profit =
          summary[sale.purchaseId].totalSaleAmount - summary[sale.purchaseId].purchaseAmount;
        if (sale.status === 'Full') {
          summary[sale.purchaseId].status = 'Sold';
        } else if (summary[sale.purchaseId].status === 'Pending') {
          summary[sale.purchaseId].status = 'Partial Sale';
        }
      }
    });

    return summary;
  }, [goodsPurchases, goodsSales]);

  const handleAddPurchase = () => {
    setError('');

    if (!purchaseItemName.trim()) {
      setError('Item name required');
      return;
    }
    if (!purchaseDesc.trim()) {
      setError('Description required');
      return;
    }
    if (!purchaseAmount || isNaN(Number(purchaseAmount))) {
      setError('Valid amount required');
      return;
    }

    const result = addGoodsPurchase({
      itemName: purchaseItemName.trim(),
      description: purchaseDesc.trim(),
      purchaseAmount: Number(purchaseAmount),
      notes: purchaseNotes.trim() || undefined,
    });

    if (result.success) {
      setPurchaseItemName('');
      setPurchaseDesc('');
      setPurchaseAmount('');
      setPurchaseNotes('');
      setError('');
    } else {
      setError(result.message || 'Failed to add purchase');
    }
  };

  const handleAddSale = () => {
    setError('');

    if (!selectedPurchaseId) {
      setError('Select a purchase batch');
      return;
    }
    if (!saleAmount || isNaN(Number(saleAmount))) {
      setError('Valid sale amount required');
      return;
    }

    const result = addGoodsSale({
      purchaseId: selectedPurchaseId,
      saleAmount: Number(saleAmount),
      status: saleStatus,
      notes: saleNotes.trim() || undefined,
    });

    if (result.success) {
      setSaleAmount('');
      setSaleStatus('Partial');
      setSaleNotes('');
      setError('');
    } else {
      setError(result.message || 'Failed to add sale');
    }
  };

  return (
    <ScreenShell
      title="Goods Batch Tracking"
      subtitle="Admin: Record goods purchase & sales at batch level"
      action={
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>
      }
    >
      {/* Tab Navigation */}
      <View style={styles.tabNav}>
        <Pressable
          onPress={() => setTab('purchase')}
          style={[styles.tab, tab === 'purchase' && styles.tabActive]}
        >
          <Text style={[styles.tabText, tab === 'purchase' && styles.tabTextActive]}>
            Record Purchase
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setTab('sale')}
          style={[styles.tab, tab === 'sale' && styles.tabActive]}
        >
          <Text style={[styles.tabText, tab === 'sale' && styles.tabTextActive]}>
            Record Sale
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setTab('ledger')}
          style={[styles.tab, tab === 'ledger' && styles.tabActive]}
        >
          <Text style={[styles.tabText, tab === 'ledger' && styles.tabTextActive]}>Ledger</Text>
        </Pressable>
      </View>

      {/* Purchase Tab */}
      {tab === 'purchase' && (
        <SectionCard
          title="Record Goods Purchase"
          description="When goods arrive, record the batch and amount paid"
        >
          <TextInput
            value={purchaseItemName}
            onChangeText={setPurchaseItemName}
            placeholder="Item name (e.g., Rice)"
            placeholderTextColor={theme.colors.muted}
            style={styles.input}
          />
          <TextInput
            value={purchaseDesc}
            onChangeText={setPurchaseDesc}
            placeholder="Description (e.g., 1000 bags)"
            placeholderTextColor={theme.colors.muted}
            style={styles.input}
          />
          <TextInput
            value={purchaseAmount}
            onChangeText={setPurchaseAmount}
            keyboardType="numeric"
            placeholder="Purchase amount (₹)"
            placeholderTextColor={theme.colors.muted}
            style={styles.input}
          />
          <TextInput
            value={purchaseNotes}
            onChangeText={setPurchaseNotes}
            placeholder="Notes (optional)"
            placeholderTextColor={theme.colors.muted}
            style={[styles.input, styles.inputMultiline]}
            multiline
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable onPress={handleAddPurchase} style={styles.submitButton}>
            <Text style={styles.submitButtonText}>Record Purchase</Text>
          </Pressable>
        </SectionCard>
      )}

      {/* Sale Tab */}
      {tab === 'sale' && (
        <SectionCard
          title="Record Goods Sale"
          description="When goods are sold, record sale amount and completion status"
        >
          {goodsPurchases.length === 0 ? (
            <Text style={styles.emptyText}>No purchase batches. Create one first.</Text>
          ) : (
            <>
              <Text style={styles.label}>Select Batch</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipWrap}
              >
                {goodsPurchases.map((purchase) => (
                  <Pressable
                    key={purchase.id}
                    onPress={() => setSelectedPurchaseId(purchase.id)}
                    style={[
                      styles.chip,
                      selectedPurchaseId === purchase.id && styles.chipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selectedPurchaseId === purchase.id && styles.chipTextActive,
                      ]}
                    >
                      {purchase.itemName} ({formatCurrency(purchase.purchaseAmount)})
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>

              <TextInput
                value={saleAmount}
                onChangeText={setSaleAmount}
                keyboardType="numeric"
                placeholder="Sale amount (₹)"
                placeholderTextColor={theme.colors.muted}
                style={styles.input}
              />

              <Text style={styles.label}>Sale Status</Text>
              <View style={styles.chipWrap}>
                {(['Partial', 'Full'] as const).map((status) => (
                  <Pressable
                    key={status}
                    onPress={() => setSaleStatus(status)}
                    style={[styles.chip, saleStatus === status && styles.chipActive]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        saleStatus === status && styles.chipTextActive,
                      ]}
                    >
                      {status}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <TextInput
                value={saleNotes}
                onChangeText={setSaleNotes}
                placeholder="Notes (optional)"
                placeholderTextColor={theme.colors.muted}
                style={[styles.input, styles.inputMultiline]}
                multiline
              />

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <Pressable onPress={handleAddSale} style={styles.submitButton}>
                <Text style={styles.submitButtonText}>Record Sale</Text>
              </Pressable>
            </>
          )}
        </SectionCard>
      )}

      {/* Ledger Tab */}
      {tab === 'ledger' && (
        <>
          {Object.keys(batchSummary).length === 0 ? (
            <SectionCard title="Batch Ledger" description="No batches recorded yet">
              <Text style={styles.emptyText}>Create a purchase to get started</Text>
            </SectionCard>
          ) : (
            <SectionCard
              title="Batch Ledger"
              description="Overview of all goods batches and their profit/loss"
            >
              {Object.entries(batchSummary).map(([batchId, batch]) => (
                <View key={batchId} style={styles.batchRow}>
                  <View style={styles.batchInfo}>
                    <Text style={styles.batchName}>{batch.itemName}</Text>
                    <Text style={styles.batchMeta}>{batch.status}</Text>
                  </View>

                  <View style={styles.batchFinancials}>
                    <View style={styles.financialItem}>
                      <Text style={styles.financialLabel}>Cost</Text>
                      <Text style={styles.financialValue}>
                        {formatCurrency(batch.purchaseAmount)}
                      </Text>
                    </View>

                    <View style={styles.financialItem}>
                      <Text style={styles.financialLabel}>Sale</Text>
                      <Text style={[styles.financialValue, { color: theme.colors.positive }]}>
                        {formatCurrency(batch.totalSaleAmount)}
                      </Text>
                    </View>

                    <View style={styles.financialItem}>
                      <Text style={styles.financialLabel}>Profit</Text>
                      <Text
                        style={[
                          styles.financialValue,
                          {
                            color: batch.profit >= 0 ? theme.colors.positive : theme.colors.negative,
                          },
                        ]}
                      >
                        {batch.profit >= 0 ? '+' : '−'}{formatCurrency(Math.abs(batch.profit))}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.divider} />
                </View>
              ))}
            </SectionCard>
          )}
        </>
      )}
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

  tabNav: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.panelRaised,
  },
  tabActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  tabText: { color: theme.colors.muted, fontSize: 12, fontWeight: '700', textAlign: 'center' },
  tabTextActive: { color: '#FFFFFF' },

  label: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 8,
  },

  input: {
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.panelRaised,
    color: theme.colors.text,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 12,
  },
  inputMultiline: { minHeight: 70, paddingTop: 12, textAlignVertical: 'top' },

  error: { color: theme.colors.negative, fontSize: 13, fontWeight: '600', marginBottom: 12 },

  submitButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },

  chipWrap: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 12 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.panelRaised,
  },
  chipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  chipText: { color: theme.colors.text, fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: '#FFFFFF' },

  emptyText: {
    color: theme.colors.muted,
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },

  batchRow: { marginBottom: 12 },
  batchInfo: { marginBottom: 8 },
  batchName: { color: theme.colors.text, fontSize: 14, fontWeight: '700' },
  batchMeta: { color: theme.colors.muted, fontSize: 12 },

  batchFinancials: { flexDirection: 'row', gap: 12, paddingVertical: 12 },
  financialItem: { flex: 1, backgroundColor: theme.colors.panelRaised, borderRadius: 10, padding: 10 },
  financialLabel: { color: theme.colors.muted, fontSize: 11, fontWeight: '600', marginBottom: 4 },
  financialValue: { color: theme.colors.text, fontSize: 14, fontWeight: '700' },

  divider: { height: 1, backgroundColor: theme.colors.border, marginTop: 12 },
});
