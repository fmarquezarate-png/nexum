/**
 * Internacionalización.
 *
 * Fase 1: solo castellano. Pero la estructura ya está montada, así que
 * añadir otro idioma es añadir un JSON y una entrada en `translations`,
 * sin tocar ninguna pantalla.
 *
 * REGLA: ningún texto visible se escribe directamente en una pantalla.
 * Todo pasa por t('clave.subclave').
 */

import es from './es.json';

export const SUPPORTED_LOCALES = ['es'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'es';

const translations: Record<Locale, unknown> = { es };

/** Recorre el JSON siguiendo una ruta con puntos. */
function buscar(key: string, locale: Locale): unknown {
  return key.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object' && part in acc) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, translations[locale]);
}

/**
 * Lista de textos: tList('proximamente.estadisticas.incluye').
 *
 * Existe porque t() solo devuelve cadenas, y forzar el tipo devolvería
 * la propia clave en pantalla en vez de la lista.
 */
export function tList(key: string, locale: Locale = DEFAULT_LOCALE): string[] {
  const valor = buscar(key, locale);
  return Array.isArray(valor) ? (valor as string[]) : [];
}

/**
 * Busca un texto por su ruta: t('tabs.home') → "Inicio".
 * Admite sustituciones: t('home.greeting', { name: 'Fran' }).
 * Si la clave no existe, devuelve la propia clave (así se ve el fallo).
 */
export function t(key: string, vars?: Record<string, string | number>, locale: Locale = DEFAULT_LOCALE): string {
  const value = buscar(key, locale);
  if (typeof value !== 'string') return key;
  if (!vars) return value;

  return Object.entries(vars).reduce(
    (text, [name, replacement]) => text.replaceAll(`{{${name}}}`, String(replacement)),
    value,
  );
}
