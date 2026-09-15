import { Check, Info, TriangleAlert } from 'lucide-react-native';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Animated, Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from './ThemeProvider';
import { vibrarError, vibrarExito } from './haptics';
import { duration, layout, radius, spacing, typography } from './tokens';

type Tono = 'exito' | 'aviso' | 'info';

interface Aviso {
  texto: string;
  tono: Tono;
}

interface AvisoAPI {
  /**
   * Confirma que algo ha salido bien. Se usa SOLO cuando el resultado no
   * se ve en pantalla: si la lista ya muestra el cambio, el aviso sobra
   * y encima tapa contenido.
   */
  avisarExito: (texto: string) => void;
  avisarAviso: (texto: string) => void;
  avisarInfo: (texto: string) => void;
}

const Ctx = createContext<AvisoAPI | null>(null);

const VISIBLE_MS = 3000;

/**
 * Avisos al pie.
 *
 * Un único mecanismo para toda la app. Antes no había ninguno: guardabas
 * algo y no pasaba nada visible, así que nunca sabías si había ido bien.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mostrar = useCallback((texto: string, tono: Tono) => {
    if (temporizador.current) clearTimeout(temporizador.current);
    setAviso({ texto, tono });
    if (tono === 'exito') vibrarExito();
    if (tono === 'aviso') vibrarError();
    temporizador.current = setTimeout(() => setAviso(null), VISIBLE_MS);
  }, []);

  useEffect(
    () => () => {
      if (temporizador.current) clearTimeout(temporizador.current);
    },
    [],
  );

  const api = useMemo<AvisoAPI>(
    () => ({
      avisarExito: (t) => mostrar(t, 'exito'),
      avisarAviso: (t) => mostrar(t, 'aviso'),
      avisarInfo: (t) => mostrar(t, 'info'),
    }),
    [mostrar],
  );

  return (
    <Ctx.Provider value={api}>
      {children}
      {aviso ? <Pildora aviso={aviso} /> : null}
    </Ctx.Provider>
  );
}

function Pildora({ aviso }: { aviso: Aviso }) {
  const { colors, shadow } = useTheme();
  const insets = useSafeAreaInsets();
  const entrada = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(entrada, {
      toValue: 1,
      duration: duration.slow,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [entrada, aviso]);

  const paleta: Record<Tono, { fondo: string; texto: string; Icono: typeof Check }> = {
    exito: { fondo: colors.successSoft, texto: colors.success, Icono: Check },
    aviso: { fondo: colors.dangerSoft, texto: colors.danger, Icono: TriangleAlert },
    info: { fondo: colors.brandSoft, texto: colors.brand, Icono: Info },
  };
  const p = paleta[aviso.tono];

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.caja,
        shadow.raised,
        {
          backgroundColor: colors.surfaceElevated,
          borderColor: colors.cardBorder,
          borderWidth: colors.cardBorderWidth,
          bottom: insets.bottom + layout.tabBarHeight + spacing.lg,
          opacity: entrada,
          transform: [
            { translateY: entrada.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) },
          ],
        },
      ]}
      accessibilityLiveRegion="polite"
    >
      <View style={[styles.azulejo, { backgroundColor: p.fondo }]}>
        <p.Icono size={16} strokeWidth={2.2} color={p.texto} />
      </View>
      <Text style={[typography.bodyStrong, { color: colors.text }, styles.texto]} numberOfLines={2}>
        {aviso.texto}
      </Text>
    </Animated.View>
  );
}

export function useAviso(): AvisoAPI {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAviso se ha usado fuera de <ToastProvider>');
  return ctx;
}

const styles = StyleSheet.create({
  caja: {
    position: 'absolute',
    left: layout.screenPaddingH,
    right: layout.screenPaddingH,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  azulejo: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texto: { flex: 1 },
});
