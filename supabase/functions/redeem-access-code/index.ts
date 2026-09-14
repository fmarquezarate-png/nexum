/**
 * Edge Function: redeem-access-code
 *
 * ⚠ ESQUELETO — fase 1. Devuelve 501 a propósito.
 *
 * Canjea un código de invitado y crea la fila en home_members o device_shares. Cada motivo de rechazo tiene su propio código y su propio mensaje en español: caducado, revocado, sin usos, inexistente. Nunca un error genérico.
 *
 * Contrato completo (entrada, salida y códigos de error):
 *   packages/contracts/api.md
 */

import { corsHeaders, notImplemented } from '../_shared/cors.ts';

Deno.serve((req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  return notImplemented('redeem-access-code');
});
