# supabase/sql-editor/ — para trabajar sin terminal

## Por qué existe esta carpeta

La forma "oficial" de aplicar el esquema es con el CLI de Supabase, que se usa
desde una terminal. **En este proyecto no usamos terminal**, así que aquí vive
el mismo esquema empaquetado para pegarlo en el editor SQL del navegador.

## `esquema-completo.sql`

Las 6 migraciones de `../migrations/` unidas en un solo archivo.

### Cómo usarlo

1. Entra a **https://supabase.com** y abre tu proyecto
2. Menú izquierdo → **SQL Editor**
3. Botón **New query** (arriba a la derecha)
4. Pega el archivo entero en el recuadro grande
5. Botón **Run** (abajo a la derecha)

**Si salió bien:** recuadro verde, *"Success. No rows returned"*. Y en
**Table Editor** aparecen 16 tablas.

**Si salió mal:** recuadro rojo con el error.

### Qué hace al final

Registra las 6 migraciones en `supabase_migrations.schema_migrations`, el
historial interno de Supabase. Así, si algún día se usa el CLI, sabrá que ya
están aplicadas y no intentará repetirlas.

## Regla

**Este archivo se genera, no se edita.** La fuente de verdad sigue siendo
`supabase/migrations/`. Si cambia el esquema: se añade una migración nueva y se
vuelve a generar este archivo.
