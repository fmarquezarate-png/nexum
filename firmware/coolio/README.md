# Firmware Coolio — contrato

> Para el agente de firmware. Fuente de verdad: `packages/contracts/`.
> **No escribir firmware en este repositorio.**

## Hardware

| Pieza | Detalle |
|---|---|
| Placa | ESP32 DevKitC V4 |
| Emisor | Módulo IR 940 nm, apuntando al receptor del split |
| Sensor | SHT31 (temperatura + humedad), por I²C |
| Alimentación | USB 5 V / 1 A |

## Qué tiene que hacer

1. **Portal cautivo** al arrancar sin configurar: levanta un punto de acceso
   WiFi llamado `Nexum-XXXX`. El usuario elige su red, mete la contraseña y
   pega un **token de reclamo**.
2. **Registro**: llama a `POST /functions/v1/provision-device/claim` con el
   token y su MAC. Recibe `device_id`, `home_id` y sus credenciales MQTT
   propias. **Es la única vez que se devuelve la contraseña**: hay que
   guardarla en memoria no volátil.
3. **Conexión MQTT** con TLS al broker HiveMQ, con LWT configurado antes de
   conectar (ver abajo).
4. **Obedecer comandos** que llegan por su topic `cmd` y confirmar por `ack`.
5. **Publicar estado** tras cada cambio y cada 5 minutos.
6. **Publicar telemetría** del SHT31 cada 60 segundos.
7. **Sobrevivir a cortes de luz**: conserva la configuración y reconecta solo.
8. **Reset de fábrica** por pulsación larga de un botón.

## Topics

`{home_id}` y `{device_id}` son los UUID recibidos en el registro.

```
nexum/{home_id}/{device_id}/cmd        ← SE SUSCRIBE (QoS 1)
nexum/{home_id}/{device_id}/state      → PUBLICA (QoS 1, retained)
nexum/{home_id}/{device_id}/telemetry  → PUBLICA (QoS 0)
nexum/{home_id}/{device_id}/ack        → PUBLICA (QoS 1)
nexum/{home_id}/{device_id}/lwt        → PUBLICA (QoS 1, retained)
```

Sus credenciales en el broker solo le permiten esto. No intente suscribirse a
nada más: el broker lo rechazará.

## Mensajes

Esquema formal y completo: `packages/contracts/payloads.schema.json`.
Todo `ts` es **epoch en segundos**, no milisegundos.

**Recibe** en `/cmd`:
```json
{
  "id": "uuid-del-comando",
  "ts": 1757856000,
  "module": "coolio",
  "action": "set_state",
  "params": { "power": true, "mode": "cool", "target_temp": 24, "fan_speed": "auto", "swing": "auto" }
}
```

`action` puede ser `set_state`, `resync`, `identify` o `reboot`.
`resync` = reenviar al aire el estado completo actual (el usuario pulsó
"Resincronizar" porque alguien tocó el mando físico).

**Publica** en `/ack`, inmediatamente después de emitir la ráfaga IR:
```json
{ "id": "uuid-del-comando", "ts": 1757856002, "status": "ok" }
```
Si falla: `{"id":"...","ts":...,"status":"error","error":"protocolo no soportado"}`

**Publica** en `/state` (retained), tras cada cambio y cada 5 min:
```json
{ "ts": 1757856002, "power": true, "mode": "cool", "target_temp": 24,
  "fan_speed": "auto", "swing": "auto", "fw": "1.0.3", "rssi": -58 }
```

**Publica** en `/telemetry`, cada 60 s:
```json
{ "ts": 1757856060, "temperature": 24.3, "humidity": 61.2, "rssi": -58 }
```

**LWT** en `/lwt` (retained): configurar el *Last Will* como
`{"online": false}` **antes** de conectar, y publicar `{"online": true}`
justo después de conectar.

## Lo que el firmware NO hace

- **No sabe nada de usuarios, roles, invitados ni códigos.** Obedece los
  comandos que llegan por su topic y punto. Quién puede mandarlos lo decide
  el backend antes de publicar.
- No habla con Supabase salvo en el registro inicial.
- No guarda historial.

## La limitación que condiciona el diseño

El infrarrojo es **unidireccional**: el ESP32 emite hacia el aire pero no
puede leer su estado real. Si alguien usa el mando físico, el firmware no se
entera y su `/state` queda desactualizado sin saberlo.

Es una limitación física conocida y aceptada. Lo que **sí** debe hacer el
firmware es publicar su `/state` con honestidad: lo que él ordenó la última
vez, con su marca de tiempo. La app ya se encarga de presentarlo como
"último estado ordenado" y de ofrecer el botón de resincronizar.

Las lecturas del SHT31 **sí** son reales y no tienen este problema.
