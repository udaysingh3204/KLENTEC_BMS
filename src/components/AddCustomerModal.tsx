import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { theme } from '../theme';

type AddCustomerModalProps = {
  visible: boolean;
  onClose: () => void;
  onAdd: (name: string, phone: string, address: string) => void;
  isLoading?: boolean;
};

export function AddCustomerModal({
  visible,
  onClose,
  onAdd,
  isLoading = false,
}: AddCustomerModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');

  const handleAdd = () => {
    setError('');

    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    if (!phone.trim()) {
      setError('Phone is required');
      return;
    }
    if (!address.trim()) {
      setError('Address is required');
      return;
    }

    onAdd(name.trim(), phone.trim(), address.trim());
    setName('');
    setPhone('');
    setAddress('');
  };

  const handleClose = () => {
    setName('');
    setPhone('');
    setAddress('');
    setError('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Add Customer</Text>
          <Text style={styles.subtitle}>Create new customer for this invoice</Text>

          {/* Name Input */}
          <Text style={styles.label}>Customer Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter customer name"
            placeholderTextColor={theme.colors.muted}
            value={name}
            onChangeText={setName}
            editable={!isLoading}
          />

          {/* Phone Input */}
          <Text style={styles.label}>Phone Number *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter phone number"
            placeholderTextColor={theme.colors.muted}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            editable={!isLoading}
          />

          {/* Address Input */}
          <Text style={styles.label}>Address *</Text>
          <TextInput
            style={[styles.input, styles.addressInput]}
            placeholder="Enter address"
            placeholderTextColor={theme.colors.muted}
            value={address}
            onChangeText={setAddress}
            multiline
            editable={!isLoading}
          />

          {/* Error Message */}
          {error ? <Text style={styles.error}>{error}</Text> : null}

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <Pressable
              onPress={handleClose}
              style={[styles.button, styles.cancelButton]}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleAdd}
              style={[styles.button, styles.addButton]}
              disabled={isLoading}
            >
              <Text style={styles.addButtonText}>
                {isLoading ? 'Adding...' : 'Add Customer'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modal: {
    backgroundColor: theme.colors.background,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 380,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: theme.colors.muted,
    marginBottom: 16,
  },
  label: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 6,
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
  },
  addressInput: {
    minHeight: 70,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  error: {
    marginTop: 10,
    color: theme.colors.negative,
    fontSize: 13,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
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
  addButton: {
    backgroundColor: theme.colors.primary,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
