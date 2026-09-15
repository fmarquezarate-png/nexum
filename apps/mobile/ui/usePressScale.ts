import { useRef } from 'react';
import { Animated, Platform, Pressable } from 'react-native';

import { PRESS_SCALE, duration } from './tokens';

/**
 * Pressable que acepta estilos animados.
 *
 * El Pressable normal NO los acepta: hay que envolverlo. Sin esto, el
 * encogido al pulsar no se aplica y no da ningún error, simplemente no
 * pasa nada.
 */
export const PressableAnimado = Animated.createAnimatedComponent(Pressable);

/**
 * Encoge levemente un elemento mientras se pulsa.
 *
 * Sustituye al viejo "bajar la opacidad", que es lo que más abarata una
 * interfaz: las apps cuidadas responden al dedo con movimiento, no
 * apagándose.
 *
 * El movimiento va por el hilo nativo, así que no se entrecorta aunque la
 * pantalla esté ocupada cargando datos. En web no existe ese hilo.
 */
export function usePressScale(escala = PRESS_SCALE) {
  const valor = useRef(new Animated.Value(1)).current;

  const animar = (a: number, ms: number) =>
    Animated.timing(valor, {
      toValue: a,
      duration: ms,
      useNativeDriver: Platform.OS !== 'web',
    }).start();

  return {
    animatedStyle: { transform: [{ scale: valor }] },
    onPressIn: () => animar(escala, duration.instant),
    onPressOut: () => animar(1, duration.fast),
  };
}
