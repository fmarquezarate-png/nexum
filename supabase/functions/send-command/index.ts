/**
 * Edge Function: send-command
 *
 * ⚠ ESQUELETO — fase 2. Devuelve 501 a propósito.
 *
 * Valida que el usuario pueda controlar el dispositivo, registra la orden en la tabla commands (auditoría) y la publica por MQTT en nexum/{home_id}/{device_id}/cmd. NUNCA se salta la comprobación de permisos: llama a can_control_device antes de publicar nada.
 *
 * Contrato completo (entrada, salida y códigos de error):
 *   packages/contracts/api.md
 */

import { corsHeaders, notImplemented } from '../_shared/cors.ts';

Deno.serve((req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  return notImplemented('send-command');
});
