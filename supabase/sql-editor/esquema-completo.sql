-- ═══════════════════════════════════════════════════════════════════════
--  NEXUM — ESQUEMA COMPLETO PARA PEGAR EN EL SQL EDITOR DE SUPABASE
-- ═══════════════════════════════════════════════════════════════════════
--
--  QUÉ ES ESTO
--  Las 6 migraciones de supabase/migrations/ unidas en un solo archivo,
--  para poder crear toda la base de datos SIN usar el terminal.
--
--  CÓMO SE USA
--    1. Entra a https://supabase.com y abre tu proyecto
--    2. En el menú de la izquierda, pulsa "SQL Editor"
--    3. Pulsa "New query" (arriba a la derecha)
--    4. Pega TODO este archivo en el recuadro grande
--    5. Pulsa "Run" (abajo a la derecha, o Ctrl+Enter)
--
--  QUÉ DEBES VER SI SALIÓ BIEN
--    Abajo, un recuadro verde con "Success. No rows returned".
--    Luego, en "Table Editor" del menú izquierdo, deben aparecer 16 tablas.
--
--  QUÉ SIGNIFICA SI FALLA
--    Un recuadro rojo con el error. Si pone "already exists", parte del
--    esquema ya estaba creado: pásame el mensaje entero antes de tocar nada.
--
--  IMPORTANTE
--  Este archivo se GENERA automáticamente a partir de supabase/migrations/.
--  No lo edites a mano: edita las migraciones y vuelve a generarlo.
--  Al final registra las migraciones en el historial de Supabase, para que
--  el día que se use el CLI no intente volver a aplicarlas.
-- ═══════════════════════════════════════════════════════════════════════

begin;


-- ▼▼▼ 20260914090000_core_schema.sql ▼▼▼
-- ═══════════════════════════════════════════════════════════════════════
--  Nexum — 01. Núcleo: identidad, casas, habitaciones y dispositivos
-- ═══════════════════════════════════════════════════════════════════════
--  Todo lo que hay en este archivo es COMÚN a todos los módulos.
--  Nada específico de Coolio o Plantico puede entrar aquí.
--  Ver docs/data-model.md para la explicación en castellano.
-- ═══════════════════════════════════════════════════════════════════════

-- Extensiones necesarias
create extension if not exists "pgcrypto";   -- para gen_random_uuid()

-- ─── Tipos cerrados (ENUM) ────────────────────────────────────────────
-- Un ENUM es una lista fija de valores permitidos. Si intentas guardar
-- algo que no está en la lista, la base de datos lo rechaza.

create type public.module_id      as enum ('coolio', 'plantico');
create type public.home_role      as enum ('owner', 'admin', 'member', 'guest');
create type public.device_role    as enum ('controller', 'viewer');
create type public.command_status as enum ('pending', 'sent', 'acked', 'failed', 'timeout');
create type public.state_source   as enum ('app', 'automation', 'device', 'unknown');
create type public.push_platform  as enum ('ios', 'android');

-- ─── profiles ─────────────────────────────────────────────────────────
-- Datos públicos del usuario. La contraseña y el email viven en
-- auth.users, que gestiona Supabase y nosotros no tocamos.

create table public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  display_name  text,
  avatar_url    text,
  locale        text        not null default 'es',
  created_at    timestamptz not null default now()
);

comment on table public.profiles is 'Perfil público del usuario. 1:1 con auth.users.';

-- Cuando alguien se registra, Supabase crea la fila en auth.users.
-- Este disparador ("trigger") crea automáticamente su perfil.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── homes ────────────────────────────────────────────────────────────

create table public.homes (
  id          uuid primary key default gen_random_uuid(),
  name        text        not null,
  timezone    text        not null default 'Europe/Madrid',
  lat         numeric(9,6),
  lng         numeric(9,6),
  created_by  uuid        not null references public.profiles (id),
  created_at  timestamptz not null default now()
);

