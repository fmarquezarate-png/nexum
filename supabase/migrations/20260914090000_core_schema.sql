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
