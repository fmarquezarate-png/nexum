# Cómo añadir un módulo nuevo

Esta guía es, en el fondo, el examen final de la arquitectura.

> **La prueba de que el trabajo está bien hecho es que añadir Plantico no
> obligue a tocar `core/` ni las migraciones del núcleo.**

Si al seguir estos pasos te ves modificando el núcleo, **para**: el problema
está en el núcleo, no en el módulo. Arréglalo ahí.

## Qué es núcleo y qué es módulo

| Es NÚCLEO (no se toca) | Es MÓDULO (se añade) |
|---|---|
| Cuentas, login | La pantalla de detalle del aparato |
| Casas, habitaciones | Su configuración específica |
| Permisos y roles | Su estado específico |
| Tabla `devices` | Tabla `<modulo>_devices` |
| Tabla `commands` | Los `params` de sus comandos |
| Tabla `telemetry` | — |
| Notificaciones | — |
| Automatizaciones | Las acciones que ofrece |
| Navegación | Su color e identidad |

Regla de bolsillo: si lo necesitaría también un módulo de iluminación, es
núcleo.

## Los seis pasos

### 1. Añadir el módulo al tipo `module_id`

```sql
alter type public.module_id add value 'iluminacion';
```

Y en `packages/shared-types/src/enums.ts`:

```ts
export const MODULES = ['coolio', 'plantico', 'iluminacion'] as const;
```

### 2. Crear sus tablas satélite

Una migración nueva, copiando el patrón de
`..._module_coolio.sql`:

- `<modulo>_devices` → configuración fija del aparato
- `<modulo>_state` → último estado conocido
- las tablas propias que haga falta (historial, etc.)

Todas cuelgan de `devices(id)` con `on delete cascade`.

### 3. Añadir sus políticas RLS

Copiar las de Coolio tal cual. **No escribas lógica de permisos nueva**: las
funciones `can_view_device` y `can_control_device` ya valen, porque las tablas
del módulo cuelgan de `devices`.

Si te hace falta una función de permisos nueva, párate: probablemente estás
metiendo en el módulo algo que es núcleo.

### 4. Definir el contrato

En `packages/contracts/payloads.schema.json`, añadir sus `params` de comando y
sus campos de estado. **Primero el contrato, luego el código.**

Los topics no cambian: `nexum/{home_id}/{device_id}/...` sirve para cualquier
módulo.

### 5. Añadir su tema visual

En `apps/mobile/ui/theme.ts`:

```ts
iluminacion: {
  label: 'Nombre',
  tagline: 'Su frase',
  primary: '#...',
  accent: '#...',
  soft: '#...',
},
```

### 6. Crear la carpeta del módulo

```
apps/mobile/modules/<nombre>/
├── index.ts
├── DeviceDetail.tsx
└── components/
```

Y registrarla en el enrutado por módulo de `app/devices/[id].tsx`.

## La regla que sostiene todo esto

**`core/` no importa nada de `modules/`.** La flecha va en un solo sentido.

El día que aparezca un `import ... from '../modules/coolio'` dentro de `core/`,
la arquitectura se ha roto y añadir el siguiente módulo dejará de ser gratis.

## Lista de comprobación

- [ ] No he modificado ninguna tabla del núcleo
- [ ] No he escrito ninguna función de permisos nueva
- [ ] No he tocado nada dentro de `core/`
- [ ] El contrato está actualizado antes que el código
- [ ] El módulo funciona con los mismos topics MQTT
- [ ] Si desactivo el módulo, el resto de la app sigue funcionando
