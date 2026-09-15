import { ChevronRight } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from './ThemeProvider';
import { layout, radius, spacing, typography } from './tokens';
import { PressableAnimado, usePressScale } from './usePressScale';

interface ListRowProps {
  titulo: string;
  subtitulo?: string;
  /** Icono a la izquierda, normalmente dentro de un IconTile. */
  izquierda?: ReactNode;
  /** Algo a la derecha: una etiqueta, un interruptor. */
  derecha?: ReactNode;
  /**
   * Qué pasa al tocar la fila. REGLA: tocar SIEMPRE abre o selecciona,
   * NUNCA borra. Las acciones destructivas viven dentro, nunca en el
   * gesto más fácil de hacer sin querer.
   */
  onPress?: () => void;
  /** Muestra la flecha de "esto se abre". Solo si hay onPress. */
  flecha?: boolean;
}

export function ListRow({
  titulo,
  subtitulo,
  izquierda,
  derecha,
  onPress,
  flecha = true,
}: ListRowProps) {
  const { colors } = useTheme();
  const { animatedStyle, onPressIn, onPressOut } = usePressScale(0.985);

  const contenido = (
    <>
      {izquierda}
      <View style={styles.textos}>
        <Text style={[typography.cardTitle, { color: colors.text }]} numberOfLines={1}>
          {titulo}
        </Text>
        {subtitulo ? (
          <Text style={[typography.caption, { color: colors.textSecondary }]} numberOfLines={2}>
            {subtitulo}
          </Text>
        ) : null}
      </View>
      {derecha}
      {onPress && flecha ? <ChevronRight size={18} strokeWidth={2} color={colors.textFaint} /> : null}
    </>
  );

  if (!onPress) return <View style={styles.fila}>{contenido}</View>;

  return (
    <PressableAnimado
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      accessibilityRole="button"
      style={[styles.fila, animatedStyle]}
    >
      {contenido}
    </PressableAnimado>
  );
}

type Tono = 'neutro' | 'ok' | 'aviso' | 'error' | 'marca';

/** Etiqueta pequeña de color. Para roles, estados y caducidades. */
export function Badge({ texto, tono = 'neutro' }: { texto: string; tono?: Tono }) {
  const { colors } = useTheme();

  const tonos: Record<Tono, { fondo: string; texto: string }> = {
    neutro: { fondo: colors.surfaceSunken, texto: colors.textSecondary },
    ok: { fondo: colors.successSoft, texto: colors.success },
    aviso: { fondo: colors.warningSoft, texto: colors.warning },
    error: { fondo: colors.dangerSoft, texto: colors.danger },
    marca: { fondo: colors.brandSoft, texto: colors.brand },
  };
  const t = tonos[tono];

  return (
    <Text
      style={[
        typography.label,
        styles.badge,
        { backgroundColor: t.fondo, color: t.texto },
      ]}
    >
      {texto}
    </Text>
  );
}

const styles = StyleSheet.create({
  fila: {
    minHeight: layout.rowHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  textos: { flex: 1, gap: spacing.xxs },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
});
