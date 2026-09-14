# Modelo de datos

## La jerarquía

```
Usuario ──┬── Casa ──── Habitación ──── Dispositivo ──── Módulo
          │
          └── (puede pertenecer a varias casas)
```

Pero con un matiz que lo cambia todo: **no hay propiedad única**.

El requisito real fue este:

> *"Me gustaría que más de una persona pueda tener configurado un mismo aire en
> su app. Perfil de Ana: A/C casa papás, A/C casa banana. Perfil de Fran: A/C
> casa banana, A/C casa Fran. Cada uno puede tener dispositivos independientes,
> o podemos compartir uno. Y los invitados también puedan conectarse con un
> código configurado por los owners, durante el tiempo que los owners decidan."*

Traducido:

- Un usuario está en **varias casas**, una casa tiene **varios usuarios**.
  Relación N:N, no jerarquía de dueño único. → tabla `home_members`
- Normalmente el acceso se da **a nivel de casa**: entras a la casa, ves sus
  dispositivos.
- Pero debe poder compartirse **un dispositivo suelto** sin dar acceso a la
  casa entera. → tabla `device_shares`
- Los invitados entran con **código que caduca**. → tabla `access_codes`
- Todo acceso tiene **rol** y puede tener **fecha de expiración**.

## Las tablas, por bloques

### Núcleo — identidad y estructura

| Tabla | Para qué |
|---|---|
| `profiles` | Nombre, avatar e idioma. 1:1 con la cuenta de Supabase |
| `homes` | "Casa Banana", "Casa Papás". Zona horaria y coordenadas |
| `home_members` | Quién está en qué casa, con qué rol y hasta cuándo |
| `rooms` | "Salón", "Dormitorio" |

### Núcleo — dispositivos

| Tabla | Para qué |
|---|---|
| `devices` | Lo común a cualquier aparato: casa, habitación, módulo, nombre, MAC, si está conectado |
| `device_shares` | Compartir un aparato suelto |
| `access_codes` | Códigos de invitado (QR o texto) |
| `commands` | **Auditoría.** Toda orden emitida, con quién y cuándo |
| `telemetry` | Lecturas reales de sensores, serie temporal |
| `push_tokens` | Para las notificaciones al móvil |

### Módulos

| Tabla | Para qué |
|---|---|
| `coolio_devices` | Marca, protocolo IR, rangos y modos soportados |
| `coolio_state` | Último estado **ordenado** (ver aviso abajo) |
| `plantico_*` | Fase 2, creadas y sin usar |

### Transversal

| Tabla | Para qué |
|---|---|
| `automations` | Disparador + acción. Las **escenas** son automatizaciones etiquetadas, no una tabla nueva |

## Dos decisiones que conviene entender

### `coolio_state` no es el estado del aire

Es el último estado que **Nexum ordenó**. El infrarrojo es unidireccional: el
ESP32 emite pero no escucha. Si alguien usa el mando físico, esta tabla queda
desactualizada sin saberlo.

Por eso la interfaz siempre lo acompaña de la hora del último cambio y del
botón de resincronizar. Ver `architecture.md`.

En cambio `telemetry` **sí** son lecturas reales del sensor SHT31.

### Por qué `devices` es común y la configuración va aparte

Todo aparato, sea del módulo que sea, tiene casa, habitación, nombre, MAC y
estado de conexión. Eso va en `devices`.

Lo que cambia de un módulo a otro (marca del aire, especie de la planta) va en
una tabla satélite: `coolio_devices`, `plantico_devices`…

**Resultado:** añadir un módulo = añadir tablas satélite. La tabla `devices` no
se toca nunca. Si algún día alguien propone meterle una columna
`ac_brand` a `devices`, la respuesta es no.

## Sobre particionar `telemetry`

El diseño inicial contemplaba particionar por mes (partir la tabla en trozos
mensuales). **De momento no se hace**, a propósito.

Los números: a 1 dato por minuto son unas 525.000 filas por dispositivo y año.
Con tres dispositivos, un millón y medio al año. Postgres maneja eso sin
despeinarse con el índice `(device_id, ts)` que ya está creado.

Particionar ahora significaría tener que crear la partición de cada mes nuevo
para siempre, a cambio de resolver un problema que aún no existe.

**Cuándo volver sobre esto:** si la tabla pasa de ~50 millones de filas o las
consultas de Estadísticas empiezan a tardar más de un segundo. La instrucción
está escrita en el comentario de la propia tabla.
