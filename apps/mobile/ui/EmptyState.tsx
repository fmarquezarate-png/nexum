import { StyleSheet, Text, View } from 'react-native';

import { Button } from './Button';
import { Mascota, type MascotaId } from './Mascota';
import { colors, spacing, typography } from './tokens';

interface EmptyStateProps {
  titulo: string;
  descripcion?: string;
  quien?: MascotaId;
  accion?: { label: string; onPress: () => void };
}

/**
 * Lo que se ve cuando una lista está vacía.
 *
 * Siempre con tres cosas: qué pasa, por qué no es un error, y qué se
 * puede hacer al respecto. Una lista vacía sin explicación parece rota.
 */
export function EmptyState({ titulo, descripcion, quien = 'nexi', accion }: EmptyStateProps) {
  return (
    <View style={styles.caja}>
      <Mascota quien={quien} tamano={120} />
      <Text style={styles.titulo}>{titulo}</Text>
      {descripcion ? <Text style={styles.descripcion}>{descripcion}</Text> : null}
      {accion ? (
        <Button label={accion.label} onPress={accion.onPress} ancho={false} style={styles.boton} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  caja: { alignItems: 'center', paddingVertical: spacing.xl, gap: spacing.sm },
  titulo: { ...typography.heading, color: colors.text, textAlign: 'center' },
  descripcion: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 320,
  },
  boton: { marginTop: spacing.md },
});
