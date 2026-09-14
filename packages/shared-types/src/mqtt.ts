/**
 * Mensajes que viajan por MQTT.
 * Espejo de packages/contracts/payloads.schema.json.
 */

import type { CoolioFanSpeed, CoolioMode, CoolioSwing, ModuleId } from './enums';
import type { UUID } from './db';

/** Epoch en SEGUNDOS (no milisegundos). */
export type EpochSeconds = number;

export const TOPIC_SUFFIXES = ['cmd', 'state', 'telemetry', 'ack', 'lwt'] as const;
export type TopicSuffix = (typeof TOPIC_SUFFIXES)[number];

/** Única función autorizada para construir un topic. No concatenar a mano. */
export function topicFor(homeId: UUID, deviceId: UUID, suffix: TopicSuffix): string {
  return `nexum/${homeId}/${deviceId}/${suffix}`;
}

export type CommandAction = 'set_state' | 'resync' | 'identify' | 'reboot';

export interface CoolioSetStateParams {
  power: boolean;
  mode?: CoolioMode;
  target_temp?: number;
  fan_speed?: CoolioFanSpeed;
  swing?: CoolioSwing;
}

export interface CommandMessage {
  id: UUID;
  ts: EpochSeconds;
  module: ModuleId;
  action: CommandAction;
  params: Record<string, unknown>;
}

export interface AckMessage {
  id: UUID;
  ts: EpochSeconds;
  status: 'ok' | 'error';
  error?: string;
}

export interface CoolioStateMessage {
  ts: EpochSeconds;
  power: boolean;
  mode?: CoolioMode;
  target_temp?: number;
  fan_speed?: CoolioFanSpeed;
  swing?: CoolioSwing;
  fw?: string;
  /** Potencia WiFi en dBm. -50 excelente, -80 malo. */
  rssi?: number;
}

export interface TelemetryMessage {
  ts: EpochSeconds;
  temperature?: number;
  humidity?: number;
  rssi?: number;
  [key: string]: unknown;
}

export interface PresenceMessage {
  online: boolean;
  ts?: EpochSeconds;
}
