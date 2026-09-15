import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from './ThemeProvider';
import { radius, spacing, typography } from './tokens';

/**
 * Bocadillo de diálogo, como los de un cómic.
 *
 * El pico es un cuadrado girado 45 grados al que se le tapa la mitad
 * superior solapándolo con el cuerpo: es la forma de hacer un triángulo
 * en React Native sin usar imágenes.
 */
export function Burbuja({ children }: { children: string }) {
  const { colors, shadow } = useTheme();

  const piel = {
    backgroundColor: colors.surface,
    borderColor: colors.cardBorder,
    borderWidth: colors.cardBorderWidth,
  };

  return (
    <View style={styles.caja}>
      <View style={[styles.cuerpo, piel, shadow.subtle]}>
        <Text style={[typography.body, { color: colors.text }, styles.texto]}>{children}</Text>
      </View>
      <View
        style={[
          styles.pico,
          { backgroundColor: colors.surface, borderColor: colors.cardBorder },
          colors.cardBorderWidth > 0 && styles.picoConBorde,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  caja: { alignItems: 'center', maxWidth: 320, alignSelf: 'center' },
  cuerpo: {
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  texto: { textAlign: 'center' },
  pico: {
    width: 14,
    height: 14,
    transform: [{ rotate: '45deg' }],
    marginTop: -7,
  },
  picoConBorde: { borderRightWidth: 1, borderBottomWidth: 1 },
});