comment on column public.homes.lat is 'Latitud. Para geo-cercas y clima exterior (fase 3).';

-- ─── home_members ─────────────────────────────────────────────────────
-- Relación N:N entre usuarios y casas: un usuario está en varias casas
-- y una casa tiene varios usuarios. No hay "dueño único".

create table public.home_members (
  home_id     uuid        not null references public.homes (id)    on delete cascade,
  user_id     uuid        not null references public.profiles (id) on delete cascade,
  role        public.home_role not null default 'member',
  expires_at  timestamptz,                    -- NULL = acceso permanente
  granted_by  uuid        references public.profiles (id),
  created_at  timestamptz not null default now(),
  primary key (home_id, user_id)
);

comment on column public.home_members.expires_at is
  'NULL = permanente. Si tiene fecha, el acceso deja de funcionar al pasar, comprobado dentro de las políticas RLS.';

create index home_members_user_idx on public.home_members (user_id);

-- ─── rooms ────────────────────────────────────────────────────────────

create table public.rooms (
  id          uuid primary key default gen_random_uuid(),
  home_id     uuid not null references public.homes (id) on delete cascade,
  name        text not null,
  icon        text,
  sort_order  int  not null default 0
);

create index rooms_home_idx on public.rooms (home_id);

-- ─── devices ──────────────────────────────────────────────────────────
-- Tabla COMÚN. La configuración propia de cada módulo va en su
-- tabla satélite (coolio_devices, plantico_devices...).

create table public.devices (
  id               uuid primary key default gen_random_uuid(),
  home_id          uuid not null references public.homes (id) on delete cascade,
  room_id          uuid references public.rooms (id) on delete set null,
  module           public.module_id not null,
  name             text not null,
  hw_id            text not null unique,      -- MAC del ESP32
  firmware_version text,
  online           boolean not null default false,
  last_seen_at     timestamptz,
  created_at       timestamptz not null default now()
);

comment on column public.devices.hw_id is 'MAC del ESP32. Única en todo el sistema: identifica físicamente la placa.';
comment on column public.devices.online is 'Lo mantiene services/mqtt-bridge a partir del mensaje LWT del broker.';

create index devices_home_idx   on public.devices (home_id);
create index devices_module_idx on public.devices (module);

-- ─── device_shares ────────────────────────────────────────────────────
-- Compartir UN dispositivo suelto sin dar acceso a toda la casa.

create table public.device_shares (
  id          uuid primary key default gen_random_uuid(),
  device_id   uuid not null references public.devices (id)  on delete cascade,
  user_id     uuid not null references public.profiles (id) on delete cascade,
  role        public.device_role not null default 'viewer',
  expires_at  timestamptz,
  granted_by  uuid references public.profiles (id),
  created_at  timestamptz not null default now(),
  unique (device_id, user_id)
);

create index device_shares_user_idx on public.device_shares (user_id);

-- ─── access_codes ─────────────────────────────────────────────────────
-- Códigos de invitado (se muestran como QR o como texto).

create table public.access_codes (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,
  home_id     uuid references public.homes (id)   on delete cascade,
  device_id   uuid references public.devices (id) on delete cascade,
  role        text not null,          -- home_role o device_role según el alcance
  max_uses    int,
  uses        int  not null default 0,
  expires_at  timestamptz not null,   -- SIEMPRE caduca, sin excepción
  revoked_at  timestamptz,
  created_by  uuid not null references public.profiles (id),
  created_at  timestamptz not null default now(),

  -- Un código apunta a una casa o a un dispositivo, no a ninguno de los dos.
  constraint access_codes_scope_chk
    check (home_id is not null or device_id is not null),

  -- El rol tiene que encajar con el alcance.
  constraint access_codes_role_chk check (
    (home_id   is not null and role in ('owner','admin','member','guest')) or
    (device_id is not null and role in ('controller','viewer'))
  )
);

comment on table public.access_codes is
  'Códigos de invitado. expires_at es NOT NULL a propósito: no existe el acceso de invitado permanente.';

