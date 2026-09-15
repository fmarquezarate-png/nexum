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
import {
  Animated,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from './ThemeProvider';
import { confirmarRed, errorDeComando } from './haptics';
import { curvas, layout, radius, spacing, typography } from './tokens';

/** Los tres tonos, y solo tres. */
type Tono = 'correcto' | 'aviso' | 'error';

interface Aviso {
  texto: string;
  tono: Tono;
  /** Si viene, el aviso trae botón Deshacer y vive ocho segundos. */
  deshacer?: () => void;
  /** Cambia en cada aviso para forzar el reinicio de la animación. */
  sello: number;
}

interface AvisoAPI {
  /**
   * Confirma que algo ha salido bien. Se usa SOLO cuando el resultado no
   * se ve en pantalla: si la lista ya muestra el cambio, el aviso sobra
   * y encima tapa contenido.
   */
  avisarExito: (texto: string, deshacer?: () => void) => void;
  /** Algo ha salido a medias, o hay algo que conviene saber. */
  avisarAviso: (texto: string) => void;
  /** Algo ha fallado pero la pantalla sigue siendo usable. */
  avisarError: (texto: string) => void;
}

const Ctx = createContext<AvisoAPI | null>(null);

const VISIBLE_MS = 3000;
/** Ocho y no cinco: con el móvil en la mano se tarda en reaccionar. */
const VISIBLE_CON_DESHACER_MS = 8000;

/**
 * Avisos al pie.
 *
 * Un único mecanismo para toda la app. Antes no había ninguno: guardabas
 * algo y no pasaba nada visible, así que nunca sabías si había ido bien,
 * y la gente reacciona a eso pulsando dos veces.
 *
 * Nunca se apilan: el nuevo sustituye al anterior. Dos franjas a la vez
 * tapan media pantalla y la segunda no se lee.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mostrar = useCallback((texto: string, tono: Tono, deshacer?: () => void) => {
    if (temporizador.current) clearTimeout(temporizador.current);
    setAviso({ texto, tono, deshacer, sello: Date.now() });

    if (tono === 'correcto') confirmarRed();
    if (tono === 'error') errorDeComando();

    temporizador.current = setTimeout(
      () => setAviso(null),
      deshacer ? VISIBLE_CON_DESHACER_MS : VISIBLE_MS,
    );
  }, []);

  useEffect(
    () => () => {
      if (temporizador.current) clearTimeout(temporizador.current);
    },
    [],
  );

  const api = useMemo<AvisoAPI>(
    () => ({
      avisarExito: (texto, deshacer) => mostrar(texto, 'correcto', deshacer),
      avisarAviso: (texto) => mostrar(texto, 'aviso'),
      avisarError: (texto) => mostrar(texto, 'error'),
    }),
    [mostrar],
  );

  const cerrar = useCallback(() => {
    if (temporizador.current) clearTimeout(temporizador.current);
    setAviso(null);
  }, []);

  return (
    <Ctx.Provider value={api}>
      {children}
      {aviso ? <Pildora key={aviso.sello} aviso={aviso} onCerrar={cerrar} /> : null}
    </Ctx.Provider>
  );
}

function Pildora({ aviso, onCerrar }: { aviso: Aviso; onCerrar: () => void }) {
  const { colors, shadow, motion } = useTheme();
  const insets = useSafeAreaInsets();
  const entrada = useRef(new Animated.Value(0)).current;
  const arrastre = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(entrada, {
      toValue: 1,
      duration: motion.slow,
      easing: curvas.decelerate,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [entrada, motion.slow]);

  // Se puede descartar deslizándola hacia abajo. Un aviso que no se
  // puede quitar de en medio molesta más de lo que informa.
  const gestos = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => g.dy > 6,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) arrastre.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 40) onCerrar();
        else
          Animated.spring(arrastre, { toValue: 0, useNativeDriver: Platform.OS !== 'web' }).start();
      },
    }),
  ).current;

  const paleta: Record<Tono, { fondo: string; tinta: string; Icono: typeof Check }> = {
    correcto: { fondo: colors.successSoft, tinta: colors.success, Icono: Check },
    aviso: { fondo: colors.warningSoft, tinta: colors.warning, Icono: Info },
    error: { fondo: colors.dangerSoft, tinta: colors.danger, Icono: TriangleAlert },
  };
  const p = paleta[aviso.tono];

  return (
    <Animated.View
      {...gestos.panHandlers}
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
            {
              translateY: Animated.add(
                entrada.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }),
                arrastre,
              ),
            },
          ],
        },
      ]}
      accessibilityLiveRegion="polite"
    >
      <View style={[styles.azulejo, { backgroundColor: p.fondo }]}>
        <p.Icono size={16} strokeWidth={2} color={p.tinta} />
      </View>

      <Text style={[typography.bodyStrong, { color: colors.text }, styles.texto]} numberOfLines={2}>
        {aviso.texto}
      </Text>

      {aviso.deshacer ? (
        <Pressable
          onPress={() => {
            aviso.deshacer?.();
            onCerrar();
          }}
          accessibilityRole="button"
          hitSlop={12}
          style={styles.deshacer}
        >
          <Text style={[typography.bodyStrong, { color: colors.brand }]}>Deshacer</Text>
        </Pressable>
      ) : null}
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
  deshacer: { minHeight: layout.hitTarget, justifyContent: 'center', paddingLeft: spacing.sm },
});
