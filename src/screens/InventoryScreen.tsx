import { useState } from 'react';
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
  const addProduct = useAppStore((state) => state.addProduct);
  const adjustProductStock = useAppStore((state) => state.adjustProductStock);
  const currentUser = useAppStore((state) => state.currentUser);
  const products = useAppStore((state) => state.products);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [unit, setUnit] = useState('Bag');
  const [price, setPrice] = useState('');
  const [stockLeft, setStockLeft] = useState('');
  const [minimumStock, setMinimumStock] = useState('');
  const [error, setError] = useState('');

  const canEdit = currentUser?.roleId !== 'delivery';

  const handleAddProduct = () => {
    const parsedPrice = parseWholeNumberInput(price);
    const parsedStockLeft = parseWholeNumberInput(stockLeft);
    const parsedMinimumStock = parseWholeNumberInput(minimumStock);

    if (!name || !category || !parsedPrice || !parsedStockLeft || !parsedMinimumStock) {
      setError('Name, category, and all numeric fields must use whole numbers greater than zero.');
      return;
    }

    addProduct({
      name,
      category,
      unit,
      price: parsedPrice,
      stockLeft: parsedStockLeft,
      minimumStock: parsedMinimumStock,
    });

    setName('');
    setCategory('');
    setUnit('Bag');
    setPrice('');
    setStockLeft('');
    setMinimumStock('');
    setError('');
  };

  return (
    <ScreenShell
      title="Inventory"
      subtitle="Track products, pricing, low-stock levels, and quick adjustments."
      action={
        <Pressable onPress={() => navigation.goBack()} style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Back</Text>
        </Pressable>
      }
    >
      {canEdit ? (
        <SectionCard title="Add product" description="Quick inventory capture for the first build.">
          <View style={styles.formGrid}>
            <TextInput value={name} onChangeText={setName} placeholder="Product name" placeholderTextColor={theme.colors.muted} style={styles.input} />
            <TextInput value={category} onChangeText={setCategory} placeholder="Category" placeholderTextColor={theme.colors.muted} style={styles.input} />
            <TextInput value={unit} onChangeText={setUnit} placeholder="Unit" placeholderTextColor={theme.colors.muted} style={styles.input} />
            <TextInput value={price} onChangeText={setPrice} placeholder="Unit price" placeholderTextColor={theme.colors.muted} keyboardType="numeric" style={styles.input} />
            <TextInput value={stockLeft} onChangeText={setStockLeft} placeholder="Opening stock" placeholderTextColor={theme.colors.muted} keyboardType="numeric" style={styles.input} />
            <TextInput value={minimumStock} onChangeText={setMinimumStock} placeholder="Minimum stock" placeholderTextColor={theme.colors.muted} keyboardType="numeric" style={styles.input} />
          </View>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable onPress={handleAddProduct} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Save product</Text>
          </Pressable>
        </SectionCard>
      ) : null}

      <SectionCard title="Product list" description="Live stock values respond to invoice creation and manual adjustments.">
        {products.map((product) => (
          <View key={product.id} style={styles.productRow}>
            <View style={styles.productCopy}>
              <Text style={styles.productTitle}>{product.name}</Text>
              <Text style={styles.productMeta}>
                {product.category} • {product.unit} • {formatCurrency(product.price)}
              </Text>
              <Text style={styles.productMeta}>
                Stock {product.stockLeft} / Min {product.minimumStock}
              </Text>
            </View>
            {canEdit ? (
              <View style={styles.stockControls}>
                <Pressable onPress={() => adjustProductStock(product.id, -1)} style={styles.stockButton}>
                  <Text style={styles.stockButtonText}>-1</Text>
                </Pressable>
                <Pressable onPress={() => adjustProductStock(product.id, 1)} style={styles.stockButton}>
                  <Text style={styles.stockButtonText}>+1</Text>
                </Pressable>
              </View>
            ) : null}
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
  formGrid: {
    gap: 10,
  },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.panelRaised,
    color: theme.colors.text,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
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
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  productCopy: {
    flex: 1,
  },
  productTitle: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  productMeta: {
    marginTop: 4,
    color: theme.colors.muted,
    fontSize: 13,
  },
  stockControls: {
    gap: 8,
  },
  stockButton: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.panelRaised,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  stockButtonText: {
    color: theme.colors.text,
    fontWeight: '800',
  },
});