/**
 * Casas, habitaciones y miembros.
 *
 * Todo va directo contra Postgres: las políticas RLS ya filtran qué puede
 * ver y tocar cada usuario, así que no hace falta backend por medio.
 * Ver docs/permissions.md.
 */

import { supabase } from '@/lib/supabase';
import type { Home, HomeMember, HomeRole, Profile, Room } from '@nexum/shared-types';

export interface CasaConRol extends Home {
  /** Rol del usuario actual en esta casa. */
  mi_rol: HomeRole;
}

/** Miembro de una casa con el perfil de la persona ya resuelto. */
export interface MiembroConPerfil extends HomeMember {
  profiles: Pick<Profile, 'id' | 'display_name' | 'avatar_url'> | null;
}

/** Las casas a las que pertenece el usuario actual, con su rol en cada una. */
export async function listarCasas(): Promise<CasaConRol[]> {
  const { data, error } = await supabase
    .from('home_members')
    .select('role, homes(*)')
    .order('created_at', { ascending: true });

  if (error) throw error;

  return (data ?? [])
    .filter((fila) => fila.homes)
    .map((fila) => ({
      ...(fila.homes as unknown as Home),
      mi_rol: fila.role as HomeRole,
    }));
}

/**
 * Crea una casa. Quien la crea entra como 'owner' automáticamente:
 * lo hace un disparador de la base de datos, no la app.
 *
 * Va por una función de la base de datos (create_home) y NO por un
 * insert normal. Motivo: un INSERT que pide de vuelta la fila creada
 * hace que Postgres compruebe también si puedes LEERLA, y en ese
 * instante todavía no eres miembro de tu propia casa —la fila que te
 * hace miembro la crea el disparador justo después—, así que la
 * denegaba. Ver supabase/migrations/..._crear_casa.sql.
 */
export async function crearCasa(nombre: string, timezone = 'Europe/Madrid'): Promise<Home> {
  const { data, error } = await supabase.rpc('create_home', {
    p_name: nombre.trim(),
    p_timezone: timezone,
  });

  if (error) throw error;

  const r = data as { ok?: boolean; error?: string; home?: Home } | null;
  if (!r?.ok || !r.home) {
    throw new Error(r?.error ?? 'unknown');
  }
  return r.home;
}

export async function renombrarCasa(homeId: string, nombre: string): Promise<void> {
  const { error } = await supabase.from('homes').update({ name: nombre.trim() }).eq('id', homeId);
  if (error) throw error;
}

export async function borrarCasa(homeId: string): Promise<void> {
  const { error } = await supabase.from('homes').delete().eq('id', homeId);
  if (error) throw error;
}

// ─── Habitaciones ────────────────────────────────────────────────────

export async function listarHabitaciones(homeId: string): Promise<Room[]> {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('home_id', homeId)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return (data ?? []) as Room[];
}

/** Crea varias habitaciones de una vez. Lo usa el asistente de alta. */
export async function crearHabitaciones(homeId: string, nombres: string[]): Promise<void> {
  const filas = nombres
    .map((n) => n.trim())
    .filter(Boolean)
    .map((name, i) => ({ home_id: homeId, name, sort_order: i }));

  if (filas.length === 0) return;

  const { error } = await supabase.from('rooms').insert(filas);
  if (error) throw error;
}

export async function borrarHabitacion(roomId: string): Promise<void> {
  const { error } = await supabase.from('rooms').delete().eq('id', roomId);
  if (error) throw error;
}

// ─── Miembros ────────────────────────────────────────────────────────

export async function listarMiembros(homeId: string): Promise<MiembroConPerfil[]> {
  const { data, error } = await supabase
    .from('home_members')
    .select('*, profiles(id, display_name, avatar_url)')
    .eq('home_id', homeId);

  if (error) throw error;
  return (data ?? []) as unknown as MiembroConPerfil[];
}

export async function cambiarRol(homeId: string, userId: string, rol: HomeRole): Promise<void> {
  const { error } = await supabase
    .from('home_members')
    .update({ role: rol })
    .eq('home_id', homeId)
    .eq('user_id', userId);

  if (error) throw error;
}

/** Expulsa a alguien de la casa. También sirve para irse uno mismo. */
export async function expulsarMiembro(homeId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('home_members')
    .delete()
    .eq('home_id', homeId)
    .eq('user_id', userId);

  if (error) throw error;
}

/**
 * Cuántos dispositivos hay en una casa.
 *
 * Se usa para poder decirle al usuario exactamente qué va a perder antes
 * de borrarla. Un "¿estás seguro?" sin números se contesta que sí por
 * inercia; "se borrarán 3 habitaciones y 2 aparatos" se lee.
 */
export async function contarDispositivos(homeId: string): Promise<number> {
  const { count, error } = await supabase
    .from('devices')
    .select('id', { count: 'exact', head: true })
    .eq('home_id', homeId);

  if (error) throw error;
  return count ?? 0;
}
