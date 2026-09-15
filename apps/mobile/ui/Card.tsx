import type { ReactNode } from 'react';
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
 */
export function Card({ children, onPress, compacta, elevada, style }: CardProps) {
  const { colors, shadow } = useTheme();
  const { animatedStyle, onPressIn, onPressOut } = usePressScale();

  const base: ViewStyle = {
    backgroundColor: elevada ? colors.surfaceElevated : colors.surface,
    borderRadius: radius.card,
    padding: compacta ? layout.cardPaddingCompact : layout.cardPadding,
    borderWidth: colors.cardBorderWidth,
    borderColor: colors.cardBorder,
    ...(elevada ? shadow.raised : shadow.card),
  };

  if (!onPress) {
    return <View style={[base, styles.contenido, style]}>{children}</View>;
  }

  return (
    <PressableAnimado
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      accessibilityRole="button"
      style={[base, styles.contenido, animatedStyle, style]}
    >
      {children}
    </PressableAnimado>
  );
}

const styles = StyleSheet.create({
  contenido: { gap: 8 },
});
