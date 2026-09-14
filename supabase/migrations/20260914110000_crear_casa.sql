-- ═══════════════════════════════════════════════════════════════════════
--  Nexum — 08. Crear casa sin caer en la trampa del RETURNING
-- ═══════════════════════════════════════════════════════════════════════
--
--  EL PROBLEMA
--
--  Crear una casa desde la app fallaba siempre con
--  "new row violates row-level security policy for table homes".
--
--  El motivo es una pescadilla que se muerde la cola:
--
--    1. La app hace INSERT y pide que le devuelvan la fila creada
--       (necesita el id para seguir con las habitaciones).
--    2. Cuando un INSERT lleva RETURNING, Postgres aplica también la
--       POLÍTICA DE LECTURA a la fila que va a devolver.
--    3. La política de lectura de homes dice: "puedes verla si eres
--       miembro de ella".
--    4. Pero la fila que te hace miembro la crea el disparador
--       on_home_created, que se ejecuta DESPUÉS.
--    5. En ese instante todavía no eres miembro de tu propia casa,
--       así que la lectura se deniega y el INSERT entero se cae.
--
--  Sin RETURNING el INSERT funciona perfectamente. Es solo el momento
--  en que se comprueba la lectura.
--
--  POR QUÉ NO SE ARREGLA AÑADIENDO "created_by = auth.uid()" A LA
--  POLÍTICA DE LECTURA
--
--  Sería más corto, pero abre un agujero: quien creó una casa seguiría
--  viéndola para siempre aunque los administradores lo expulsaran
--  después. La pertenencia dejaría de ser la única fuente de verdad.
--
--  LA SOLUCIÓN
--
--  Una función que hace las dos cosas de una vez y devuelve la casa ya
--  creada. Al ejecutarse con permisos elevados no se topa con el
--  problema de sincronización, y sigue comprobando por dentro que hay
--  sesión iniciada.
-- ═══════════════════════════════════════════════════════════════════════

create or replace function public.create_home(
  p_name     text,
  p_timezone text default 'Europe/Madrid'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_casa public.homes%rowtype;
begin
  if auth.uid() is null then
    return jsonb_build_object('ok', false, 'error', 'not_authenticated');
  end if;

  if coalesce(trim(p_name), '') = '' then
    return jsonb_build_object('ok', false, 'error', 'empty_name');
  end if;

  insert into public.homes (name, timezone, created_by)
  values (
    trim(p_name),
    coalesce(nullif(trim(p_timezone), ''), 'Europe/Madrid'),
    auth.uid()
  )
  returning * into v_casa;

  -- El disparador on_home_created ya ha añadido al creador como 'owner'.

  return jsonb_build_object('ok', true, 'home', to_jsonb(v_casa));
end;
$$;

comment on function public.create_home is
  'Crea una casa y devuelve la fila. Existe porque un INSERT con RETURNING choca con la política de lectura: el creador todavía no es miembro cuando Postgres comprueba si puede ver la fila que va a devolver.';

revoke execute on function public.create_home(text, text) from public, anon;
grant  execute on function public.create_home(text, text) to authenticated;
