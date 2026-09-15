import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '@/core/auth';
import { ThemeProvider, ToastProvider, useTheme } from '@/ui';

/**
 * Layout raíz.
 *
 * El orden importa: ThemeProvider por fuera, para que cualquier pantalla
 * —incluida la de sesión— tenga colores resueltos desde el primer
 * fotograma y no haya un parpadeo claro al abrir en modo oscuro.
 */
export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SafeAreaProvider>
          <ToastProvider>
            <Navegacion />
          </ToastProvider>
        </SafeAreaProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

function Navegacion() {
  const { colors, scheme } = useTheme();

  return (
    <>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.canvas },
          headerTintColor: colors.text,
          headerStyle: { backgroundColor: colors.canvas },
          headerTitleStyle: { color: colors.text },
          headerShadowVisible: false,
          // Deslizamiento horizontal: la pantalla nueva entra desde la
          // derecha y la anterior se va un poco, dando sensación de capas.
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(nexum)" />
        {/* UNA sola entrada para todos los mundos. Expo Router descubre
            las carpetas hijas solo, así que añadir Plantico no toca
            este archivo. El núcleo nunca nombra un módulo. */}
        <Stack.Screen name="(mundos)" />
        <Stack.Screen name="onboarding/index" />
        <Stack.Screen name="casas/index" options={{ headerShown: true, title: 'Mis casas' }} />
        <Stack.Screen name="casas/[id]" options={{ headerShown: true, title: '' }} />
        <Stack.Screen name="anadir-dispositivo" options={{ headerShown: true, title: '' }} />
        <Stack.Screen name="modulo/[id]" options={{ headerShown: true, title: '' }} />
        <Stack.Screen name="canjear" options={{ headerShown: true, title: '' }} />
        <Stack.Screen name="perfil" options={{ headerShown: true, title: '' }} />
      </Stack>
    </>
  );
}
