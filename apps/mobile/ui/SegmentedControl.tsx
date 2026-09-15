import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from './ThemeProvider';
import { radius, spacing, typography } from './tokens';
import { PressableAnimado, usePressScale } from './usePressScale';

interface Opcion<T extends string> {
  valor: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  opciones: Opcion<T>[];
  valor: T;
  onChange: (v: T) => void;
}

/**
 * Selector de opciones excluyentes, en una sola fila.
 *
 * Es el control de "Auto / Claro / Oscuro" y el de duración de los
 * códigos. Se usa cuando hay entre dos y cuatro opciones y todas caben
 * escritas; por encima de cuatro, una lista.
 */
export function SegmentedControl<T extends string>({
  opciones,
  valor,
  onChange,
}: SegmentedControlProps<T>) {
  const { colors } = useTheme();

  return (
    <View
      style={[styles.pista, { backgroundColor: colors.surfaceSunken }]}
      accessibilityRole="radiogroup"
    >
      {opciones.map((o) => (
        <Segmento
          key={o.valor}
          label={o.label}
          activo={o.valor === valor}
          onPress={() => onChange(o.valor)}
        />
      ))}
    </View>
  );
}

function Segmento({
  label,
  activo,
  onPress,
}: {
  label: string;
  activo: boolean;
  onPress: () => void;
}) {
  const { colors, shadow } = useTheme();
  const { animatedStyle, onPressIn, onPressOut } = usePressScale(0.96);

  return (
    <PressableAnimado
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      accessibilityRole="radio"
      accessibilityState={{ selected: activo }}
      style={[
        styles.segmento,
        activo && { backgroundColor: colors.surface, ...shadow.subtle },
        animatedStyle,
      ]}
    >
      <Text
        style={[
          activo ? typography.captionStrong : typography.caption,
          { color: activo ? colors.text : colors.textSecondary },
        ]}
      >
        {label}
      </Text>
    </PressableAnimado>
  );
}

const styles = StyleSheet.create({
  pista: {
    flexDirection: 'row',
    borderRadius: radius.md,
    padding: 3,
    gap: 3,
  },
  segmento: {
    flex: 1,
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
  },
});
