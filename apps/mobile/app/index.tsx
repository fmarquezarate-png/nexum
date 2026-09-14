import { Redirect } from 'expo-router';

/**
 * Pantalla de entrada.
 *
 * Fase 1: aquí se comprobará si hay sesión iniciada y se redirigirá a
 * (auth)/sign-in o a (tabs). De momento va siempre a (tabs) para poder
 * navegar por la estructura.
 */
export default function Index() {
  return <Redirect href="/(tabs)" />;
}
