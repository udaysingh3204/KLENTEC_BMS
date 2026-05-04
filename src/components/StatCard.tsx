import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../theme';
import { DashboardStat } from '../types';

type StatCardProps = {
  stat: DashboardStat;
};

const directionColor = {
  up: theme.colors.accent,
  down: theme.colors.warning,
  flat: theme.colors.positive,
} as const;

export function StatCard({ stat }: StatCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{stat.label}</Text>
      <Text style={styles.value}>{stat.value}</Text>
      <View style={styles.footer}>
        <View
          style={[
            styles.directionDot,
            { backgroundColor: directionColor[stat.direction] },
          ]}
        />
        <Text style={styles.caption}>{stat.caption}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.panelRaised,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 8,
  },
  label: {
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  value: {
    color: theme.colors.text,
    fontSize: 26,
    fontWeight: '800',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  directionDot: {
    width: 9,
    height: 9,
    borderRadius: 999,
  },
  caption: {
    flex: 1,
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
});