-- ─── commands ─────────────────────────────────────────────────────────
-- Auditoría: toda orden emitida queda registrada con quién y cuándo.

create table public.commands (
  id          uuid primary key default gen_random_uuid(),
  device_id   uuid not null references public.devices (id) on delete cascade,
  user_id     uuid references public.profiles (id),   -- NULL = lo lanzó una automatización
  payload     jsonb not null,
  status      public.command_status not null default 'pending',
  created_at  timestamptz not null default now(),
  sent_at     timestamptz,
  acked_at    timestamptz,
  error       text
);

comment on column public.commands.user_id is 'NULL cuando el comando lo originó una automatización, no una persona.';

create index commands_device_created_idx on public.commands (device_id, created_at desc);
create index commands_pending_idx on public.commands (status) where status in ('pending', 'sent');

-- ─── telemetry ────────────────────────────────────────────────────────
-- Serie temporal de lecturas REALES de sensores.

create table public.telemetry (
  id          bigserial primary key,
  device_id   uuid not null references public.devices (id) on delete cascade,
  ts          timestamptz not null default now(),
  temperature numeric(5,2),
  humidity    numeric(5,2),
  extra       jsonb
);

create index telemetry_device_ts_idx on public.telemetry (device_id, ts desc);

comment on table public.telemetry is
  'Lecturas reales del sensor. A 1 dato/minuto son ~525.000 filas por dispositivo y año: Postgres lo aguanta de sobra sin particionar. CUANDO PARTICIONAR: si esta tabla pasa de ~50 millones de filas o las consultas de Estadísticas tardan más de 1 s, convertirla en tabla particionada por RANGE (ts) con una partición por mes. No antes: particionar obliga a crear la partición de cada mes nuevo y añade mantenimiento permanente.';

-- ─── push_tokens ──────────────────────────────────────────────────────

create table public.push_tokens (
  user_id    uuid not null references public.profiles (id) on delete cascade,
  token      text not null,
  platform   public.push_platform not null,
  created_at timestamptz not null default now(),
  primary key (user_id, token)
);


-- ▼▼▼ 20260914090100_permission_functions.sql ▼▼▼
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


-- ▼▼▼ 20260914090200_rls_policies.sql ▼▼▼
-- ═══════════════════════════════════════════════════════════════════════
--  Nexum — 03. Row Level Security (RLS)
-- ═══════════════════════════════════════════════════════════════════════
--  RLS = "seguridad a nivel de fila". En vez de confiar en que la app
--  filtre bien, es la propia base de datos la que decide, fila a fila,
--  qué puede ver y tocar cada usuario.
--
--  Consecuencia práctica: aunque alguien se saltara la app por completo
--  y hablara directamente con la base de datos con la clave pública,
--  solo vería sus casas y sus dispositivos.
--
--  OBLIGATORIO en todas las tablas. Sin excepción.
--  La clave de servicio (service_role) SALTA todas estas políticas:
--  por eso solo puede vivir en el servidor.
-- ═══════════════════════════════════════════════════════════════════════

alter table public.profiles      enable row level security;
alter table public.homes         enable row level security;
alter table public.home_members  enable row level security;
alter table public.rooms         enable row level security;
alter table public.devices       enable row level security;
alter table public.device_shares enable row level security;
alter table public.access_codes  enable row level security;
alter table public.commands      enable row level security;
alter table public.telemetry     enable row level security;
alter table public.push_tokens   enable row level security;

-- ─── profiles ─────────────────────────────────────────────────────────

create policy "perfil propio: lectura"
  on public.profiles for select
  using (id = auth.uid());

create policy "perfil propio: actualización"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- Ver el nombre y el avatar de quienes comparten casa contigo.
create policy "perfiles de convecinos: lectura"
  on public.profiles for select
  using (
    exists (
      select 1
      from public.home_members mine
      join public.home_members theirs on theirs.home_id = mine.home_id
      where mine.user_id = auth.uid()
        and public.is_active(mine.expires_at)
        and theirs.user_id = public.profiles.id
        and public.is_active(theirs.expires_at)
    )
  );

