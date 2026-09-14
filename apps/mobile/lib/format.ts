/**
 * Utilidades de formato. Todo en castellano.
 */

/**
 * "hace 2 h", "hace 5 min", "ahora mismo".
 *
 * Se usa sobre todo para la marca de tiempo del estado de Coolio, que es
 * obligatoria: el estado que mostramos es el último que ordenamos, no una
 * lectura del aparato.
 */
export function timeAgo(iso: string | null | undefined): string {
  if (!iso) return 'sin datos';

  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);

  if (seconds < 60) return 'ahora mismo';
  if (seconds < 3600) return `hace ${Math.floor(seconds / 60)} min`;
  if (seconds < 86400) return `hace ${Math.floor(seconds / 3600)} h`;
  return `hace ${Math.floor(seconds / 86400)} días`;
}

/** "24 °C" con el espacio fino correcto del castellano. */
export function celsius(value: number | null | undefined): string {
  return value == null ? '—' : `${Math.round(value)} °C`;
}

/** "61 %" */
export function percent(value: number | null | undefined): string {
  return value == null ? '—' : `${Math.round(value)} %`;
}

/** "12 de septiembre a las 18:30" */
export function fechaLarga(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  const dia = d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
  const hora = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  return `${dia} a las ${hora}`;
}

/** "12 sept 18:30" — versión corta para listas. */
export function fechaCorta(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}
