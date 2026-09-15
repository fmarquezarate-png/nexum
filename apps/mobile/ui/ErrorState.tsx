import { CloudOff } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from './Button';
import { IconTile } from './IconTile';
import { useTheme } from './ThemeProvider';
import { spacing, typography } from './tokens';

interface ErrorStateProps {
  /** Qué ha pasado, en cristiano. */
  titulo?: string;
  /** El motivo concreto. Nunca "ha ocurrido un error". */
  detalle?: string;
  onReintentar?: () => void;
}

/**
 * Lo que se ve cuando algo falla.
 *
 * Existe porque la app enseñaba "Todavía no tienes ninguna casa" cuando
 * lo que pasaba era que no había conexión. Eso le dice al usuario que ha
 * perdido sus datos. Vacío y error NUNCA pueden parecerse.
 *
 * Sin mascota a propósito: cuando algo va mal, un dibujo sonriente
 * molesta.
 */
export function ErrorState({ titulo, detalle, onReintentar }: ErrorStateProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.caja}>
      <IconTile tamano={56} fondo={colors.dangerSoft}>
        <CloudOff size={26} strokeWidth={1.75} color={colors.danger} />
      </IconTile>

      <Text style={[typography.section, { color: colors.text }, styles.centro]}>
        {titulo ?? 'No hemos podido cargar esto'}
      </Text>
      <Text style={[typography.body, { color: colors.textSecondary }, styles.centro, styles.ancho]}>
        {detalle ?? 'Revisa tu conexión a internet. Tus datos siguen a salvo.'}
      </Text>

      {onReintentar ? (
        <Button
          label="Reintentar"
          variante="secundario"
          onPress={onReintentar}
          ancho={false}
          style={styles.boton}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  caja: { alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.md },
  centro: { textAlign: 'center' },
  ancho: { maxWidth: 320 },
  boton: { marginTop: spacing.xs },
});
