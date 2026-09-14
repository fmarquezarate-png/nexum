/**
 * Cabeceras CORS compartidas por todas las Edge Functions.
 *
 * CORS es el permiso que un navegador pide antes de dejar que una web
 * llame a otro dominio. La app móvil no lo necesita, pero sí el
 * navegador cuando pruebas desde Expo Web.
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

/** Respuesta estándar mientras la función está sin implementar. */
export function notImplemented(name: string): Response {
  return jsonResponse(
    {
      error: 'not_implemented',
      message: `La función "${name}" todavía no está implementada. Contrato en packages/contracts/api.md`,
    },
    501,
  );
}
