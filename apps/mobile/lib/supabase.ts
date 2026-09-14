/**
 * Cliente de Supabase para la app móvil.
 *
 * Este es el ÚNICO sitio de la app donde se crea la conexión con el
 * backend. Todo lo demás importa desde aquí.
 *
 * Qué NO hay aquí y no puede haber nunca:
 *   - La clave de servicio (service role).
 *   - Credenciales del broker MQTT.
 * La app no habla MQTT. Todo pasa por el backend, que comprueba permisos
 * antes de publicar nada. Ver docs/architecture.md.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    'Faltan las claves de Supabase.\n\n' +
      'Qué hacer:\n' +
      '  1. Ve a la carpeta apps/mobile\n' +
      '  2. Copia el archivo .env.example y llámalo .env\n' +
      '  3. Rellena EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY\n' +
      '     (Supabase → tu proyecto → Project Settings → API)\n' +
      '  4. Para el servidor de Expo y vuelve a arrancarlo\n',
  );
}

export const supabase = createClient(url, anonKey, {
  auth: {
    // Guarda la sesión en el móvil para no pedir login cada vez.
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    // En móvil no hay URL de navegador que leer.
    detectSessionInUrl: false,
  },
});
