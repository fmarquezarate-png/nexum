import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { Image, StyleSheet, Text } from 'react-native';

import { useTheme } from './ThemeProvider';
import { layout, radius, spacing, typography } from './tokens';
import { PressableAnimado, usePressScale } from './usePressScale';

const LOGO_NEXUM = require('../assets/marcas/nexum.png');

/**
 * La salida de un mundo de módulo, de vuelta a Nexum.
 *
 * Dice A DÓNDE VAS, no "Volver" ni "Atrás": cuando has cambiado de mundo,
 * saber que vuelves a Nexum es la única información útil.
 *
 * Es obligatoria en TODAS las pestañas raíz de un mundo, no solo en la
 * primera. Un mundo del que solo se sale desde una pestaña es una trampa.
 */
export function PuertaNexum() {
  const { colors } = useTheme();
  const { animatedStyle, onPressIn, onPressOut } = usePressScale(0.94);

  return (
    <PressableAnimado
      onPress={() => router.replace('/(nexum)')}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      accessibilityRole="button"
      accessibilityLabel="Volver a Nexum"
      hitSlop={8}
      style={[styles.puerta, animatedStyle]}
    >
      <ChevronLeft size={20} strokeWidth={1.75} color={colors.textSecondary} />
      {/* El logotipo no se tiñe nunca: es la marca, no un icono. */}
      <Image source={LOGO_NEXUM} style={styles.logo} resizeMode="contain" />
      <Text style={[typography.caption, { color: colors.textSecondary }]}>Nexum</Text>
    </PressableAnimado>
  );
}

const styles = StyleSheet.create({
  puerta: {
    minHeight: layout.hitTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingRight: spacing.sm,
    alignSelf: 'flex-start',
  },
  logo: { width: 24, height: 24, borderRadius: radius.xs },
});