-- ─── homes ────────────────────────────────────────────────────────────

create policy "casas propias: lectura"
  on public.homes for select
  using (public.is_home_member(id));

create policy "casas: crear"
  on public.homes for insert
  with check (created_by = auth.uid());

create policy "casas: editar (admin)"
  on public.homes for update
  using (public.can_admin_home(id))
  with check (public.can_admin_home(id));

create policy "casas: borrar (solo owner)"
  on public.homes for delete
  using (public.home_role_of(id) = 'owner');

-- Quien crea una casa entra automáticamente como 'owner'.
create or replace function public.handle_new_home()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.home_members (home_id, user_id, role, granted_by)
  values (new.id, new.created_by, 'owner', new.created_by);
  return new;
end;
$$;

create trigger on_home_created
  after insert on public.homes
  for each row execute function public.handle_new_home();

-- ─── home_members ─────────────────────────────────────────────────────

create policy "miembros: ver los de mis casas"
  on public.home_members for select
  using (public.is_home_member(home_id));

create policy "miembros: invitar (admin)"
  on public.home_members for insert
  with check (public.can_admin_home(home_id));

create policy "miembros: cambiar rol (admin)"
  on public.home_members for update
  using (public.can_admin_home(home_id))
  with check (public.can_admin_home(home_id));

-- Un admin puede expulsar a otros; cualquiera puede irse de una casa.
create policy "miembros: expulsar o salirse"
  on public.home_members for delete
  using (public.can_admin_home(home_id) or user_id = auth.uid());

-- ─── rooms ────────────────────────────────────────────────────────────

create policy "habitaciones: lectura"
  on public.rooms for select
  using (public.is_home_member(home_id));

create policy "habitaciones: crear (admin)"
  on public.rooms for insert
  with check (public.can_admin_home(home_id));

create policy "habitaciones: editar (admin)"
  on public.rooms for update
  using (public.can_admin_home(home_id))
  with check (public.can_admin_home(home_id));

create policy "habitaciones: borrar (admin)"
  on public.rooms for delete
  using (public.can_admin_home(home_id));

-- ─── devices ──────────────────────────────────────────────────────────

create policy "dispositivos: ver"
  on public.devices for select
  using (public.can_view_device(id));

-- El alta real la hace provision-device con la clave de servicio.
create policy "dispositivos: dar de alta (admin)"
  on public.devices for insert
  with check (public.can_admin_home(home_id));

-- Renombrar o mover de habitación: basta con poder controlarlo.
create policy "dispositivos: editar"
  on public.devices for update
  using (public.can_control_device(id))
  with check (public.can_control_device(id));

create policy "dispositivos: dar de baja (admin)"
  on public.devices for delete
  using (public.can_admin_home(home_id));

-- ─── device_shares ────────────────────────────────────────────────────

create policy "comparticiones: ver las mías o las de mis casas"
  on public.device_shares for select
  using (user_id = auth.uid() or public.can_admin_home(public.home_of_device(device_id)));

create policy "comparticiones: crear (admin)"
  on public.device_shares for insert
  with check (public.can_admin_home(public.home_of_device(device_id)));

create policy "comparticiones: editar (admin)"
  on public.device_shares for update
  using (public.can_admin_home(public.home_of_device(device_id)))
  with check (public.can_admin_home(public.home_of_device(device_id)));

create policy "comparticiones: revocar (admin o el propio invitado)"
  on public.device_shares for delete
  using (user_id = auth.uid() or public.can_admin_home(public.home_of_device(device_id)));

-- ─── access_codes ─────────────────────────────────────────────────────
-- Solo los admin ven y gestionan los códigos.
-- El CANJE lo hace la Edge Function redeem-access-code con la clave
-- de servicio: quien canjea todavía no tiene ningún permiso.

