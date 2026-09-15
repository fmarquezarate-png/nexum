import { StyleSheet, Text, View } from 'react-native';

import { Badge } from './ListRow';
import { Saludo } from './Saludo';
import { useTheme } from './ThemeProvider';
import type { MascotaId } from './Mascota';
import { spacing, typography } from './tokens';

interface ProximamenteProps {
  /** Qué va a haber aquí, en una frase que ilusione. */
  titulo: string;
  /** Lo que dice la mascota. En primera persona. */
  mensaje: string;
  quien?: MascotaId;
  /** Tres o cuatro cosas concretas que llegarán. */
  incluye?: string[];
}

/**
 * Pantalla de una sección que todavía no existe.
 *
 * Sustituye a las tarjetas de "Fase 3 · Pendiente de implementar", que
 * convertían la app en una lista de deberes. Aquí la palabra "Fase" no
 * aparece: eso es vocabulario del repositorio, no del producto.
 */
export function Proximamente({ titulo, mensaje, quien = 'nexi', incluye }: ProximamenteProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.caja}>
      <Saludo mensaje={mensaje} quien={quien} tamano={140} />

      <Badge texto="PRÓXIMAMENTE" tono="marca" />

      <Text style={[typography.section, { color: colors.text }, styles.centro]}>{titulo}</Text>

      {incluye?.length ? (
        <View style={styles.lista}>
          {incluye.map((linea) => (
            <View key={linea} style={styles.punto}>
              <View style={[styles.bolita, { backgroundColor: colors.brand }]} />
              <Text style={[typography.body, { color: colors.textSecondary }, styles.flexible]}>
                {linea}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  caja: { alignItems: 'center', gap: spacing.md, paddingTop: spacing.lg },
  centro: { textAlign: 'center' },
  lista: { gap: spacing.sm, paddingTop: spacing.sm, alignSelf: 'stretch', maxWidth: 340 },
  punto: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  bolita: { width: 6, height: 6, borderRadius: 3, marginTop: 8 },
  flexible: { flex: 1 },
});
