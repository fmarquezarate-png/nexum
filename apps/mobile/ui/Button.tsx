import { ActivityIndicator, Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';

import { HIT_TARGET, colors, radius, spacing, typography } from './tokens';

type Variante = 'primario' | 'secundario' | 'texto' | 'peligro';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variante?: Variante;
  /** Muestra una ruedecita y bloquea el botón. */
  cargando?: boolean;
  desactivado?: boolean;
  /** Ocupa todo el ancho disponible. */
  ancho?: boolean;
  style?: ViewStyle;
}

export function Button({
  label,
  onPress,
  variante = 'primario',
  cargando = false,
  desactivado = false,
  ancho = true,
  style,
}: ButtonProps) {
  const bloqueado = desactivado || cargando;
  const v = estilos[variante];

  return (
    <Pressable
      onPress={onPress}
      disabled={bloqueado}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: bloqueado, busy: cargando }}
      style={({ pressed }) => [
        base.boton,
        v.boton,
        ancho && base.ancho,
        pressed && !bloqueado && base.pulsado,
        bloqueado && base.bloqueado,
        style,
      ]}
    >
      {cargando ? (
        <ActivityIndicator color={v.texto.color} />
      ) : (
        <Text style={[base.texto, v.texto]}>{label}</Text>
      )}
    </Pressable>
  );
}

const base = StyleSheet.create({
  boton: {
    minHeight: HIT_TARGET,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ancho: { alignSelf: 'stretch' },
  pulsado: { opacity: 0.75 },
  bloqueado: { opacity: 0.45 },
  texto: { ...typography.bodyStrong },
});

const estilos = {
  primario: StyleSheet.create({
    boton: { backgroundColor: colors.brand },
    texto: { color: colors.textOnBrand },
  }),
  secundario: StyleSheet.create({
    boton: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    texto: { color: colors.text },
  }),
  texto: StyleSheet.create({
    boton: { backgroundColor: 'transparent', paddingHorizontal: spacing.sm },
    texto: { color: colors.brand },
  }),
  peligro: StyleSheet.create({
    boton: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.danger },
    texto: { color: colors.danger },
  }),
} as const;
