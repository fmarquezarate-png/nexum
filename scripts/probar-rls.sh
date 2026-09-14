#!/usr/bin/env bash
#
# Prueba de las políticas de seguridad (RLS) COMO USUARIO NORMAL.
#
# POR QUÉ EXISTE ESTE ARCHIVO
#
# Las primeras pruebas del esquema se hicieron conectando como el
# superusuario de Postgres. Y el superusuario SE SALTA EL RLS. O sea que
# probaban las funciones de permisos, pero nunca las políticas.
#
# Por eso se coló un fallo que rompía el asistente de alta entero: crear
# una casa fallaba siempre, y ninguna prueba lo detectó.
#
# Este script levanta un Postgres desechable, imita el entorno de
# Supabase (esquema auth, auth.uid() leyendo el usuario de la sesión) y
# ejecuta todo con el rol 'authenticated', SIN superpoderes. Así el RLS
# se aplica de verdad.
#
# Uso:  bash scripts/probar-rls.sh
# Necesita: postgresql-16 instalado.

set -euo pipefail

PUERTO="${PUERTO:-55450}"
DATOS="$(mktemp -d)/pgdata"
RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BIN=/usr/lib/postgresql/16/bin

limpiar() {
  su postgres -c "$BIN/pg_ctl -D $DATOS -o '-p $PUERTO -k /tmp' stop" >/dev/null 2>&1 || true
  rm -rf "$DATOS"
}
trap limpiar EXIT

mkdir -p "$DATOS"
chown -R postgres:postgres "$(dirname "$DATOS")"
su postgres -c "$BIN/initdb -D $DATOS -U postgres --auth=trust" >/dev/null 2>&1
su postgres -c "$BIN/pg_ctl -D $DATOS -o '-p $PUERTO -k /tmp' -l /tmp/pg-rls.log start" >/dev/null 2>&1

export PGHOST=/tmp PGPORT="$PUERTO" PGUSER=postgres
until psql -c "select 1" >/dev/null 2>&1; do sleep 1; done

psql -q -c "create database nexum_rls;"

# ── Imitación mínima de Supabase ─────────────────────────────────────
psql -q -d nexum_rls -v ON_ERROR_STOP=1 <<'EOF'
create schema if not exists auth;
create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb);

-- En Supabase auth.uid() sale del JWT. Aquí, de una variable de sesión.
create or replace function auth.uid() returns uuid language sql stable as
$$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;

-- El rol que usa de verdad la app. SIN superpoderes: el RLS se aplica.
create role authenticated nologin;
create role anon nologin;
grant usage on schema public, auth to authenticated;
EOF

for archivo in "$RAIZ"/supabase/migrations/*.sql; do
  psql -q -d nexum_rls -v ON_ERROR_STOP=1 -f "$archivo" 2>/dev/null
done

psql -q -d nexum_rls -v ON_ERROR_STOP=1 <<'EOF'
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;
grant execute on all functions in schema public to authenticated;
insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111','fran@test.com'),
  ('22222222-2222-2222-2222-222222222222','ana@test.com');
EOF

echo "── Pruebas como usuario normal (rol 'authenticated', RLS activo) ──"
echo

psql -d nexum_rls -v ON_ERROR_STOP=1 -X -q <<'EOF'
set role authenticated;
select set_config('request.jwt.claim.sub','11111111-1111-1111-1111-111111111111', false);

\echo '1. Fran crea una casa'
select case when (create_home('Casa Banana') ->> 'ok') = 'true'
            then '   OK' else '   FALLO' end;

\echo '2. Queda como propietario'
select case when exists (
  select 1 from home_members where user_id = auth.uid() and role = 'owner'
) then '   OK' else '   FALLO' end;

\echo '3. Puede leer su casa'
select case when (select count(*) from homes) = 1 then '   OK' else '   FALLO' end;

\echo '4. Puede crear habitaciones'
insert into rooms (home_id, name, sort_order)
values ((select id from homes limit 1), 'Salón', 0);
select case when (select count(*) from rooms) = 1 then '   OK' else '   FALLO' end;

\echo '5. Nombre vacío se rechaza con motivo propio'
select case when (create_home('  ') ->> 'error') = 'empty_name'
            then '   OK' else '   FALLO' end;

\echo '6. Fran genera un código de invitado'
select create_access_code((select id from homes limit 1), null, 'guest',
                          now() + interval '1 day', null) as res \gset
select case when (:'res'::jsonb ->> 'ok') = 'true' then '   OK' else '   FALLO' end;
-- Se guarda el código AQUÍ, mientras somos Fran. Ana no puede leer la
-- tabla de códigos (y está bien que no pueda): en la vida real se lo
-- pasa Fran por mensaje.
select (:'res'::jsonb ->> 'code') as codigo \gset

\echo '7. Ana, sin acceso, NO ve la casa de Fran'
select set_config('request.jwt.claim.sub','22222222-2222-2222-2222-222222222222', false);
select case when (select count(*) from homes) = 0 then '   OK' else '   FALLO' end;

\echo '8. Ana canjea el código que le pasó Fran'
select case when (redeem_access_code(:'codigo') ->> 'ok') = 'true'
            then '   OK' else '   FALLO' end;

\echo '9. Ahora Ana SÍ ve la casa'
select case when (select count(*) from homes) = 1 then '   OK' else '   FALLO' end;

\echo '10. Ana es invitada: no puede administrar'
select case when not can_admin_home((select id from homes limit 1))
            then '   OK' else '   FALLO' end;
EOF

echo
echo "── Fin ──"
