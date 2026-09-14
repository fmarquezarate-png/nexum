import type { Session } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { supabase } from '@/lib/supabase';
import type { Profile } from '@nexum/shared-types';

interface AuthContexto {
  /** null = no hay sesión iniciada. */
  session: Session | null;
  perfil: Profile | null;
  /** true mientras aún no sabemos si hay sesión. Evita parpadeos al arrancar. */
  cargando: boolean;
  entrar: (email: string, password: string) => Promise<{ error: string | null }>;
  registrarse: (
    email: string,
    password: string,
    nombre: string,
  ) => Promise<{ error: string | null }>;
  salir: () => Promise<void>;
  recuperarPassword: (email: string) => Promise<{ error: string | null }>;
  refrescarPerfil: () => Promise<void>;
}

const Ctx = createContext<AuthContexto | null>(null);

/**
 * Traduce los errores de Supabase, que vienen en inglés, a mensajes
 * en castellano que digan algo útil.
 *
 * Nota de seguridad: al iniciar sesión no distinguimos entre "ese correo
 * no existe" y "la contraseña no es esa". Si lo distinguiéramos, cualquiera
 * podría averiguar qué correos están registrados probando de uno en uno.
 */
function traducirError(mensaje: string): string {
  const m = mensaje.toLowerCase();
  if (m.includes('invalid login credentials')) return 'El correo o la contraseña no son correctos.';
  if (m.includes('user already registered')) return 'Ya existe una cuenta con este correo.';
  if (m.includes('password should be at least')) return 'La contraseña debe tener al menos 6 caracteres.';
  if (m.includes('unable to validate email') || m.includes('invalid email'))
    return 'Ese correo no tiene un formato válido.';
  if (m.includes('email rate limit') || m.includes('rate limit'))
    return 'Demasiados intentos seguidos. Espera un minuto y vuelve a probar.';
  if (m.includes('network') || m.includes('fetch')) return 'No hay conexión con el servidor.';
  return mensaje;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [perfil, setPerfil] = useState<Profile | null>(null);
  const [cargando, setCargando] = useState(true);

  async function cargarPerfil(userId: string) {
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
      setPerfil((data as Profile) ?? null);
    } catch {
      // Sin perfil la app sigue funcionando: solo se pierde el nombre.
      setPerfil(null);
    }
  }

  useEffect(() => {
    let vivo = true;

    // El .catch() es imprescindible: si esto falla y no se recoge el
    // error, "cargando" se queda en true para siempre y la app se queda
    // colgada en la ruedecita, sin pantalla y sin mensaje.
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!vivo) return;
        setSession(data.session);
        if (data.session) void cargarPerfil(data.session.user.id);
      })
      .catch(() => {
        if (vivo) setSession(null);
      })
      .finally(() => {
        if (vivo) setCargando(false);
      });

    const { data: sub } = supabase.auth.onAuthStateChange((_evento, nueva) => {
      setSession(nueva);
      if (nueva) void cargarPerfil(nueva.user.id);
      else setPerfil(null);
    });

    return () => {
      vivo = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const valor = useMemo<AuthContexto>(
    () => ({
      session,
      perfil,
      cargando,

      async entrar(email, password) {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        return { error: error ? traducirError(error.message) : null };
      },

      async registrarse(email, password, nombre) {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { display_name: nombre.trim() } },
        });
        return { error: error ? traducirError(error.message) : null };
      },

      async salir() {
        await supabase.auth.signOut();
      },

      async recuperarPassword(email) {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
        return { error: error ? traducirError(error.message) : null };
      },

      async refrescarPerfil() {
        if (session) await cargarPerfil(session.user.id);
      },
    }),
    [session, perfil, cargando],
  );

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthContexto {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth se ha usado fuera de <AuthProvider>');
  return ctx;
}