create policy "códigos: ver (admin)"
  on public.access_codes for select
  using (
    (home_id   is not null and public.can_admin_home(home_id)) or
    (device_id is not null and public.can_admin_home(public.home_of_device(device_id)))
  );

create policy "códigos: crear (admin)"
  on public.access_codes for insert
  with check (
    created_by = auth.uid() and (
      (home_id   is not null and public.can_admin_home(home_id)) or
      (device_id is not null and public.can_admin_home(public.home_of_device(device_id)))
    )
  );

create policy "códigos: revocar (admin)"
  on public.access_codes for update
  using (
    (home_id   is not null and public.can_admin_home(home_id)) or
    (device_id is not null and public.can_admin_home(public.home_of_device(device_id)))
  )
  with check (
    (home_id   is not null and public.can_admin_home(home_id)) or
    (device_id is not null and public.can_admin_home(public.home_of_device(device_id)))
  );

-- ─── commands ─────────────────────────────────────────────────────────
-- Solo lectura desde la app: el historial de auditoría no se toca.
-- Escribe send-command con la clave de servicio.

create policy "comandos: ver el historial del dispositivo"
  on public.commands for select
  using (public.can_view_device(device_id));

-- ─── telemetry ────────────────────────────────────────────────────────
-- Solo lectura. Escribe mqtt-bridge con la clave de servicio.

create policy "telemetría: lectura"
  on public.telemetry for select
  using (public.can_view_device(device_id));

-- ─── push_tokens ──────────────────────────────────────────────────────

create policy "tokens push: solo los míos"
  on public.push_tokens for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());


-- ▼▼▼ 20260914090300_module_coolio.sql ▼▼▼
-- ═══════════════════════════════════════════════════════════════════════
--  Nexum — 04. Módulo Coolio (climatización por infrarrojos)
-- ═══════════════════════════════════════════════════════════════════════
--  PATRÓN DE MÓDULO. Cualquier módulo futuro copia esta estructura:
--    <modulo>_devices  → configuración fija del aparato
--    <modulo>_state    → último estado conocido
--    (+ tablas propias del módulo si hace falta)
--  Nada de esto se toca al añadir otro módulo. Ver docs/adding-a-module.md
-- ═══════════════════════════════════════════════════════════════════════

create table public.coolio_devices (
  device_id       uuid primary key references public.devices (id) on delete cascade,
  ac_brand        text,          -- "Daikin", "Mitsubishi", "Fujitsu"...
  ac_protocol     text,          -- nombre del protocolo en IRremoteESP8266
  min_temp        int  not null default 16,
  max_temp        int  not null default 30,
  supported_modes jsonb not null default '["auto","cool","heat","fan","dry"]'::jsonb,
  supported_fan   jsonb not null default '["auto","low","medium","high"]'::jsonb,
  has_swing       boolean not null default true,

  constraint coolio_temp_range_chk check (min_temp < max_temp)
);

comment on column public.coolio_devices.ac_protocol is
  'Identificador del protocolo IR en la librería IRremoteESP8266 del firmware. Lo elige el usuario en el emparejado y lo usa el ESP32 para saber qué ráfaga de infrarrojos emitir.';

-- ─── coolio_state ─────────────────────────────────────────────────────
--
--  ⚠ LEER ANTES DE USAR ESTA TABLA ⚠
--
--  Esto NO es el estado real del aire acondicionado. Es el último estado
--  que Nexum ORDENÓ. El infrarrojo es unidireccional: el ESP32 le habla
--  al aire, pero no puede escucharlo.
--
--  Si alguien usa el mando físico, Nexum no se entera y esta tabla queda
--  desactualizada sin saberlo.
--
--  La interfaz NUNCA debe presentar estos valores como una lectura
--  verificada. Siempre acompañados de "según el último cambio, hace X"
--  y con un botón de resincronizar. Ver docs/architecture.md.
--
--  La temperatura y humedad de la tabla telemetry SÍ son lecturas reales
--  (sensor SHT31) y deben mostrarse claramente separadas de esto.

