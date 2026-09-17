import { Moon, Sun } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet } from 'react-native';

import { cambiarValor } from './haptics';
import { useTheme } from './ThemeProvider';
import { curvas, layout, radius } from './tokens';
import { PressableAnimado, usePressScale } from './usePressScale';

/**
 * Cambiar entre claro y oscuro de un toque.
 *
 * El icono dice A DÓNDE VAS, no dónde estás: de día enseña una luna
 * ("pulsa para la noche"). Un botón que muestra el estado actual se lee
 * como un indicador y no se pulsa.
 *
 * Deja siempre una preferencia explícita, nunca 'auto'. Es a propósito:
 * si desde 'auto' pulsaras y volvieras a 'auto', el botón no haría nada
 * visible la mitad de las veces. Para volver a seguir al sistema está
 * Ajustes, que es donde vive la opción de tres estados.
 */
export function BotonTema() {
  const { colors, scheme, cambiarTema, motion } = useTheme();
  const { animatedStyle, onPressIn, onPressOut } = usePressScale();

  const esDeNoche = scheme === 'dark';
  const destino = esDeNoche ? 'light' : 'dark';

  // El icono no se sustituye de golpe: se funde y gira un octavo de
  // vuelta. Es el único adorno del botón y dura lo que un parpadeo.
  // Arranca en 1, que es el reposo: con 0 el icono se quedaría
  // inclinado y a media opacidad hasta el primer cambio de tema.
  const giro = useRef(new Animated.Value(1)).current;
  const primera = useRef(true);

  useEffect(() => {
    if (primera.current) {
      primera.current = false;
      return;
    }
    giro.setValue(0);
    Animated.timing(giro, {
      toValue: 1,
      duration: motion.reducido ? motion.instant : motion.base,
      easing: curvas.decelerate,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [scheme, giro, motion]);

  const Icono = esDeNoche ? Sun : Moon;

  return (
    <PressableAnimado
      onPress={() => {
        cambiarValor();
        cambiarTema(destino);
      }}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      accessibilityRole="button"
      accessibilityLabel={esDeNoche ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      hitSlop={6}
      style={[
        styles.boton,
        // Fondo hundido y no de marca: al lado del avatar, dos círculos
        // con el color de marca compiten y ninguno gana.
        { backgroundColor: colors.surfaceSunken },
        animatedStyle,
      ]}
    >
      <Animated.View
        style={{
          opacity: giro.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0.4, 0.7, 1] }),
          transform: [
            {
              rotate: giro.interpolate({ inputRange: [0, 1], outputRange: ['-45deg', '0deg'] }),
            },
          ],
        }}
      >
        <Icono size={19} strokeWidth={1.9} color={colors.textSecondary} />
      </Animated.View>
    </PressableAnimado>
  );
}

const styles = StyleSheet.create({
  boton: {
    width: layout.avatar,
    height: layout.avatar,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
