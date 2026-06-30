import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ScreenShell } from '../components/ScreenShell';
import { SectionCard } from '../components/SectionCard';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { Influencer } from '../types';
import { theme } from '../theme';
import { formatCurrency } from '../utils/finance';

type Props = NativeStackScreenProps<RootStackParamList, 'Influencer'>;

export function InfluencerScreen({ navigation }: Props) {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingInfluencer, setEditingInfluencer] = useState<Influencer | null>(null);
  const [searchText, setSearchText] = useState('');

  const influencers = useAppStore((s) => s.influencers);
  const addInfluencer = useAppStore((s) => s.addInfluencer);
  const updateInfluencer = useAppStore((s) => s.updateInfluencer);
  const deleteInfluencer = useAppStore((s) => s.deleteInfluencer);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    commissionRate: '0',
    notes: '',
  });

  const filteredInfluencers = influencers.filter((inf) =>
    inf.name.toLowerCase().includes(searchText.toLowerCase()) ||
    inf.phone.includes(searchText)
  );

  const handleAddInfluencer = () => {
    if (!formData.name.trim() || !formData.phone.trim()) {
      Alert.alert('Error', 'Name and phone are required');
      return;
    }

    const commissionRate = parseFloat(formData.commissionRate) || 0;
    if (commissionRate < 0 || commissionRate > 100) {
      Alert.alert('Error', 'Commission rate must be between 0-100%');
      return;
    }

    const result = addInfluencer({
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim() || undefined,
      commissionRate,
      notes: formData.notes.trim() || undefined,
    });

    if (result.success) {
      Alert.alert('Success', 'Influencer added successfully');
      resetForm();
      setIsAddingNew(false);
    } else {
      Alert.alert('Error', result.message || 'Failed to add influencer');
    }
  };

  const handleUpdateInfluencer = () => {
    if (!editingInfluencer || !formData.name.trim() || !formData.phone.trim()) {
      Alert.alert('Error', 'Name and phone are required');
      return;
    }

    const commissionRate = parseFloat(formData.commissionRate) || 0;
    if (commissionRate < 0 || commissionRate > 100) {
      Alert.alert('Error', 'Commission rate must be between 0-100%');
      return;
    }

    const result = updateInfluencer(editingInfluencer.id, {
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim() || undefined,
      commissionRate,
      notes: formData.notes.trim() || undefined,
    });

    if (result.success) {
      Alert.alert('Success', 'Influencer updated successfully');
      resetForm();
      setEditingInfluencer(null);
    } else {
      Alert.alert('Error', result.message || 'Failed to update influencer');
    }
  };

  const handleDeleteInfluencer = (id: string, name: string) => {
    Alert.alert('Delete Influencer', `Are you sure you want to delete ${name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          const result = deleteInfluencer(id);
          if (result.success) {
            Alert.alert('Success', 'Influencer deleted successfully');
          } else {
            Alert.alert('Error', result.message || 'Failed to delete influencer');
          }
        },
      },
    ]);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      commissionRate: '0',
      notes: '',
    });
  };

  const openEditForm = (influencer: Influencer) => {
    setEditingInfluencer(influencer);
    setFormData({
      name: influencer.name,
      phone: influencer.phone,
      email: influencer.email || '',
      commissionRate: influencer.commissionRate.toString(),
      notes: influencer.notes || '',
    });
  };

  const closeForm = () => {
    setIsAddingNew(false);
    setEditingInfluencer(null);
    resetForm();
  };

  const totalCommissionEarned = influencers.reduce((sum, inf) => sum + inf.totalCommissionEarned, 0);
  const totalReferrals = influencers.reduce((sum, inf) => sum + inf.totalReferrals, 0);
  const activeInfluencers = influencers.filter((inf) => inf.status === 'Active').length;

  return (
    <ScreenShell
      title="Influencers"
      subtitle="Manage influencers, track referrals, and commission earnings."
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Active Influencers</Text>
            <Text style={styles.summaryValue}>{activeInfluencers}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Referrals</Text>
            <Text style={styles.summaryValue}>{totalReferrals}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Commission Earned</Text>
            <Text style={[styles.summaryValue, { color: theme.colors.positive }]}>
              {formatCurrency(totalCommissionEarned)}
            </Text>
          </View>
        </View>

        {/* Search & Add Button */}
        <View style={styles.actionContainer}>
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search by name or phone..."
            placeholderTextColor={theme.colors.muted}
            style={styles.searchInput}
          />
          <Pressable
            onPress={() => {
              resetForm();
              setIsAddingNew(true);
            }}
            style={styles.addButton}
          >
            <Text style={styles.addButtonText}>+ Add Influencer</Text>
          </Pressable>
        </View>

        {/* Influencers List */}
        <SectionCard title="Influencers" description={`${filteredInfluencers.length} total`}>
          {filteredInfluencers.length === 0 ? (
            <Text style={styles.emptyText}>
              {searchText ? 'No influencers found' : 'No influencers yet. Add one to get started!'}
            </Text>
          ) : (
            <View style={styles.listContainer}>
              {filteredInfluencers.map((influencer) => (
                <View key={influencer.id} style={styles.influencerCard}>
                  <View style={styles.influencerHeader}>
                    <View style={styles.influencerInfo}>
                      <Text style={styles.influencerName}>{influencer.name}</Text>
                      <Text style={styles.influencerPhone}>{influencer.phone}</Text>
                      {influencer.email && <Text style={styles.influencerEmail}>{influencer.email}</Text>}
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            influencer.status === 'Active'
                              ? theme.colors.positive
                              : theme.colors.negative,
                        },
                      ]}
                    >
                      <Text style={styles.statusText}>{influencer.status}</Text>
                    </View>
                  </View>

                  <View style={styles.influencerStats}>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Commission Rate</Text>
                      <Text style={styles.statValue}>{influencer.commissionRate}%</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Referrals</Text>
                      <Text style={styles.statValue}>{influencer.totalReferrals}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Earned</Text>
                      <Text style={[styles.statValue, { color: theme.colors.positive }]}>
                        {formatCurrency(influencer.totalCommissionEarned)}
                      </Text>
                    </View>
                  </View>

                  {influencer.notes && (
                    <Text style={styles.influencerNotes}>{influencer.notes}</Text>
                  )}

                  <View style={styles.buttonRow}>
                    <Pressable
                      onPress={() => openEditForm(influencer)}
                      style={[styles.actionBtn, styles.editBtn]}
                    >
                      <Text style={styles.editBtnText}>Edit</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => handleDeleteInfluencer(influencer.id, influencer.name)}
                      style={[styles.actionBtn, styles.deleteBtn]}
                    >
                      <Text style={styles.deleteBtnText}>Delete</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          )}
        </SectionCard>
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal visible={isAddingNew || editingInfluencer !== null} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingInfluencer ? 'Edit Influencer' : 'Add New Influencer'}
              </Text>
              <Pressable onPress={closeForm} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </Pressable>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Name *</Text>
              <TextInput
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Influencer name"
                placeholderTextColor={theme.colors.muted}
                style={styles.input}
              />

              <Text style={styles.inputLabel}>Phone *</Text>
              <TextInput
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                placeholder="Phone number"
                placeholderTextColor={theme.colors.muted}
                keyboardType="phone-pad"
                style={styles.input}
              />

              <Text style={styles.inputLabel}>Email (Optional)</Text>
              <TextInput
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                placeholder="Email address"
                placeholderTextColor={theme.colors.muted}
                keyboardType="email-address"
                style={styles.input}
              />

              <Text style={styles.inputLabel}>Commission Rate (%) *</Text>
              <TextInput
                value={formData.commissionRate}
                onChangeText={(text) => setFormData({ ...formData, commissionRate: text })}
                placeholder="0-100"
                placeholderTextColor={theme.colors.muted}
                keyboardType="decimal-pad"
                style={styles.input}
              />

              <Text style={styles.inputLabel}>Notes (Optional)</Text>
              <TextInput
                value={formData.notes}
                onChangeText={(text) => setFormData({ ...formData, notes: text })}
                placeholder="Add any notes..."
                placeholderTextColor={theme.colors.muted}
                style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]}
                multiline
              />

              <View style={styles.modalButtonContainer}>
                <Pressable onPress={closeForm} style={[styles.modalBtn, styles.cancelBtn]}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={editingInfluencer ? handleUpdateInfluencer : handleAddInfluencer}
                  style={[styles.modalBtn, styles.saveBtn]}
                >
                  <Text style={styles.saveBtnText}>
                    {editingInfluencer ? 'Update' : 'Add'} Influencer
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  summaryContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.background,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: theme.colors.panelRaised,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  summaryLabel: {
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
  },
  summaryValue: {
    color: theme.colors.primary,
    fontSize: 18,
    fontWeight: '800',
  },
  actionContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  searchInput: {
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.panelRaised,
    color: theme.colors.text,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  emptyText: {
    color: theme.colors.muted,
    textAlign: 'center',
    fontSize: 13,
    fontStyle: 'italic',
  },
  listContainer: {
    gap: 12,
  },
  influencerCard: {
    backgroundColor: theme.colors.panelRaised,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  influencerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  influencerInfo: {
    flex: 1,
    gap: 4,
  },
  influencerName: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  influencerPhone: {
    color: theme.colors.muted,
    fontSize: 12,
  },
  influencerEmail: {
    color: theme.colors.muted,
    fontSize: 11,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  influencerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    paddingVertical: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statItem: {
    alignItems: 'center',
    gap: 2,
  },
  statLabel: {
    color: theme.colors.muted,
    fontSize: 10,
    fontWeight: '600',
  },
  statValue: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  influencerNotes: {
    color: theme.colors.muted,
    fontSize: 12,
    fontStyle: 'italic',
    marginVertical: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  editBtn: {
    backgroundColor: theme.colors.primary,
  },
  editBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
  },
  deleteBtn: {
    backgroundColor: theme.colors.negative + '20',
  },
  deleteBtnText: {
    color: theme.colors.negative,
    fontWeight: '600',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    marginTop: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.panelRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: theme.colors.muted,
    fontSize: 18,
  },
  modalContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  inputLabel: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.panelRaised,
    color: theme.colors.text,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 40,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: theme.colors.panelRaised,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
  },
  cancelBtnText: {
    color: theme.colors.muted,
    fontWeight: '700',
    fontSize: 14,
  },
  saveBtn: {
    backgroundColor: theme.colors.primary,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
