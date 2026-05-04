import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ScreenShell } from '../components/ScreenShell';
import { SectionCard } from '../components/SectionCard';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { theme } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Deliveries'>;

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
      subtitle="Create dispatches, track status flow, and give delivery staff a focused job list."
      action={
        <Pressable onPress={() => navigation.goBack()} style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Back</Text>
        </Pressable>
      }
    >
      {canCreate ? (
        <SectionCard title="Create delivery" description="Admin-only delivery creation flow for the current build.">
          <TextInput value={customer} onChangeText={setCustomer} placeholder="Customer" placeholderTextColor={theme.colors.muted} style={styles.input} />
          <TextInput value={items} onChangeText={setItems} placeholder="Items and quantity" placeholderTextColor={theme.colors.muted} style={styles.input} />
          <TextInput value={assignee} onChangeText={setAssignee} placeholder="Delivery person" placeholderTextColor={theme.colors.muted} style={styles.input} />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable onPress={handleCreate} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Create delivery</Text>
          </Pressable>
        </SectionCard>
      ) : null}

      <SectionCard title="Delivery queue" description="Status progression follows Pending, Dispatched, then Delivered.">
        {deliveries.map((delivery) => (
          <View key={delivery.id} style={styles.deliveryRow}>
            <View style={styles.deliveryCopy}>
              <Text style={styles.deliveryTitle}>{delivery.customer}</Text>
              <Text style={styles.deliveryMeta}>{delivery.items}</Text>
              <Text style={styles.deliveryMeta}>{delivery.assignee}</Text>
            </View>
            <View style={styles.deliveryActions}>
              <Text style={styles.statusText}>{delivery.status}</Text>
              {delivery.status !== 'Delivered' ? (
                <Pressable onPress={() => advanceDeliveryStatus(delivery.id)} style={styles.statusButton}>
                  <Text style={styles.statusButtonText}>Advance</Text>
                </Pressable>
              ) : null}
            </View>
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
  input: {
    marginTop: 10,
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
  },
  deliveryTitle: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  deliveryMeta: {
    marginTop: 4,
    color: theme.colors.muted,
    fontSize: 13,
  },
  deliveryActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  statusText: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '700',
    backgroundColor: theme.colors.badge,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: 'hidden',
  },
  statusButton: {
    borderRadius: 12,
    backgroundColor: theme.colors.panelRaised,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  statusButtonText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '800',
  },
});