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
