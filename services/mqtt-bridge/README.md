# services/mqtt-bridge — el oído permanente

## Por qué existe este servicio

Las Edge Functions de Supabase son *serverless*: se despiertan cuando las
llamas, hacen su trabajo y se apagan. Perfectas para **publicar** un comando.

Pero para **recibir** telemetría hace falta alguien conectado al broker las 24
horas, esperando. Una función que se apaga no puede esperar nada.

Analogía: la Edge Function es el que llama por teléfono cuando hace falta. Este
servicio es el que se queda con el teléfono descolgado todo el día por si llaman.

## Qué hace, exactamente

1. **Se suscribe** a `nexum/+/+/state`, `nexum/+/+/telemetry`, `nexum/+/+/ack`
   y `nexum/+/+/lwt` (el `+` significa "cualquier casa, cualquier dispositivo").
2. **Escribe en Supabase** lo que recibe, usando la clave de servicio:
   - `state` → actualiza `coolio_state`
   - `telemetry` → inserta en `telemetry`
   - `ack` → marca el comando como `acked`
   - `lwt` → marca el dispositivo `online` / `offline`
3. **Reconcilia comandos**: cada pocos segundos busca comandos enviados hace
   más de `COMMAND_TIMEOUT_SECONDS` sin confirmar y los marca como `timeout`.

## Reglas de diseño

- **Stateless**: no guarda nada en memoria que importe. Se puede reiniciar en
  cualquier momento sin perder datos.
- **Nunca decide permisos.** Solo escribe lo que llega del broker. Quién puede
  qué lo decide la base de datos.
- **Valida los mensajes** contra `packages/contracts/payloads.schema.json` antes
  de escribir. Un dispositivo con firmware roto no debe poder ensuciar la base.

## Dónde se despliega

**Railway** o **Fly.io**, ambos con plan gratuito suficiente. Solo necesita
estar encendido y tener salida a Internet; no recibe peticiones de nadie.

Variables a configurar en el panel del proveedor: las de `.env.example`.

## Estado actual

**Esqueleto.** `src/index.ts` tiene la estructura, los manejadores vacíos y
comentado qué va en cada uno. La implementación es de la fase 2.
