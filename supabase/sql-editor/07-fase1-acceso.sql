-- ═══════════════════════════════════════════════════════════════════════
--  NEXUM — ACTUALIZACIÓN 07: acceso de fase 1
-- ═══════════════════════════════════════════════════════════════════════
--
--  ESTE ES EL ARCHIVO QUE TIENES QUE PEGAR AHORA.
--  Parte de una base de datos que YA tiene las 16 tablas creadas.
--
--  Qué cambia:
--    1. El historial de comandos pasa a verlo solo owners y admins.
--    2. Añade las funciones de códigos de invitado: crear, canjear
--       y revocar.
--
--
--  ⚠ ANTES DE PEGAR: VACÍA EL EDITOR ⚠
--  Pulsa dentro del recuadro, selecciona todo (Ctrl+A / Cmd+A) y bórralo,
--  o abre una consulta nueva con "New query". Si queda texto de una
--  ejecución anterior, se mezcla con este y da un error de sintaxis
--  raro, del estilo "syntax error at or near".
--
--  CÓMO SE USA
--    1. https://supabase.com -> tu proyecto -> SQL Editor
--    2. New query -> pega todo este archivo -> Run
--
--  BIEN: recuadro verde "Success. No rows returned".
--  MAL:  recuadro rojo. Pásame el mensaje entero.
--
--  Se puede ejecutar más de una vez sin romper nada.
-- ═══════════════════════════════════════════════════════════════════════

begin;

-- ▼▼▼ 20260914100000_fase1_acceso.sql ▼▼▼
-- ═══════════════════════════════════════════════════════════════════════
--  Nexum — 07. Fase 1: historial restringido y códigos de invitado
-- ═══════════════════════════════════════════════════════════════════════

-- ─── 1. El historial de comandos, solo para owners y admins ───────────
-- Decisión del propietario: un miembro normal ve el estado del aire,
-- pero no quién lo tocó ni cuándo. La auditoría es cosa de quien manda.

-- Los dos "drop if exists" permiten volver a ejecutar este archivo sin
-- que falle: quita la política vieja y también la nueva, si ya estuviera.
drop policy if exists "comandos: ver el historial del dispositivo" on public.commands;
drop policy if exists "comandos: ver el historial (solo admin)"    on public.commands;

create policy "comandos: ver el historial (solo admin)"
  on public.commands for select
  using (public.can_admin_home(public.home_of_device(device_id)));

-- ─── 2. Generación de códigos ─────────────────────────────────────────
-- Alfabeto sin caracteres que se confunden al leerlos en voz alta o al
-- teclearlos: fuera la O y el 0, fuera la I y el 1.

create or replace function public.random_code()
returns text
language sql
volatile
as $$
  select 'NEXUM-' || string_agg(
    substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789',
           1 + floor(random() * 32)::int, 1), ''
  )
  from generate_series(1, 6);
$$;

comment on function public.random_code is
  'Código de 6 caracteres con prefijo NEXUM-. Alfabeto sin O/0 ni I/1 para que no se confundan al dictarlo.';

-- ─── 3. Crear un código de invitado ───────────────────────────────────
-- Devuelve el código creado. Comprueba permisos por dentro.

