import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ScreenShell } from '../components/ScreenShell';
import { SectionCard } from '../components/SectionCard';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { theme } from '../theme';
import { formatCurrency, parseWholeNumberInput } from '../utils/finance';

type Props = NativeStackScreenProps<RootStackParamList, 'Inventory'>;

export function InventoryScreen({ navigation }: Props) {
  const addProduct = useAppStore((s) => s.addProduct);
  const adjustProductStock = useAppStore((s) => s.adjustProductStock);
  const currentUser = useAppStore((s) => s.currentUser);
  const products = useAppStore((s) => s.products);

  // Add product
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [unit, setUnit] = useState('Bag');
  const [price, setPrice] = useState('');
  const [stockLeft, setStockLeft] = useState('');
  const [minimumStock, setMinimumStock] = useState('');
  const [addError, setAddError] = useState('');

  // Bulk adjust
  const [adjustProductId, setAdjustProductId] = useState(products[0]?.id ?? '');
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustType, setAdjustType] = useState<'add' | 'reduce'>('add');
  const [adjustError, setAdjustError] = useState('');
  const [adjustSuccess, setAdjustSuccess] = useState('');

  // Search
  const [search, setSearch] = useState('');

  const canEdit = currentUser?.roleId !== 'delivery';

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.unit.toLowerCase().includes(q)
    );
  }, [products, search]);

  const lowStockCount = products.filter((p) => p.stockLeft <= p.minimumStock).length;

  const handleAddProduct = () => {
    const parsedPrice = parseWholeNumberInput(price);
    const parsedStock = parseWholeNumberInput(stockLeft);
    const parsedMin = parseWholeNumberInput(minimumStock);
    if (!name || !category || !parsedPrice || !parsedStock || !parsedMin) {
      setAddError('All fields are required and must be positive whole numbers.');
      return;
    }
    const result = addProduct({ name, category, unit, price: parsedPrice, stockLeft: parsedStock, minimumStock: parsedMin });
    if (!result.success) { setAddError(result.message ?? 'Failed.'); return; }
    setName(''); setCategory(''); setUnit('Bag'); setPrice(''); setStockLeft(''); setMinimumStock(''); setAddError('');
  };

  const handleAdjust = () => {
    setAdjustError(''); setAdjustSuccess('');
    const qty = parseWholeNumberInput(adjustQty);
    if (!qty) { setAdjustError('Enter a valid quantity.'); return; }
    const delta = adjustType === 'add' ? qty : -qty;
    adjustProductStock(adjustProductId, delta);
    const product = products.find((p) => p.id === adjustProductId);
    setAdjustSuccess(`Stock ${adjustType === 'add' ? 'added' : 'reduced'} for ${product?.name ?? 'product'}.`);
    setAdjustQty('');
    setTimeout(() => setAdjustSuccess(''), 3000);
  };

  return (
    <ScreenShell
      title="Inventory"
      subtitle="Track products, adjust stock, and monitor low-stock alerts."
      action={
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>
      }
    >
      {/* Summary */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Products</Text>
          <Text style={styles.summaryValue}>{products.length}</Text>
        </View>
        <View style={[
          styles.summaryCard,
          lowStockCount > 0 ? { borderColor: '#FECACA', backgroundColor: '#FFF5F5' } : { borderColor: '#BBF7D0', backgroundColor: '#F0FDF4' },
        ]}>
          <Text style={styles.summaryLabel}>Low stock</Text>
          <Text style={[styles.summaryValue, { color: lowStockCount > 0 ? theme.colors.negative : theme.colors.positive }]}>
            {lowStockCount}
          </Text>
        </View>
      </View>

      {/* Bulk stock adjustment */}
      {canEdit ? (
        <SectionCard title="Adjust Stock" description="Record stock received from suppliers or manual reductions.">
          <View style={styles.adjustTypeRow}>
            <Pressable
              onPress={() => setAdjustType('add')}
              style={[styles.adjustTypeBtn, adjustType === 'add' ? styles.adjustTypeBtnAddActive : null]}
            >
              <Text style={[styles.adjustTypeBtnText, adjustType === 'add' ? { color: '#065F46' } : null]}>
                + Stock In
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setAdjustType('reduce')}
              style={[styles.adjustTypeBtn, adjustType === 'reduce' ? styles.adjustTypeBtnReduceActive : null]}
            >
              <Text style={[styles.adjustTypeBtnText, adjustType === 'reduce' ? { color: '#991B1B' } : null]}>
                − Stock Out
              </Text>
            </Pressable>
          </View>

          <Text style={styles.groupLabel}>Product</Text>
          <View style={styles.chipWrap}>
            {products.map((p) => (
              <Pressable
                key={p.id}
                onPress={() => setAdjustProductId(p.id)}
                style={[styles.chip, p.id === adjustProductId ? styles.chipActive : null]}
              >
                <Text style={[styles.chipText, p.id === adjustProductId ? styles.chipTextActive : null]}>
                  {p.name}
                </Text>
              </Pressable>
            ))}
          </View>

          <TextInput
            value={adjustQty}
            onChangeText={setAdjustQty}
            keyboardType="numeric"
            placeholder="Quantity"
            placeholderTextColor={theme.colors.muted}
            style={styles.input}
          />

          {adjustError ? <Text style={styles.error}>{adjustError}</Text> : null}
          {adjustSuccess ? <Text style={styles.successText}>{adjustSuccess}</Text> : null}

          <Pressable
            onPress={handleAdjust}
            style={[styles.adjustBtn, { backgroundColor: adjustType === 'add' ? theme.colors.positive : theme.colors.negative }]}
          >
            <Text style={styles.adjustBtnText}>
              {adjustType === 'add' ? 'Confirm Stock In' : 'Confirm Stock Out'}
            </Text>
          </Pressable>
        </SectionCard>
      ) : null}

      {/* Add product */}
      {canEdit ? (
        <SectionCard title="Add Product" description="Register a new product for billing and inventory tracking.">
          <View style={styles.formGrid}>
            <TextInput value={name} onChangeText={setName} placeholder="Product name" placeholderTextColor={theme.colors.muted} style={styles.input} />
            <TextInput value={category} onChangeText={setCategory} placeholder="Category (e.g. Cement, Tiles)" placeholderTextColor={theme.colors.muted} style={styles.input} />
            <TextInput value={unit} onChangeText={setUnit} placeholder="Unit (Bag, Piece, Box)" placeholderTextColor={theme.colors.muted} style={styles.input} />
            <TextInput value={price} onChangeText={setPrice} placeholder="Unit price (₹)" placeholderTextColor={theme.colors.muted} keyboardType="numeric" style={styles.input} />
            <TextInput value={stockLeft} onChangeText={setStockLeft} placeholder="Opening stock qty" placeholderTextColor={theme.colors.muted} keyboardType="numeric" style={styles.input} />
            <TextInput value={minimumStock} onChangeText={setMinimumStock} placeholder="Minimum stock qty" placeholderTextColor={theme.colors.muted} keyboardType="numeric" style={styles.input} />
          </View>
          {addError ? <Text style={styles.error}>{addError}</Text> : null}
          <Pressable onPress={handleAddProduct} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Save Product</Text>
          </Pressable>
        </SectionCard>
      ) : null}

      {/* Product list with search */}
      <SectionCard title="Product List" description="Stock updates automatically on each invoice created.">
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search products…"
          placeholderTextColor={theme.colors.muted}
          style={styles.searchInput}
        />
        {filtered.length === 0 ? (
          <Text style={styles.emptyText}>No products match your search.</Text>
        ) : null}
        {filtered.map((product) => {
          const isLow = product.stockLeft <= product.minimumStock;
          return (
            <View key={product.id} style={styles.productRow}>
              <View style={styles.productCopy}>
                <View style={styles.productTitleRow}>
                  <Text style={styles.productTitle}>{product.name}</Text>
                  {isLow ? (
                    <View style={styles.lowBadge}>
                      <Text style={styles.lowBadgeText}>Low stock</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.productMeta}>
                  {product.category} · {product.unit} · {formatCurrency(product.price)}
                </Text>
                <Text style={[styles.stockMeta, isLow ? styles.stockMetaLow : null]}>
                  Stock: {product.stockLeft} · Min: {product.minimumStock}
                </Text>
              </View>
            </View>
          );
        })}
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
  summaryRow: { flexDirection: 'row', gap: 10 },
  summaryCard: {
    flex: 1, padding: 16, borderRadius: 14, backgroundColor: theme.colors.panel,
    borderWidth: 1, borderColor: theme.colors.border, gap: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  summaryLabel: { color: theme.colors.muted, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  summaryValue: { fontSize: 26, fontWeight: '800', color: theme.colors.text },
  adjustTypeRow: { flexDirection: 'row', gap: 10 },
  adjustTypeBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1.5,
    borderColor: theme.colors.border, backgroundColor: theme.colors.panelRaised, alignItems: 'center',
  },
  adjustTypeBtnAddActive: { borderColor: '#10B981', backgroundColor: '#F0FDF4' },
  adjustTypeBtnReduceActive: { borderColor: '#F87171', backgroundColor: '#FFF5F5' },
  adjustTypeBtnText: { fontSize: 14, fontWeight: '700', color: theme.colors.muted },
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
  input: {
    marginTop: 10, borderRadius: 10, borderWidth: 1.5, borderColor: theme.colors.border,
    backgroundColor: theme.colors.panelRaised, color: theme.colors.text,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15,
  },
  error: { marginTop: 10, color: theme.colors.negative, fontSize: 13, fontWeight: '600' },
  successText: { marginTop: 10, color: theme.colors.positive, fontSize: 13, fontWeight: '700' },
  adjustBtn: { marginTop: 14, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  adjustBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  formGrid: { gap: 4 },
  primaryButton: {
    marginTop: 14, borderRadius: 12, backgroundColor: theme.colors.accent, paddingVertical: 14, alignItems: 'center',
  },
  primaryButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  searchInput: {
    borderRadius: 10, borderWidth: 1.5, borderColor: theme.colors.border,
    backgroundColor: theme.colors.panelRaised, color: theme.colors.text,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, marginBottom: 4,
  },
  emptyText: { color: theme.colors.muted, fontSize: 14, textAlign: 'center', paddingVertical: 16 },
  productRow: {
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.border,
  },
  productCopy: { gap: 3 },
  productTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  productTitle: { color: theme.colors.text, fontSize: 15, fontWeight: '700' },
  lowBadge: { backgroundColor: '#FEE2E2', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  lowBadgeText: { color: theme.colors.negative, fontSize: 11, fontWeight: '700' },
  productMeta: { color: theme.colors.muted, fontSize: 13 },
  stockMeta: { color: theme.colors.muted, fontSize: 12, fontWeight: '500' },
  stockMetaLow: { color: theme.colors.negative, fontWeight: '700' },
});
