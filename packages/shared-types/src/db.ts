/**
 * Filas de las tablas de Postgres.
 * Espejo de supabase/migrations. Ver docs/data-model.md.
 */

import type {
  CommandStatus,
  CoolioFanSpeed,
  CoolioMode,
  CoolioSwing,
  DeviceRole,
  HomeRole,
  ModuleId,
  StateSource,
} from './enums';

export type UUID = string;
/** Fecha en formato ISO 8601, ej: "2026-09-14T18:10:00.000Z" */
export type Timestamptz = string;

export interface Profile {
  id: UUID;
  display_name: string | null;
  avatar_url: string | null;
  locale: string;
  created_at: Timestamptz;
}

export interface Home {
  id: UUID;
  name: string;
  timezone: string;
  lat: number | null;
  lng: number | null;
  created_by: UUID;
  created_at: Timestamptz;
}

export interface HomeMember {
  home_id: UUID;
  user_id: UUID;
  role: HomeRole;
  /** null = acceso permanente */
  expires_at: Timestamptz | null;
  granted_by: UUID | null;
  created_at: Timestamptz;
}

export interface Room {
  id: UUID;
  home_id: UUID;
  name: string;
  icon: string | null;
  sort_order: number;
}

export interface Device {
  id: UUID;
  home_id: UUID;
  room_id: UUID | null;
  module: ModuleId;
  name: string;
  /** MAC del ESP32. Única en todo el sistema. */
  hw_id: string;
  firmware_version: string | null;
  online: boolean;
  last_seen_at: Timestamptz | null;
  created_at: Timestamptz;
}

export interface DeviceShare {
  id: UUID;
  device_id: UUID;
  user_id: UUID;
  role: DeviceRole;
  expires_at: Timestamptz | null;
  granted_by: UUID | null;
  created_at: Timestamptz;
}

export interface AccessCode {
  id: UUID;
  code: string;
  /** Alcance: una casa entera... */
  home_id: UUID | null;
  /** ...o un solo dispositivo. Al menos uno de los dos no es null. */
  device_id: UUID | null;
  role: HomeRole | DeviceRole;
  max_uses: number | null;
  uses: number;
  /** Nunca es null: todo código caduca. */
  expires_at: Timestamptz;
  revoked_at: Timestamptz | null;
  created_by: UUID;
  created_at: Timestamptz;
}

export interface Command {
  id: UUID;
  device_id: UUID;
  /** null si lo originó una automatización. */
  user_id: UUID | null;
  payload: Record<string, unknown>;
  status: CommandStatus;
  created_at: Timestamptz;
  sent_at: Timestamptz | null;
  acked_at: Timestamptz | null;
  error: string | null;
}

export interface TelemetryRow {
  id: number;
  device_id: UUID;
  ts: Timestamptz;
  temperature: number | null;
  humidity: number | null;
  extra: Record<string, unknown> | null;
}

export interface PushToken {
  user_id: UUID;
  token: string;
  platform: 'ios' | 'android';
  created_at: Timestamptz;
}

// ─── Módulo Coolio ───────────────────────────────────────────────────

export interface CoolioDevice {
  device_id: UUID;
  ac_brand: string | null;
  /** Nombre del protocolo en la librería IRremoteESP8266. */
  ac_protocol: string | null;
  min_temp: number;
  max_temp: number;
  supported_modes: CoolioMode[];
  supported_fan: CoolioFanSpeed[];
  has_swing: boolean;
}

/**
 * OJO: el último estado que Nexum ORDENÓ, no una lectura del aparato.
 * El infrarrojo es unidireccional. Ver docs/architecture.md.
 */
export interface CoolioState {
  device_id: UUID;
  power: boolean;
  mode: CoolioMode | null;
  target_temp: number | null;
  fan_speed: CoolioFanSpeed | null;
  swing: CoolioSwing | null;
  updated_at: Timestamptz;
  source: StateSource;
}

// ─── Automatizaciones ────────────────────────────────────────────────

export type AutomationTrigger =
  | { type: 'schedule'; cron: string }
  | { type: 'threshold'; metric: 'temperature' | 'humidity'; op: '>' | '<'; value: number }
  | { type: 'geofence'; direction: 'enter' | 'leave'; radius_m: number }
  | { type: 'presence'; state: 'home' | 'away' };

export interface AutomationAction {
  command: { action: string; params: Record<string, unknown> };
}

export interface Automation {
  id: UUID;
  home_id: UUID;
  device_id: UUID | null;
  module: ModuleId | null;
  name: string;
  enabled: boolean;
  trigger: AutomationTrigger;
  action: AutomationAction;
  created_by: UUID;
  created_at: Timestamptz;
}
