/** Valores cerrados que se repiten por todo el sistema. */

export const MODULES = ['coolio', 'plantico'] as const;
export type ModuleId = (typeof MODULES)[number];

/** Rol dentro de una casa. De más a menos poder. */
export const HOME_ROLES = ['owner', 'admin', 'member', 'guest'] as const;
export type HomeRole = (typeof HOME_ROLES)[number];

/** Rol cuando se comparte un dispositivo suelto. */
export const DEVICE_ROLES = ['controller', 'viewer'] as const;
export type DeviceRole = (typeof DEVICE_ROLES)[number];

export const COMMAND_STATUSES = ['pending', 'sent', 'acked', 'failed', 'timeout'] as const;
export type CommandStatus = (typeof COMMAND_STATUSES)[number];

/** Quién originó un cambio de estado. Necesario para la auditoría. */
export const STATE_SOURCES = ['app', 'automation', 'device', 'unknown'] as const;
export type StateSource = (typeof STATE_SOURCES)[number];

export const COOLIO_MODES = ['auto', 'cool', 'heat', 'fan', 'dry'] as const;
export type CoolioMode = (typeof COOLIO_MODES)[number];

export const COOLIO_FAN_SPEEDS = ['auto', 'low', 'medium', 'high'] as const;
export type CoolioFanSpeed = (typeof COOLIO_FAN_SPEEDS)[number];

export const COOLIO_SWINGS = ['auto', 'off', 'vertical', 'horizontal', 'both'] as const;
export type CoolioSwing = (typeof COOLIO_SWINGS)[number];
