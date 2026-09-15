/**
 * Saca un mensaje legible de cualquier cosa que se haya lanzado.
 *
 * Existe porque los errores llegan de sitios distintos y con formas
 * distintas: Supabase devuelve un objeto con `message`, `code`, `details`
 * y `hint`; el código de la app lanza Error; y a veces llega un texto
 * suelto. Sin esto, cada pantalla acababa enseñando "[object Object]" o
 * tragándose el motivo.
 *
 * La regla del proyecto es que el motivo real SIEMPRE se enseña. Un
 * "revisa tu conexión" cuando hay conexión de sobra no ayuda a nadie.
 */
export function mensajeDe(fallo: unknown): string {
  if (!fallo) return 'Error desconocido';

  if (typeof fallo === 'string') return fallo;

  if (typeof fallo === 'object') {
    const e = fallo as Record<string, unknown>;

    const partes = [e.message, e.details, e.hint]
      .filter((x): x is string => typeof x === 'string' && x.length > 0);

    // El código de Postgres identifica el problema exacto: 42501 es
    // permiso denegado, 23503 una fila referenciada desde otro sitio.
    const codigo = typeof e.code === 'string' ? `[${e.code}] ` : '';

    if (partes.length) return codigo + partes.join(' · ');
  }

  if (fallo instanceof Error) return fallo.message;

  return String(fallo);
}
