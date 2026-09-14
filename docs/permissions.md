# Permisos y seguridad

## Dónde vive la seguridad de verdad

**En la base de datos, no en la app.**

Postgres tiene una función llamada RLS (*Row Level Security*, seguridad a nivel
de fila): reglas que se aplican fila por fila y deciden qué puede ver y tocar
cada usuario.

Por qué importa: aunque alguien se saltara la app por completo y hablara
directamente con la base de datos usando la clave pública, **seguiría viendo
solo sus casas y sus dispositivos**. La seguridad no depende de que la app esté
bien programada.

Lo que hay en `apps/mobile/core/permissions/` sirve solo para decidir qué se
dibuja (ocultarle el botón de encender a un invitado). Eso es comodidad, no
seguridad.

## La matriz

| Rol | Ver | Controlar | Administrar la casa |
|---|:---:|:---:|:---:|
| `owner` | sí | sí | sí |
| `admin` | sí | sí | sí |
| `member` | sí | sí | no |
| `guest` | sí | **no** | no |
| `controller` ⁽¹⁾ | sí | sí | no |
| `viewer` ⁽¹⁾ | sí | **no** | no |

⁽¹⁾ Solo sobre el dispositivo concreto que les han compartido.

**Controlar** = encender, apagar, cambiar temperatura, regar.
**Administrar** = invitar y expulsar miembros, crear y revocar códigos, dar de
alta y de baja dispositivos.

## Los dos caminos de acceso

Un usuario puede tocar un dispositivo si se cumple **al menos uno**:

1. Tiene fila en `home_members` para la casa de ese dispositivo, con
   `expires_at` nulo o futuro.
2. Tiene fila en `device_shares` para ese dispositivo, con `expires_at` nulo o
   futuro.

Y además su rol permite la acción concreta.

## Cómo está implementado

Toda la lógica está en **funciones SQL reutilizables**, no repetida política a
política:

| Función | Responde a |
|---|---|
| `is_active(expires_at)` | ¿Este acceso sigue vivo? |
| `home_role_of(home_id)` | ¿Qué rol tengo en esta casa? (NULL si ninguno o caducado) |
| `is_home_member(home_id)` | ¿Estoy en esta casa? |
| `can_admin_home(home_id)` | ¿Puedo administrarla? |
| `can_view_device(device_id)` | ¿Puedo ver este aparato? |
| `can_control_device(device_id)` | ¿Puedo controlarlo? |

Las políticas RLS se limitan a invocarlas. Es la misma idea que una medida DAX:
la fórmula vive en un sitio y todos los visuales la usan. El día que cambie una
regla, cambia en un archivo.

Están en `supabase/migrations/..._permission_functions.sql`.

### Por qué son `security definer`

Estas funciones leen `home_members`. Si se ejecutaran con los permisos del
usuario, RLS volvería a llamarlas para decidir si puede leer esa tabla →
bucle infinito. `security definer` las ejecuta saltando RLS **dentro** de la
función. Por eso también fijan `search_path`: para que nadie pueda colarles
otra tabla con el mismo nombre.

## La caducidad se comprueba en la base de datos

**Siempre dentro de la política, nunca en el código de la app.**

Un acceso caducado tiene que dejar de funcionar aunque la app tenga la pantalla
abierta, aunque esté sin cobertura, aunque el usuario tenga una versión vieja
instalada. Si la comprobación estuviera en la app, bastaría con no actualizarla.

Regla única: `expires_at IS NULL OR expires_at > now()`.

## Códigos de invitado

- `expires_at` es **NOT NULL**. No existe el código de invitado permanente.
- Pueden tener alcance de casa (`home_id`) o de un dispositivo (`device_id`),
  nunca ninguno de los dos: lo garantiza una restricción `CHECK`.
- El rol tiene que encajar con el alcance: un código de casa no puede dar rol
  `viewer`, y uno de dispositivo no puede dar rol `admin`. También por `CHECK`.
- Pueden tener número máximo de usos y pueden revocarse en cualquier momento.
- **El canje lo hace la Edge Function** `redeem-access-code` con la clave de
  servicio, porque quien canjea todavía no tiene ningún permiso para leer la
  tabla de códigos.

### Mensajes de rechazo

Cada motivo tiene su propio mensaje. Un código caducado devuelve *"Este código
ha caducado"*, no un error genérico. Está en los criterios de aceptación de la
fase 1.

Textos en `apps/mobile/lib/i18n/es.json`, bajo `errors`.

## Las tres claves y dónde puede vivir cada una

| Clave | Puede estar en | NUNCA en |
|---|---|---|
| `anon` (pública) | La app móvil | — |
| `service_role` | `mqtt-bridge`, Edge Functions | La app, el repositorio, el firmware |
| Credenciales MQTT del dispositivo | El propio ESP32 | La app, el repositorio |

La clave `service_role` **salta todas las políticas RLS**. Si acabara dentro de
la app, cualquiera que descargara el APK podría leer y borrar toda la base de
datos.

**Ningún secreto se sube al repositorio.** Los archivos `.env.example` listan
todas las claves con el valor vacío y explican de dónde sale cada una.
