import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from './ThemeProvider';
import { spacing, typography } from './tokens';

interface VacioDeMundoProps {
  Icono: LucideIcon;
  titulo: string;
  texto: string;
}

/**
 * Vacío de una pestaña secundaria dentro de un mundo.
 *
 * Sin mascota y sin botón, a propósito: la mascota ya salió en la portada
 * del mundo, y ofrecer "añadir equipo" en las cuatro pestañas convierte
 * el mundo en una lista de deberes. Se ofrece una vez, donde corresponde.
 */
export function VacioDeMundo({ Icono, titulo, texto }: VacioDeMundoProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.caja}>
      <Icono size={40} strokeWidth={1.5} color={colors.textFaint} />
      <Text style={[typography.section, { color: colors.text }, styles.centro]}>{titulo}</Text>
      <Text style={[typography.body, { color: colors.textSecondary }, styles.centro, styles.ancho]}>
        {texto}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  caja: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.huge },
  centro: { textAlign: 'center' },
  ancho: { maxWidth: 320 },
});