create or replace function public.create_access_code(
  p_home_id    uuid default null,
  p_device_id  uuid default null,
  p_role       text default 'guest',
  p_expires_at timestamptz default null,
  p_max_uses   int default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code   text;
  v_id     uuid;
  v_intentos int := 0;
begin
  if auth.uid() is null then
    return jsonb_build_object('ok', false, 'error', 'not_authenticated');
  end if;

  -- Alcance: exactamente uno de los dos
  if (p_home_id is null) = (p_device_id is null) then
    return jsonb_build_object('ok', false, 'error', 'invalid_scope');
  end if;

  -- Permiso: hay que administrar la casa afectada
  if p_home_id is not null then
    if not public.can_admin_home(p_home_id) then
      return jsonb_build_object('ok', false, 'error', 'forbidden');
    end if;
  else
    if not public.can_admin_home(public.home_of_device(p_device_id)) then
      return jsonb_build_object('ok', false, 'error', 'forbidden');
    end if;
  end if;

  -- Caducidad obligatoria. Sin fecha, 24 horas.
  if p_expires_at is null then
    p_expires_at := now() + interval '24 hours';
  end if;
  if p_expires_at <= now() then
    return jsonb_build_object('ok', false, 'error', 'expiry_in_past');
  end if;

  -- Genera un código libre. El bucle es por si sale uno repetido.
  loop
    v_intentos := v_intentos + 1;
    v_code := public.random_code();
    exit when not exists (select 1 from public.access_codes where code = v_code);
    if v_intentos > 20 then
      return jsonb_build_object('ok', false, 'error', 'code_generation_failed');
    end if;
  end loop;

  insert into public.access_codes
    (code, home_id, device_id, role, max_uses, expires_at, created_by)
  values
    (v_code, p_home_id, p_device_id, p_role, p_max_uses, p_expires_at, auth.uid())
  returning id into v_id;

  return jsonb_build_object(
    'ok', true, 'id', v_id, 'code', v_code, 'expires_at', p_expires_at
  );
end;
$$;

-- ─── 4. Canjear un código ─────────────────────────────────────────────
--
--  Por qué es "security definer": quien canjea todavía no tiene ningún
--  permiso sobre esa casa, así que RLS le impediría siquiera leer la
--  tabla de códigos para comprobar si el suyo existe.
--
--  Devuelve un objeto con 'ok' y, si falla, un 'error' concreto. Cada
--  motivo tiene el suyo: la app enseña un mensaje distinto para cada
--  caso, nunca un "ha ocurrido un error".

create or replace function public.redeem_access_code(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  c      public.access_codes%rowtype;
  v_user uuid := auth.uid();
begin
  if v_user is null then
    return jsonb_build_object('ok', false, 'error', 'not_authenticated');
  end if;

  select * into c
  from public.access_codes
  where upper(trim(code)) = upper(trim(p_code));

  if not found then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;

  if c.revoked_at is not null then
    return jsonb_build_object('ok', false, 'error', 'revoked');
  end if;

  if c.expires_at <= now() then
    return jsonb_build_object('ok', false, 'error', 'expired',
                              'expired_at', c.expires_at);
  end if;

  if c.max_uses is not null and c.uses >= c.max_uses then
    return jsonb_build_object('ok', false, 'error', 'exhausted');
  end if;

  -- ── Código de casa ──
  if c.home_id is not null then
    if exists (select 1 from public.home_members
               where home_id = c.home_id and user_id = v_user
                 and public.is_active(expires_at)) then
      return jsonb_build_object('ok', false, 'error', 'already_member');
    end if;

    insert into public.home_members (home_id, user_id, role, expires_at, granted_by)
    values (c.home_id, v_user, c.role::public.home_role, c.expires_at, c.created_by)
    on conflict (home_id, user_id) do update
      set role       = excluded.role,
          expires_at = excluded.expires_at,
          granted_by = excluded.granted_by;

    update public.access_codes set uses = uses + 1 where id = c.id;

    return jsonb_build_object('ok', true, 'scope', 'home',
                              'home_id', c.home_id, 'role', c.role,
                              'expires_at', c.expires_at);
  end if;

  -- ── Código de un dispositivo suelto ──
  if exists (select 1 from public.device_shares
             where device_id = c.device_id and user_id = v_user
               and public.is_active(expires_at)) then
    return jsonb_build_object('ok', false, 'error', 'already_member');
  end if;

  insert into public.device_shares (device_id, user_id, role, expires_at, granted_by)
  values (c.device_id, v_user, c.role::public.device_role, c.expires_at, c.created_by)
  on conflict (device_id, user_id) do update
    set role       = excluded.role,
        expires_at = excluded.expires_at,
        granted_by = excluded.granted_by;

  update public.access_codes set uses = uses + 1 where id = c.id;

  return jsonb_build_object('ok', true, 'scope', 'device',
                            'device_id', c.device_id, 'role', c.role,
                            'expires_at', c.expires_at);
end;
$$;

-- ─── 5. Revocar un código ─────────────────────────────────────────────
-- Revocar NO expulsa a quien ya entró: solo impide nuevos canjes.
-- Para echar a alguien se borra su fila de home_members.

create or replace function public.revoke_access_code(p_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  c public.access_codes%rowtype;
begin
  select * into c from public.access_codes where id = p_id;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;

  if not (
    (c.home_id   is not null and public.can_admin_home(c.home_id)) or
    (c.device_id is not null and public.can_admin_home(public.home_of_device(c.device_id)))
  ) then
    return jsonb_build_object('ok', false, 'error', 'forbidden');
  end if;

  update public.access_codes set revoked_at = now() where id = p_id;
  return jsonb_build_object('ok', true);
end;
$$;

-- ─── 6. Permisos de ejecución ─────────────────────────────────────────
-- Solo usuarios con sesión iniciada. Los anónimos no tocan nada.

revoke execute on function public.create_access_code(uuid, uuid, text, timestamptz, int) from public, anon;
revoke execute on function public.redeem_access_code(text)  from public, anon;
revoke execute on function public.revoke_access_code(uuid)  from public, anon;

grant execute on function public.create_access_code(uuid, uuid, text, timestamptz, int) to authenticated;
grant execute on function public.redeem_access_code(text)  to authenticated;
grant execute on function public.revoke_access_code(uuid)  to authenticated;


-- ═══════════════════════════════════════════════════════════════════════
--  Registro en el historial de migraciones de Supabase
-- ═══════════════════════════════════════════════════════════════════════
create schema if not exists supabase_migrations;
create table if not exists supabase_migrations.schema_migrations (
  version text primary key, statements text[], name text
);
insert into supabase_migrations.schema_migrations (version, name) values
  ('20260914100000', 'fase1_acceso')
on conflict (version) do nothing;

commit;
