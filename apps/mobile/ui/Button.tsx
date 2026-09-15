import { ActivityIndicator, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { useTheme } from './ThemeProvider';
import { vibrarAccion } from './haptics';
import { layout, radius, spacing, typography } from './tokens';
import { PressableAnimado, usePressScale } from './usePressScale';

type Variante = 'primario' | 'secundario' | 'texto' | 'peligro';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variante?: Variante;
  cargando?: boolean;
  desactivado?: boolean;
  ancho?: boolean;
  /** Icono a la izquierda del texto. Se le pasa ya con su color. */
  icono?: React.ReactNode;
  /**
   * Vibra al pulsar. Solo para acciones con efecto real sobre el hogar.
   * Nunca para navegar. Por defecto no vibra.
   */
  vibra?: boolean;
  style?: ViewStyle;
}

export function Button({
  label,
  onPress,
  variante = 'primario',
  cargando = false,
  desactivado = false,
  ancho = true,
  icono,
  vibra = false,
  style,
}: ButtonProps) {
  const { colors } = useTheme();
  const { animatedStyle, onPressIn, onPressOut } = usePressScale();
  const bloqueado = desactivado || cargando;

  const paleta: Record<Variante, { fondo: string; texto: string; borde?: string }> = {
    primario: { fondo: colors.brandFill, texto: colors.textOnFill },
    secundario: { fondo: colors.surface, texto: colors.text, borde: colors.borderStrong },
    texto: { fondo: 'transparent', texto: colors.brand },
    peligro: { fondo: 'transparent', texto: colors.danger, borde: colors.danger },
  };
  const v = paleta[variante];

  return (
    <PressableAnimado
      onPress={() => {
        if (vibra) vibrarAccion();
        onPress();
      }}
      onPressIn={bloqueado ? undefined : onPressIn}
      onPressOut={bloqueado ? undefined : onPressOut}
      disabled={bloqueado}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: bloqueado, busy: cargando }}
      style={[
        styles.boton,
        {
          backgroundColor: v.fondo,
          borderWidth: v.borde ? 1 : 0,
          borderColor: v.borde ?? 'transparent',
        },
        ancho && styles.ancho,
        bloqueado && styles.bloqueado,
        animatedStyle,
        style,
      ]}
    >
      {cargando ? (
        <ActivityIndicator color={v.texto} />
      ) : (
        <View style={styles.contenido}>
          {icono}
          <Text style={[typography.bodyStrong, { color: v.texto }]}>{label}</Text>
        </View>
      )}
    </PressableAnimado>
  );
}

const styles = StyleSheet.create({
  boton: {
    minHeight: 52,
    paddingHorizontal: spacing.xxl,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ancho: { alignSelf: 'stretch' },
  bloqueado: { opacity: 0.4 },
  contenido: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: layout.hitTarget - 8,
  },
});
