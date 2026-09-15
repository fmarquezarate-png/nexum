import { StyleSheet, Text, View } from 'react-native';

import { Button } from './Button';
import { Mascota, type MascotaId } from './Mascota';
import { useTheme } from './ThemeProvider';
import { spacing, typography } from './tokens';

interface EmptyStateProps {
  titulo: string;
  descripcion?: string;
  /** Solo se pasa si la pantalla es de las que explican algo. */
  quien?: MascotaId;
  accion?: { label: string; onPress: () => void };
}

/**
 * Lo que se ve cuando una lista está vacía DE VERDAD.
 *
 * ⚠ No usar cuando falla la red. Un fallo de conexión con este cartel le
 * dice al usuario que ha perdido sus datos, y es mentira. Para eso está
 * ErrorState.
 */
export function EmptyState({ titulo, descripcion, quien, accion }: EmptyStateProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.caja}>
      {quien ? <Mascota quien={quien} tamano={120} /> : null}
      <Text style={[typography.section, { color: colors.text }, styles.centro]}>{titulo}</Text>
      {descripcion ? (
        <Text style={[typography.body, { color: colors.textSecondary }, styles.centro, styles.ancho]}>
          {descripcion}
        </Text>
      ) : null}
      {accion ? (
        <Button
          label={accion.label}
          onPress={accion.onPress}
          ancho={false}
          style={styles.boton}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  caja: { alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.sm },
  centro: { textAlign: 'center' },
  ancho: { maxWidth: 320 },
  boton: { marginTop: spacing.md },
});
