import { ChevronRight } from 'lucide-react-native';
import { useRef, type ReactNode } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from './ThemeProvider';
import { layout, radius, spacing, typography } from './tokens';

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
  /** Etiqueta para el lector de pantalla. Por defecto, el título. */
  accesibilidad?: string;
}

/**
 * Fila de lista.
 *
 * A diferencia de una tarjeta, la fila NO escala al pulsarla: encoger
 * una fila dentro de una lista deforma visualmente a sus vecinas. Lo que
 * cambia es el fondo, que se hunde.
 */
export function ListRow({
  titulo,
  subtitulo,
  izquierda,
  derecha,
  onPress,
  flecha = true,
  accesibilidad,
}: ListRowProps) {
  const { colors, motion } = useTheme();
  const hundido = useRef(new Animated.Value(0)).current;

  const animar = (a: number) =>
    Animated.timing(hundido, {
      toValue: a,
      duration: motion.instant,
      // Un color no se puede animar por el hilo nativo.
      useNativeDriver: false,
    }).start();

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
      {onPress && flecha ? (
        <ChevronRight size={20} strokeWidth={1.75} color={colors.textFaint} />
      ) : null}
    </>
  );

  if (!onPress) return <View style={styles.fila}>{contenido}</View>;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => animar(1)}
      onPressOut={() => animar(0)}
      accessibilityRole="button"
      accessibilityLabel={accesibilidad ?? titulo}
    >
      <Animated.View
        style={[
          styles.fila,
          styles.filaPulsable,
          {
            backgroundColor: hundido.interpolate({
              inputRange: [0, 1],
              outputRange: ['rgba(0,0,0,0)', colors.surfaceSunken],
            }),
          },
        ]}
      >
        {contenido}
      </Animated.View>
    </Pressable>
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
  // El hundido se sale un poco por los lados para que el fondo llegue
  // al borde interior de la tarjeta y no parezca una pastilla flotando.
  filaPulsable: {
    marginHorizontal: -spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.xs,
  },
  textos: { flex: 1, gap: spacing.xxs },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
});
