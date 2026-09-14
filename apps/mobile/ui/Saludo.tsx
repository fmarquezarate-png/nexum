import { StyleSheet, View } from 'react-native';

import { Burbuja } from './Burbuja';
import { Mascota, type MascotaId } from './Mascota';
import { spacing } from './tokens';

interface SaludoProps {
  /** Lo que dice la mascota. Va en un bocadillo encima de ella. */
  mensaje: string;
  quien?: MascotaId;
  tamano?: number;
}

/** Mascota con bocadillo. La usa la pantalla de bienvenida y el asistente. */
export function Saludo({ mensaje, quien = 'nexi', tamano = 150 }: SaludoProps) {
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
