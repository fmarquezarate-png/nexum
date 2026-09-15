import { useState, type ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { useTheme } from './ThemeProvider';
import { layout, radius } from './tokens';
import { PressableAnimado, usePressScale } from './usePressScale';

interface CardProps {
  children: ReactNode;
  /** Si se pasa, la tarjeta es pulsable y encoge levemente al tocarla. */
  onPress?: () => void;
  /** Tarjetas en rejilla de dos columnas: padding más ajustado. */
  compacta?: boolean;
  /** Elevación mayor: dial, hoja modal. */
  elevada?: boolean;
  /** Etiqueta para el lector de pantalla cuando la tarjeta es pulsable. */
  accesibilidad?: string;
  style?: ViewStyle;
}

/**
 * Tarjeta. La unidad visual básica de toda la app.
 *
 * Detalle importante: en claro NO lleva borde —la sombra ya la separa del
 * fondo, y poner las dos cosas hace que se cancelen y la tarjeta se vea
 * plana—. En oscuro sí lo lleva, porque ahí la sombra es invisible y el
 * borde es lo único que separa. Lo decide el token cardBorderWidth, así
 * que este componente no pregunta en qué modo está.
 *
 * Al pulsarla baja un escalón de sombra. Es lo que hace que se lea como
 * un objeto que se hunde y no como una imagen que se encoge; en oscuro,
 * donde no hay sombra, lo que cambia es el borde.
 */
export function Card({
  children,
  onPress,
  compacta,
  elevada,
  accesibilidad,
  style,
}: CardProps) {
  const { colors, shadow } = useTheme();
  const { animatedStyle, onPressIn, onPressOut } = usePressScale('tarjeta');
  const [pulsada, setPulsada] = useState(false);

  const reposo = elevada ? shadow.raised : shadow.card;

  const base: ViewStyle = {
    backgroundColor: elevada ? colors.surfaceElevated : colors.surface,
    borderRadius: radius.card,
    padding: compacta ? layout.cardPaddingCompact : layout.cardPadding,
    borderWidth: colors.cardBorderWidth,
    borderColor: pulsada ? colors.borderStrong : colors.cardBorder,
    ...(pulsada ? shadow.subtle : reposo),
  };

  if (!onPress) {
    return <View style={[base, styles.contenido, style]}>{children}</View>;
  }

  return (
    <PressableAnimado
      onPress={onPress}
      onPressIn={() => {
        setPulsada(true);
        onPressIn();
      }}
      onPressOut={() => {
        setPulsada(false);
        onPressOut();
      }}
      accessibilityRole="button"
      accessibilityLabel={accesibilidad}
      style={[base, styles.contenido, animatedStyle, style]}
    >
      {children}
    </PressableAnimado>
  );
}

const styles = StyleSheet.create({
  /** 12 entre los bloques internos, como en la anatomía de la tarjeta. */
  contenido: { gap: layout.cardGap },
});
