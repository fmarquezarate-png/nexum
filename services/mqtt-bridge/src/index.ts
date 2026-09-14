/**
 * mqtt-bridge — punto de entrada.
 *
 * ⚠ ESQUELETO — la implementación es de la fase 2.
 *
 * Lo que está aquí es la ESTRUCTURA: qué se suscribe, qué manejador
 * atiende cada topic y en qué orden arranca todo. Los manejadores están
 * vacíos con la descripción de lo que tienen que hacer.
 *
 * Contrato de topics y mensajes: packages/contracts/
 */

import { config } from './config.ts';
import { handleAck, handleLwt, handleState, handleTelemetry } from './handlers.ts';

/** Topics a los que se suscribe el puente. '+' = cualquier valor en ese tramo. */
const SUBSCRIPTIONS = [
  'nexum/+/+/state',
  'nexum/+/+/telemetry',
  'nexum/+/+/ack',
  'nexum/+/+/lwt',
] as const;

/**
 * Extrae home_id, device_id y el tipo de mensaje de un topic.
 * Devuelve null si el topic no tiene la forma esperada.
 */
export function parseTopic(topic: string) {
  const parts = topic.split('/');
  if (parts.length !== 4 || parts[0] !== 'nexum') return null;
  return { homeId: parts[1]!, deviceId: parts[2]!, suffix: parts[3]! };
}

async function main(): Promise<void> {
  console.log('[nexum-bridge] arrancando…');
  console.log(`[nexum-bridge] broker: ${config.mqtt.host}:${config.mqtt.port}`);
  console.log(`[nexum-bridge] suscripciones previstas: ${SUBSCRIPTIONS.join(', ')}`);

  // TODO (fase 2): conectar a MQTT con TLS y reconexión automática.
  //   const client = mqtt.connect(`mqtts://${config.mqtt.host}:${config.mqtt.port}`, {
  //     username: config.mqtt.username,
  //     password: config.mqtt.password,
  //     reconnectPeriod: 5000,
  //   });
  //   client.on('connect', () => client.subscribe([...SUBSCRIPTIONS], { qos: 1 }));
  //   client.on('message', (topic, payload) => route(topic, payload));

  // TODO (fase 2): arrancar el reconciliador de comandos.
  //   setInterval(reconcilePendingCommands, 5000);

  console.log('[nexum-bridge] ESQUELETO: sin conexión real todavía (fase 2).');
}

/** Reparte cada mensaje al manejador que le toca. */
export async function route(topic: string, raw: Buffer): Promise<void> {
  const parsed = parseTopic(topic);
  if (!parsed) {
    console.warn(`[nexum-bridge] topic desconocido, ignorado: ${topic}`);
    return;
  }

  let payload: unknown;
  try {
    payload = JSON.parse(raw.toString('utf8'));
  } catch {
    console.warn(`[nexum-bridge] mensaje no es JSON válido en ${topic}, ignorado`);
    return;
  }

  switch (parsed.suffix) {
    case 'state':
      return handleState(parsed.deviceId, payload);
    case 'telemetry':
      return handleTelemetry(parsed.deviceId, payload);
    case 'ack':
      return handleAck(parsed.deviceId, payload);
    case 'lwt':
      return handleLwt(parsed.deviceId, payload);
    default:
      console.warn(`[nexum-bridge] sufijo no contemplado: ${parsed.suffix}`);
  }
}

main().catch((error) => {
  console.error('[nexum-bridge] error fatal al arrancar:', error);
  process.exit(1);
});
