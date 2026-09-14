import { StyleSheet, Text, View } from 'react-native';

import { Card } from './Card';
import { colors, spacing, typography } from './tokens';

interface PlaceholderProps {
  /** Qué irá aquí cuando esté hecho. */
  what: string;
  /** En qué fase se implementa. */
  phase: string;
}

/**
 * Hueco marcado de una pantalla todavía sin hacer.
 *
 * Existe para que al abrir la app se vea la estructura completa y quede
 * claro qué falta y cuándo llega, en vez de pantallas en blanco que
 * parecen rotas.
 */
export function Placeholder({ what, phase }: PlaceholderProps) {
  return (
    <Card>
      <View style={styles.row}>
        <Text style={styles.badge}>{phase}</Text>
      </View>
      <Text style={styles.what}>{what}</Text>
      <Text style={styles.note}>Pendiente de implementar.</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  badge: {
    ...typography.label,
    color: colors.brand,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    overflow: 'hidden',
  },
  what: { ...typography.bodyStrong, color: colors.text },
  note: { ...typography.caption, color: colors.textFaint },
});
