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
