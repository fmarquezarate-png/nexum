import { useRef } from 'react';
import { Animated, Platform, Pressable } from 'react-native';

import { useTheme } from './ThemeProvider';
import { easing } from './tokens';

/**
 * Pressable que acepta estilos animados.
 *
 * El Pressable normal NO los acepta: hay que envolverlo. Sin esto, el
 * encogido al pulsar no se aplica y no da ningún error, simplemente no
 * pasa nada.
 */
export const PressableAnimado = Animated.createAnimatedComponent(Pressable);

type Pieza = 'boton' | 'tarjeta';

/**
 * Encoge levemente un elemento mientras se pulsa.
 *
 * Sustituye al viejo "bajar la opacidad", que es lo que más abarata una
 * interfaz: las apps cuidadas responden al dedo con movimiento, no
 * apagándose.
 *
 * La vuelta va con muelle y no con una duración fija porque el regreso
 * de una pulsación tiene que sentirse elástico sin rebotar; el muelle
 * está calibrado (amortiguación 18, rigidez 320) para no producir
 * sobreimpulso visible.
 *
 * Una tarjeta encoge menos que un botón: el mismo 3 % en un área ancha
 * se percibe como un salto.
 *
 * El movimiento va por el hilo nativo, así que no se entrecorta aunque
 * la pantalla esté ocupada cargando datos. En web no existe ese hilo.
 */
export function usePressScale(pieza: Pieza | number = 'boton') {
  const { motion } = useTheme();
  const valor = useRef(new Animated.Value(1)).current;

  const escala =
    typeof pieza === 'number'
      ? motion.reducido
        ? 1
        : pieza
      : pieza === 'tarjeta'
        ? motion.escalaTarjeta
        : motion.escalaBoton;

  const nativo = Platform.OS !== 'web';

  return {
    animatedStyle: { transform: [{ scale: valor }] },
    onPressIn: () =>
      Animated.timing(valor, {
        toValue: escala,
        duration: motion.instant,
        useNativeDriver: nativo,
      }).start(),
    onPressOut: () =>
      Animated.spring(valor, {
        toValue: 1,
        damping: easing.press.damping,
        stiffness: easing.press.stiffness,
        mass: easing.press.mass,
        useNativeDriver: nativo,
      }).start(),
  };
}
