import { PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../theme';

type SectionCardProps = PropsWithChildren<{
  title: string;
  description: string;
}>;

export function SectionCard({ children, description, title }: SectionCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <View style={styles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.panel,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  title: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  description: {
    color: theme.colors.muted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  body: {
    marginTop: 12,
  },
});