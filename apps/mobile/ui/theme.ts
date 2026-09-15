/**
 * Acentos por módulo.
 *
 * Cada módulo tiene identidad propia (Coolio es cyan, Plantico verde
 * agua) pero comparte con el resto espaciados, tipografías y radios.
 * Añadir un módulo nuevo = añadir una entrada aquí.
 *
 * REGLA DEL ACENTO — no negociable:
 *   El color del módulo ocupa como MUCHO el 10 % del área de pantalla
 *   (8 % en oscuro, donde el color pesa más) y solo aparece en cuatro
 *   sitios: el azulejo del icono, el indicador de estado, el arco del
 *   dato protagonista y el botón principal dentro del módulo.
 *
 *   Nunca el fondo. Nunca la tarjeta. Nunca la barra de pestañas.
 *   Eso es lo que evita que Nexum parezca tres apps distintas.
 */

import type { ModuleId } from '@nexum/shared-types';
import type { Scheme } from './tokens';

export interface ModuleTheme {
  label: string;
  tagline: string;
  /** Color principal: icono, indicador, borde de acento. */
  primary: string;
  /** Texto de acento sobre el fondo suave. */
  deep: string;
  /** Fondo del azulejo del icono. */
  soft: string;
  /** Texto sobre un relleno del color primario. */
  onPrimary: string;
  /** Color de los números del módulo. */
  data: string;
  /** Degradado del arco del dial. */
  gradient: readonly [string, string];
}

const claros: Record<ModuleId, ModuleTheme> = {
  coolio: {
    label: 'Coolio',
    tagline: 'Más que aire, mejor vida.',
    primary: '#1F9FD4',
    deep: '#1687B8',
    soft: '#E6F4FB',
    onPrimary: '#FFFFFF',
    data: '#1687B8',
    gradient: ['#1F9FD4', '#7FD3EA'],
  },
  plantico: {
    label: 'Plantico',
    tagline: 'Riega hoy, un mejor mañana.',
    primary: '#2E7D57',
    deep: '#256A49',
    soft: '#E9F2EC',
    onPrimary: '#FFFFFF',
    data: '#3FA9D6',
    gradient: ['#3FA9D6', '#8FD0EA'],
  },
};

/**
 * En oscuro los acentos suben luminancia y BAJAN saturación.
 *
 * Sin ese ajuste: el cyan de Coolio deslumbra, y el verde de Plantico
 * directamente desaparece —da 1.86:1 sobre la tarjeta oscura, muy por
 * debajo del mínimo legible—.
 *
 * Y el texto sobre un acento aclarado deja de ser blanco: en blanco
 * daría 2.4:1. Pasa a ser tinta oscura.
 */
const oscuros: Record<ModuleId, ModuleTheme> = {
  coolio: {
    ...claros.coolio,
    primary: '#58AECB',
    deep: '#8ECBE0',
    soft: '#15262E',
    onPrimary: '#0E1A1F',
    data: '#8ECBE0',
    gradient: ['#3E8FA8', '#6FC4DE'],
  },
  plantico: {
    ...claros.plantico,
    primary: '#5FB88C',
    deep: '#94D2B2',
    soft: '#16261E',
    onPrimary: '#0D1A13',
    data: '#6FB8D6',
    gradient: ['#3F8E6B', '#7FC9A3'],
  },
};

export function themeForModule(module: ModuleId, scheme: Scheme): ModuleTheme {
  return (scheme === 'dark' ? oscuros : claros)[module];
}

export const moduleThemes = claros;
