/**
 * Lectura y validación de las variables de entorno.
 *
 * Si falta alguna, el servicio se niega a arrancar y dice CUÁL falta.
 * Es mucho mejor que arrancar y fallar misteriosamente media hora después.
 */

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Falta la variable de entorno ${name}. ` +
        `Copia services/mqtt-bridge/.env.example como .env y rellénala.`,
    );
  }
  return value;
}

export const config = {
  supabase: {
    url: required('SUPABASE_URL'),
    serviceRoleKey: required('SUPABASE_SERVICE_ROLE_KEY'),
  },
  mqtt: {
    host: required('MQTT_HOST'),
    port: Number(process.env.MQTT_PORT ?? 8883),
    username: required('MQTT_BRIDGE_USERNAME'),
    password: required('MQTT_BRIDGE_PASSWORD'),
  },
  commandTimeoutSeconds: Number(process.env.COMMAND_TIMEOUT_SECONDS ?? 30),
} as const;
