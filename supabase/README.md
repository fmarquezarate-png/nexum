# supabase/ — la base de datos y el backend

## Qué hay aquí

| Carpeta | Qué contiene |
|---|---|
| `migrations/` | El esquema de la base de datos, en archivos SQL numerados por fecha |
| `functions/` | Las Edge Functions (los "trocitos de backend") |
| `seed.sql` | Datos de ejemplo para desarrollo local |
| `config.toml` | Configuración del CLI de Supabase |

## Cómo funcionan las migraciones

Una *migración* es un archivo SQL que describe un cambio en la base de datos.
Se ejecutan **en orden de nombre**, por eso empiezan por una fecha.

**Regla que no se rompe nunca:** una migración ya aplicada **no se edita**.
Si te equivocaste, creas una migración nueva que lo corrige. Editar una
aplicada hace que tu base de datos y la de otro dejen de coincidir, y eso es
muy difícil de detectar después.

Orden actual:

1. `..._core_schema.sql` — tablas comunes a todos los módulos
2. `..._permission_functions.sql` — las funciones que deciden quién puede qué
3. `..._rls_policies.sql` — las reglas de seguridad, tabla por tabla
4. `..._module_coolio.sql` — tablas del módulo Coolio
5. `..._module_plantico_phase2.sql` — tablas de Plantico (creadas, sin usar)
6. `..._automations.sql` — automatizaciones y escenas

## Aplicarlas a tu proyecto en la nube

```bash
npx supabase login          # se abre el navegador, das permiso
npx supabase link --project-ref TU_REF_DE_PROYECTO
npx supabase db push        # aplica las migraciones que falten
```

`TU_REF_DE_PROYECTO` es el código que aparece en la dirección de tu proyecto:
`https://supabase.com/dashboard/project/`**`abcdefghijklmnop`**

**Si salió bien:** verás una lista de las migraciones aplicadas y ningún error
en rojo. Comprueba en Supabase → Table Editor que aparecen las tablas
`homes`, `devices`, `coolio_state`...

**Si salió mal:** lee la primera línea roja. Casi siempre es "relation already
exists" (la tabla ya estaba) o un problema de orden de archivos.

## Edge Functions

Cada carpeta dentro de `functions/` es una función independiente. Se despliegan
una a una:

```bash
npx supabase functions deploy send-command
```

**Están todas en estado de esqueleto.** Devuelven `501 Not Implemented` a
propósito: la lógica llega en la fase 2. Lo que sí está escrito y cerrado es su
contrato de entrada y salida, en `packages/contracts/api.md`.
