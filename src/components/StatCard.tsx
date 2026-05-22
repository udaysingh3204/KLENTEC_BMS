import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../theme';
import { DashboardStat } from '../types';

type StatCardProps = {
  stat: DashboardStat;
};

const directionColor = {
  up: theme.colors.positive,
  down: theme.colors.negative,
  flat: theme.colors.muted,
} as const;

const directionLabel = {
  up: '▲',
  down: '▼',
  flat: '—',
} as const;

export function StatCard({ stat }: StatCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{stat.label}</Text>
      <Text style={styles.value}>{stat.value}</Text>
      <View style={styles.footer}>
        <Text style={[styles.directionArrow, { color: directionColor[stat.direction] }]}>
          {directionLabel[stat.direction]}
        </Text>
        <Text style={styles.caption}>{stat.caption}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.panel,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: '800',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  directionArrow: {
    fontSize: 11,
    fontWeight: '800',
  },
  caption: {
    flex: 1,
    color: theme.colors.muted,
    fontSize: 12,
    lineHeight: 17,
  },
});
