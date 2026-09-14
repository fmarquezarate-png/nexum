import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, shadow, spacing, typography } from './tokens';

/**
 * Bocadillo de diálogo, como los de un cómic.
 *
 * Se pone encima de una mascota para que parezca que habla. El pico
 * apunta hacia abajo, hacia ella.
 *
 * El pico es un cuadrado girado 45 grados al que se le tapa la mitad
 * de arriba solapándolo con el cuerpo del bocadillo: es la forma de
 * hacer un triángulo en React Native sin usar imágenes.
 */
export function Burbuja({ children }: { children: string }) {
  return (
    <View style={styles.caja}>
      <View style={styles.cuerpo}>
        <Text style={styles.texto}>{children}</Text>
      </View>
      <View style={styles.pico} />
    </View>
  );
}

const styles = StyleSheet.create({
  caja: { alignItems: 'center', maxWidth: 320 },
  cuerpo: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    ...shadow.card,
  },
  texto: { ...typography.body, color: colors.text, textAlign: 'center' },
  pico: {
    width: 14,
    height: 14,
    backgroundColor: colors.surface,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    transform: [{ rotate: '45deg' }],
    marginTop: -7,
  },
});
