import { useEffect, useRef, type ReactNode } from 'react';
import { Animated, Platform, type ViewStyle } from 'react-native';

import { useTheme } from './ThemeProvider';
import { curvas, stagger } from './tokens';

/**
 * Entrada escalonada de una tarjeta.
 *
 * Aparece subiendo 8 px y apareciendo. 8 y no 20: el gesto se insinúa,
 * no se ejecuta.
 *
 * SOLO en el primer montaje de la lista. No al hacer scroll, no al
 * volver a la pantalla, no al refrescar: animar cada vez que llegan
 * datos convierte la app en un parpadeo constante. Por eso la animación
 * vive en un efecto sin dependencias y el valor inicial se fija una sola
 * vez con useRef.
 *
 * El escalonado se corta en la sexta tarjeta; de ahí en adelante todas
 * entran con el retardo de la sexta, para que la última de una lista
 * larga no aparezca dos segundos después que la primera.
 */
export function Entrada({
  indice = 0,
  children,
  style,
}: {
  indice?: number;
  children: ReactNode;
  style?: ViewStyle;
}) {
  const { motion } = useTheme();
  const progreso = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const retardo = Math.min(indice, stagger.max - 1) * motion.step;
    const animacion = Animated.timing(progreso, {
      toValue: 1,
      duration: motion.reducido ? motion.fast : stagger.duration,
      delay: retardo,
      easing: curvas.decelerate,
      useNativeDriver: Platform.OS !== 'web',
    });
    animacion.start();
    return () => animacion.stop();
    // Sin dependencias a propósito: solo el primer montaje.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View
      style={[
        {
          opacity: progreso,
          transform: [
            {
              translateY: progreso.interpolate({
                inputRange: [0, 1],
                outputRange: [motion.translateY, 0],
              }),
            },
          ],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}