create table public.coolio_state (
  device_id   uuid primary key references public.devices (id) on delete cascade,
  power       boolean not null default false,
  mode        text,
  target_temp int,
  fan_speed   text,
  swing       text,
  updated_at  timestamptz not null default now(),
  source      public.state_source not null default 'unknown'
);

comment on table public.coolio_state is
  'ÚLTIMO ESTADO ORDENADO, no leído. El IR es unidireccional. Mostrar siempre con la marca de tiempo y el botón de resincronizar.';

comment on column public.coolio_state.source is
  'Quién provocó este estado: la app, una automatización, el propio dispositivo al arrancar, o desconocido.';

-- ─── RLS ──────────────────────────────────────────────────────────────
-- Las tablas de módulo cuelgan de devices, así que reutilizan
-- exactamente las mismas funciones de permisos. Cero lógica nueva.

alter table public.coolio_devices enable row level security;
alter table public.coolio_state   enable row level security;

create policy "coolio config: ver"
  on public.coolio_devices for select
  using (public.can_view_device(device_id));

create policy "coolio config: editar"
  on public.coolio_devices for update
  using (public.can_control_device(device_id))
  with check (public.can_control_device(device_id));

create policy "coolio config: crear"
  on public.coolio_devices for insert
  with check (public.can_control_device(device_id));

create policy "coolio estado: ver"
  on public.coolio_state for select
  using (public.can_view_device(device_id));

-- Escribir el estado es cosa del backend (mqtt-bridge / send-command)
-- con la clave de servicio. La app no lo escribe nunca directamente:
-- ordena, y el estado llega de vuelta cuando el dispositivo confirma.


-- ▼▼▼ 20260914090400_module_plantico_phase2.sql ▼▼▼
-- ═══════════════════════════════════════════════════════════════════════
--  Nexum — 05. Módulo Plantico (riego)
--  ⚠ FASE 2 — SIN USAR ⚠
-- ═══════════════════════════════════════════════════════════════════════
--  Estas tablas existen para demostrar que la estructura aguanta un
--  módulo nuevo sin tocar el núcleo. NO hay código de app detrás.
--
--  La prueba de que el trabajo de fase 1 está bien hecho es que activar
--  Plantico no obligue a modificar NADA de core/ ni de las migraciones
--  01, 02 y 03.
-- ═══════════════════════════════════════════════════════════════════════

-- FASE 2, sin usar
create table public.plantico_devices (
  device_id           uuid primary key references public.devices (id) on delete cascade,
  plant_species       text,
  pot_volume_ml       int,
  target_moisture_pct int not null default 60,
  pump_ml_per_second  numeric(6,2),
  reservoir_ml        int,
  created_at          timestamptz not null default now()
);

-- FASE 2, sin usar
create table public.plantico_state (
  device_id        uuid primary key references public.devices (id) on delete cascade,
  soil_moisture_pct numeric(5,2),
  reservoir_pct     numeric(5,2),
  last_watered_at   timestamptz,
  next_watering_at  timestamptz,
  updated_at        timestamptz not null default now(),
  source            public.state_source not null default 'unknown'
);

-- FASE 2, sin usar
create table public.plantico_watering_log (
  id          bigserial primary key,
  device_id   uuid not null references public.devices (id) on delete cascade,
  ts          timestamptz not null default now(),
  volume_ml   int,
  trigger     text,     -- 'manual' | 'schedule' | 'threshold'
  user_id     uuid references public.profiles (id)
);

create index plantico_watering_log_device_ts_idx
  on public.plantico_watering_log (device_id, ts desc);

-- RLS: mismas funciones que Coolio. Cero lógica nueva.
alter table public.plantico_devices      enable row level security;
alter table public.plantico_state        enable row level security;
alter table public.plantico_watering_log enable row level security;

