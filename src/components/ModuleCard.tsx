import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../theme';
import { ModuleDefinition } from '../types';

type ModuleCardProps = {
  moduleDefinition: ModuleDefinition;
};

const statusPalette: Record<ModuleDefinition['status'], { bg: string; text: string; label: string }> = {
  planned: { bg: '#EEF1F8', text: theme.colors.muted, label: 'Planned' },
  'in-progress': { bg: '#FFF7ED', text: '#C2410C', label: 'In Progress' },
  ready: { bg: '#F0FDF4', text: '#15803D', label: 'Ready' },
};

export function ModuleCard({ moduleDefinition }: ModuleCardProps) {
  const palette = statusPalette[moduleDefinition.status];

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.id}>{moduleDefinition.id}</Text>
        <Text style={[styles.status, { backgroundColor: palette.bg, color: palette.text }]}>
          {palette.label}
        </Text>
      </View>
      <Text style={styles.title}>{moduleDefinition.title}</Text>
      <Text style={styles.owner}>{moduleDefinition.owner}</Text>
      <Text style={styles.description}>{moduleDefinition.description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.panel,
    borderRadius: 14,
    padding: 14,
    gap: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  id: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  status: {
    fontSize: 11,
    fontWeight: '700',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
    overflow: 'hidden',
  },
  title: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  owner: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
});
