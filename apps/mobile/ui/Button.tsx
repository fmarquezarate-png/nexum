import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { useTheme } from './ThemeProvider';
import { confirmarAccion } from './haptics';
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
  const { animatedStyle, onPressIn, onPressOut } = usePressScale('boton');
  const [pulsado, setPulsado] = useState(false);
  const bloqueado = desactivado || cargando;

  /**
   * Al pulsar cambia el COLOR, nunca la opacidad. Bajar la opacidad deja
   * ver el fondo a través del botón y es el tic visual que más abarata
   * una interfaz.
   */
  const paleta: Record<Variante, { fondo: string; pulsado: string; texto: string; borde?: string }> = {
    primario: { fondo: colors.brandFill, pulsado: colors.brandPressed, texto: colors.textOnFill },
    secundario: {
      fondo: colors.surface,
      pulsado: colors.surfaceSunken,
      texto: colors.text,
      borde: colors.borderStrong,
    },
    texto: { fondo: 'transparent', pulsado: colors.brandSoft, texto: colors.brand },
    peligro: {
      fondo: 'transparent',
      pulsado: colors.dangerSoft,
      texto: colors.danger,
      borde: colors.danger,
    },
  };
  const v = paleta[variante];

  return (
    <PressableAnimado
      onPress={onPress}
      onPressIn={
        bloqueado
          ? undefined
          : () => {
              setPulsado(true);
              onPressIn();
            }
      }
      onPressOut={
        bloqueado
          ? undefined
          : () => {
              setPulsado(false);
              onPressOut();
              // La vibración va AL SOLTAR: confirma que la acción se ha
              // lanzado, no que el dedo ha tocado el cristal.
              if (vibra) confirmarAccion();
            }
      }
      disabled={bloqueado}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: bloqueado, busy: cargando }}
      style={[
        styles.boton,
        {
          backgroundColor: pulsado ? v.pulsado : v.fondo,
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
  bloqueado: { opacity: 0.45 },
  contenido: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: layout.hitTarget - 8,
  },
});
