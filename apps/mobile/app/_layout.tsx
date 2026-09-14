import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { colors } from '@/ui';

/**
 * Layout raíz de la app.
 *
 * Aquí se decidirá (fase 1) si el usuario tiene sesión iniciada:
 *   - con sesión  → (tabs)
 *   - sin sesión  → (auth)
 * De momento entra siempre directo a (tabs) para poder ver las pantallas.
 */
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="devices/[id]" options={{ headerShown: true, title: '' }} />
        <Stack.Screen name="onboarding/index" options={{ headerShown: true, title: 'Añadir dispositivo' }} />
      </Stack>
    </SafeAreaProvider>
  );
}
