import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import {
  darkColors,
  lightColors,
  shadowsFor,
  type Colors,
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
}

const Ctx = createContext<Tema | null>(null);
const CLAVE = 'nexum.tema';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const delSistema = useColorScheme();
  const [preferencia, setPreferencia] = useState<PreferenciaTema>('auto');

  // Se recuerda la elección entre sesiones.
  useEffect(() => {
    AsyncStorage.getItem(CLAVE)
      .then((v) => {
        if (v === 'light' || v === 'dark' || v === 'auto') setPreferencia(v);
      })
      .catch(() => {
        // Si el almacenamiento falla, seguimos en automático. No es grave.
      });
  }, []);

  const valor = useMemo<Tema>(() => {
    const scheme: Scheme =
      preferencia === 'auto' ? (delSistema === 'dark' ? 'dark' : 'light') : preferencia;

    return {
      scheme,
      colors: scheme === 'dark' ? darkColors : lightColors,
      shadow: shadowsFor(scheme),
      preferencia,
      cambiarTema: (p) => {
        setPreferencia(p);
        void AsyncStorage.setItem(CLAVE, p).catch(() => {});
      },
    };
  }, [preferencia, delSistema]);

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
