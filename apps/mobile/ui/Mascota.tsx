import { Image, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from './tokens';

/** Las tres mascotas de la casa. Ver brand/README.md. */
const IMAGENES = {
  nexi: require('../assets/mascotas/nexi.png'),
  airi: require('../assets/mascotas/airi.png'),
  broti: require('../assets/mascotas/broti.png'),
} as const;

export type MascotaId = keyof typeof IMAGENES;

interface MascotaProps {
  quien?: MascotaId;
  /** Lo que "dice". Va debajo, centrado. */
  mensaje?: string;
  tamano?: number;
}

/**
 * Mascota con un mensaje opcional.
 *
 * Se usa donde una pantalla vacía resultaría fría: el asistente de alta,
 * las listas sin nada todavía, los errores sin salida.
 */
export function Mascota({ quien = 'nexi', mensaje, tamano = 140 }: MascotaProps) {
  return (
    <View style={styles.caja}>
      <Image
        source={IMAGENES[quien]}
        style={{ width: tamano, height: tamano }}
        resizeMode="contain"
        accessible
        accessibilityLabel={`Mascota ${quien}`}
      />
      {mensaje ? <Text style={styles.mensaje}>{mensaje}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  caja: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md },
  mensaje: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 300,
  },
});
