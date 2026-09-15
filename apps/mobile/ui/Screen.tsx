import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from './ThemeProvider';
import { layout, spacing, typography } from './tokens';

interface ScreenProps {
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  /** Sin scroll para pantallas que ocupan exactamente el alto. */
  scroll?: boolean;
  /** Elemento pegado abajo, fuera del scroll (botón principal de un paso). */
  pie?: ReactNode;
}

/**
 * Contenedor base de todas las pantallas.
 *
 * Se ocupa del fondo, de respetar la muesca del móvil, de los márgenes
 * laterales y del título. Ninguna pantalla repite esto.
 */
export function Screen({ title, subtitle, children, scroll = true, pie }: ScreenProps) {
  const { colors } = useTheme();

  const cabecera = (title || subtitle) && (
    <View style={styles.cabecera}>
      {title ? (
        <Text style={[typography.title, { color: colors.text }]}>{title}</Text>
      ) : null}
      {subtitle ? (
        <Text style={[typography.body, { color: colors.textSecondary }]}>{subtitle}</Text>
      ) : null}
    </View>
  );

  const cuerpo = (
    <>
      {cabecera}
      {children}
    </>
  );

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.canvas }]}
      edges={['top', 'left', 'right']}
    >
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {cuerpo}
        </ScrollView>
      ) : (
        <View style={styles.fijo}>{cuerpo}</View>
      )}

      {pie ? (
        <View
          style={[
            styles.pie,
            { backgroundColor: colors.canvas, borderTopColor: colors.divider },
          ]}
        >
          {pie}
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: layout.screenPaddingH,
    paddingTop: layout.screenPaddingTop,
    paddingBottom: layout.scrollBottom,
    gap: layout.cardGap,
  },
  fijo: {
    flex: 1,
    paddingHorizontal: layout.screenPaddingH,
    paddingTop: layout.screenPaddingTop,
    gap: layout.cardGap,
  },
  cabecera: { gap: spacing.xxs, paddingBottom: spacing.sm },
  pie: {
    paddingHorizontal: layout.screenPaddingH,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
