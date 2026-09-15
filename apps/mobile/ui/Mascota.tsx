import { Image, StyleSheet, View } from 'react-native';

/** Las tres mascotas de la casa. Ver brand/README.md. */
const IMAGENES = {
  nexi: require('../assets/mascotas/nexi.png'),
  airi: require('../assets/mascotas/airi.png'),
  broti: require('../assets/mascotas/broti.png'),
} as const;

export type MascotaId = keyof typeof IMAGENES;

/**
 * REGLA DE USO (docs/diseno/02-experiencia-de-uso.md):
 *
 *   Aparece cuando la app PIDE o EXPLICA algo.
 *   Nunca mientras el usuario trabaja.
 *   Una por pantalla y una por recorrido.
 *   NUNCA en una confirmación de borrado ni en un error con solución.
 *
 * Una mascota en cada pantalla deja de ser simpática en dos días.
 */
export function Mascota({ quien = 'nexi', tamano = 140 }: { quien?: MascotaId; tamano?: number }) {
  return (
    <View style={styles.caja}>
      <Image
        source={IMAGENES[quien]}
        style={{ width: tamano, height: tamano }}
        resizeMode="contain"
        accessible
        accessibilityLabel={`Mascota ${quien}`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  caja: { alignItems: 'center' },
});
