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
 */
export async function crearCasa(nombre: string, timezone = 'Europe/Madrid'): Promise<Home> {
  const { data: sesion } = await supabase.auth.getUser();
  if (!sesion.user) throw new Error('No hay sesión iniciada.');

  const { data, error } = await supabase
    .from('homes')
    .insert({ name: nombre.trim(), timezone, created_by: sesion.user.id })
    .select()
    .single();

  if (error) throw error;
  return data as Home;
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
