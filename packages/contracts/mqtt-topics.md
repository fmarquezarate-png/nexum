# Contrato MQTT — Topics

> Versión del contrato: **1.0.0**

## Qué es un "topic"

MQTT funciona como una radio: quien habla **publica** en una frecuencia y quien
escucha se **suscribe** a esa frecuencia. Esa frecuencia se llama *topic* y es
simplemente un texto con barras, parecido a la ruta de una carpeta.

## Nomenclatura

```
nexum/{home_id}/{device_id}/cmd        ← el backend PUBLICA, el dispositivo ESCUCHA
nexum/{home_id}/{device_id}/state      → el dispositivo PUBLICA (retained)
nexum/{home_id}/{device_id}/telemetry  → el dispositivo PUBLICA
nexum/{home_id}/{device_id}/ack        → el dispositivo CONFIRMA un comando
nexum/{home_id}/{device_id}/lwt        → presencia (retained, Last Will)
```

`{home_id}` y `{device_id}` son **UUID** (identificadores de 36 caracteres
generados por la base de datos), nunca nombres legibles.

**Por qué UUID y no "casa-banana/salon":** los nombres cambian, llevan acentos y
espacios, y no son únicos. El día que renombres "Salón" a "Comedor" el
dispositivo dejaría de escuchar. El UUID no cambia nunca.

## Conceptos MQTT que aparecen arriba

| Término | Significado |
|---|---|
| **retained** | El broker guarda el último mensaje de ese topic. Quien se suscriba después lo recibe inmediatamente, sin esperar al siguiente envío. Por eso `state` y `lwt` son retained: al abrir la app ves el estado al instante. |
| **LWT** (*Last Will and Testament*) | Un mensaje que el dispositivo deja preparado al conectarse, con la instrucción "si me caigo sin avisar, publica esto por mí". Es la única forma fiable de detectar un corte de luz o de WiFi. |
| **QoS** | Nivel de garantía de entrega. Ver tabla abajo. |

## QoS por topic

| Topic | QoS | Retained | Motivo |
|---|---|---|---|
| `cmd` | 1 | no | Una orden no se puede perder. QoS 1 = "al menos una vez". |
| `ack` | 1 | no | La confirmación tampoco. |
| `state` | 1 | **sí** | Debe estar disponible al abrir la app. |
| `telemetry` | 0 | no | Llega cada 60 s; perder una lectura suelta da igual. |
| `lwt` | 1 | **sí** | La presencia debe sobrevivir a la desconexión. |

## Permisos en el broker (HiveMQ)

Cada dispositivo tiene **credenciales propias**. Sus permisos son exactamente:

- **Publicar** solo en: `nexum/{su_home_id}/{su_device_id}/state`, `.../telemetry`, `.../ack`, `.../lwt`
- **Suscribirse** solo a: `nexum/{su_home_id}/{su_device_id}/cmd`

Nada más. Un dispositivo comprometido no puede controlar a otro ni escuchar lo
que hacen los demás.

El servicio `mqtt-bridge` es el único cliente con permiso amplio:
suscripción a `nexum/+/+/state`, `nexum/+/+/telemetry`, `nexum/+/+/ack`,
`nexum/+/+/lwt` (el `+` significa "cualquier valor en este tramo").

Las Edge Functions publican en `nexum/+/+/cmd` y no se suscriben a nada.

## Frecuencias de publicación

| Mensaje | Cuándo |
|---|---|
| `state` | Tras cada cambio de estado **y** cada 5 minutos como latido |
| `telemetry` | Cada 60 segundos |
| `ack` | Inmediatamente después de ejecutar un `cmd` |
| `lwt` | `{"online":true}` al conectar; el broker publica `{"online":false}` si el dispositivo cae |
