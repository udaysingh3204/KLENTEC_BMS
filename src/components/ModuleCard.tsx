import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../theme';
import { ModuleDefinition } from '../types';

type ModuleCardProps = {
  moduleDefinition: ModuleDefinition;
};

const statusPalette = {
  planned: '#3D6B75',
  'in-progress': '#F4A259',
  ready: '#78D08B',
} as const;

export function ModuleCard({ moduleDefinition }: ModuleCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.id}>{moduleDefinition.id}</Text>
        <Text
          style={[
            styles.status,
            { backgroundColor: statusPalette[moduleDefinition.status] },
          ]}
        >
          {moduleDefinition.status}
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
    backgroundColor: theme.colors.panelRaised,
    borderRadius: 22,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  id: {
    color: theme.colors.accent,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  status: {
    color: '#0D1B1E',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    overflow: 'hidden',
  },
  title: {
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  owner: {
    color: theme.colors.warning,
    fontSize: 13,
    fontWeight: '700',
  },
  description: {
    color: theme.colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
});