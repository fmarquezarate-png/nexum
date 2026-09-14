# @nexum/contracts — Fuente de verdad

Esta carpeta manda sobre el código. Si un topic MQTT, un campo de un mensaje o
un endpoint no está escrito aquí, **no existe**.

Tres archivos:

| Archivo | Qué define |
|---|---|
| `mqtt-topics.md` | Los "canales" por los que hablan backend y dispositivos |
| `payloads.schema.json` | La forma exacta de cada mensaje (qué campos, de qué tipo) |
| `api.md` | Las funciones del backend que llama la app |

## Regla de oro

Cualquier cambio se hace **primero aquí** y luego se propaga a:

1. `packages/shared-types` (los tipos de TypeScript)
2. `services/mqtt-bridge` y `supabase/functions` (backend)
3. El repositorio del firmware (avisar al agente de firmware)

Cambiar el código sin cambiar el contrato es la forma garantizada de que la app
y los dispositivos dejen de entenderse.
