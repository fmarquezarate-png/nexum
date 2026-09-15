import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AccessibilityInfo, useColorScheme } from 'react-native';

import { configurarVibracion } from './haptics';
import {
  darkColors,
  lightColors,
  motionFor,
  shadowsFor,
  type Colors,
  type Motion,
  type Scheme,
  type Sombra,
} from './tokens';

/** Lo que el usuario elige en Ajustes. 'auto' sigue al sistema. */
export type PreferenciaTema = 'auto' | 'light' | 'dark';

interface Tema {
  /** Los colores ya resueltos. Un componente NUNCA pregunta si es de noche. */
  colors: Colors;
  /** Las tres sombras, ya ajustadas al modo. */
  shadow: Record<'subtle' | 'card' | 'raised', Sombra>;
  /** Modo efectivo, después de resolver 'auto'. */
  scheme: Scheme;
  preferencia: PreferenciaTema;
  cambiarTema: (p: PreferenciaTema) => void;
  /** Duraciones ya recortadas si el sistema pide movimiento reducido. */
  motion: Motion;
  /** Si la app puede vibrar. Lo decide el usuario en Ajustes. */
  vibracion: boolean;
  cambiarVibracion: (v: boolean) => void;
}

const Ctx = createContext<Tema | null>(null);
const CLAVE = 'nexum.tema';
const CLAVE_VIBRACION = 'nexum.vibracion';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const delSistema = useColorScheme();
  const [preferencia, setPreferencia] = useState<PreferenciaTema>('auto');
  const [reducido, setReducido] = useState(false);
  const [vibracion, setVibracion] = useState(true);

  // Se recuerda la elección entre sesiones.
  useEffect(() => {
    AsyncStorage.multiGet([CLAVE, CLAVE_VIBRACION])
      .then((pares) => {
        for (const [clave, v] of pares) {
          if (clave === CLAVE && (v === 'light' || v === 'dark' || v === 'auto')) setPreferencia(v);
          // Por defecto la vibración está activada: solo se apaga si el
          // usuario la apagó expresamente alguna vez.
          if (clave === CLAVE_VIBRACION && v === '0') setVibracion(false);
        }
      })
      .catch(() => {
        // Si el almacenamiento falla, seguimos con los valores por
        // defecto. No es grave y no merece molestar al usuario.
      });
  }, []);

  /**
   * "Reducir movimiento" del sistema.
   *
   * Se lee una vez y se escucha el cambio, porque se puede activar con
   * la app abierta. El resultado se recorta aquí, en el proveedor, para
   * que ninguna pantalla tenga que preguntar por el ajuste.
   */
  useEffect(() => {
    let vivo = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((v) => {
        if (vivo) setReducido(v);
      })
      .catch(() => {});

    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReducido);
    return () => {
      vivo = false;
      sub.remove();
    };
  }, []);

  // El módulo de vibración no puede leer el contexto (lo llaman
  // funciones sueltas, no componentes), así que se le empuja el ajuste.
  useEffect(() => {
    configurarVibracion(vibracion);
  }, [vibracion]);

  const valor = useMemo<Tema>(() => {
    const scheme: Scheme =
      preferencia === 'auto' ? (delSistema === 'dark' ? 'dark' : 'light') : preferencia;

    return {
      scheme,
      colors: scheme === 'dark' ? darkColors : lightColors,
      shadow: shadowsFor(scheme),
      motion: motionFor(reducido),
      preferencia,
      cambiarTema: (p) => {
        setPreferencia(p);
        void AsyncStorage.setItem(CLAVE, p).catch(() => {});
      },
      vibracion,
      cambiarVibracion: (v) => {
        setVibracion(v);
        void AsyncStorage.setItem(CLAVE_VIBRACION, v ? '1' : '0').catch(() => {});
      },
    };
  }, [preferencia, delSistema, reducido, vibracion]);

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

/**
 * Acceso al tema desde cualquier componente.
 *
 *   const { colors, shadow } = useTheme();
 *
 * Los estilos que dependen del color se crean dentro del componente, no
 * con StyleSheet.create a nivel de módulo: si se crean fuera, se quedan
 * congelados con los colores del primer arranque y el modo oscuro no
 * cambia nada.
 */
export function useTheme(): Tema {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useTheme se ha usado fuera de <ThemeProvider>');
  return ctx;
}
