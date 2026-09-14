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
