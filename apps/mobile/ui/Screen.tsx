import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing, typography } from './tokens';

interface ScreenProps {
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  /** Sin scroll para pantallas que no lo necesitan (ej: un dial a pantalla completa). */
  scroll?: boolean;
}

/**
 * Contenedor base de todas las pantallas.
 *
 * Se encarga de: fondo correcto, respetar la muesca del móvil (SafeArea),
 * márgenes laterales y el título. Ninguna pantalla debe repetir esto.
 */
export function Screen({ title, subtitle, children, scroll = true }: ScreenProps) {
  const content = (
    <View style={styles.inner}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {children}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {scroll ? (
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, paddingBottom: spacing.xxxl },
  inner: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.lg, gap: spacing.md },
  title: { ...typography.title, color: colors.text },
  subtitle: { ...typography.body, color: colors.textMuted },
});
