import { useEffect, useRef, useState } from 'react';
import { Animated, Platform, StyleSheet, Text, View } from 'react-native';

import { useTheme } from './ThemeProvider';
import { curvas, typography } from './tokens';

interface DataHeroProps {
  /** El número. Uno por pantalla: si hay dos candidatos, el segundo baja a `dataL`. */
  valor: number;
  /** `°C`, `%`… Va a un cuerpo mucho menor, alineado a la línea base. */
  unidad?: string;
  /** Contexto bajo el número. Encima no va nada: la etiqueta la lleva la tarjeta. */
  pie?: string;
  /** Color del número. Por defecto, el del texto. El de módulo solo en su pantalla. */
  color?: string;
  /** Si el dato ha dejado de ser válido, baja de contraste en vez de ocultarse. */
  atenuado?: boolean;
}

const SALTO_CORTO = 5;
const MS_CUENTA = 300;
const MS_FUNDIDO = 160;

/**
 * El dato protagonista.
 *
 * Es el núcleo del parecido con los mockups: un número enorme que dice
 * lo que importa, y todo lo demás en silencio alrededor.
 *
 * Cómo se comporta al cambiar:
 *   · salto de 5 unidades o menos → cuenta por los valores intermedios
 *     en 300 ms, que es lo que hace que se lea como una magnitud real
 *   · salto mayor o cambio de unidad → no cuenta, se funde en el sitio:
 *     contar de 12 a 380 es un tragaperras, no un dato
 *   · nunca parpadea, nunca se oculta
 */
export function DataHero({ valor, unidad, pie, color, atenuado = false }: DataHeroProps) {
  const { colors, motion } = useTheme();

  const [mostrado, setMostrado] = useState(valor);
  const anterior = useRef(valor);
  const opacidad = useRef(new Animated.Value(1)).current;
  const contador = useRef(new Animated.Value(valor)).current;

  useEffect(() => {
    const previo = anterior.current;
    anterior.current = valor;
    if (previo === valor) return;

    const salto = Math.abs(valor - previo);

    if (salto <= SALTO_CORTO && !motion.reducido) {
      contador.setValue(previo);
      const escucha = contador.addListener(({ value }) => setMostrado(Math.round(value)));
      Animated.timing(contador, {
        toValue: valor,
        duration: MS_CUENTA,
        easing: curvas.standard,
        // Un listener de valor obliga a JavaScript: no se puede delegar.
        useNativeDriver: false,
      }).start(() => {
        contador.removeListener(escucha);
        setMostrado(valor);
      });
      return () => contador.removeListener(escucha);
    }

    // Salto grande: fundido cruzado en el sitio.
    Animated.sequence([
      Animated.timing(opacidad, {
        toValue: 0,
        duration: MS_FUNDIDO / 2,
        easing: curvas.accelerate,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(opacidad, {
        toValue: 1,
        duration: MS_FUNDIDO / 2,
        easing: curvas.decelerate,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
    const id = setTimeout(() => setMostrado(valor), MS_FUNDIDO / 2);
    return () => clearTimeout(id);
  }, [valor, contador, opacidad, motion.reducido]);

  const tinta = atenuado ? colors.textMuted : (color ?? colors.text);

  return (
    <View style={styles.caja}>
      <Animated.View style={[styles.linea, { opacity: opacidad }]}>
        <Text
          style={[typography.dataHero, { color: tinta }]}
          // Con letra XXL el número rompería el dial: se le pone tope.
          maxFontSizeMultiplier={1.4}
          accessibilityRole="text"
        >
          {mostrado}
        </Text>
        {unidad ? (
          <Text
            style={[typography.dataHeroUnit, { color: colors.textSecondary }, styles.unidad]}
            maxFontSizeMultiplier={1.4}
          >
            {unidad}
          </Text>
        ) : null}
      </Animated.View>

      {pie ? (
        <Text style={[typography.caption, { color: colors.textSecondary }, styles.pie]}>{pie}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  caja: { alignItems: 'center' },
  /** La unidad se apoya en la línea base del número, no en su centro. */
  linea: { flexDirection: 'row', alignItems: 'baseline' },
  unidad: { marginLeft: 2 },
  pie: { marginTop: 2, textAlign: 'center' },
});
