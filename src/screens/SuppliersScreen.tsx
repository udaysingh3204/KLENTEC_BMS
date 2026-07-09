import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
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
  const addSupplier = useAppStore((s) => s.addSupplier);
  const deleteSupplier = useAppStore((s) => s.deleteSupplier);
  const editSupplier = useAppStore((s) => s.editSupplier);
  const suppliers = useAppStore((s) => s.suppliers);

  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState('');
  const [materials, setMaterials] = useState('');
  const [status, setStatus] = useState<Supplier['status']>('Active');
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editContactPerson, setEditContactPerson] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editMaterials, setEditMaterials] = useState('');
  const [editStatus, setEditStatus] = useState<Supplier['status']>('Active');
  const [editError, setEditError] = useState('');

  const activeSuppliers = useMemo(
    () => suppliers.filter((s) => s.status === 'Active').length,
    [suppliers]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return suppliers;
    return suppliers.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.contactPerson.toLowerCase().includes(q) ||
        s.materials.toLowerCase().includes(q)
    );
  }, [suppliers, search]);

  const handleSave = () => {
    const result = addSupplier({ name, contactPerson, phone, address, category, materials, status });
    if (!result.success) { setError(result.message ?? 'Unable to save.'); return; }
    setName(''); setContactPerson(''); setPhone(''); setAddress('');
    setCategory(''); setMaterials(''); setStatus('Active'); setError('');
  };

  const handleEditSupplier = (id: string) => {
    const sup = suppliers.find((s) => s.id === id);
    if (!sup) return;
    setEditingId(id);
    setEditName(sup.name);
    setEditContactPerson(sup.contactPerson);
    setEditPhone(sup.phone);
    setEditAddress(sup.address);
    setEditCategory(sup.category);
    setEditMaterials(sup.materials);
    setEditStatus(sup.status);
    setEditError('');
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    const result = editSupplier(editingId, { name: editName, contactPerson: editContactPerson, phone: editPhone, address: editAddress, category: editCategory, materials: editMaterials, status: editStatus });
    if (!result.success) { setEditError(result.message ?? 'Unable to save.'); return; }
    setEditingId(null);
  };

  const handleDeleteSupplier = (id: string) => {
    const sup = suppliers.find((s) => s.id === id);
    if (!sup) return;
    Alert.alert('Delete Supplier', `Remove ${sup.name} from suppliers?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          const result = deleteSupplier(id);
          if (!result.success) {
            Alert.alert('Error', result.message ?? 'Unable to delete.');
          }
        },
      },
    ]);
  };

  return (
    <ScreenShell
      title="Suppliers"
      subtitle="Maintain supplier contacts, materials, and availability for restocking."
      action={
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>
      }
    >
      {/* Summary */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total</Text>
          <Text style={styles.summaryValue}>{suppliers.length}</Text>
        </View>
        <View style={[styles.summaryCard, { borderColor: '#BBF7D0', backgroundColor: '#F0FDF4' }]}>
          <Text style={styles.summaryLabel}>Active</Text>
          <Text style={[styles.summaryValue, { color: theme.colors.positive }]}>{activeSuppliers}</Text>
        </View>
      </View>

      {/* Add supplier */}
      <SectionCard title="Add Supplier" description="Capture supplier details for restocking and follow-up.">
        <TextInput value={name} onChangeText={setName} placeholder="Supplier / company name" placeholderTextColor={theme.colors.muted} style={styles.input} />
        <TextInput value={contactPerson} onChangeText={setContactPerson} placeholder="Contact person" placeholderTextColor={theme.colors.muted} style={styles.input} />
        <TextInput value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="Mobile number" placeholderTextColor={theme.colors.muted} style={styles.input} />
        <TextInput value={address} onChangeText={setAddress} placeholder="Address or market location" placeholderTextColor={theme.colors.muted} style={styles.input} />
        <TextInput value={category} onChangeText={setCategory} placeholder="Primary category (e.g. Cement)" placeholderTextColor={theme.colors.muted} style={styles.input} />
        <TextInput
          value={materials}
          onChangeText={setMaterials}
          placeholder="Materials supplied"
          placeholderTextColor={theme.colors.muted}
          style={[styles.input, styles.multilineInput]}
          multiline
        />
        <View style={styles.statusRow}>
          {supplierStatuses.map((entry) => (
            <Pressable
              key={entry}
              onPress={() => setStatus(entry)}
              style={[styles.statusChip, status === entry ? styles.statusChipSelected : null]}
            >
              <Text style={[styles.statusChipText, status === entry ? styles.statusChipTextSelected : null]}>
                {entry}
              </Text>
            </Pressable>
          ))}
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable onPress={handleSave} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Save Supplier</Text>
        </Pressable>
      </SectionCard>

      {/* Directory with search */}
      <SectionCard title="Supplier Directory" description="Search by name, category, or materials.">
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search suppliers…"
          placeholderTextColor={theme.colors.muted}
          style={styles.searchInput}
        />
        {filtered.length === 0 ? (
          <Text style={styles.emptyText}>No suppliers match your search.</Text>
        ) : null}
        {filtered.map((supplier) => (
          <View key={supplier.id} style={styles.supplierCard}>
            <View style={styles.supplierHeader}>
              <View style={styles.supplierCopy}>
                <Text style={styles.supplierName}>{supplier.name}</Text>
                <Text style={styles.supplierMeta}>{supplier.category} · {supplier.contactPerson}</Text>
              </View>
              <View style={styles.supplierActions}>
                <Pressable onPress={() => handleEditSupplier(supplier.id)} style={styles.editButton}>
                  <Text style={styles.editButtonText}>✏️</Text>
                </Pressable>
                <Pressable onPress={() => handleDeleteSupplier(supplier.id)} style={styles.deleteButton}>
                  <Text style={styles.deleteButtonText}>🗑️</Text>
                </Pressable>
              </View>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Phone</Text>
              <Text style={styles.detailValue}>{supplier.phone}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Address</Text>
              <Text style={styles.detailValue}>{supplier.address}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Materials</Text>
              <Text style={styles.detailValue}>{supplier.materials}</Text>
            </View>
            <View style={[styles.badge, supplier.status === 'Active' ? styles.badgeActive : styles.badgeInactive]}>
              <Text style={[styles.badgeText, supplier.status === 'Active' ? styles.badgeTextActive : styles.badgeTextInactive]}>
                {supplier.status}
              </Text>
            </View>
          </View>
        ))}
      </SectionCard>

      {/* Edit modal */}
      {editingId && (
        <SectionCard title="Edit Supplier" description="Update supplier details">
          <TextInput value={editName} onChangeText={setEditName} placeholder="Supplier / company name" placeholderTextColor={theme.colors.muted} style={styles.input} />
          <TextInput value={editContactPerson} onChangeText={setEditContactPerson} placeholder="Contact person" placeholderTextColor={theme.colors.muted} style={styles.input} />
          <TextInput value={editPhone} onChangeText={setEditPhone} keyboardType="phone-pad" placeholder="Mobile number" placeholderTextColor={theme.colors.muted} style={styles.input} />
          <TextInput value={editAddress} onChangeText={setEditAddress} placeholder="Address or market location" placeholderTextColor={theme.colors.muted} style={styles.input} />
          <TextInput value={editCategory} onChangeText={setEditCategory} placeholder="Primary category" placeholderTextColor={theme.colors.muted} style={styles.input} />
          <TextInput value={editMaterials} onChangeText={setEditMaterials} placeholder="Materials supplied" placeholderTextColor={theme.colors.muted} style={[styles.input, styles.multilineInput]} multiline />
          <View style={styles.statusRow}>
            {supplierStatuses.map((entry) => (
              <Pressable
                key={entry}
                onPress={() => setEditStatus(entry)}
                style={[styles.statusChip, editStatus === entry ? styles.statusChipSelected : null]}
              >
                <Text style={[styles.statusChipText, editStatus === entry ? styles.statusChipTextSelected : null]}>
                  {entry}
                </Text>
              </Pressable>
            ))}
          </View>
          {editError ? <Text style={styles.error}>{editError}</Text> : null}
          <View style={styles.buttonRow}>
            <Pressable onPress={() => setEditingId(null)} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </Pressable>
            <Pressable onPress={handleSaveEdit} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Save</Text>
            </Pressable>
          </View>
        </SectionCard>
      )}
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
  summaryValue: { color: theme.colors.text, fontSize: 26, fontWeight: '800' },
  input: {
    borderRadius: 10, borderWidth: 1.5, borderColor: theme.colors.border,
    paddingHorizontal: 14, paddingVertical: 12, marginBottom: 10,
    color: theme.colors.text, backgroundColor: theme.colors.panelRaised, fontSize: 15,
  },
  multilineInput: { minHeight: 88, textAlignVertical: 'top' },
  statusRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  statusChip: {
    flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1.5,
    borderColor: theme.colors.border, backgroundColor: theme.colors.panelRaised, alignItems: 'center',
  },
  statusChipSelected: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primaryLight },
  statusChipText: { color: theme.colors.muted, fontSize: 13, fontWeight: '700' },
  statusChipTextSelected: { color: theme.colors.primary },
  error: { marginBottom: 12, color: theme.colors.negative, fontSize: 13, fontWeight: '600' },
  primaryButton: { borderRadius: 12, paddingVertical: 14, alignItems: 'center', backgroundColor: theme.colors.accent },
  primaryButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  searchInput: {
    borderRadius: 10, borderWidth: 1.5, borderColor: theme.colors.border,
    backgroundColor: theme.colors.panelRaised, color: theme.colors.text,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, marginBottom: 4,
  },
  emptyText: { color: theme.colors.muted, fontSize: 14, textAlign: 'center', paddingVertical: 16 },
  supplierCard: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: theme.colors.border, gap: 6 },
  supplierHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  supplierCopy: { flex: 1, gap: 3 },
  supplierName: { color: theme.colors.text, fontSize: 15, fontWeight: '700' },
  supplierMeta: { color: theme.colors.muted, fontSize: 13 },
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, borderWidth: 1 },
  badgeActive: { backgroundColor: '#D1FAE5', borderColor: '#10B981' },
  badgeInactive: { backgroundColor: '#FEE2E2', borderColor: '#F87171' },
  badgeText: { fontSize: 12, fontWeight: '700' },
  badgeTextActive: { color: '#065F46' },
  badgeTextInactive: { color: theme.colors.negative },
  detailRow: { flexDirection: 'row', gap: 8 },
  detailLabel: { color: theme.colors.muted, fontSize: 12, fontWeight: '700', width: 64 },
  detailValue: { flex: 1, color: theme.colors.text, fontSize: 13, lineHeight: 19 },
  supplierActions: { flexDirection: 'row', gap: 8 },
  editButton: { paddingHorizontal: 8, paddingVertical: 6, borderRadius: 6, backgroundColor: theme.colors.panelRaised, borderWidth: 1, borderColor: theme.colors.border },
  editButtonText: { fontSize: 14 },
  deleteButton: { paddingHorizontal: 8, paddingVertical: 6, borderRadius: 6, backgroundColor: '#FEE2E2', borderWidth: 1, borderColor: '#F87171' },
  deleteButtonText: { fontSize: 14 },
  buttonRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  secondaryButton: { flex: 1, borderRadius: 12, backgroundColor: theme.colors.panelRaised, borderWidth: 1.5, borderColor: theme.colors.border, paddingVertical: 14, alignItems: 'center' },
  secondaryButtonText: { color: theme.colors.text, fontSize: 15, fontWeight: '700' },
});
