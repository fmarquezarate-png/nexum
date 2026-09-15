import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View, type ViewStyle } from 'react-native';

import { useTheme } from './ThemeProvider';
import { SKELETON_CICLO, layout, radius, spacing } from './tokens';

/**
 * Esqueleto de carga.
 *
 * Nunca una ruedecita sola sobre una pantalla en blanco: se enseña la
 * FORMA de lo que va a llegar. Así el usuario ya sabe qué está esperando
 * y, cuando llegan los datos, nada se mueve de sitio.
 *
 * Es la única animación de la app que pasa de 350 ms, y lo hace porque
 * es un estado y no una transición. Con movimiento reducido deja de
 * pulsar y se queda quieta.
 */
function Bloque({ alto, ancho, estilo }: { alto: number; ancho?: ViewStyle['width']; estilo?: ViewStyle }) {
  const { colors, motion } = useTheme();
  const pulso = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (motion.reducido) return;
    const ciclo = Animated.loop(
      Animated.sequence([
        Animated.timing(pulso, {
          toValue: 0.5,
          duration: SKELETON_CICLO / 2,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(pulso, {
          toValue: 1,
          duration: SKELETON_CICLO / 2,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ]),
    );
    ciclo.start();
    return () => ciclo.stop();
  }, [pulso, motion.reducido]);

  return (
    <Animated.View
      style={[
        {
          height: alto,
          width: ancho ?? '100%',
          borderRadius: radius.xs,
          backgroundColor: colors.surfaceSunken,
          opacity: pulso,
        },
        estilo,
      ]}
    />
  );
}

/** Varias filas grises con la forma de una lista. */
export function EsqueletoLista({ filas = 3 }: { filas?: number }) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.tarjeta,
        {
          backgroundColor: colors.surface,
          borderWidth: colors.cardBorderWidth,
          borderColor: colors.cardBorder,
        },
      ]}
      accessibilityLabel="Cargando"
      accessibilityRole="progressbar"
    >
      {Array.from({ length: filas }, (_, i) => (
        <View key={i} style={styles.fila}>
          <Bloque alto={32} ancho={32} estilo={styles.azulejo} />
          <View style={styles.textos}>
            <Bloque alto={14} ancho={i % 2 === 0 ? '60%' : '45%'} />
            <Bloque alto={11} ancho="35%" />
          </View>
        </View>
      ))}
    </View>
  );
}

/** Rectángulos con la forma de las tarjetas que van a llegar. */
export function EsqueletoTarjetas({ cuantas = 2, alto = 96 }: { cuantas?: number; alto?: number }) {
  const { colors } = useTheme();

  return (
    <View style={styles.pila} accessibilityLabel="Cargando" accessibilityRole="progressbar">
      {Array.from({ length: cuantas }, (_, i) => (
        <View
          key={i}
          style={[
            styles.tarjetaVacia,
            {
              height: alto,
              backgroundColor: colors.surface,
              borderWidth: colors.cardBorderWidth,
              borderColor: colors.cardBorder,
            },
          ]}
        >
          <Bloque alto={44} ancho={44} estilo={styles.azulejoGrande} />
          <Bloque alto={14} ancho="55%" />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    borderRadius: radius.card,
    padding: layout.cardPadding,
    gap: layout.cardGap,
  },
  tarjetaVacia: {
    borderRadius: radius.card,
    padding: layout.cardPadding,
    gap: layout.cardGap,
    justifyContent: 'center',
  },
  pila: { gap: layout.cardGap },
  fila: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: 40 },
  azulejo: { borderRadius: radius.sm },
  azulejoGrande: { borderRadius: radius.md },
  textos: { flex: 1, gap: spacing.sm },
});
