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
