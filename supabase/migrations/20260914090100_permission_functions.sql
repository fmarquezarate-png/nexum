-- ═══════════════════════════════════════════════════════════════════════
--  Nexum — 02. Funciones de permisos
-- ═══════════════════════════════════════════════════════════════════════
--  Toda la lógica de "¿quién puede qué?" vive AQUÍ y solo aquí.
--  Las políticas RLS del archivo siguiente se limitan a invocarlas.
--  Duplicar esta lógica política a política es como copiar la misma
--  medida DAX en veinte visuales: el día que cambie, cambia en un sitio.
--
--  Por qué "security definer":
--    Estas funciones leen home_members y device_shares. Si se ejecutaran
--    con los permisos del usuario que llama, RLS volvería a llamarlas
--    para decidir si puede leer esas tablas → bucle infinito.
--    "security definer" las ejecuta con los permisos del creador,
--    saltando RLS DENTRO de la función. Por eso se fija search_path:
--    para que nadie pueda colarle otra tabla con el mismo nombre.
-- ═══════════════════════════════════════════════════════════════════════

-- ─── ¿Sigue vivo este acceso? ─────────────────────────────────────────
-- Regla única de caducidad: NULL = para siempre, fecha futura = vale.
-- Se comprueba SIEMPRE dentro de la base de datos, nunca en la app.
-- Un acceso caducado deja de funcionar aunque la app no se entere.

create or replace function public.is_active(expires_at timestamptz)
returns boolean
language sql
immutable
as $$
  select expires_at is null or expires_at > now();
$$;

-- ─── Rol del usuario actual en una casa ───────────────────────────────
-- Devuelve NULL si no es miembro o si su acceso caducó.

create or replace function public.home_role_of(p_home_id uuid)
returns public.home_role
language sql
stable
security definer
set search_path = public
as $$
  select hm.role
  from public.home_members hm
  where hm.home_id = p_home_id
    and hm.user_id = auth.uid()
    and public.is_active(hm.expires_at)
  limit 1;
$$;

-- ─── ¿Es miembro (de cualquier rol) de esta casa? ─────────────────────

create or replace function public.is_home_member(p_home_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.home_role_of(p_home_id) is not null;
$$;

-- ─── ¿Puede administrar la casa? ──────────────────────────────────────
-- Administrar = invitar y expulsar miembros, crear y revocar códigos,
-- dar de alta y de baja dispositivos, borrar habitaciones.

create or replace function public.can_admin_home(p_home_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.home_role_of(p_home_id) in ('owner', 'admin'), false);
$$;

-- ─── ¿Puede controlar dispositivos de esta casa? ─────────────────────
-- 'guest' mira pero no toca.

create or replace function public.can_control_in_home(p_home_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.home_role_of(p_home_id) in ('owner', 'admin', 'member'), false);
$$;

-- ─── ¿Puede VER este dispositivo? ─────────────────────────────────────
-- Dos caminos posibles, según el brief:
--   1. Es miembro activo de la casa a la que pertenece el dispositivo.
--   2. Le han compartido ese dispositivo suelto y el permiso sigue vivo.

create or replace function public.can_view_device(p_device_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.devices d
    where d.id = p_device_id
      and public.is_home_member(d.home_id)
  )
  or exists (
    select 1
    from public.device_shares s
    where s.device_id = p_device_id
      and s.user_id = auth.uid()
      and public.is_active(s.expires_at)
  );
$$;

-- ─── ¿Puede CONTROLAR este dispositivo? ───────────────────────────────
-- Controlar = encender, apagar, cambiar temperatura, regar.
-- 'guest' y 'viewer' MIRAN pero no tocan.

create or replace function public.can_control_device(p_device_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.devices d
    where d.id = p_device_id
      and public.can_control_in_home(d.home_id)
  )
  or exists (
    select 1
    from public.device_shares s
    where s.device_id = p_device_id
      and s.user_id = auth.uid()
      and s.role = 'controller'
      and public.is_active(s.expires_at)
  );
$$;

-- ─── Casa a la que pertenece un dispositivo ───────────────────────────
-- Atajo interno para las políticas.

create or replace function public.home_of_device(p_device_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select d.home_id from public.devices d where d.id = p_device_id;
$$;

-- ─── Resumen de la matriz de permisos ─────────────────────────────────
--
--   Rol         | Ver | Controlar | Administrar la casa
--   ------------|-----|-----------|--------------------
--   owner       | sí  | sí        | sí  (+ no se puede expulsar al último)
--   admin       | sí  | sí        | sí
--   member      | sí  | sí        | no
--   guest       | sí  | NO        | no
--   controller* | sí  | sí        | no   (*solo sobre el dispositivo compartido)
--   viewer*     | sí  | NO        | no
--
-- ═══════════════════════════════════════════════════════════════════════
