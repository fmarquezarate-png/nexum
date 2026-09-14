import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { HIT_TARGET, colors, radius, spacing, typography } from './tokens';

interface ListRowProps {
  titulo: string;
  subtitulo?: string;
  /** Algo a la derecha: una etiqueta, un interruptor, una flecha. */
  derecha?: ReactNode;
  onPress?: () => void;
}

/** Fila pulsable de una lista. Se usa en Ajustes, casas, miembros y códigos. */
export function ListRow({ titulo, subtitulo, derecha, onPress }: ListRowProps) {
  const Contenido = (
    <View style={styles.fila}>
      <View style={styles.textos}>
        <Text style={styles.titulo} numberOfLines={1}>
          {titulo}
        </Text>
        {subtitulo ? (
          <Text style={styles.subtitulo} numberOfLines={2}>
            {subtitulo}
          </Text>
        ) : null}
      </View>
      {derecha ? <View style={styles.derecha}>{derecha}</View> : null}
    </View>
  );

  if (!onPress) return Contenido;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => pressed && styles.pulsada}
    >
      {Contenido}
    </Pressable>
  );
}

/** Etiqueta pequeña de color. Para roles, estados y caducidades. */
export function Badge({ texto, tono = 'neutro' }: { texto: string; tono?: 'neutro' | 'ok' | 'aviso' | 'error' }) {
  return <Text style={[styles.badge, tonos[tono]]}>{texto}</Text>;
}

const styles = StyleSheet.create({
  fila: {
    minHeight: HIT_TARGET,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  pulsada: { opacity: 0.6 },
  textos: { flex: 1, gap: 2 },
  titulo: { ...typography.bodyStrong, color: colors.text },
  subtitulo: { ...typography.caption, color: colors.textMuted },
  derecha: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  badge: {
    ...typography.label,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
});

const tonos = StyleSheet.create({
  neutro: { color: colors.textMuted, backgroundColor: colors.surfaceAlt },
  ok: { color: '#1C6B3E', backgroundColor: '#DCF0E4' },
  aviso: { color: '#8A6318', backgroundColor: '#FAEFD6' },
  error: { color: '#8F2F1E', backgroundColor: '#F8DFDA' },
});
