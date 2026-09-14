import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '@/core/auth';
import { colors } from '@/ui';

/**
 * Layout raíz.
 *
 * Envuelve toda la app en <AuthProvider>, que es quien sabe si hay sesión
 * iniciada. Quién va a qué pantalla lo decide app/index.tsx.
 */
export default function RootLayout() {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
            headerStyle: { backgroundColor: colors.background },
            headerShadowVisible: false,
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="onboarding/index" options={{ headerShown: false }} />
          <Stack.Screen name="devices/[id]" options={{ headerShown: true, title: '' }} />
          <Stack.Screen name="casas/index" options={{ headerShown: true, title: 'Mis casas' }} />
          <Stack.Screen name="casas/[id]" options={{ headerShown: true, title: '' }} />
          <Stack.Screen name="canjear" options={{ headerShown: true, title: 'Tengo un código' }} />
          <Stack.Screen name="perfil" options={{ headerShown: true, title: 'Perfil' }} />
        </Stack>
      </SafeAreaProvider>
    </AuthProvider>
  );
}
