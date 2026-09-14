# Contrato de API — qué llama la app al backend

> Versión del contrato: **1.0.0**

La app **nunca** habla MQTT y **nunca** usa la clave de servicio. Todo lo que
necesita hacer contra los dispositivos pasa por estas cuatro Edge Functions.

Una *Edge Function* es un trocito de código que vive en Supabase y se ejecuta
cuando la app lo llama, como si fuera una página web. Se despierta, hace su
trabajo y se apaga.

Todas exigen el **token JWT** del usuario (Supabase lo añade solo si usas el
cliente oficial). Sin token → `401`.

---

## `POST /functions/v1/send-command`

Envía una orden a un dispositivo.

**Entrada**
```json
{
  "device_id": "uuid",
  "action": "set_state",
  "params": { "power": true, "mode": "cool", "target_temp": 24 }
}
```

**Qué hace, en orden**
1. Comprueba con `can_control_device(device_id)` que este usuario puede.
2. Inserta una fila en `commands` con estado `pending`.
3. Publica el mensaje `Command` en `nexum/{home_id}/{device_id}/cmd`.
4. Marca la fila como `sent`.

**Salida `200`**
```json
{ "command_id": "uuid", "status": "sent" }
```

**Errores**

| Código | Cuándo |
|---|---|
| `401` | Sin sesión iniciada |
| `403` | El usuario no tiene permiso de control sobre ese dispositivo |
| `404` | El dispositivo no existe |
| `409` | El dispositivo está offline |
| `422` | Los `params` no cumplen `payloads.schema.json` |

La confirmación del dispositivo **no** llega por aquí: llega por MQTT al
`mqtt-bridge`, que actualiza la fila a `acked`. La app se entera por Realtime
(la suscripción en vivo de Supabase a los cambios de una tabla).

---

## `POST /functions/v1/provision-device`

Genera el token de un solo uso para dar de alta un dispositivo nuevo.

**Entrada**
```json
{ "home_id": "uuid", "room_id": "uuid|null", "module": "coolio", "name": "Salón" }
```

**Salida `200`**
```json
{ "claim_token": "ABCD-1234-EFGH", "expires_at": "2026-09-14T18:10:00Z" }
```

Válido **10 minutos**, un solo uso. Requiere rol `admin` u `owner` en la casa.

### Segunda llamada — la hace el ESP32, no la app

`POST /functions/v1/provision-device/claim`

```json
{ "claim_token": "ABCD-1234-EFGH", "hw_id": "AA:BB:CC:DD:EE:FF", "firmware_version": "1.0.0" }
```

Respuesta: credenciales MQTT propias del dispositivo.

```json
{
  "device_id": "uuid",
  "home_id": "uuid",
  "mqtt": { "host": "...", "port": 8883, "username": "dev_<device_id>", "password": "<generada>" }
}
```

Esta es la **única** vez que se devuelve la contraseña. Si se pierde, hay que
re-emparejar el dispositivo.

---

## `POST /functions/v1/redeem-access-code`

Canjea un código de invitado.

**Entrada:** `{ "code": "NEXUM-7K2P" }`

**Salida `200`:** `{ "scope": "home", "home_id": "uuid", "role": "guest", "expires_at": "..." }`

**Errores** — cada uno con mensaje propio en español, nunca un error genérico:

| Código | Situación | Mensaje en la app |
|---|---|---|
| `404` | No existe | "Este código no es válido." |
| `410` | Caducado | "Este código caducó el 12 de septiembre." |
| `410` | Revocado | "El propietario ha desactivado este código." |
| `429` | Sin usos | "Este código ya se ha usado el número máximo de veces." |
| `409` | Ya tiene acceso | "Ya tienes acceso a esta casa." |

---

## `POST /functions/v1/evaluate-automations`

**No la llama la app.** La dispara un *cron* (un reloj programado) de Supabase
cada minuto. Revisa las automatizaciones activas y, cuando una se cumple,
llama internamente a la misma lógica que `send-command`, registrando el
comando con `source = 'automation'`.

---

## Lo que la app hace directamente contra Postgres

Sin pasar por Edge Functions, porque RLS ya lo protege:

- Leer y escribir `profiles`, `homes`, `rooms`, `devices` (nombre, habitación)
- Leer `coolio_state`, `telemetry`, `commands`
- Crear y revocar `access_codes`, gestionar `home_members` y `device_shares`
- Crear y editar `automations`
- Suscribirse por **Realtime** a `coolio_state`, `devices` y `commands`
