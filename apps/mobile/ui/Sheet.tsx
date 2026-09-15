import { useEffect, useRef, type ReactNode } from 'react';
import {
  Animated,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from './ThemeProvider';
import { curvas, layout, radius, spacing, typography } from './tokens';

interface SheetProps {
  visible: boolean;
  titulo: string;
  onCerrar: () => void;
  /** Acción principal. Va SIEMPRE arriba a la derecha, en toda la app. */
  accion?: { label: string; onPress: () => void; desactivada?: boolean };
  /** Texto del escape. Arriba a la izquierda. */
  cancelar?: string;
  children: ReactNode;
}

/**
 * Hoja que sube desde abajo.
 *
 * Es la forma de abrir formularios cortos y acciones sobre un elemento
 * concreto: renombrar, la ficha de un miembro, el QR de un código. La
 * diferencia con una pantalla apilada es que no cambias de sitio, solo
 * te asomas a algo; por eso se cierra con "Cancelar" y no con una flecha.
 *
 * El botón principal siempre arriba a la derecha. Que esté siempre en el
 * mismo sitio es más importante que el sitio que se elija.
 */
export function Sheet({ visible, titulo, onCerrar, accion, cancelar = 'Cancelar', children }: SheetProps) {
  const { colors, shadow, motion } = useTheme();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const progreso = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progreso, {
      toValue: visible ? 1 : 0,
      // Entrar se posa (decelerate); salir se va (accelerate) y tarda menos.
      duration: visible ? motion.slow : 220,
      easing: visible ? curvas.decelerate : curvas.accelerate,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [visible, progreso, motion.slow]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onCerrar}>
      <Animated.View style={[styles.velo, { backgroundColor: colors.scrim, opacity: progreso }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCerrar} accessibilityLabel={cancelar} />
      </Animated.View>

      <View style={styles.contenedor} pointerEvents="box-none">
        <Animated.View
          style={[
            styles.hoja,
            shadow.raised,
            {
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.cardBorder,
              borderWidth: colors.cardBorderWidth,
              maxHeight: height * 0.9,
              paddingBottom: insets.bottom + spacing.lg,
              transform: [
                {
                  translateY: progreso.interpolate({
                    inputRange: [0, 1],
                    outputRange: [height, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.barra}>
            <Text
              style={[typography.bodyStrong, { color: colors.textSecondary }, styles.escape]}
              onPress={onCerrar}
              accessibilityRole="button"
              suppressHighlighting
            >
              {cancelar}
            </Text>

            <Text style={[typography.cardTitle, { color: colors.text }]} numberOfLines={1}>
              {titulo}
            </Text>

            {accion ? (
              <Text
                style={[
                  typography.bodyStrong,
                  { color: accion.desactivada ? colors.textFaint : colors.brand },
                  styles.principal,
                ]}
                onPress={accion.desactivada ? undefined : accion.onPress}
                accessibilityRole="button"
                accessibilityState={{ disabled: accion.desactivada }}
                suppressHighlighting
              >
                {accion.label}
              </Text>
            ) : (
              <View style={styles.hueco} />
            )}
          </View>

          <ScrollView
            contentContainerStyle={styles.cuerpo}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  velo: { ...StyleSheet.absoluteFillObject },
  contenedor: { flex: 1, justifyContent: 'flex-end' },
  hoja: {
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    paddingTop: spacing.md,
  },
  barra: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: layout.screenPaddingH,
    minHeight: layout.hitTarget,
  },
  // Las zonas pulsables de texto se estiran a lo alto hasta el mínimo de
  // 44 pt: un enlace de 18 px de alto se falla al tocar.
  escape: { minWidth: 72, paddingVertical: spacing.md },
  principal: { minWidth: 72, textAlign: 'right', paddingVertical: spacing.md },
  hueco: { minWidth: 72 },
  cuerpo: {
    paddingHorizontal: layout.screenPaddingH,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    gap: layout.cardGap,
  },
});
