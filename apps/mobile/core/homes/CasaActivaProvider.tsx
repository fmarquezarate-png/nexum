import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { useAuth } from '@/core/auth';
import { mensajeDe } from '@/lib/errores';
import { listarCasas, type CasaConRol } from './api';

interface CasaActivaCtx {
  casas: CasaConRol[];
  /** La casa en la que estás. undefined mientras carga o si no tienes ninguna. */
  activa: CasaConRol | undefined;
  cargando: boolean;
  /** Mensaje real del servidor. null si todo fue bien. */
  error: string | null;
  cambiar: (homeId: string) => void;
  recargar: () => void;
}

const Ctx = createContext<CasaActivaCtx | null>(null);
const CLAVE = 'nexum.casaActiva';

/**
 * La casa activa, compartida por toda la app.
 *
 * Existe porque la casa activa es el contexto de TODO lo que se ve: los
 * dispositivos, las automatizaciones, los miembros. Antes cada pantalla
 * llamaba a listarCasas por su cuenta y daba por activa la primera, así
 * que cambiar de casa en una pantalla no se notaba en las demás.
 *
 * Se recuerda entre sesiones: si ayer estabas en Casa Banana, hoy abres
 * en Casa Banana.
 *
 * Va atado a la sesión: sin usuario no pregunta nada al servidor —una
 * consulta con RLS y sin JWT solo devuelve una lista vacía que luego
 * habría que desmentir— y al cerrar sesión se vacía, para que el
 * siguiente que entre en este móvil no vea el nombre de la casa anterior.
 */
export function CasaActivaProvider({ children }: { children: ReactNode }) {
  const { session, cargando: cargandoSesion } = useAuth();
  const userId = session?.user.id ?? null;
  const [casas, setCasas] = useState<CasaConRol[]>([]);
  const [activaId, setActivaId] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const recargar = useCallback(() => {
    if (cargandoSesion) return;

    if (!userId) {
      setCasas([]);
      setActivaId(null);
      setError(null);
      setCargando(false);
      return;
    }

    setCargando(true);
    setError(null);
    listarCasas()
      .then(async (lista) => {
        setCasas(lista);
        const guardada = await AsyncStorage.getItem(CLAVE).catch(() => null);
        // Si la casa recordada ya no existe —te han quitado el acceso o
        // se ha borrado— se cae a la primera, no a "ninguna".
        const valida = lista.some((c) => c.id === guardada) ? guardada : (lista[0]?.id ?? null);
        setActivaId(valida);
      })
      .catch((fallo) => setError(mensajeDe(fallo)))
      .finally(() => setCargando(false));
  }, [userId, cargandoSesion]);

  useEffect(recargar, [recargar]);

  const valor = useMemo<CasaActivaCtx>(
    () => ({
      casas,
      activa: casas.find((c) => c.id === activaId),
      cargando,
      error,
      cambiar: (homeId) => {
        setActivaId(homeId);
        void AsyncStorage.setItem(CLAVE, homeId).catch(() => {});
      },
      recargar,
    }),
    [casas, activaId, cargando, error, recargar],
  );

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

export function useCasaActiva(): CasaActivaCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useCasaActiva se ha usado fuera de <CasaActivaProvider>');
  return ctx;
}
