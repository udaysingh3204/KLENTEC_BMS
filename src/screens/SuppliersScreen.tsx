import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ScreenShell } from '../components/ScreenShell';
import { SectionCard } from '../components/SectionCard';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { theme } from '../theme';
import { Supplier } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Suppliers'>;

const supplierStatuses: Supplier['status'][] = ['Active', 'Inactive'];

export function SuppliersScreen({ navigation }: Props) {
  const addSupplier = useAppStore((state) => state.addSupplier);
  const suppliers = useAppStore((state) => state.suppliers);

  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState('');
  const [materials, setMaterials] = useState('');
  const [status, setStatus] = useState<Supplier['status']>('Active');
  const [error, setError] = useState('');

  const activeSuppliers = useMemo(
    () => suppliers.filter((supplier) => supplier.status === 'Active').length,
    [suppliers]
  );

  const handleSave = () => {
    const result = addSupplier({
      name,
      contactPerson,
      phone,
      address,
      category,
      materials,
      status,
    });

    if (!result.success) {
      setError(result.message ?? 'Unable to save supplier.');
      return;
    }

    setName('');
    setContactPerson('');
    setPhone('');
    setAddress('');
    setCategory('');
    setMaterials('');
    setStatus('Active');
    setError('');
  };

  return (
    <ScreenShell
      title="Supplier records"
      subtitle="Maintain trusted suppliers with contact details, material coverage, and current availability."
      action={
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>
      }
    >
      <SectionCard title="Supplier summary" description="Quick view of active partners and purchasing coverage.">
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total suppliers</Text>
            <Text style={styles.summaryValue}>{suppliers.length}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Active suppliers</Text>
            <Text style={styles.summaryValue}>{activeSuppliers}</Text>
          </View>
        </View>
      </SectionCard>

      <SectionCard title="Add supplier" description="Capture the minimum details the admin team needs for restocking and follow-up.">
        <TextInput value={name} onChangeText={setName} placeholder="Supplier name" placeholderTextColor={theme.colors.muted} style={styles.input} />
        <TextInput value={contactPerson} onChangeText={setContactPerson} placeholder="Contact person" placeholderTextColor={theme.colors.muted} style={styles.input} />
        <TextInput value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="Phone number" placeholderTextColor={theme.colors.muted} style={styles.input} />
        <TextInput value={address} onChangeText={setAddress} placeholder="Address or market location" placeholderTextColor={theme.colors.muted} style={styles.input} />
        <TextInput value={category} onChangeText={setCategory} placeholder="Primary category" placeholderTextColor={theme.colors.muted} style={styles.input} />
        <TextInput value={materials} onChangeText={setMaterials} placeholder="Materials supplied" placeholderTextColor={theme.colors.muted} style={[styles.input, styles.multilineInput]} multiline />
        <View style={styles.statusRow}>
          {supplierStatuses.map((entry) => {
            const isSelected = status === entry;

            return (
              <Pressable
                key={entry}
                onPress={() => setStatus(entry)}
                style={[styles.statusChip, isSelected ? styles.statusChipSelected : null]}
              >
                <Text style={[styles.statusChipText, isSelected ? styles.statusChipTextSelected : null]}>{entry}</Text>
              </Pressable>
            );
          })}
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable onPress={handleSave} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Save supplier</Text>
        </Pressable>
      </SectionCard>

      <SectionCard title="Supplier directory" description="Keep purchasing contacts easy to find during live operations.">
        {suppliers.map((supplier) => (
          <View key={supplier.id} style={styles.supplierCard}>
            <View style={styles.supplierHeader}>
              <View style={styles.supplierCopy}>
                <Text style={styles.supplierName}>{supplier.name}</Text>
                <Text style={styles.supplierMeta}>{supplier.category} • {supplier.contactPerson}</Text>
              </View>
              <View style={[styles.badge, supplier.status === 'Active' ? styles.badgeActive : styles.badgeInactive]}>
                <Text style={styles.badgeText}>{supplier.status}</Text>
              </View>
            </View>
            <Text style={styles.detailLabel}>Phone</Text>
            <Text style={styles.detailValue}>{supplier.phone}</Text>
            <Text style={styles.detailLabel}>Address</Text>
            <Text style={styles.detailValue}>{supplier.address}</Text>
            <Text style={styles.detailLabel}>Materials</Text>
            <Text style={styles.detailValue}>{supplier.materials}</Text>
          </View>
        ))}
      </SectionCard>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    borderRadius: 18,
    backgroundColor: theme.colors.panelRaised,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 8,
  },
  summaryLabel: {
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  summaryValue: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: '800',
  },
  input: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 12,
    color: theme.colors.text,
    backgroundColor: theme.colors.panelRaised,
  },
  multilineInput: {
    minHeight: 92,
    textAlignVertical: 'top',
  },
  statusRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  statusChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.panelRaised,
    alignItems: 'center',
  },
  statusChipSelected: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.badge,
  },
  statusChipText: {
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  statusChipTextSelected: {
    color: theme.colors.text,
  },
  error: {
    marginBottom: 12,
    color: theme.colors.warning,
    fontSize: 13,
    fontWeight: '600',
  },
  primaryButton: {
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: theme.colors.accent,
  },
  primaryButtonText: {
    color: theme.colors.background,
    fontSize: 15,
    fontWeight: '800',
  },
  backButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: theme.colors.panelRaised,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  backButtonText: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  supplierCard: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: 6,
  },
  supplierHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  supplierCopy: {
    flex: 1,
    gap: 4,
  },
  supplierName: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  supplierMeta: {
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeActive: {
    backgroundColor: theme.colors.badge,
    borderWidth: 1,
    borderColor: theme.colors.positive,
  },
  badgeInactive: {
    backgroundColor: theme.colors.panelRaised,
    borderWidth: 1,
    borderColor: theme.colors.warning,
  },
  badgeText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  detailLabel: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  detailValue: {
    color: theme.colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
});