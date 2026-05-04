import { PropsWithChildren, ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '../theme';

type ScreenShellProps = PropsWithChildren<{
  title: string;
  subtitle: string;
  action?: ReactNode;
}>;

export function ScreenShell({ action, children, subtitle, title }: ScreenShellProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
          {action}
        </View>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 36,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
  },
  headerCopy: {
    flex: 1,
  },
  title: {
    color: theme.colors.text,
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 6,
    color: theme.colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
});