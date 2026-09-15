import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { useTheme } from './ThemeProvider';
import { curvas, radius, spacing, typography } from './tokens';

export type EstadoPunto = 'ok' | 'aviso' | 'error' | 'apagado';

/**
 * Estado de una cosa: un punto de 8 pt y un texto pequeño.
 *
 * En los mockups el estado (`Todo bien`, `Encendido`) es SIEMPRE un
 * punto, nunca una etiqueta rellena: una etiqueta de color pesa como un
 * botón y compite con el dato de la tarjeta. Las etiquetas rellenas se
 * reservan para roles y caducidades.
 *
 * Al cambiar de estado cambia solo el color, en 200 ms. Ni escala ni
 * parpadeo: un punto que parpadea se lee como una alarma.
 */
export function StatusDot({ estado, texto }: { estado: EstadoPunto; texto: string }) {
  const { colors, motion } = useTheme();

  const tintes: Record<EstadoPunto, string> = {
    ok: colors.success,
    aviso: colors.warning,
    error: colors.danger,
    apagado: colors.offline,
  };

  const color = tintes[estado];
  const fundido = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    fundido.setValue(0.4);
    Animated.timing(fundido, {
      toValue: 1,
      duration: motion.base,
      easing: curvas.standard,
      useNativeDriver: false,
    }).start();
  }, [estado, fundido, motion.base]);

  return (
    <View style={styles.caja} accessibilityRole="text" accessibilityLabel={texto}>
      <Animated.View style={[styles.punto, { backgroundColor: color, opacity: fundido }]} />
      <Text style={[typography.captionStrong, { color: colors.textSecondary }]}>{texto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  caja: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  punto: { width: 8, height: 8, borderRadius: radius.pill },
});

/** Cabecera de sección: título a la izquierda y, si hace falta, una acción a la derecha. */
export function SectionHeader({
  titulo,
  accion,
}: {
  titulo: string;
  accion?: { label: string; onPress: () => void };
}) {
  const { colors } = useTheme();

  return (
    <View style={cabecera.fila}>
      <Text style={[typography.section, { color: colors.text }]}>{titulo}</Text>
      {accion ? (
        <Text
          style={[typography.captionStrong, { color: colors.brand }]}
          onPress={accion.onPress}
          accessibilityRole="button"
          suppressHighlighting
        >
          {accion.label}
        </Text>
      ) : null}
    </View>
  );
}

const cabecera = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 24,
    gap: spacing.md,
  },
});
