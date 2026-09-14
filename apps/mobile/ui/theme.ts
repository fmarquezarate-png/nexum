/**
 * Temas por módulo.
 *
 * Cada módulo tiene su identidad visual (Coolio es cyan, Plantico es verde
 * agua) pero comparte con el resto espaciados, tipografías y radios.
 *
 * Así, añadir un módulo nuevo = añadir una entrada aquí. El núcleo no cambia.
 */

import type { ModuleId } from '@nexum/shared-types';
import { palette } from './tokens';

export interface ModuleTheme {
  /** Nombre visible. */
  label: string;
  /** Frase del mockup. */
  tagline: string;
  /** Color principal del módulo. */
  primary: string;
  /** Color de acento / texto sobre fondos claros. */
  accent: string;
  /** Fondo suave para tarjetas del módulo. */
  soft: string;
}

export const moduleThemes: Record<ModuleId, ModuleTheme> = {
  coolio: {
    label: 'Coolio',
    tagline: 'Más que aire, mejor vida.',
    primary: palette.cyan500,
    accent: palette.cyan700,
    soft: palette.cyan100,
  },
  plantico: {
    label: 'Plantico',
    tagline: 'Riega hoy, un mejor mañana.',
    primary: palette.leaf600,
    accent: palette.water500,
    soft: palette.leaf100,
  },
};

export function themeForModule(module: ModuleId): ModuleTheme {
  return moduleThemes[module];
}
