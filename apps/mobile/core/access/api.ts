/**
 * Códigos de invitado: crear, canjear y revocar.
 *
 * Las tres operaciones son funciones SQL en la base de datos, no código
 * de la app. Motivo: quien canjea un código todavía no tiene ningún
 * permiso sobre esa casa, así que las reglas de seguridad le impedirían
 * hasta comprobar si su código existe. La función se ejecuta con permisos
 * elevados y por dentro hace todas las comprobaciones.
 *
 * Ver supabase/migrations/..._fase1_acceso.sql
 */

import { supabase } from '@/lib/supabase';
import type { AccessCode } from '@nexum/shared-types';

/** Motivos por los que un código puede rechazarse. Cada uno tiene su mensaje. */
export type MotivoRechazo =
  | 'not_authenticated'
  | 'not_found'
  | 'expired'
  | 'revoked'
  | 'exhausted'
  | 'already_member'
  | 'forbidden'
  | 'invalid_scope'
  | 'expiry_in_past'
  | 'code_generation_failed';

export type Resultado<T> = { ok: true; datos: T } | { ok: false; motivo: MotivoRechazo };

export interface CodigoCreado {
  id: string;
  code: string;
  expires_at: string;
}

export interface CanjeRealizado {
  scope: 'home' | 'device';
  home_id?: string;
  device_id?: string;
  role: string;
  expires_at: string;
}

/**
 * Duraciones que ofrece la interfaz al crear un código.
 *
 * PENDIENTE DE CERRAR con el propietario. Cambiar esta lista es lo único
 * que hace falta: las pantallas la leen de aquí.
 */
export const DURACIONES = [
  { etiqueta: '1 hora', horas: 1 },
  { etiqueta: '1 día', horas: 24 },
  { etiqueta: '1 semana', horas: 24 * 7 },
] as const;

function interpretar<T>(data: unknown): Resultado<T> {
  const r = data as Record<string, unknown> | null;
  if (!r) return { ok: false, motivo: 'not_found' };
  if (r.ok === true) return { ok: true, datos: r as unknown as T };
  return { ok: false, motivo: (r.error as MotivoRechazo) ?? 'not_found' };
}

/** Crea un código para toda una casa. */
export async function crearCodigoDeCasa(
  homeId: string,
  rol: 'member' | 'guest',
  horas: number,
  maxUsos: number | null = null,
): Promise<Resultado<CodigoCreado>> {
  const caduca = new Date(Date.now() + horas * 3600_000).toISOString();

  const { data, error } = await supabase.rpc('create_access_code', {
    p_home_id: homeId,
    p_device_id: null,
    p_role: rol,
    p_expires_at: caduca,
    p_max_uses: maxUsos,
  });

  if (error) throw error;
  return interpretar<CodigoCreado>(data);
}

/** Canjea un código. Vale tanto para códigos de casa como de dispositivo. */
export async function canjearCodigo(codigo: string): Promise<Resultado<CanjeRealizado>> {
  const { data, error } = await supabase.rpc('redeem_access_code', {
    p_code: codigo.trim().toUpperCase(),
  });

  if (error) throw error;
  return interpretar<CanjeRealizado>(data);
}

/**
 * Revoca un código.
 *
 * OJO: revocar NO expulsa a quien ya entró con él, solo impide nuevos
 * canjes. Para echar a alguien hay que quitarlo de la lista de miembros.
 */
export async function revocarCodigo(id: string): Promise<Resultado<Record<string, never>>> {
  const { data, error } = await supabase.rpc('revoke_access_code', { p_id: id });
  if (error) throw error;
  return interpretar(data);
}

/** Códigos de una casa. Solo los ven owners y admins (lo impone RLS). */
export async function listarCodigos(homeId: string): Promise<AccessCode[]> {
  const { data, error } = await supabase
    .from('access_codes')
    .select('*')
    .eq('home_id', homeId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as AccessCode[];
}

/** Estado legible de un código, para pintar la etiqueta de color. */
export function estadoDeCodigo(c: AccessCode): 'activo' | 'caducado' | 'revocado' | 'agotado' {
  if (c.revoked_at) return 'revocado';
  if (new Date(c.expires_at) <= new Date()) return 'caducado';
  if (c.max_uses !== null && c.uses >= c.max_uses) return 'agotado';
  return 'activo';
}
