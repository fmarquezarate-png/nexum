import { Plus } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from './ThemeProvider';
import { layout, radius, spacing, typography } from './tokens';
import { PressableAnimado, usePressScale } from './usePressScale';

/**
 * Botón principal de una pantalla de lista: redondo, flotando abajo a la
 * derecha, siempre visible.
 *
 * Sustituye al botón que vivía al final del scroll y había que ir a
 * buscar. Si para crear algo hay que desplazarse hasta el fondo de una
 * lista de veinte, la acción principal de la pantalla está escondida.
 */
export function Fab({
  onPress,
  etiqueta,
  /** Se aparta de la barra de pestañas cuando la pantalla está dentro de ellas. */
  sobreTabBar = false,
}: {
  onPress: () => void;
  etiqueta: string;
  sobreTabBar?: boolean;
}) {
  const { colors, shadow } = useTheme();
  const { animatedStyle, onPressIn, onPressOut } = usePressScale('boton');
  const insets = useSafeAreaInsets();

  const abajo =
    insets.bottom + spacing.xl + (sobreTabBar ? layout.tabBarHeight : 0);

  return (
    <PressableAnimado
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      accessibilityRole="button"
      accessibilityLabel={etiqueta}
      style={[
        styles.boton,
        shadow.raised,
        { backgroundColor: colors.brandFill, bottom: abajo },
        animatedStyle,
      ]}
    >
      <View style={styles.contenido}>
        <Plus size={20} strokeWidth={2} color={colors.textOnFill} />
        <Text style={[typography.bodyStrong, { color: colors.textOnFill }]} numberOfLines={1}>
          {etiqueta}
        </Text>
      </View>
    </PressableAnimado>
  );
}

const styles = StyleSheet.create({
  boton: {
    position: 'absolute',
    right: layout.screenPaddingH,
    minHeight: 52,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    borderRadius: radius.pill,
  },
  contenido: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
