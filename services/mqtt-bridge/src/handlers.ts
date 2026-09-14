/**
 * Manejadores: uno por tipo de mensaje que llega del broker.
 *
 * ⚠ ESQUELETO — todos vacíos. Implementación en la fase 2.
 *
 * Norma común a los cuatro:
 *   1. Validar el mensaje contra packages/contracts/payloads.schema.json.
 *      Un dispositivo con firmware roto no debe ensuciar la base de datos.
 *   2. Escribir en Supabase con la clave de servicio.
 *   3. No decidir nunca permisos. Eso es cosa de la base de datos.
 */

export async function handleState(deviceId: string, payload: unknown): Promise<void> {
  // TODO (fase 2):
  //   - Validar contra el esquema CoolioState.
  //   - upsert en coolio_state con source = 'device'.
  //   - Actualizar devices.firmware_version y devices.last_seen_at.
  console.log('[state]', deviceId, payload);
}

export async function handleTelemetry(deviceId: string, payload: unknown): Promise<void> {
  // TODO (fase 2):
  //   - Validar contra el esquema Telemetry.
  //   - insert en telemetry (estas SÍ son lecturas reales del SHT31).
  //   - Actualizar devices.last_seen_at.
  console.log('[telemetry]', deviceId, payload);
}

export async function handleAck(deviceId: string, payload: unknown): Promise<void> {
  // TODO (fase 2):
  //   - Validar contra el esquema Ack.
  //   - Buscar commands.id = payload.id Y commands.device_id = deviceId.
  //     (Comprobar las dos cosas: un dispositivo no puede confirmar
  //      comandos que no eran suyos.)
  //   - status = 'acked' si ok, 'failed' + error si no. Rellenar acked_at.
  console.log('[ack]', deviceId, payload);
}

export async function handleLwt(deviceId: string, payload: unknown): Promise<void> {
  // TODO (fase 2):
  //   - Validar contra el esquema Presence.
  //   - devices.online = payload.online, devices.last_seen_at = now().
  //   - Si pasa a offline: marcar como 'failed' sus comandos pendientes.
  console.log('[lwt]', deviceId, payload);
}

/**
 * Reconciliador. Se ejecuta cada pocos segundos, no por mensaje.
 *
 * TODO (fase 2): buscar comandos en estado 'sent' cuyo sent_at sea más
 * antiguo que COMMAND_TIMEOUT_SECONDS, marcarlos como 'timeout' y
 * notificar al usuario que lo lanzó.
 */
export async function reconcilePendingCommands(): Promise<void> {
  // TODO (fase 2)
}
