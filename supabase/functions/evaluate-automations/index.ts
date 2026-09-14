/**
 * Edge Function: evaluate-automations
 *
 * ⚠ ESQUELETO — fase 3. Devuelve 501 a propósito.
 *
 * La dispara un cron cada minuto, no la app. Revisa las automatizaciones activas y, cuando se cumple el disparador, emite el comando con user_id NULL y source 'automation'.
 *
 * Contrato completo (entrada, salida y códigos de error):
 *   packages/contracts/api.md
 */

import { corsHeaders, notImplemented } from '../_shared/cors.ts';

Deno.serve((req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  return notImplemented('evaluate-automations');
});
