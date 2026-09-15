/**
 * La lista de módulos.
 *
 * Añadir un módulo nuevo = añadir UNA línea aquí, más su carpeta de rutas
 * y su carpeta de manifiesto. Cero cambios en core/ y cero en app/(nexum).
 *
 * Esta es la única costura del sistema: el sitio por el que Nexum se
 * entera de que Coolio existe.
 */

import type { ModuleManifest } from './tipos';
import { manifiesto as coolio } from './coolio';
import { manifiesto as plantico } from './plantico';

export const MODULOS: ModuleManifest[] = [coolio, plantico];

export const MODULOS_DISPONIBLES = MODULOS.filter((m) => m.estado === 'disponible');
export const MODULOS_PROXIMOS = MODULOS.filter((m) => m.estado === 'proximamente');

export function modulo(id: string): ModuleManifest | undefined {
  return MODULOS.find((m) => m.id === id);
}
