import { StyleSheet, View } from 'react-native';

import { Burbuja } from './Burbuja';
import { Mascota, type MascotaId } from './Mascota';
import { spacing } from './tokens';

/**
 * Mascota con bocadillo.
 *
 * Solo donde la app pide o explica algo: bienvenida, asistente de alta,
 * pantallas de "próximamente". Ver la regla completa en Mascota.tsx.
 */
export function Saludo({
  mensaje,
  quien = 'nexi',
  tamano = 150,
}: {
  mensaje: string;
  quien?: MascotaId;
  tamano?: number;
}) {
  return (
    <View style={styles.caja}>
      <Burbuja>{mensaje}</Burbuja>
      <Mascota quien={quien} tamano={tamano} />
    </View>
  );
}

const styles = StyleSheet.create({
  caja: { alignItems: 'center', gap: spacing.xs },
});