create policy "plantico config: ver"
  on public.plantico_devices for select
  using (public.can_view_device(device_id));

create policy "plantico estado: ver"
  on public.plantico_state for select
  using (public.can_view_device(device_id));

create policy "plantico riegos: ver"
  on public.plantico_watering_log for select
  using (public.can_view_device(device_id));


-- ▼▼▼ 20260914090500_automations.sql ▼▼▼
-- ═══════════════════════════════════════════════════════════════════════
--  Nexum — 06. Automatizaciones (transversal a todos los módulos)
-- ═══════════════════════════════════════════════════════════════════════
--  Las "escenas" de la pantalla de Inicio (En casa / Noche / Fuera / Eco)
--  NO son una entidad nueva: son grupos de automatizaciones etiquetadas.
--  Por eso existe la columna scene.
-- ═══════════════════════════════════════════════════════════════════════

create table public.automations (
  id          uuid primary key default gen_random_uuid(),
  home_id     uuid not null references public.homes (id) on delete cascade,
  device_id   uuid references public.devices (id) on delete cascade,
  module      public.module_id,
  name        text not null,
  scene       text,            -- 'home' | 'night' | 'away' | 'eco' | NULL
  enabled     boolean not null default true,
  trigger     jsonb not null,  -- {type:'schedule'|'threshold'|'geofence'|'presence', ...}
  action      jsonb not null,  -- {command:{action:'set_state', params:{...}}}
  created_by  uuid not null references public.profiles (id),
  created_at  timestamptz not null default now(),

  constraint automations_trigger_type_chk
    check (trigger ->> 'type' in ('schedule','threshold','geofence','presence'))
);

comment on column public.automations.scene is
  'Etiqueta de escena. Las escenas de la pantalla de Inicio son grupos de automatizaciones, no una tabla aparte.';

comment on column public.automations.trigger is
  'Disparador. Ver el tipo AutomationTrigger en packages/shared-types.';

create index automations_home_idx    on public.automations (home_id);
create index automations_enabled_idx on public.automations (enabled) where enabled;

alter table public.automations enable row level security;

create policy "automatizaciones: ver"
  on public.automations for select
  using (public.is_home_member(home_id));

create policy "automatizaciones: crear"
  on public.automations for insert
  with check (
    created_by = auth.uid()
    and public.can_control_in_home(home_id)
    and (device_id is null or public.can_control_device(device_id))
  );

create policy "automatizaciones: editar"
  on public.automations for update
  using (public.can_control_in_home(home_id))
  with check (public.can_control_in_home(home_id));

create policy "automatizaciones: borrar"
  on public.automations for delete
  using (public.can_control_in_home(home_id));


-- ═══════════════════════════════════════════════════════════════════════
--  Registro en el historial de migraciones de Supabase
-- ═══════════════════════════════════════════════════════════════════════
--  Deja constancia de que estas 6 migraciones YA están aplicadas.
--  Sin esto, un futuro "supabase db push" intentaría aplicarlas otra vez
--  y fallaría con "already exists".

create schema if not exists supabase_migrations;

create table if not exists supabase_migrations.schema_migrations (
  version text primary key,
  statements text[],
  name text
);

insert into supabase_migrations.schema_migrations (version, name) values
  ('20260914090000', 'core_schema'),
  ('20260914090100', 'permission_functions'),
  ('20260914090200', 'rls_policies'),
  ('20260914090300', 'module_coolio'),
  ('20260914090400', 'module_plantico_phase2'),
  ('20260914090500', 'automations')
on conflict (version) do nothing;

commit;

-- ═══════════════════════════════════════════════════════════════════════
--  COMPROBACIÓN
-- ═══════════════════════════════════════════════════════════════════════
--  Ejecuta esto DESPUÉS, en una consulta nueva. Deben salir 16 tablas,
--  todas con rls_activo = true.

--  select tablename, rowsecurity as rls_activo
--  from pg_tables where schemaname = 'public' order by tablename;
