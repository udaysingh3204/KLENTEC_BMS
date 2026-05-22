import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ScreenShell } from '../components/ScreenShell';
import { SectionCard } from '../components/SectionCard';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { theme } from '../theme';
import { DeliveryEntry } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Deliveries'>;

const statusStyle: Record<DeliveryEntry['status'], { bg: string; text: string; border: string }> = {
  Pending: { bg: '#FEF3C7', text: '#92400E', border: '#F59E0B' },
  Dispatched: { bg: '#DBEAFE', text: '#1E40AF', border: '#3B82F6' },
  Delivered: { bg: '#D1FAE5', text: '#065F46', border: '#10B981' },
};

export function DeliveriesScreen({ navigation }: Props) {
  const advanceDeliveryStatus = useAppStore((state) => state.advanceDeliveryStatus);
  const createDelivery = useAppStore((state) => state.createDelivery);
  const currentUser = useAppStore((state) => state.currentUser);
  const deliveries = useAppStore((state) => state.deliveries);

  const [customer, setCustomer] = useState('');
  const [items, setItems] = useState('');
  const [assignee, setAssignee] = useState('');
  const [error, setError] = useState('');

  const canCreate = currentUser?.roleId === 'admin';

  const pendingCount = deliveries.filter((d) => d.status === 'Pending').length;
  const dispatchedCount = deliveries.filter((d) => d.status === 'Dispatched').length;
  const deliveredCount = deliveries.filter((d) => d.status === 'Delivered').length;

  const handleCreate = () => {
    const result = createDelivery({ customer, items, assignee });
    if (!result.success) {
      setError(result.message ?? 'Unable to create delivery.');
      return;
    }

    setCustomer('');
    setItems('');
    setAssignee('');
    setError('');
  };

  return (
    <ScreenShell
      title="Deliveries"
      subtitle="Create dispatches, track status flow, and manage the delivery queue."
      action={
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>
      }
    >
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { borderColor: '#F59E0B', backgroundColor: '#FFFBEB' }]}>
          <Text style={styles.summaryLabel}>Pending</Text>
          <Text style={[styles.summaryValue, { color: '#92400E' }]}>{pendingCount}</Text>
        </View>
        <View style={[styles.summaryCard, { borderColor: '#3B82F6', backgroundColor: '#EFF6FF' }]}>
          <Text style={styles.summaryLabel}>Dispatched</Text>
          <Text style={[styles.summaryValue, { color: '#1E40AF' }]}>{dispatchedCount}</Text>
        </View>
        <View style={[styles.summaryCard, { borderColor: '#10B981', backgroundColor: '#F0FDF4' }]}>
          <Text style={styles.summaryLabel}>Delivered</Text>
          <Text style={[styles.summaryValue, { color: '#065F46' }]}>{deliveredCount}</Text>
        </View>
      </View>

      {canCreate ? (
        <SectionCard title="Create Delivery" description="Admin-only: assign items and delivery person.">
          <TextInput value={customer} onChangeText={setCustomer} placeholder="Customer name" placeholderTextColor={theme.colors.muted} style={styles.input} />
          <TextInput value={items} onChangeText={setItems} placeholder="Items and quantity (e.g. 25 bags cement)" placeholderTextColor={theme.colors.muted} style={styles.input} />
          <TextInput value={assignee} onChangeText={setAssignee} placeholder="Delivery person name" placeholderTextColor={theme.colors.muted} style={styles.input} />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable onPress={handleCreate} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Create Delivery</Text>
          </Pressable>
        </SectionCard>
      ) : null}

      <SectionCard title="Delivery Queue" description="Tap Advance to move a delivery through Pending → Dispatched → Delivered.">
        {deliveries.map((delivery) => {
          const s = statusStyle[delivery.status];

          return (
            <View key={delivery.id} style={styles.deliveryRow}>
              <View style={styles.deliveryCopy}>
                <Text style={styles.deliveryTitle}>{delivery.customer}</Text>
                <Text style={styles.deliveryMeta}>{delivery.items}</Text>
                <Text style={styles.deliveryMeta}>Assigned: {delivery.assignee}</Text>
              </View>
              <View style={styles.deliveryActions}>
                <View style={[styles.statusBadge, { backgroundColor: s.bg, borderColor: s.border }]}>
                  <Text style={[styles.statusText, { color: s.text }]}>{delivery.status}</Text>
                </View>
                {delivery.status !== 'Delivered' ? (
                  <Pressable onPress={() => advanceDeliveryStatus(delivery.id)} style={styles.advanceButton}>
                    <Text style={styles.advanceButtonText}>Advance →</Text>
                  </Pressable>
                ) : null}
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
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: theme.colors.panelRaised,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  backButtonText: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  summaryCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    gap: 4,
  },
  summaryLabel: {
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: '800',
  },
  input: {
    marginTop: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.panelRaised,
    color: theme.colors.text,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  error: {
    marginTop: 10,
    color: theme.colors.negative,
    fontSize: 13,
    fontWeight: '600',
  },
  primaryButton: {
    marginTop: 14,
    borderRadius: 12,
    backgroundColor: theme.colors.accent,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  deliveryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  deliveryCopy: {
    flex: 1,
    gap: 3,
  },
  deliveryTitle: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  deliveryMeta: {
    color: theme.colors.muted,
    fontSize: 13,
  },
  deliveryActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  advanceButton: {
    borderRadius: 8,
    backgroundColor: theme.colors.primaryLight,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  advanceButtonText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
});
