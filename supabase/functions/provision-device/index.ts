/**
 * Edge Function: provision-device
 *
 * ⚠ ESQUELETO — fase 2. Devuelve 501 a propósito.
 *
 * Dos operaciones. (1) La app pide un token de reclamo de un solo uso, válido 10 minutos, ligado a una casa y habitación. (2) El ESP32 canjea ese token contra /claim y recibe sus credenciales MQTT propias, que solo se devuelven esta vez.
 *
 * Contrato completo (entrada, salida y códigos de error):
 *   packages/contracts/api.md
 */

import { corsHeaders, notImplemented } from '../_shared/cors.ts';

Deno.serve((req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  return notImplemented('provision-device');
});
