-- ═══════════════════════════════════════════════════════════════════════
--  Nexum — 09. Restaura la seguridad de la tabla homes
-- ═══════════════════════════════════════════════════════════════════════
--
--  POR QUÉ EXISTE ESTE ARCHIVO
--
--  Mientras se depuraba el fallo de "crear casa", la protección de la
--  tabla homes se desactivó a mano para poder seguir probando. Funcionó,
--  pero dejó la tabla abierta: sin RLS, cualquiera con la clave pública
--  —que viaja dentro de la app y por tanto es conocida— puede leer,
--  crear y borrar casas de cualquier usuario.
--
--  La causa de aquel fallo ya está resuelta en la migración 08, con la
--  función create_home. No hace falta renunciar a nada.
--
--  Este archivo devuelve la tabla a su estado correcto. Se puede
--  ejecutar tantas veces como haga falta: primero quita las políticas y
--  luego las vuelve a crear, así que da igual cómo estuviera antes.
-- ═══════════════════════════════════════════════════════════════════════

-- 1. Protección encendida
alter table public.homes enable row level security;

-- 2. Fuera cualquier política previa, se llame como se llame
drop policy if exists "casas propias: lectura"     on public.homes;
drop policy if exists "casas: crear"               on public.homes;
drop policy if exists "casas: editar (admin)"      on public.homes;
drop policy if exists "casas: borrar (solo owner)" on public.homes;

-- 3. Las cuatro políticas correctas

--  Ver una casa: hay que ser miembro con acceso vigente.
create policy "casas propias: lectura"
  on public.homes for select
  using (public.is_home_member(id));

--  Crear: solo a tu propio nombre. Nadie crea casas en nombre de otro.
--  La app no usa esta vía: pasa por create_home (migración 08), que
--  además devuelve la fila recién creada. La política se mantiene para
--  que la tabla no dependa de que exista esa función.
create policy "casas: crear"
  on public.homes for insert
  with check (created_by = auth.uid());

--  Editar (nombre, zona horaria, coordenadas): propietarios y admins.
create policy "casas: editar (admin)"
  on public.homes for update
  using (public.can_admin_home(id))
  with check (public.can_admin_home(id));

--  Borrar: SOLO el propietario. Arrastra habitaciones, dispositivos,
--  telemetría e historial, así que no se delega en los administradores.
create policy "casas: borrar (solo owner)"
  on public.homes for delete
  using (public.home_role_of(id) = 'owner');

-- 4. Y ya que estamos, revisión del resto: que no se haya quedado
--    ninguna otra tabla desprotegida por el camino.
do $$
declare
  t record;
begin
  for t in
    select tablename from pg_tables
    where schemaname = 'public' and not rowsecurity
  loop
    execute format('alter table public.%I enable row level security', t.tablename);
    raise notice 'Protección reactivada en la tabla: %', t.tablename;
  end loop;
end;
$$;
